import { loadToGrams, type ExerciseMode, type LoadUnit } from './models.ts';

export interface SetInput {
  reps?: number;
  load?: number;
  loadUnit?: LoadUnit;
  seconds?: number;
}

export interface ValidatedSetInput {
  reps: number | null;
  loadGrams: number | null;
  durationSeconds: number | null;
}

export function validateSetInput(mode: ExerciseMode, values: SetInput): ValidatedSetInput {
  if (mode === 'time') {
    if (!Number.isInteger(values.seconds) || (values.seconds ?? 0) <= 0) throw new Error('Enter whole-number seconds greater than zero.');
    return { reps: null, loadGrams: null, durationSeconds: values.seconds! };
  }
  if (!Number.isInteger(values.reps) || (values.reps ?? 0) <= 0) throw new Error('Enter whole-number reps greater than zero.');
  if (mode === 'bodyweight') return { reps: values.reps!, loadGrams: null, durationSeconds: null };
  if (!Number.isFinite(values.load) || values.load === undefined || values.load < 0) throw new Error('Enter a valid load before saving this set.');
  return { reps: values.reps!, loadGrams: loadToGrams(values.load, values.loadUnit ?? 'kg'), durationSeconds: null };
}
