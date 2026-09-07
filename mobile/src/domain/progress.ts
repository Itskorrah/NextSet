import type { ExerciseMode, ProgressRecord, WorkoutRecord } from './models';

export function deriveProgress(workouts: WorkoutRecord[]): ProgressRecord[] {
  const byExercise = new Map<string, { record: ProgressRecord; workoutIds: Set<string> }>();

  for (const workout of workouts.filter((item) => item.status === 'completed')) {
    for (const exercise of workout.exercises) {
      const existing = byExercise.get(exercise.definitionKey) ?? {
        record: { definitionKey: exercise.definitionKey, name: exercise.name, mode: exercise.mode, sessions: 0, bestLoadGrams: null, bestReps: null, bestDurationSeconds: null },
        workoutIds: new Set<string>(),
      };
      existing.workoutIds.add(workout.id);
      for (const set of exercise.sets) {
        if (set.loadGrams !== null) existing.record.bestLoadGrams = Math.max(existing.record.bestLoadGrams ?? 0, set.loadGrams);
        if (set.reps !== null) existing.record.bestReps = Math.max(existing.record.bestReps ?? 0, set.reps);
        if (set.durationSeconds !== null) existing.record.bestDurationSeconds = Math.max(existing.record.bestDurationSeconds ?? 0, set.durationSeconds);
      }
      byExercise.set(exercise.definitionKey, existing);
    }
  }

  return [...byExercise.values()]
    .map(({ record, workoutIds }) => ({ ...record, sessions: workoutIds.size }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function progressDescription(record: ProgressRecord): string {
  const sessions = `${record.sessions} recorded session${record.sessions === 1 ? '' : 's'}`;
  if (record.sessions < 2) return `${sessions} · log this exercise again to compare it`;
  const mode: ExerciseMode = record.mode;
  if (mode === 'time') return `${sessions} · longest set ${record.bestDurationSeconds ?? 0} sec`;
  if (mode === 'bodyweight') return `${sessions} · most reps ${record.bestReps ?? 0}`;
  const load = record.bestLoadGrams === null ? '—' : `${record.bestLoadGrams / 1000} kg`;
  return `${sessions} · heaviest recorded set ${load}`;
}
