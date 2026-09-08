export type ExerciseMode = 'weight' | 'bodyweight' | 'time';
export type LoadUnit = 'kg' | 'lb';

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

export interface AppSettings {
  loadUnit: LoadUnit;
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

export type CatalogueExercise = Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode'>;

export interface CatalogueSection {
  title: string;
  exercises: CatalogueExercise[];
}

export const CATALOGUE_SECTIONS: CatalogueSection[] = [
  {
    title: 'Chest & shoulders',
    exercises: [
      { definitionKey: 'catalogue:barbell-bench-press:weight', name: 'Barbell bench press', mode: 'weight' },
      { definitionKey: 'catalogue:incline-barbell-bench-press:weight', name: 'Incline barbell bench press', mode: 'weight' },
      { definitionKey: 'catalogue:dumbbell-bench-press:weight', name: 'Dumbbell bench press', mode: 'weight' },
      { definitionKey: 'catalogue:incline-dumbbell-bench-press:weight', name: 'Incline dumbbell bench press', mode: 'weight' },
      { definitionKey: 'catalogue:machine-chest-press:weight', name: 'Machine chest press', mode: 'weight' },
      { definitionKey: 'catalogue:incline-machine-chest-press:weight', name: 'Incline machine chest press', mode: 'weight' },
      { definitionKey: 'catalogue:cable-fly:weight', name: 'Cable fly', mode: 'weight' },
      { definitionKey: 'catalogue:pec-deck:weight', name: 'Pec deck', mode: 'weight' },
      { definitionKey: 'catalogue:dumbbell-shoulder-press:weight', name: 'Dumbbell shoulder press', mode: 'weight' },
      { definitionKey: 'catalogue:machine-shoulder-press:weight', name: 'Machine shoulder press', mode: 'weight' },
      { definitionKey: 'catalogue:dumbbell-lateral-raise:weight', name: 'Dumbbell lateral raise', mode: 'weight' },
      { definitionKey: 'catalogue:lateral-raise-machine:weight', name: 'Lateral raise machine', mode: 'weight' },
      { definitionKey: 'catalogue:reverse-pec-deck:weight', name: 'Reverse pec deck', mode: 'weight' },
      { definitionKey: 'catalogue:face-pull:weight', name: 'Face pull', mode: 'weight' },
    ],
  },
  {
    title: 'Back',
    exercises: [
      { definitionKey: 'catalogue:lat-pulldown:weight', name: 'Lat pulldown', mode: 'weight' },
      { definitionKey: 'catalogue:pull-up:bodyweight', name: 'Pull-up', mode: 'bodyweight' },
      { definitionKey: 'catalogue:seated-cable-row:weight', name: 'Seated cable row', mode: 'weight' },
      { definitionKey: 'catalogue:single-arm-dumbbell-row:weight', name: 'Single-arm dumbbell row', mode: 'weight' },
      { definitionKey: 'catalogue:chest-supported-row:weight', name: 'Chest-supported row', mode: 'weight' },
      { definitionKey: 'catalogue:barbell-row:weight', name: 'Barbell row', mode: 'weight' },
      { definitionKey: 'catalogue:t-bar-row:weight', name: 'T-bar row', mode: 'weight' },
      { definitionKey: 'catalogue:straight-arm-cable-pulldown:weight', name: 'Straight-arm cable pulldown', mode: 'weight' },
    ],
  },
  {
    title: 'Legs',
    exercises: [
      { definitionKey: 'catalogue:barbell-squat:weight', name: 'Barbell squat', mode: 'weight' },
      { definitionKey: 'catalogue:romanian-deadlift:weight', name: 'Romanian deadlift', mode: 'weight' },
      { definitionKey: 'catalogue:barbell-deadlift:weight', name: 'Barbell deadlift', mode: 'weight' },
      { definitionKey: 'catalogue:leg-press:weight', name: 'Leg press', mode: 'weight' },
      { definitionKey: 'catalogue:hack-squat:weight', name: 'Hack squat', mode: 'weight' },
      { definitionKey: 'catalogue:leg-extension:weight', name: 'Leg extension', mode: 'weight' },
      { definitionKey: 'catalogue:seated-leg-curl:weight', name: 'Seated leg curl', mode: 'weight' },
      { definitionKey: 'catalogue:lying-leg-curl:weight', name: 'Lying leg curl', mode: 'weight' },
      { definitionKey: 'catalogue:bulgarian-split-squat:weight', name: 'Bulgarian split squat', mode: 'weight' },
      { definitionKey: 'catalogue:barbell-hip-thrust:weight', name: 'Barbell hip thrust', mode: 'weight' },
      { definitionKey: 'catalogue:standing-calf-raise:weight', name: 'Standing calf raise', mode: 'weight' },
      { definitionKey: 'catalogue:seated-calf-raise:weight', name: 'Seated calf raise', mode: 'weight' },
    ],
  },
  {
    title: 'Arms',
    exercises: [
      { definitionKey: 'catalogue:weighted-dip:weight', name: 'Weighted dip', mode: 'weight' },
      { definitionKey: 'catalogue:cable-triceps-pushdown:weight', name: 'Cable triceps pushdown', mode: 'weight' },
      { definitionKey: 'catalogue:overhead-cable-triceps-extension:weight', name: 'Overhead cable triceps extension', mode: 'weight' },
      { definitionKey: 'catalogue:skull-crusher:weight', name: 'Skull crusher', mode: 'weight' },
      { definitionKey: 'catalogue:dumbbell-biceps-curl:weight', name: 'Dumbbell biceps curl', mode: 'weight' },
      { definitionKey: 'catalogue:hammer-curl:weight', name: 'Hammer curl', mode: 'weight' },
      { definitionKey: 'catalogue:cable-biceps-curl:weight', name: 'Cable biceps curl', mode: 'weight' },
      { definitionKey: 'catalogue:preacher-curl:weight', name: 'Preacher curl', mode: 'weight' },
    ],
  },
  {
    title: 'Bodyweight & core',
    exercises: [
      { definitionKey: 'catalogue:push-up:bodyweight', name: 'Push-up', mode: 'bodyweight' },
      { definitionKey: 'catalogue:bodyweight-dip:bodyweight', name: 'Bodyweight dip', mode: 'bodyweight' },
      { definitionKey: 'catalogue:plank:time', name: 'Plank', mode: 'time' },
      { definitionKey: 'catalogue:hanging-knee-raise:bodyweight', name: 'Hanging knee raise', mode: 'bodyweight' },
      { definitionKey: 'catalogue:cable-crunch:weight', name: 'Cable crunch', mode: 'weight' },
    ],
  },
];

export const CATALOGUE: CatalogueExercise[] = CATALOGUE_SECTIONS.flatMap((section) => section.exercises);

export function formatLoad(grams: number | null, unit: LoadUnit = 'kg'): string {
  if (grams === null) return '—';
  const value = unit === 'kg' ? grams / 1000 : grams / 453.59237;
  const rounded = Number(value.toFixed(1));
  return `${rounded} ${unit}`;
}

export function formatSet(set: SetRecord, mode: ExerciseMode, unit: LoadUnit = 'kg'): string {
  if (mode === 'time') return `${set.durationSeconds ?? 0} sec`;
  if (mode === 'bodyweight') return `${set.reps ?? 0} reps`;
  return `${formatLoad(set.loadGrams, unit)} × ${set.reps ?? 0}`;
}

export function loadToGrams(value: number, unit: LoadUnit): number {
  return Math.round(value * (unit === 'kg' ? 1000 : 453.59237));
}

export function gramsToLoad(grams: number, unit: LoadUnit): number {
  return grams / (unit === 'kg' ? 1000 : 453.59237);
}

export function makeId(): string {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const random = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${timestamp.slice(0, 8)}-${timestamp.slice(8)}-7${random.slice(0, 3)}-${random.slice(3, 7)}-${random.slice(7)}`;
}
