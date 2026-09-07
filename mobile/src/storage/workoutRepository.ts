import * as SQLite from 'expo-sqlite';
import { makeId, type AppSettings, type ExerciseMode, type ExerciseRecord, type LoadUnit, type ProgressRecord, type RoutineRecord, type SetRecord, type WorkoutRecord } from '../domain/models';
import { deriveProgress } from '../domain/progress';
import { validateSetInput, type SetInput } from '../domain/setValidation';

type WorkoutRow = Omit<WorkoutRecord, 'exercises'>;
type ExerciseRow = Omit<ExerciseRecord, 'sets'>;

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;
let writeQueue = Promise.resolve();

async function database(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync('nextset.db').then(async (db) => {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        source TEXT NOT NULL CHECK (source IN ('blank', 'repeat', 'routine')),
        status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
        started_at INTEGER NOT NULL,
        completed_at INTEGER
      );
      CREATE UNIQUE INDEX IF NOT EXISTS one_active_workout ON workouts(status) WHERE status = 'active';
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY NOT NULL,
        workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
        definition_key TEXT NOT NULL,
        name TEXT NOT NULL,
        mode TEXT NOT NULL CHECK (mode IN ('weight', 'bodyweight', 'time')),
        position INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sets (
        id TEXT PRIMARY KEY NOT NULL,
        exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        reps INTEGER,
        load_grams INTEGER,
        duration_seconds INTEGER,
        created_at INTEGER NOT NULL,
        CHECK ((reps IS NOT NULL) OR (duration_seconds IS NOT NULL)),
        CHECK (reps IS NULL OR reps > 0),
        CHECK (load_grams IS NULL OR load_grams >= 0),
        CHECK (duration_seconds IS NULL OR duration_seconds > 0)
      );
      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS routine_exercises (
        id TEXT PRIMARY KEY NOT NULL,
        routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
        definition_key TEXT NOT NULL,
        name TEXT NOT NULL,
        mode TEXT NOT NULL CHECK (mode IN ('weight', 'bodyweight', 'time')),
        position INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workout_audit (
        id TEXT PRIMARY KEY NOT NULL,
        workout_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS deleted_workouts (
        workout_id TEXT PRIMARY KEY NOT NULL,
        deleted_at INTEGER NOT NULL,
        snapshot_json TEXT NOT NULL
      );
    `);
    const exerciseColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(exercises)');
    if (!exerciseColumns.some((column) => column.name === 'definition_key')) {
      await db.execAsync("ALTER TABLE exercises ADD COLUMN definition_key TEXT NOT NULL DEFAULT ''");
      await db.execAsync("UPDATE exercises SET definition_key = 'legacy:' || mode || ':' || lower(replace(name, ' ', '-')) WHERE definition_key = ''");
    }
    const routineColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(routine_exercises)');
    if (!routineColumns.some((column) => column.name === 'definition_key')) {
      await db.execAsync("ALTER TABLE routine_exercises ADD COLUMN definition_key TEXT NOT NULL DEFAULT ''");
      await db.execAsync("UPDATE routine_exercises SET definition_key = 'legacy:' || mode || ':' || lower(replace(name, ' ', '-')) WHERE definition_key = ''");
    }
    const deletedColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(deleted_workouts)');
    if (!deletedColumns.some((column) => column.name === 'snapshot_json')) {
      await db.execAsync("ALTER TABLE deleted_workouts ADD COLUMN snapshot_json TEXT NOT NULL DEFAULT '{}' ");
    }
    return db;
  });
  return databasePromise;
}

async function serialWrite<T>(operation: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.then(() => undefined, () => undefined);
  return next;
}

async function hydrateWorkout(row: WorkoutRow): Promise<WorkoutRecord> {
  const db = await database();
  const exercises = await db.getAllAsync<ExerciseRow>('SELECT id, workout_id as workoutId, definition_key as definitionKey, name, mode, position FROM exercises WHERE workout_id = ? ORDER BY position, id', row.id);
  const hydratedExercises = await Promise.all(exercises.map(async (exercise) => {
    const sets = await db.getAllAsync<SetRecord>('SELECT id, exercise_id as exerciseId, reps, load_grams as loadGrams, duration_seconds as durationSeconds, created_at as createdAt FROM sets WHERE exercise_id = ? ORDER BY created_at, id', exercise.id);
    return { ...exercise, mode: exercise.mode as ExerciseMode, sets };
  }));
  return { ...row, source: row.source as WorkoutRecord['source'], status: row.status as WorkoutRecord['status'], exercises: hydratedExercises };
}

export const workoutRepository = {
  async settings(): Promise<AppSettings> {
    const db = await database();
    const row = await db.getFirstAsync<{ value: LoadUnit }>("SELECT value FROM app_settings WHERE key = 'load_unit'");
    return { loadUnit: row?.value === 'lb' ? 'lb' : 'kg' };
  },

  async setLoadUnit(loadUnit: LoadUnit): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('load_unit', ?)", loadUnit);
    });
  },

  async active(): Promise<WorkoutRecord | null> {
    const db = await database();
    const row = await db.getFirstAsync<WorkoutRow>('SELECT id, title, source, status, started_at as startedAt, completed_at as completedAt FROM workouts WHERE status = \'active\' LIMIT 1');
    return row ? hydrateWorkout(row) : null;
  },

  async completed(): Promise<WorkoutRecord[]> {
    const db = await database();
    const rows = await db.getAllAsync<WorkoutRow>('SELECT id, title, source, status, started_at as startedAt, completed_at as completedAt FROM workouts WHERE status = \'completed\' ORDER BY completed_at DESC');
    return Promise.all(rows.map(hydrateWorkout));
  },

  async start(source: WorkoutRecord['source'] = 'blank', exercises: Array<Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode'>> = []): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const active = await db.getFirstAsync<{ id: string }>('SELECT id FROM workouts WHERE status = \'active\' LIMIT 1');
        if (active) return;
        const workoutId = makeId();
        const now = Date.now();
        await db.runAsync('INSERT INTO workouts (id, title, source, status, started_at) VALUES (?, ?, ?, \'active\', ?)', workoutId, 'Workout', source, now);
        for (const [position, exercise] of exercises.entries()) {
          await db.runAsync('INSERT INTO exercises (id, workout_id, definition_key, name, mode, position) VALUES (?, ?, ?, ?, ?, ?)', makeId(), workoutId, exercise.definitionKey, exercise.name, exercise.mode, position);
        }
      });
    });
  },

  async addExercise(workoutId: string, exercise: Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode'>): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      const active = await db.getFirstAsync<{ id: string }>('SELECT id FROM workouts WHERE id = ? AND status = \'active\'', workoutId);
      if (!active) throw new Error('This workout has already finished. Your exercise was not added.');
      const result = await db.getFirstAsync<{ position: number }>('SELECT COALESCE(MAX(position), -1) + 1 as position FROM exercises WHERE workout_id = ?', workoutId);
      await db.runAsync('INSERT INTO exercises (id, workout_id, definition_key, name, mode, position) VALUES (?, ?, ?, ?, ?, ?)', makeId(), workoutId, exercise.definitionKey, exercise.name, exercise.mode, result?.position ?? 0);
    });
  },

  async logSet(exercise: ExerciseRecord, values: SetInput): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      const active = await db.getFirstAsync<{ id: string; mode: ExerciseMode }>('SELECT workouts.id, exercises.mode FROM workouts INNER JOIN exercises ON exercises.workout_id = workouts.id WHERE exercises.id = ? AND workouts.status = \'active\'', exercise.id);
      if (!active) throw new Error('This workout has already finished. Your set was not saved.');
      const valid = validateSetInput(active.mode, values);
      await db.runAsync('INSERT INTO sets (id, exercise_id, reps, load_grams, duration_seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)', makeId(), exercise.id, valid.reps, valid.loadGrams, valid.durationSeconds, Date.now());
    });
  },

  async finish(workout: WorkoutRecord): Promise<boolean> {
    if (!workout.exercises.some((exercise) => exercise.sets.length > 0)) return false;
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const recorded = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sets INNER JOIN exercises ON exercises.id = sets.exercise_id WHERE exercises.workout_id = ? ', workout.id);
        if (!recorded?.count) throw new Error('Log a set before finishing this workout.');
        const result = await db.runAsync('UPDATE workouts SET status = \'completed\', completed_at = ? WHERE id = ? AND status = \'active\'', Date.now(), workout.id);
        if (result.changes !== 1) throw new Error('This workout has already changed. Your history was not updated.');
      });
    });
    return true;
  },

  async renameWorkout(workoutId: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) throw new Error('Give this workout a name.');
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const workout = await db.getFirstAsync<{ id: string; title: string }>('SELECT id, title FROM workouts WHERE id = ?', workoutId);
        if (!workout) throw new Error('This workout no longer exists.');
        await db.runAsync('UPDATE workouts SET title = ? WHERE id = ?', trimmed, workoutId);
        await db.runAsync('INSERT INTO workout_audit (id, workout_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', makeId(), workoutId, 'workout_renamed', JSON.stringify({ before: workout.title, after: trimmed }), Date.now());
      });
    });
  },

  async updateSet(setId: string, values: SetInput): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const current = await db.getFirstAsync<SetRecord & { workoutId: string; mode: ExerciseMode }>('SELECT sets.id, sets.exercise_id as exerciseId, sets.reps, sets.load_grams as loadGrams, sets.duration_seconds as durationSeconds, sets.created_at as createdAt, exercises.workout_id as workoutId, exercises.mode FROM sets INNER JOIN exercises ON exercises.id = sets.exercise_id INNER JOIN workouts ON workouts.id = exercises.workout_id WHERE sets.id = ? AND workouts.status IN (\'active\', \'completed\')', setId);
        if (!current) throw new Error('This set is no longer available to edit.');
        const valid = validateSetInput(current.mode, values);
        await db.runAsync('UPDATE sets SET reps = ?, load_grams = ?, duration_seconds = ? WHERE id = ?', valid.reps, valid.loadGrams, valid.durationSeconds, setId);
        await db.runAsync('INSERT INTO workout_audit (id, workout_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', makeId(), current.workoutId, 'set_edited', JSON.stringify({ setId, before: current, after: valid }), Date.now());
      });
    });
  },

  async deleteSet(setId: string): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const current = await db.getFirstAsync<SetRecord & { workoutId: string; status: WorkoutRecord['status'] }>('SELECT sets.id, sets.exercise_id as exerciseId, sets.reps, sets.load_grams as loadGrams, sets.duration_seconds as durationSeconds, sets.created_at as createdAt, exercises.workout_id as workoutId, workouts.status FROM sets INNER JOIN exercises ON exercises.id = sets.exercise_id INNER JOIN workouts ON workouts.id = exercises.workout_id WHERE sets.id = ?', setId);
        if (!current) throw new Error('This set no longer exists.');
        const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sets INNER JOIN exercises ON exercises.id = sets.exercise_id WHERE exercises.workout_id = ?', current.workoutId);
        if (current.status === 'completed' && (count?.count ?? 0) <= 1) throw new Error('Delete the completed workout instead of leaving an empty history record.');
        await db.runAsync('DELETE FROM sets WHERE id = ?', setId);
        await db.runAsync('INSERT INTO workout_audit (id, workout_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', makeId(), current.workoutId, 'set_deleted', JSON.stringify({ setId, previous: current }), Date.now());
      });
    });
  },

  async repeat(workout: WorkoutRecord): Promise<void> {
    await this.start('repeat', workout.exercises.map(({ definitionKey, name, mode }) => ({ definitionKey, name, mode })));
  },

  async saveRoutine(workout: WorkoutRecord): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const routineId = makeId();
        await db.runAsync('INSERT INTO routines (id, name, created_at) VALUES (?, ?, ?)', routineId, workout.title, Date.now());
        for (const exercise of workout.exercises) {
          await db.runAsync('INSERT INTO routine_exercises (id, routine_id, definition_key, name, mode, position) VALUES (?, ?, ?, ?, ?, ?)', makeId(), routineId, exercise.definitionKey, exercise.name, exercise.mode, exercise.position);
        }
      });
    });
  },

  async renameRoutine(routineId: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Give this routine a name.');
    await serialWrite(async () => {
      const db = await database();
      const result = await db.runAsync('UPDATE routines SET name = ? WHERE id = ?', trimmed, routineId);
      if (result.changes !== 1) throw new Error('This routine no longer exists.');
    });
  },

  async deleteRoutine(routineId: string): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.runAsync('DELETE FROM routines WHERE id = ?', routineId);
    });
  },

  async routines(): Promise<RoutineRecord[]> {
    const db = await database();
    const routines = await db.getAllAsync<{ id: string; name: string }>('SELECT id, name FROM routines ORDER BY created_at DESC');
    return Promise.all(routines.map(async (routine) => ({
      ...routine,
      exercises: await db.getAllAsync<Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode' | 'position'>>('SELECT definition_key as definitionKey, name, mode, position FROM routine_exercises WHERE routine_id = ? ORDER BY position, id', routine.id),
    })));
  },

  async startRoutine(routine: RoutineRecord): Promise<void> {
    await this.start('routine', routine.exercises);
  },

  async progress(): Promise<ProgressRecord[]> {
    return deriveProgress(await this.completed());
  },

  async exportPayload(): Promise<string> {
    const db = await database();
    const [settings, workouts, exercises, sets, routines, routineExercises, audit, deletedWorkouts] = await Promise.all([
      db.getAllAsync('SELECT key, value FROM app_settings'),
      db.getAllAsync('SELECT * FROM workouts'),
      db.getAllAsync('SELECT * FROM exercises'),
      db.getAllAsync('SELECT * FROM sets'),
      db.getAllAsync('SELECT * FROM routines'),
      db.getAllAsync('SELECT * FROM routine_exercises'),
      db.getAllAsync('SELECT * FROM workout_audit'),
      db.getAllAsync('SELECT * FROM deleted_workouts'),
    ]);
    return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), data: { settings, workouts, exercises, sets, routines, routineExercises, audit, deletedWorkouts } }, null, 2);
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM workouts WHERE id = ?', workoutId);
        if (!existing) throw new Error('This workout no longer exists.');
        const workout = await db.getFirstAsync('SELECT * FROM workouts WHERE id = ?', workoutId);
        const exercises = await db.getAllAsync('SELECT * FROM exercises WHERE workout_id = ? ORDER BY position, id', workoutId);
        const sets = await db.getAllAsync('SELECT sets.* FROM sets INNER JOIN exercises ON exercises.id = sets.exercise_id WHERE exercises.workout_id = ? ORDER BY sets.created_at, sets.id', workoutId);
        const snapshot = JSON.stringify({ workout, exercises, sets });
        const deletedAt = Date.now();
        await db.runAsync('INSERT OR REPLACE INTO deleted_workouts (workout_id, deleted_at, snapshot_json) VALUES (?, ?, ?)', workoutId, deletedAt, snapshot);
        await db.runAsync('INSERT INTO workout_audit (id, workout_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', makeId(), workoutId, 'workout_deleted', snapshot, deletedAt);
        await db.runAsync('DELETE FROM workouts WHERE id = ?', workoutId);
      });
    });
  },

  async deleteAll(): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      await db.withTransactionAsync(async () => {
        await db.execAsync('DELETE FROM workout_audit; DELETE FROM deleted_workouts; DELETE FROM sets; DELETE FROM exercises; DELETE FROM workouts; DELETE FROM routine_exercises; DELETE FROM routines; DELETE FROM app_settings;');
      });
    });
  },
};
