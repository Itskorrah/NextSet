# NextSet mobile app

This is the first real, local-first NextSet application. It implements the approved logging-first loop from D-009 and D-010:

- start an empty workout without account, goal, programme or schedule setup;
- add a catalogue or custom exercise and log weighted, bodyweight or timed sets;
- finish only workouts with recorded work;
- reopen completed history, repeat it as a fresh workout, or save its exercise list as an optional routine;
- read descriptive exercise observations based only on completed recorded sets.

Workout data is stored in the app-owned SQLite database `nextset.db` on the device. It survives ordinary restarts. There is no account, network dependency, cloud sync, telemetry, schedule, recommendation or coaching feature.

## Run locally

Use a current Node LTS release and pnpm:

```sh
pnpm install
pnpm run ios
pnpm run android
```

The project uses Expo development builds and Continuous Native Generation. `expo run:ios` requires Xcode and CocoaPods; `expo run:android` requires Android Studio and an emulator or Android device.

## Checks

```sh
pnpm run typecheck
pnpm test
pnpm exec expo export --platform ios --output-dir dist-ios
pnpm exec expo export --platform android --output-dir dist-android
```

This is a vertical slice, not a release candidate. Export, deletion/recovery, durable draft restoration, completed-workout and set editing, exercise reordering, routine naming/editing/versioning, settings and unit preferences, timer behaviour, audit history, accessibility verification on devices, interruption drills and performance testing remain required release work.
