import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveProgress, progressDescription } from '../src/domain/progress.ts';
import { formatLoad, loadToGrams, type WorkoutRecord } from '../src/domain/models.ts';
import { validateSetInput } from '../src/domain/setValidation.ts';

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
  assert.equal(progressDescription(progress[0], 'lb'), '2 recorded sessions · heaviest recorded set 154.3 lb');
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

test('unit preferences convert display and input without changing canonical grams', () => {
  const grams = loadToGrams(135, 'lb');
  assert.equal(grams, 61235);
  assert.equal(formatLoad(grams, 'lb'), '135 lb');
  assert.equal(formatLoad(grams, 'kg'), '61.2 kg');
});

test('validates complete, safely storable set values', () => {
  assert.deepEqual(
    validateSetInput('weight', { reps: 8, load: 135, loadUnit: 'lb' }),
    { reps: 8, loadGrams: 61235, durationSeconds: null },
  );
  assert.deepEqual(
    validateSetInput('bodyweight', { reps: 12 }),
    { reps: 12, loadGrams: null, durationSeconds: null },
  );
  assert.deepEqual(
    validateSetInput('time', { seconds: 45 }),
    { reps: null, loadGrams: null, durationSeconds: 45 },
  );

  assert.throws(
    () => validateSetInput('weight', { reps: 5.5, load: 20 }),
    /whole-number reps/,
  );
  assert.throws(
    () => validateSetInput('weight', { reps: 8 }),
    /valid load/,
  );
  assert.throws(
    () => validateSetInput('time', { seconds: 30.5 }),
    /whole-number seconds/,
  );
});
