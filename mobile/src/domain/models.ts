export type ExerciseMode = 'weight' | 'bodyweight' | 'time';

export type WorkoutStatus = 'active' | 'completed';

export interface SetRecord {
  id: string;
  exerciseId: string;
  reps: number | null;
  loadGrams: number | null;
  durationSeconds: number | null;
  createdAt: number;
}

export interface ExerciseRecord {
  id: string;
  workoutId: string;
  definitionKey: string;
  name: string;
  mode: ExerciseMode;
  position: number;
  sets: SetRecord[];
}

export interface WorkoutRecord {
  id: string;
  title: string;
  source: 'blank' | 'repeat' | 'routine';
  status: WorkoutStatus;
  startedAt: number;
  completedAt: number | null;
  exercises: ExerciseRecord[];
}

export interface RoutineRecord {
  id: string;
  name: string;
  exercises: Array<Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode' | 'position'>>;
}

export interface ProgressRecord {
  definitionKey: string;
  name: string;
  mode: ExerciseMode;
  sessions: number;
  bestLoadGrams: number | null;
  bestReps: number | null;
  bestDurationSeconds: number | null;
}

export const CATALOGUE: Array<Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode'>> = [
  { definitionKey: 'catalogue:barbell-bench-press:weight', name: 'Barbell bench press', mode: 'weight' },
  { definitionKey: 'catalogue:barbell-squat:weight', name: 'Barbell squat', mode: 'weight' },
  { definitionKey: 'catalogue:barbell-deadlift:weight', name: 'Barbell deadlift', mode: 'weight' },
  { definitionKey: 'catalogue:lat-pulldown:weight', name: 'Lat pulldown', mode: 'weight' },
  { definitionKey: 'catalogue:dumbbell-shoulder-press:weight', name: 'Dumbbell shoulder press', mode: 'weight' },
  { definitionKey: 'catalogue:push-up:bodyweight', name: 'Push-up', mode: 'bodyweight' },
  { definitionKey: 'catalogue:pull-up:bodyweight', name: 'Pull-up', mode: 'bodyweight' },
  { definitionKey: 'catalogue:plank:time', name: 'Plank', mode: 'time' },
];

export function formatLoad(grams: number | null): string {
  if (grams === null) return '—';
  const kilograms = grams / 1000;
  return `${Number.isInteger(kilograms) ? kilograms : kilograms.toFixed(1)} kg`;
}

export function formatSet(set: SetRecord, mode: ExerciseMode): string {
  if (mode === 'time') return `${set.durationSeconds ?? 0} sec`;
  if (mode === 'bodyweight') return `${set.reps ?? 0} reps`;
  return `${formatLoad(set.loadGrams)} × ${set.reps ?? 0}`;
}

export function makeId(): string {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const random = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${timestamp.slice(0, 8)}-${timestamp.slice(8)}-7${random.slice(0, 3)}-${random.slice(3, 7)}-${random.slice(7)}`;
}
