import * as SQLite from 'expo-sqlite';
import { makeId, type ExerciseMode, type ExerciseRecord, type ProgressRecord, type RoutineRecord, type SetRecord, type WorkoutRecord } from '../domain/models';
import { deriveProgress } from '../domain/progress';

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

  async logSet(exercise: ExerciseRecord, values: { reps?: number; loadKg?: number; seconds?: number }): Promise<void> {
    await serialWrite(async () => {
      const db = await database();
      const active = await db.getFirstAsync<{ id: string }>('SELECT workouts.id FROM workouts INNER JOIN exercises ON exercises.workout_id = workouts.id WHERE exercises.id = ? AND workouts.status = \'active\'', exercise.id);
      if (!active) throw new Error('This workout has already finished. Your set was not saved.');
      const reps = exercise.mode === 'time' ? null : values.reps ?? null;
      const loadGrams = exercise.mode === 'weight' && values.loadKg !== undefined ? Math.round(values.loadKg * 1000) : null;
      const duration = exercise.mode === 'time' ? values.seconds ?? null : null;
      await db.runAsync('INSERT INTO sets (id, exercise_id, reps, load_grams, duration_seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)', makeId(), exercise.id, reps, loadGrams, duration, Date.now());
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
};
