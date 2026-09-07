# NextSet mobile app

This is the first real, local-first NextSet application. It implements the approved logging-first loop from D-009 and D-010:

- start an empty workout without account, goal, programme or schedule setup;
- add a catalogue or custom exercise and log weighted, bodyweight or timed sets;
- finish only workouts with recorded work;
- reopen completed history, repeat it as a fresh workout, or save its exercise list as an optional routine;
- edit or delete a recorded set, rename/delete a completed workout, and rename/delete a routine;
- choose kg or lb without changing the stored load, export a private JSON file, or delete local data with an explicit confirmation;
- reopen an active workout from the locally committed exercise and set state;
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

This is still not a release candidate. Exercise reordering, routine exercise editing/versioning, durable uncommitted-draft restoration, timer behaviour, complete deletion/backup audits, migration/corruption recovery, accessibility verification on physical devices, interruption drills and performance testing remain required release work.
