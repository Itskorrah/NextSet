import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveProgress, progressDescription } from '../src/domain/progress.ts';
import type { WorkoutRecord } from '../src/domain/models.ts';

const completedWorkout: WorkoutRecord = {
  id: 'workout-1', title: 'Workout', source: 'blank', status: 'completed', startedAt: 1, completedAt: 2,
  exercises: [
    { id: 'bench-1', workoutId: 'workout-1', definitionKey: 'catalogue:bench:weight', name: 'Barbell bench press', mode: 'weight', position: 0, sets: [{ id: 'set-1', exerciseId: 'bench-1', reps: 8, loadGrams: 60000, durationSeconds: null, createdAt: 1 }] },
    { id: 'bench-2', workoutId: 'workout-1', definitionKey: 'catalogue:bench:weight', name: 'Barbell bench press', mode: 'weight', position: 1, sets: [{ id: 'set-2', exerciseId: 'bench-2', reps: 5, loadGrams: 70000, durationSeconds: null, createdAt: 2 }] },
  ],
};

test('progress combines repeated exercise entries only across separate completed workouts', () => {
  const secondWorkout = { ...completedWorkout, id: 'workout-2', completedAt: 3 };
  const progress = deriveProgress([completedWorkout, secondWorkout]);
  assert.equal(progress.length, 1);
  assert.equal(progress[0].sessions, 2);
  assert.equal(progress[0].bestLoadGrams, 70000);
  assert.equal(progressDescription(progress[0]), '2 recorded sessions · heaviest recorded set 70 kg');
});

test('active workouts cannot create a progress record', () => {
  const active = { ...completedWorkout, status: 'active' as const, completedAt: null };
  assert.deepEqual(deriveProgress([active]), []);
});

test('a duplicate exercise row in one workout is a single observation, not a trend', () => {
  const progress = deriveProgress([completedWorkout]);
  assert.equal(progress.length, 1);
  assert.equal(progress[0].sessions, 1);
  assert.equal(progressDescription(progress[0]), '1 recorded session · log this exercise again to compare it');
});

test('same-name custom exercises with different identities never merge', () => {
  const first = { ...completedWorkout, exercises: [{ ...completedWorkout.exercises[0], definitionKey: 'custom:first', name: 'Cable press' }] };
  const second = { ...completedWorkout, id: 'workout-2', exercises: [{ ...completedWorkout.exercises[0], definitionKey: 'custom:second', name: 'Cable press' }] };
  assert.equal(deriveProgress([first, second]).length, 2);
});

test('timed and bodyweight records never invent a load', () => {
  const workout: WorkoutRecord = {
    id: 'workout-2', title: 'Workout', source: 'blank', status: 'completed', startedAt: 3, completedAt: 4,
    exercises: [
      { id: 'plank', workoutId: 'workout-2', definitionKey: 'catalogue:plank:time', name: 'Plank', mode: 'time', position: 0, sets: [{ id: 'time', exerciseId: 'plank', reps: null, loadGrams: null, durationSeconds: 90, createdAt: 3 }] },
      { id: 'push', workoutId: 'workout-2', definitionKey: 'catalogue:push-up:bodyweight', name: 'Push-up', mode: 'bodyweight', position: 1, sets: [{ id: 'rep', exerciseId: 'push', reps: 12, loadGrams: null, durationSeconds: null, createdAt: 3 }] },
    ],
  };
  const secondWorkout = { ...workout, id: 'workout-3', completedAt: 5 };
  const progress = deriveProgress([workout, secondWorkout]);
  assert.equal(progress.find((item) => item.name === 'Plank')?.bestLoadGrams, null);
  assert.equal(progress.find((item) => item.name === 'Push-up')?.bestLoadGrams, null);
});
