import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BarChartIcon,
  CalendarIcon,
  CheckCircledIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DotsHorizontalIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  Pencil2Icon,
  PlusIcon,
  ReloadIcon,
  RowsIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, KeyboardInput, MobileScroll, useKeyboard } from "./mobile";

type DirectionId = "tempo" | "field" | "pace";
type ProgrammeWorkoutId = "Upper A" | "Lower A" | "Upper B";
type WorkingSetNumber = 1 | 2 | 3 | 4;
type ScreenId =
  | "onboarding"
  | "programme"
  | "today"
  | "active"
  | "set-entry"
  | "substitution"
  | "complete"
  | "history"
  | "exercise-progress"
  | "programme-editor";
type NavigationDestination = ScreenId | "direction-gallery";

type Direction = {
  id: DirectionId;
  name: string;
  strapline: string;
  personality: string;
  primaryAction: string;
};

type ExerciseRow = {
  index: number;
  name: string;
  prescription: string;
  meta: string;
};

type WorkingSet = {
  number: WorkingSetNumber;
  weight: number;
  reps: number;
  rir: number | null;
  saved: boolean;
};

type NavigationGuard = {
  dirty: boolean;
  canSave: boolean;
  title: string;
  description: string;
  savedConfirmation: string;
  discardedConfirmation: string;
  save: () => boolean;
  discard: () => void;
};

type HistorySession = {
  id: string;
  date: string;
  workout: ProgrammeWorkoutId;
  duration: string;
  setCount: number;
  status: "Completed" | "Short mode";
  exercises: Array<{
    name: string;
    result: string;
  }>;
};

const directions: Direction[] = [
  {
    id: "tempo",
    name: "Tempo Ledger",
    strapline: "Quiet precision for repeat training",
    personality: "Editorial, exact and calm",
    primaryAction: "Log set",
  },
  {
    id: "field",
    name: "Field Kit",
    strapline: "Decisive controls built for the gym floor",
    personality: "Utilitarian, dense and energetic",
    primaryAction: "Complete set",
  },
  {
    id: "pace",
    name: "Open Pace",
    strapline: "Clear guidance without pressure",
    personality: "Human, fluid and optimistic",
    primaryAction: "Save set",
  },
];

const screenLabels: Record<ScreenId, string> = {
  onboarding: "Onboarding",
  programme: "Programme selection",
  today: "Today",
  active: "Active workout",
  "set-entry": "Set entry",
  substitution: "Exercise substitution",
  complete: "Workout completion",
  history: "History",
  "exercise-progress": "Exercise progress",
  "programme-editor": "Programme editor",
};

const screenOrder = Object.keys(screenLabels) as ScreenId[];

const exerciseRows: ExerciseRow[] = [
  { index: 1, name: "Barbell bench press", prescription: "4 × 6–10", meta: "Chest · Barbell" },
  { index: 2, name: "Chest-supported row", prescription: "3 × 8–12", meta: "Back · Dumbbell" },
  { index: 3, name: "Seated shoulder press", prescription: "3 × 8–10", meta: "Shoulders · Machine" },
  { index: 4, name: "Cable lateral raise", prescription: "3 × 12–15", meta: "Shoulders · Cable" },
  { index: 5, name: "Rope pressdown", prescription: "3 × 10–15", meta: "Triceps · Cable" },
];

const programmeWorkoutNames: ProgrammeWorkoutId[] = ["Upper A", "Lower A", "Upper B"];
const nextProgrammeWorkout: Record<ProgrammeWorkoutId, ProgrammeWorkoutId> = {
  "Upper A": "Lower A",
  "Lower A": "Upper B",
  "Upper B": "Upper A",
};
const substitutionMetaByName: Record<string, string> = {
  "Dumbbell bench press": "Chest · Dumbbell",
  "Chest press machine": "Chest · Machine",
  "Weighted push-up": "Chest · Bodyweight-plus",
  "Goblet squat": "Quads · Dumbbell",
  "Hack squat machine": "Quads · Machine",
  "Dumbbell Romanian deadlift": "Hamstrings · Dumbbell",
  "Incline chest press machine": "Chest · Machine",
};

const programmeEditorSeed: Record<ProgrammeWorkoutId, ExerciseRow[]> = {
  "Upper A": exerciseRows,
  "Lower A": [
    { index: 1, name: "Back squat", prescription: "4 × 6–10", meta: "Quads · Barbell" },
    { index: 2, name: "Romanian deadlift", prescription: "3 × 8–10", meta: "Hamstrings · Barbell" },
    { index: 3, name: "Leg press", prescription: "3 × 10–12", meta: "Quads · Machine" },
    { index: 4, name: "Seated leg curl", prescription: "3 × 10–15", meta: "Hamstrings · Machine" },
    { index: 5, name: "Standing calf raise", prescription: "2 × 10–15", meta: "Calves · Machine" },
  ],
  "Upper B": [
    { index: 1, name: "Incline dumbbell press", prescription: "4 × 8–12", meta: "Chest · Dumbbell" },
    { index: 2, name: "Lat pulldown", prescription: "4 × 8–12", meta: "Back · Cable" },
    { index: 3, name: "One-arm cable row", prescription: "3 × 8–12", meta: "Back · Cable" },
    { index: 4, name: "Dumbbell lateral raise", prescription: "3 × 12–15", meta: "Shoulders · Dumbbell" },
    { index: 5, name: "Alternating dumbbell curl", prescription: "2 × 10–15", meta: "Biceps · Dumbbell" },
  ],
};

const programmeEditorAdditions: Record<ProgrammeWorkoutId, ExerciseRow> = {
  "Upper A": {
    index: 0,
    name: "Cable fly",
    prescription: "3 × 10–15",
    meta: "Chest · Cable",
  },
  "Lower A": {
    index: 0,
    name: "Bulgarian split squat",
    prescription: "3 × 8–10",
    meta: "Quads · Dumbbell",
  },
  "Upper B": {
    index: 0,
    name: "Face pull",
    prescription: "3 × 12–15",
    meta: "Rear delts · Cable",
  },
};

const historySessions: HistorySession[] = [
  {
    id: "2026-08-06-upper-a",
    date: "THU 06 AUG",
    workout: "Upper A",
    duration: "52 min",
    setCount: 16,
    status: "Completed",
    exercises: [
      { name: "Barbell bench press", result: "4 sets · best 100 kg × 9" },
      { name: "Chest-supported row", result: "3 sets · best 36 kg × 11" },
      { name: "Seated shoulder press", result: "3 sets · best 55 kg × 9" },
      { name: "Cable lateral raise", result: "3 sets · best 7.5 kg × 14" },
      { name: "Rope pressdown", result: "3 sets · best 30 kg × 13" },
    ],
  },
  {
    id: "2026-08-03-lower-a",
    date: "MON 03 AUG",
    workout: "Lower A",
    duration: "48 min",
    setCount: 15,
    status: "Completed",
    exercises: [
      { name: "Back squat", result: "4 sets · best 95 kg × 8" },
      { name: "Romanian deadlift", result: "3 sets · best 90 kg × 10" },
      { name: "Leg press", result: "3 sets · best 180 kg × 11" },
      { name: "Seated leg curl", result: "3 sets · best 52.5 kg × 12" },
      { name: "Standing calf raise", result: "2 sets · best 80 kg × 13" },
    ],
  },
  {
    id: "2026-07-31-upper-a",
    date: "FRI 31 JUL",
    workout: "Upper A",
    duration: "55 min",
    setCount: 17,
    status: "Completed",
    exercises: [
      { name: "Barbell bench press", result: "4 sets · best 100 kg × 8" },
      { name: "Chest-supported row", result: "4 sets · best 34 kg × 12" },
      { name: "Seated shoulder press", result: "3 sets · best 55 kg × 8" },
      { name: "Cable lateral raise", result: "3 sets · best 7.5 kg × 13" },
      { name: "Rope pressdown", result: "3 sets · best 30 kg × 12" },
    ],
  },
  {
    id: "2026-07-28-lower-a",
    date: "TUE 28 JUL",
    workout: "Lower A",
    duration: "44 min",
    setCount: 14,
    status: "Short mode",
    exercises: [
      { name: "Back squat", result: "4 sets · best 92.5 kg × 8" },
      { name: "Romanian deadlift", result: "3 sets · best 87.5 kg × 10" },
      { name: "Leg press", result: "3 sets · best 175 kg × 12" },
      { name: "Seated leg curl", result: "2 sets · best 50 kg × 13" },
      { name: "Standing calf raise", result: "2 sets · best 80 kg × 12" },
    ],
  },
];

const workingSetSeedByWorkout: Record<ProgrammeWorkoutId, Record<WorkingSetNumber, Omit<WorkingSet, "number" | "saved">>> = {
  "Upper A": {
    1: { weight: 95, reps: 10, rir: 2 },
    2: { weight: 100, reps: 8, rir: 2 },
    3: { weight: 100, reps: 8, rir: 1 },
    4: { weight: 100, reps: 8, rir: null },
  },
  "Lower A": {
    1: { weight: 85, reps: 10, rir: 3 },
    2: { weight: 90, reps: 8, rir: 2 },
    3: { weight: 92.5, reps: 8, rir: 2 },
    4: { weight: 95, reps: 8, rir: null },
  },
  "Upper B": {
    1: { weight: 26, reps: 12, rir: 2 },
    2: { weight: 28, reps: 10, rir: 2 },
    3: { weight: 30, reps: 8, rir: 2 },
    4: { weight: 30, reps: 8, rir: null },
  },
};

const priorComparableSetByWorkout: Record<ProgrammeWorkoutId, Pick<WorkingSet, "weight" | "reps" | "rir">> = {
  "Upper A": { weight: 100, reps: 8, rir: 1 },
  "Lower A": { weight: 92.5, reps: 8, rir: 2 },
  "Upper B": { weight: 30, reps: 8, rir: 2 },
};

function cloneProgrammeExercises(
  source: Record<ProgrammeWorkoutId, ExerciseRow[]>,
): Record<ProgrammeWorkoutId, ExerciseRow[]> {
  const normalizeOrder = (exercises: ExerciseRow[]) => exercises.map((exercise, position) => ({
    ...exercise,
    index: position + 1,
  }));
  return {
    "Upper A": normalizeOrder(source["Upper A"]),
    "Lower A": normalizeOrder(source["Lower A"]),
    "Upper B": normalizeOrder(source["Upper B"]),
  };
}

function programmeExercisesMatch(
  left: Record<ProgrammeWorkoutId, ExerciseRow[]>,
  right: Record<ProgrammeWorkoutId, ExerciseRow[]>,
) {
  return programmeWorkoutNames.every((workout) => (
    left[workout].length === right[workout].length
    && left[workout].every((exercise, index) => {
      const comparison = right[workout][index];
      return comparison
        && exercise.name === comparison.name
        && exercise.prescription === comparison.prescription
        && exercise.meta === comparison.meta;
    })
  ));
}

function directionById(id: DirectionId) {
  return directions.find((direction) => direction.id === id) ?? directions[0];
}

function parseSupportedPrescription(value: string) {
  const match = value.trim().match(/^([1-4])\s*[×x]\s*(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?$/);
  if (!match) return null;

  const sets = Number(match[1]);
  const minimumReps = Number(match[2]);
  const maximumReps = match[3] ? Number(match[3]) : minimumReps;
  if (minimumReps < 1 || maximumReps < minimumReps || maximumReps > 100) return null;

  return {
    sets,
    normalized: `${sets} × ${minimumReps}${match[3] ? `–${maximumReps}` : ""}`,
  };
}

function hasComparableWorkingSetFixture(exercise: ExerciseRow, workout: ProgrammeWorkoutId) {
  return exercise.name === programmeEditorSeed[workout][0].name
    && exercise.prescription === programmeEditorSeed[workout][0].prescription;
}

export default function Prototype() {
  const keyboard = useKeyboard();
  const [directionId, setDirectionId] = useState<DirectionId | null>(null);
  const [screen, setScreen] = useState<ScreenId>("onboarding");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<"flexible" | "fixed">("flexible");
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(8);
  const [rir, setRir] = useState<number | null>(null);
  const [savedSet, setSavedSet] = useState(false);
  const [completedSets, setCompletedSets] = useState(() => ({
    1: { ...workingSetSeedByWorkout["Upper A"][1] },
    2: { ...workingSetSeedByWorkout["Upper A"][2] },
    3: { ...workingSetSeedByWorkout["Upper A"][3] },
  }));
  const [editingSetNumber, setEditingSetNumber] = useState<WorkingSetNumber>(4);
  const [partialFinishOpen, setPartialFinishOpen] = useState(false);
  const [pendingGlobalNavigation, setPendingGlobalNavigation] = useState<NavigationDestination | null>(null);
  const [completionSource, setCompletionSource] = useState<"fixture" | "active-finish">("fixture");
  const [todayWorkout, setTodayWorkout] = useState<ProgrammeWorkoutId>("Upper A");
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<ProgrammeWorkoutId>("Lower A");
  const [hasCompletedPrototypeWorkout, setHasCompletedPrototypeWorkout] = useState(false);
  const [activeCountsAsExpected, setActiveCountsAsExpected] = useState(true);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeExerciseName, setActiveExerciseName] = useState("Barbell bench press");
  const [lastRecordedExerciseName, setLastRecordedExerciseName] = useState("Barbell bench press");
  const [lastRecordedSet, setLastRecordedSet] = useState(() => ({
    weight: workingSetSeedByWorkout["Upper A"][3].weight,
    reps: workingSetSeedByWorkout["Upper A"][3].reps,
  }));
  const [replacementFromExercise, setReplacementFromExercise] = useState<string | null>(null);
  const [hasComparableSetFixture, setHasComparableSetFixture] = useState(true);
  const [publishedProgrammeName, setPublishedProgrammeName] = useState("Full body · 3 sessions");
  const [publishedProgrammeExercises, setPublishedProgrammeExercises] = useState(() => cloneProgrammeExercises(programmeEditorSeed));
  const [activePlanExercises, setActivePlanExercises] = useState(() => programmeEditorSeed["Upper A"].map((exercise) => ({ ...exercise })));
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const [restSeconds, setRestSeconds] = useState(72);
  const [restPaused, setRestPaused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const navigationGuardRef = useRef<NavigationGuard | null>(null);

  const direction = useMemo(
    () => (directionId ? directionById(directionId) : directions[0]),
    [directionId],
  );

  const workingSets = useMemo<WorkingSet[]>(() => [
    { number: 1, ...completedSets[1], saved: true },
    { number: 2, ...completedSets[2], saved: true },
    { number: 3, ...completedSets[3], saved: true },
    { number: 4, weight, reps, rir, saved: savedSet },
  ], [completedSets, weight, reps, rir, savedSet]);

  const editingSet = workingSets.find((set) => set.number === editingSetNumber) ?? workingSets[3];

  const navigate = (next: ScreenId) => {
    keyboard.hide();
    setToast(null);
    setPendingGlobalNavigation(null);
    setScreen(next);
    setReviewOpen(false);
    setPartialFinishOpen(false);
  };

  const registerNavigationGuard = useCallback((guard: NavigationGuard | null) => {
    navigationGuardRef.current = guard;
  }, []);

  const requestGlobalNavigation = (next: NavigationDestination) => {
    if (next === screen) {
      setReviewOpen(false);
      return;
    }
    const guard = navigationGuardRef.current;
    if (guard?.dirty) {
      keyboard.hide();
      setReviewOpen(false);
      setPartialFinishOpen(false);
      setPendingGlobalNavigation(next);
      return;
    }
    if (next === "direction-gallery") {
      returnToDirectionGallery();
      return;
    }
    navigate(next);
  };

  const returnToDirectionGallery = () => {
    keyboard.hide();
    setToast(null);
    setReviewOpen(false);
    setPartialFinishOpen(false);
    setPendingGlobalNavigation(null);
    setDirectionId(null);
  };

  const openSetEntry = (setNumber: WorkingSetNumber) => {
    setEditingSetNumber(setNumber);
    navigate("set-entry");
  };

  const markSetFourDraft = (change: () => void) => {
    change();
    if (savedSet) {
      setSavedSet(false);
      setToast("Set 4 changed · save again to commit the revised values");
    }
  };

  const updateSetFourWeight = (value: number) => {
    if (value === weight) return;
    markSetFourDraft(() => setWeight(value));
  };

  const updateSetFourReps = (value: number) => {
    if (value === reps) return;
    markSetFourDraft(() => setReps(value));
  };

  const updateSetFourRir = (value: number | null) => {
    if (value === rir) return;
    markSetFourDraft(() => setRir(value));
  };

  const finishActiveWorkout = () => {
    setWorkoutInProgress(false);
    setCompletionSource("active-finish");
    navigate("complete");
  };

  const returnToTodayAfterCompletion = () => {
    const nextWorkout = activeCountsAsExpected ? nextProgrammeWorkout[todayWorkout] : todayWorkout;
    setWorkoutInProgress(false);
    setLastCompletedWorkout(todayWorkout);
    setHasCompletedPrototypeWorkout(true);
    setTodayWorkout(nextWorkout);
    setActivePlanExercises(publishedProgrammeExercises[nextWorkout].map((exercise) => ({ ...exercise })));
    setActiveExerciseName(publishedProgrammeExercises[nextWorkout][0].name);
    setLastRecordedExerciseName(publishedProgrammeExercises[nextWorkout][0].name);
    setLastRecordedSet({
      weight: workingSetSeedByWorkout[nextWorkout][3].weight,
      reps: workingSetSeedByWorkout[nextWorkout][3].reps,
    });
    setHasComparableSetFixture(hasComparableWorkingSetFixture(publishedProgrammeExercises[nextWorkout][0], nextWorkout));
    setWeight(workingSetSeedByWorkout[nextWorkout][4].weight);
    setReps(workingSetSeedByWorkout[nextWorkout][4].reps);
    setRir(workingSetSeedByWorkout[nextWorkout][4].rir);
    setSavedSet(false);
    setCompletedSets({
      1: { ...workingSetSeedByWorkout[nextWorkout][1] },
      2: { ...workingSetSeedByWorkout[nextWorkout][2] },
      3: { ...workingSetSeedByWorkout[nextWorkout][3] },
    });
    setEditingSetNumber(4);
    setActiveExerciseIndex(0);
    setReplacementFromExercise(null);
    navigate("today");
  };

  const saveEditedSet = (nextWeight: number, nextReps: number, nextRir: number | null) => {
    if (editingSetNumber === 4) {
      setWeight(nextWeight);
      setReps(nextReps);
      setRir(nextRir);
      setSavedSet(true);
      setLastRecordedExerciseName(activeExerciseName);
      setLastRecordedSet({ weight: nextWeight, reps: nextReps });
      navigate("active");
      setToast(`Set 4 recorded in prototype state · ${nextWeight} kg × ${nextReps}`);
      return;
    }

    setCompletedSets((current) => ({
      ...current,
      [editingSetNumber]: { weight: nextWeight, reps: nextReps, rir: nextRir },
    }));
    setLastRecordedExerciseName(activeExerciseName);
    setLastRecordedSet({ weight: nextWeight, reps: nextReps });
    navigate("active");
    setToast(`Set ${editingSetNumber} updated in prototype state · ${nextWeight} kg × ${nextReps}`);
  };

  const saveQuickSet = (nextWeight: number, nextReps: number, nextRir: number | null) => {
    const normalSetReps = Math.max(1, Math.trunc(nextReps));
    setWeight(nextWeight);
    setReps(normalSetReps);
    setRir(nextRir);
    setSavedSet(true);
    setLastRecordedExerciseName(activeExerciseName);
    setLastRecordedSet({ weight: nextWeight, reps: normalSetReps });
    setToast(`Set 4 recorded in prototype state · ${nextWeight} kg × ${normalSetReps}`);
  };

  if (!directionId) {
    return (
      <MobileScroll className="nextset-scroll review-scroll">
        <main className="direction-gallery" aria-label="NextSet visual direction prototypes">
          <p className="eyebrow">NEXTSET / FOUNDATION REVIEW</p>
          <h1>Three ways to make the next set feel effortless.</h1>
          <p className="gallery-intro">
            Each direction contains the same ten critical product screens, expressed through a different
            hierarchy, interaction rhythm and visual system.
          </p>
          <div className="direction-list">
            {directions.map((item, index) => (
              <button
                className={`direction-card direction-card-${item.id}`}
                key={item.id}
                onClick={() => {
                  keyboard.hide();
                  setToast(null);
                  setReviewOpen(false);
                  setPartialFinishOpen(false);
                  setDirectionId(item.id);
                  setScreen("onboarding");
                  setSchedule("flexible");
                  setWeight(100);
                  setReps(8);
                  setRir(null);
                  setSavedSet(false);
                  setCompletedSets({
                    1: { ...workingSetSeedByWorkout["Upper A"][1] },
                    2: { ...workingSetSeedByWorkout["Upper A"][2] },
                    3: { ...workingSetSeedByWorkout["Upper A"][3] },
                  });
                  setEditingSetNumber(4);
                  setCompletionSource("fixture");
                  setTodayWorkout("Upper A");
                  setLastCompletedWorkout("Lower A");
                  setHasCompletedPrototypeWorkout(false);
                  setActiveCountsAsExpected(true);
                  setWorkoutInProgress(false);
                  setActiveExerciseIndex(0);
                  setActiveExerciseName("Barbell bench press");
                  setLastRecordedExerciseName("Barbell bench press");
                  setLastRecordedSet({
                    weight: workingSetSeedByWorkout["Upper A"][3].weight,
                    reps: workingSetSeedByWorkout["Upper A"][3].reps,
                  });
                  setReplacementFromExercise(null);
                  setHasComparableSetFixture(true);
                  setPublishedProgrammeName("Full body · 3 sessions");
                  setPublishedProgrammeExercises(cloneProgrammeExercises(programmeEditorSeed));
                  setActivePlanExercises(programmeEditorSeed["Upper A"].map((exercise) => ({ ...exercise })));
                  setExerciseNotes({});
                  setRestSeconds(72);
                  setRestPaused(false);
                  setSelection(null);
                }}
              >
                <span className="direction-number">0{index + 1}</span>
                <span className="direction-card-copy">
                  <strong>{item.name}</strong>
                  <small>{item.strapline}</small>
                </span>
                <ArrowRightIcon aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="prototype-note">
            Disposable design artefacts · realistic sample training data · not production code
          </p>
        </main>
      </MobileScroll>
    );
  }

  return (
    <div className={`nextset-app direction-${direction.id}`} data-direction={direction.id}>
      <MobileScroll className="nextset-scroll">
        <main className={`app-content screen-${screen}`} data-testid={`screen-${screen}`}>
          <PrototypeHeader
            direction={direction}
            screen={screen}
            onBack={screen === "onboarding" ? returnToDirectionGallery : undefined}
            onOpenReview={() => setReviewOpen(true)}
          />

          {screen === "onboarding" && (
            <OnboardingScreen
              direction={direction}
              selection={selection}
              onSelect={setSelection}
              onContinue={() => navigate("programme")}
              onSkip={() => {
                setSelection(null);
                navigate("programme");
                setToast("No training goal selected · suggestions remain neutral");
              }}
            />
          )}
          {screen === "programme" && (
            <ProgrammeScreen
              direction={direction}
              schedule={schedule}
              onSchedule={setSchedule}
              onContinue={() => navigate("today")}
              onCustom={() => navigate("programme-editor")}
            />
          )}
          {screen === "today" && (
            <TodayScreen
              direction={direction}
              schedule={schedule}
              workout={todayWorkout}
              lastCompletedWorkout={lastCompletedWorkout}
              hasCompletedPrototypeWorkout={hasCompletedPrototypeWorkout}
              plannedExercises={workoutInProgress ? activePlanExercises : publishedProgrammeExercises[todayWorkout]}
              workoutInProgress={workoutInProgress}
              onStart={() => {
                if (workoutInProgress) {
                  navigate("active");
                  return;
                }
                setActiveCountsAsExpected(true);
                setWorkoutInProgress(true);
                setActiveExerciseIndex(0);
                setReplacementFromExercise(null);
                setActivePlanExercises(publishedProgrammeExercises[todayWorkout].map((exercise) => ({ ...exercise })));
                setActiveExerciseName(publishedProgrammeExercises[todayWorkout][0].name);
                setLastRecordedExerciseName(publishedProgrammeExercises[todayWorkout][0].name);
                setLastRecordedSet({
                  weight: workingSetSeedByWorkout[todayWorkout][3].weight,
                  reps: workingSetSeedByWorkout[todayWorkout][3].reps,
                });
                setWeight(workingSetSeedByWorkout[todayWorkout][4].weight);
                setReps(workingSetSeedByWorkout[todayWorkout][4].reps);
                setRir(workingSetSeedByWorkout[todayWorkout][4].rir);
                setSavedSet(false);
                setCompletedSets({
                  1: { ...workingSetSeedByWorkout[todayWorkout][1] },
                  2: { ...workingSetSeedByWorkout[todayWorkout][2] },
                  3: { ...workingSetSeedByWorkout[todayWorkout][3] },
                });
                setEditingSetNumber(4);
                setHasComparableSetFixture(hasComparableWorkingSetFixture(publishedProgrammeExercises[todayWorkout][0], todayWorkout));
                setExerciseNotes({});
                setRestSeconds(72);
                setRestPaused(false);
                navigate("active");
              }}
              onUnplanned={() => {
                setActiveCountsAsExpected(false);
                setWorkoutInProgress(true);
                setActiveExerciseIndex(0);
                setReplacementFromExercise(null);
                setActivePlanExercises(publishedProgrammeExercises[todayWorkout].map((exercise) => ({ ...exercise })));
                setActiveExerciseName(publishedProgrammeExercises[todayWorkout][0].name);
                setLastRecordedExerciseName(publishedProgrammeExercises[todayWorkout][0].name);
                setLastRecordedSet({
                  weight: workingSetSeedByWorkout[todayWorkout][3].weight,
                  reps: workingSetSeedByWorkout[todayWorkout][3].reps,
                });
                setWeight(workingSetSeedByWorkout[todayWorkout][4].weight);
                setReps(workingSetSeedByWorkout[todayWorkout][4].reps);
                setRir(workingSetSeedByWorkout[todayWorkout][4].rir);
                setSavedSet(false);
                setCompletedSets({
                  1: { ...workingSetSeedByWorkout[todayWorkout][1] },
                  2: { ...workingSetSeedByWorkout[todayWorkout][2] },
                  3: { ...workingSetSeedByWorkout[todayWorkout][3] },
                });
                setEditingSetNumber(4);
                setHasComparableSetFixture(hasComparableWorkingSetFixture(publishedProgrammeExercises[todayWorkout][0], todayWorkout));
                setExerciseNotes({});
                setRestSeconds(72);
                setRestPaused(false);
                navigate("active");
                setToast("Unplanned workout started · programme sequence unchanged");
              }}
              onEdit={() => navigate("programme-editor")}
            />
          )}
          {screen === "active" && (
            <ActiveWorkoutScreen
              direction={direction}
              savedSet={savedSet}
              weight={weight}
              reps={reps}
              rir={rir}
              activeExerciseIndex={activeExerciseIndex}
              replacementFromExercise={replacementFromExercise}
              countsAsExpected={activeCountsAsExpected}
              hasComparableSetFixture={hasComparableSetFixture}
              workout={todayWorkout}
              exerciseName={activeExerciseName}
              plannedFirstExercise={activePlanExercises[0]}
              nextExerciseName={activePlanExercises[1]?.name ?? "Next planned exercise"}
              plannedExerciseCount={activePlanExercises.length}
              exerciseNote={exerciseNotes[activeExerciseName] ?? ""}
              onSaveExerciseNote={(note) => {
                setExerciseNotes((current) => ({ ...current, [activeExerciseName]: note }));
              }}
              onAdvanceExercise={() => {
                setActiveExerciseIndex(1);
                setReplacementFromExercise(null);
                setActiveExerciseName(activePlanExercises[1]?.name ?? "Next planned exercise");
                setToast("Focus moved to exercise 2 in prototype state");
              }}
              workingSets={workingSets}
              onEditSet={openSetEntry}
              onWeight={updateSetFourWeight}
              onReps={updateSetFourReps}
              onRir={updateSetFourRir}
              restSeconds={restSeconds}
              restPaused={restPaused}
              onRestSeconds={setRestSeconds}
              onRestPaused={setRestPaused}
              onSubstitute={() => navigate("substitution")}
              onFinish={() => savedSet ? finishActiveWorkout() : setPartialFinishOpen(true)}
            />
          )}
          {screen === "set-entry" && (
            <SetEntryScreen
              direction={direction}
              setNumber={editingSet.number}
              initialWeight={editingSet.weight}
              initialReps={editingSet.reps}
              initialRir={editingSet.rir}
              previouslySaved={editingSet.saved}
              exerciseName={activeExerciseName}
              onSave={saveEditedSet}
              onNavigationGuard={registerNavigationGuard}
            />
          )}
          {screen === "substitution" && (
            <SubstitutionScreen
              direction={direction}
              exerciseName={activeExerciseName}
              candidateExerciseName={replacementFromExercise ?? activeExerciseName}
              exerciseMeta={
                substitutionMetaByName[activeExerciseName]
                ?? (replacementFromExercise ? "Today-only replacement · detailed metadata not recorded" : activePlanExercises[activeExerciseIndex]?.meta)
                ?? "Exercise metadata unavailable"
              }
              onChoose={(name, scope) => {
                if (scope === "today") {
                  setReplacementFromExercise((current) => current ?? activeExerciseName);
                  setActiveExerciseName(name);
                } else {
                  setPublishedProgrammeExercises((current) => ({
                    ...current,
                    [todayWorkout]: current[todayWorkout].map((exercise, index) => (
                      index === activeExerciseIndex
                        ? { ...exercise, name, meta: substitutionMetaByName[name] ?? "Future replacement · metadata review needed" }
                        : exercise
                    )),
                  }));
                }
                navigate("active");
                setToast(`${name} selected for ${scope === "today" ? "today only" : "the next programme version"}`);
              }}
            />
          )}
          {screen === "complete" && (
            <CompletionScreen
              direction={direction}
              savedSet={savedSet}
              recordedExerciseName={lastRecordedExerciseName}
              recordedWeight={lastRecordedSet.weight}
              recordedReps={lastRecordedSet.reps}
              workingSets={workingSets}
              countsAsExpected={activeCountsAsExpected}
              activeCompletedSetCount={hasComparableSetFixture ? savedSet ? 4 : 3 : 0}
              workout={todayWorkout}
              plannedExercises={activePlanExercises}
              nextWorkout={activeCountsAsExpected ? nextProgrammeWorkout[todayWorkout] : todayWorkout}
              source={completionSource}
              onDone={returnToTodayAfterCompletion}
            />
          )}
          {screen === "history" && (
            <HistoryScreen direction={direction} onExercise={() => navigate("exercise-progress")} />
          )}
          {screen === "exercise-progress" && <ExerciseProgressScreen direction={direction} />}
          {screen === "programme-editor" && (
            <ProgrammeEditorScreen
              direction={direction}
              initialSchedule={schedule}
              initialProgrammeName={publishedProgrammeName}
              initialExercises={publishedProgrammeExercises}
              onNavigationGuard={registerNavigationGuard}
              onSave={(nextName, nextExercises, nextSchedule) => {
                setPublishedProgrammeName(nextName);
                setPublishedProgrammeExercises(cloneProgrammeExercises(nextExercises));
                setSchedule(nextSchedule);
                navigate("today");
                setToast("New programme version published in this prototype state");
              }}
            />
          )}
        </main>
      </MobileScroll>

      {toast && (
        <div className="save-toast" role="status">
          <CheckCircledIcon aria-hidden="true" /> {toast}
        </div>
      )}

      {screen === "active" && activeExerciseIndex === 0 && replacementFromExercise === null && hasComparableSetFixture && (
        <ActiveWorkoutDock
          direction={direction}
          savedSet={savedSet}
          weight={weight}
          reps={reps}
          rir={rir}
          onWeight={updateSetFourWeight}
          onReps={updateSetFourReps}
          onRir={updateSetFourRir}
          onQuickSave={() => saveQuickSet(weight, reps, rir)}
        />
      )}

      <BottomNavigation
        direction={direction}
        screen={screen}
        workoutInProgress={workoutInProgress}
        onNavigate={requestGlobalNavigation}
        onOpenReview={() => setReviewOpen(true)}
      />

      <BottomSheet
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        title={`${direction.name} screen index`}
        description="Jump between the ten required review states or switch direction."
        snap={0.82}
      >
        <div className="screen-index">
          {screenOrder.map((item, index) => (
            <button
              className={screen === item ? "is-current" : ""}
              key={item}
              onClick={() => {
                if (item === "complete") setCompletionSource("fixture");
                requestGlobalNavigation(item);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {screenLabels[item]}
              {screen === item && <CheckIcon aria-hidden="true" />}
            </button>
          ))}
          <button className="switch-direction" onClick={() => requestGlobalNavigation("direction-gallery")}>
            <ReloadIcon aria-hidden="true" /> Review all three directions
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={partialFinishOpen}
        onOpenChange={setPartialFinishOpen}
        title="Finish with planned work remaining?"
        description={hasComparableSetFixture
          ? `Set 4 of ${activeExerciseName} has not been recorded. Finishing now records 3 planned working sets; later work remains incomplete.`
          : `No sets for ${activeExerciseName} have been recorded in prototype state. Finishing now leaves all planned work incomplete.`}
        snap={0.46}
      >
        <div className="partial-finish-actions">
          <button
            className="primary-button"
            data-direction={direction.id}
            onClick={finishActiveWorkout}
          >
            Finish partial workout
          </button>
          <button className="secondary-action" onClick={() => setPartialFinishOpen(false)}>
            Keep training
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={pendingGlobalNavigation !== null}
        onOpenChange={(open) => {
          if (!open) setPendingGlobalNavigation(null);
        }}
        title={navigationGuardRef.current?.title ?? "Save changes before leaving?"}
        description={navigationGuardRef.current?.description ?? "Choose what to do with the edits on this screen."}
        snap={0.52}
      >
        <div className="partial-finish-actions navigation-guard-actions">
          <button
            className="primary-button"
            data-direction={direction.id}
            disabled={!navigationGuardRef.current?.canSave}
            onClick={() => {
              const destination = pendingGlobalNavigation;
              const guard = navigationGuardRef.current;
              if (!destination || !guard?.canSave || !guard.save()) return;
              if (destination === "direction-gallery") returnToDirectionGallery();
              else navigate(destination);
              setToast(guard.savedConfirmation);
            }}
          >
            Save changes and leave
          </button>
          <button
            className="secondary-action"
            onClick={() => {
              const destination = pendingGlobalNavigation;
              const guard = navigationGuardRef.current;
              if (!destination || !guard) return;
              guard.discard();
              if (destination === "direction-gallery") returnToDirectionGallery();
              else navigate(destination);
              setToast(guard.discardedConfirmation);
            }}
          >
            Discard changes
          </button>
          <button className="secondary-action" onClick={() => setPendingGlobalNavigation(null)}>
            Keep editing
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function PrototypeHeader({
  direction,
  screen,
  onBack,
  onOpenReview,
}: {
  direction: Direction;
  screen: ScreenId;
  onBack?: () => void;
  onOpenReview: () => void;
}) {
  return (
    <header className="prototype-header">
      <div className="brand-lockup">
        {onBack && (
          <button className="icon-button back-button" onClick={onBack} aria-label="Back to direction gallery">
            <ArrowLeftIcon />
          </button>
        )}
        <div>
          <strong>NEXTSET</strong>
          <small>{direction.name}</small>
        </div>
      </div>
      <button className="review-menu" onClick={onOpenReview} aria-label="Open prototype screen index">
        <RowsIcon aria-hidden="true" />
        <span>{screenLabels[screen]}</span>
      </button>
    </header>
  );
}

function OnboardingScreen({
  direction,
  selection,
  onSelect,
  onContinue,
  onSkip,
}: {
  direction: Direction;
  selection: string | null;
  onSelect: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const goals = ["Build consistency", "Get stronger", "Build muscle", "General fitness"];
  return (
    <section className="screen-section onboarding-screen">
      <ProgressMarker current={1} total={3} label="YOUR STARTING POINT" />
      <p className="section-kicker">A plan that moves with real life</p>
      <h1>What would make training feel successful right now?</h1>
      <p className="section-lead">
        Choose a starting point. This shapes suggestions, never locks your training into one method.
      </p>
      <div className="choice-list" role="radiogroup" aria-label="Training goal">
        {goals.map((goal) => (
          <button
            key={goal}
            role="radio"
            aria-checked={selection === goal}
            className={selection === goal ? "is-selected" : ""}
            onClick={() => onSelect(goal)}
          >
            <span>{goal}</span>
            <small>{goal === "Build consistency" ? "A simple rhythm you can sustain" : "Adjustable at any time"}</small>
            {selection === goal && <CheckCircledIcon aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="plain-assurance">
        <CheckIcon aria-hidden="true" /> No punitive streaks. Flexible plans stay on the current step; fixed-date misses wait for your choice.
      </div>
      <PrimaryButton direction={direction} onClick={onContinue}>
        Continue to programmes <ArrowRightIcon aria-hidden="true" />
      </PrimaryButton>
      <button className="secondary-action" onClick={onSkip}>
        Explore without choosing
      </button>
    </section>
  );
}

function ProgrammeScreen({
  direction,
  schedule,
  onSchedule,
  onContinue,
  onCustom,
}: {
  direction: Direction;
  schedule: "flexible" | "fixed";
  onSchedule: (value: "flexible" | "fixed") => void;
  onContinue: () => void;
  onCustom: () => void;
}) {
  return (
    <section className="screen-section programme-screen">
      <ProgressMarker current={2} total={3} label="CHOOSE A PROGRAMME" />
      <h1>Explore an example. Tune it later.</h1>
      <p className="section-lead">Example content only · three sessions · common gym equipment · 45–60 minute estimate. Professional content review is required before release.</p>

      <article className="programme-feature is-selected">
        <div className="feature-topline">
          <span className="status-label">EXAMPLE · CONTENT REVIEW REQUIRED</span>
          <CheckCircledIcon aria-hidden="true" />
        </div>
        <h2>Full body · 3 sessions</h2>
        <p>A three-session structure showing rep-range fields and equipment substitution controls.</p>
        <dl>
          <div><dt>Frequency</dt><dd>3× weekly</dd></div>
          <div><dt>Duration</dt><dd>45–60 min</dd></div>
          <div><dt>Status</dt><dd>Not validated</dd></div>
        </dl>
      </article>

      <div className="schedule-choice">
        <p className="field-heading">How should workouts advance?</p>
        <div className="segmented-control" role="radiogroup" aria-label="Schedule type">
          <button
            role="radio"
            aria-checked={schedule === "flexible"}
            className={schedule === "flexible" ? "is-selected" : ""}
            onClick={() => onSchedule("flexible")}
          >
            Flexible sequence
            <small>A → B → C, whenever you train</small>
          </button>
          <button
            role="radio"
            aria-checked={schedule === "fixed"}
            className={schedule === "fixed" ? "is-selected" : ""}
            onClick={() => onSchedule("fixed")}
          >
            Fixed weekdays
            <small>Plan around chosen days</small>
          </button>
        </div>
      </div>

      <PrimaryButton direction={direction} onClick={onContinue}>
        Use this example in prototype <ArrowRightIcon aria-hidden="true" />
      </PrimaryButton>
      <button className="secondary-action" onClick={onCustom}>
        Create a custom programme
      </button>
    </section>
  );
}

function TodayScreen({
  direction,
  schedule,
  workout,
  lastCompletedWorkout,
  hasCompletedPrototypeWorkout,
  plannedExercises,
  workoutInProgress,
  onStart,
  onUnplanned,
  onEdit,
}: {
  direction: Direction;
  schedule: "flexible" | "fixed";
  workout: ProgrammeWorkoutId;
  lastCompletedWorkout: ProgrammeWorkoutId;
  hasCompletedPrototypeWorkout: boolean;
  plannedExercises: ExerciseRow[];
  workoutInProgress: boolean;
  onStart: () => void;
  onUnplanned: () => void;
  onEdit: () => void;
}) {
  const isUpperA = workout === "Upper A";
  return (
    <section className="screen-section today-screen">
      <div className="today-date">
        <span>THURSDAY</span>
        <strong>6 AUG</strong>
      </div>
      <p className="section-kicker">NEXT IN YOUR {schedule === "flexible" ? "SEQUENCE" : "WEEK"}</p>
      <h1>{workout}</h1>
      <p className="today-summary">{isUpperA ? "Horizontal push and pull" : workout === "Lower A" ? "Squat and hinge" : "Upper-body variation"} · {plannedExercises.length} exercises · about 52 minutes</p>

      <div className="focus-panel">
        <div>
          <small>MAIN FOCUS</small>
          <strong>{plannedExercises[0].name} · {plannedExercises[0].prescription}</strong>
        </div>
        <div>
          <small>LAST WORKOUT</small>
          <strong>{lastCompletedWorkout} · {hasCompletedPrototypeWorkout ? "just recorded" : "3 days ago"}</strong>
        </div>
      </div>

      <ol className="today-exercises">
        {plannedExercises.map((exercise, position) => (
          <li key={exercise.name}>
            <span>{String(position + 1).padStart(2, "0")}</span>
            <div><strong>{exercise.name}</strong><small>{exercise.meta}</small></div>
            <b>{exercise.prescription}</b>
          </li>
        ))}
      </ol>

      <div className="offline-note">
        <CheckCircledIcon aria-hidden="true" /> Foundation target · local-first persistence must pass release testing
      </div>
      <PrimaryButton direction={direction} onClick={onStart}>
        {workoutInProgress ? `Continue ${workout}` : `Start ${workout}`} <ArrowRightIcon aria-hidden="true" />
      </PrimaryButton>
      <div className="inline-actions">
        {!workoutInProgress && <button onClick={onUnplanned}>Start unplanned workout</button>}
        <button onClick={onEdit}>Edit programme</button>
      </div>
    </section>
  );
}

function ActiveWorkoutScreen({
  direction,
  savedSet,
  weight,
  reps,
  rir,
  activeExerciseIndex,
  replacementFromExercise,
  countsAsExpected,
  hasComparableSetFixture,
  workout,
  exerciseName,
  plannedFirstExercise,
  nextExerciseName,
  plannedExerciseCount,
  exerciseNote,
  onSaveExerciseNote,
  onAdvanceExercise,
  workingSets,
  onEditSet,
  onWeight,
  onReps,
  onRir,
  restSeconds,
  restPaused,
  onRestSeconds,
  onRestPaused,
  onSubstitute,
  onFinish,
}: {
  direction: Direction;
  savedSet: boolean;
  weight: number;
  reps: number;
  rir: number | null;
  activeExerciseIndex: number;
  replacementFromExercise: string | null;
  countsAsExpected: boolean;
  hasComparableSetFixture: boolean;
  workout: ProgrammeWorkoutId;
  exerciseName: string;
  plannedFirstExercise: ExerciseRow;
  nextExerciseName: string;
  plannedExerciseCount: number;
  exerciseNote: string;
  onSaveExerciseNote: (note: string) => void;
  onAdvanceExercise: () => void;
  workingSets: WorkingSet[];
  onEditSet: (setNumber: WorkingSetNumber) => void;
  onWeight: (value: number) => void;
  onReps: (value: number) => void;
  onRir: (value: number | null) => void;
  restSeconds: number;
  restPaused: boolean;
  onRestSeconds: Dispatch<SetStateAction<number>>;
  onRestPaused: Dispatch<SetStateAction<boolean>>;
  onSubstitute: () => void;
  onFinish: () => void;
}) {
  const restLabel = `${String(Math.floor(restSeconds / 60)).padStart(2, "0")}:${String(restSeconds % 60).padStart(2, "0")}`;
  const targetRepRange = plannedFirstExercise.prescription.split("×")[1]?.trim() ?? plannedFirstExercise.prescription;
  const priorComparableSet = priorComparableSetByWorkout[workout];

  useEffect(() => {
    if (restPaused) return undefined;
    const timer = window.setInterval(() => {
      onRestSeconds((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [onRestSeconds, restPaused]);

  if (replacementFromExercise) {
    return (
      <section className="screen-section active-screen next-exercise-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <p className="section-kicker">{workout.toUpperCase()} · TODAY-ONLY REPLACEMENT SEGMENT</p>
        <h1>{exerciseName}</h1>
        <p className="section-lead">
          Previously recorded sets remain attributed to {replacementFromExercise}. No sets for {exerciseName} have been entered in prototype state.
        </p>
        <div className="next-exercise-ready" role="status">
          <CheckCircledIcon aria-hidden="true" /> Current replacement focus · set entry is outside this ten-screen review state
        </div>
        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} />
        <div className="inline-actions">
          <button onClick={onSubstitute}>Choose another replacement</button>
          <button onClick={onFinish}>Finish workout</button>
        </div>
      </section>
    );
  }

  if (!hasComparableSetFixture) {
    return (
      <section className="screen-section active-screen next-exercise-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <p className="section-kicker">{workout.toUpperCase()} · EXERCISE 1 OF {plannedExerciseCount}</p>
        <h1>{exerciseName}</h1>
        <p className="section-lead">Target {targetRepRange} reps · {plannedFirstExercise.prescription.split("×")[0]?.trim()} working sets</p>
        <div className="next-exercise-ready" role="status">
          No comparable set sample exists for this reordered or replaced first exercise. No observations are prefilled or recorded.
        </div>
        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} />
        <div className="inline-actions">
          <button onClick={onSubstitute}>Replace exercise</button>
          <button onClick={onFinish}>Finish workout</button>
        </div>
      </section>
    );
  }

  if (activeExerciseIndex > 0) {
    return (
      <section className="screen-section active-screen next-exercise-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <p className="section-kicker">{workout.toUpperCase()} · EXERCISE {activeExerciseIndex + 1} OF {plannedExerciseCount}</p>
        <h1>{exerciseName}</h1>
        <p className="section-lead">Focus advanced after the previous set was recorded. No sets for this exercise have been entered in prototype state.</p>
        <div className="next-exercise-ready" role="status">
          <CheckCircledIcon aria-hidden="true" /> Current focus · set entry is outside this ten-screen review state
        </div>
        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} />
        <div className="inline-actions">
          <button onClick={onSubstitute}>Replace exercise</button>
          <button onClick={onFinish}>Finish workout</button>
        </div>
      </section>
    );
  }

  if (direction.id === "field") {
    return (
      <section className="screen-section active-screen field-active-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <div className="field-exercise-strip">
          <span>EXERCISE 1 OF {plannedExerciseCount}</span>
          <strong>{Math.round(100 / plannedExerciseCount)}%</strong>
          <div aria-hidden="true"><i style={{ width: `${100 / plannedExerciseCount}%` }} /></div>
        </div>

        <div className="field-active-title">
          <div>
            <p className="section-kicker">{workout.toUpperCase()}</p>
            <h1>{exerciseName}</h1>
          </div>
          <button className="icon-button" onClick={onSubstitute} aria-label="Exercise options"><DotsHorizontalIcon /></button>
        </div>

        <div className="field-rest-row" aria-label={`Rest timer: ${restLabel}${restPaused ? ", paused" : " remaining"}`}>
          <span>REST {restLabel}</span>
          <i aria-hidden="true" />
          <button aria-pressed={restPaused} onClick={() => onRestPaused((paused) => !paused)}>{restPaused ? "Resume" : "Pause"}</button>
          <button onClick={() => onRestSeconds((seconds) => seconds + 30)}>+30s</button>
        </div>

        <dl className="field-previous-set">
          <div><dt>Previous set</dt><dd>{workingSets[2].weight} kg</dd></div>
          <div><dt>Reps</dt><dd>{workingSets[2].reps}</dd></div>
          <div><dt>RIR</dt><dd>{workingSets[2].rir ?? "—"}</dd></div>
          <div><dt>Status</dt><dd><CheckIcon aria-label="Complete" /></dd></div>
        </dl>

        <div className="field-entry-console">
          <div>
            <span>LOAD (KG)</span><strong>{weight.toFixed(1)}</strong>
            <div><button onClick={() => onWeight(Math.max(0, weight - 2.5))} aria-label="Decrease active weight"><MinusIcon /></button><small>2.5 KG<br />INCREMENT</small><button onClick={() => onWeight(weight + 2.5)} aria-label="Increase active weight"><PlusIcon /></button></div>
          </div>
          <div>
            <span>REPS</span><strong>{reps}</strong>
            <div><button onClick={() => onReps(Math.max(1, reps - 1))} aria-label="Decrease active reps"><MinusIcon /></button><small>1 REP<br />INCREMENT</small><button onClick={() => onReps(reps + 1)} aria-label="Increase active reps"><PlusIcon /></button></div>
          </div>
        </div>

        <div className="field-rir-strip" aria-label="Active set reps in reserve">
          <span>RIR · REPS IN RESERVE</span>
          <button onClick={() => onRir(Math.max(0, (rir ?? 0) - 1))} aria-label="Decrease active RIR"><MinusIcon /></button>
          <strong aria-label={`Current active RIR: ${rir ?? "not recorded"}`}>{rir ?? "—"}</strong>
          <button onClick={() => onRir(Math.min(10, (rir ?? -1) + 1))} aria-label="Increase active RIR"><PlusIcon /></button>
          <button onClick={() => onRir(null)} aria-label="Do not record active RIR" disabled={rir === null}>CLR</button>
        </div>

        <div className="field-set-tabs" aria-label="Working set selection">
          {workingSets.map((set) => (
            <button
              key={set.number}
              className={set.number === 4 && !set.saved ? "is-current" : ""}
              onClick={() => onEditSet(set.number)}
              aria-label={`${set.saved ? "Edit completed" : "Open"} set ${set.number}: ${set.weight} kilograms, ${set.reps} reps`}
            >
              <span>SET {set.number}</span><strong>{set.weight} KG</strong><small>{set.saved ? `${set.reps} REPS` : "CURRENT"}</small>
            </button>
          ))}
        </div>

        <NextFocusCard visible={savedSet} exerciseName={nextExerciseName} totalExercises={plannedExerciseCount} onAdvance={onAdvanceExercise} />

        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} />

        <div className="field-target-row"><span>TARGET RANGE</span><strong>{targetRepRange} REPS</strong><small>{plannedFirstExercise.meta}</small></div>
        <div className="inline-actions"><button onClick={onSubstitute}>Replace exercise</button><button onClick={onFinish}>Finish workout</button></div>
      </section>
    );
  }

  if (direction.id === "pace") {
    return (
      <section className="screen-section active-screen pace-active-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <div
          className="pace-timeline"
          aria-label={`Exercise progress: exercise 1 of ${plannedExerciseCount} is current`}
          style={{ gridTemplateRows: `repeat(${plannedExerciseCount}, 32px)`, gap: `${Math.max(46, 106 - plannedExerciseCount * 2)}px` }}
        >
          {Array.from({ length: plannedExerciseCount }, (_, index) => <span key={index} className={index === 0 ? "is-current" : ""}>{index + 1}</span>)}
        </div>
        <div className="pace-active-body">
          <div className="pace-heading-row">
            <div>
              <small>EXERCISE 1 OF {plannedExerciseCount}</small>
              <h1>{exerciseName}</h1>
              <p>
                {exerciseName === plannedFirstExercise.name
                  ? plannedFirstExercise.meta
                  : "Today-only replacement · review metadata below"}
              </p>
            </div>
            <button className="icon-button" onClick={onSubstitute} aria-label="Exercise options"><DotsHorizontalIcon /></button>
          </div>

          <div className="pace-rest-card" aria-label={`Rest timer: ${restLabel}${restPaused ? ", paused" : " remaining"}`}>
            <ClockIcon aria-hidden="true" /><div><small>{restPaused ? "PAUSED" : "RESTING"}</small><strong>{restLabel}</strong></div><span aria-hidden="true"><i /></span>
            <button aria-pressed={restPaused} onClick={() => onRestPaused((paused) => !paused)}>{restPaused ? "Resume" : "Pause"}</button>
            <button onClick={() => onRestSeconds((seconds) => seconds + 30)}>+30s</button>
          </div>

          <dl className="pace-session-facts"><div><dt>Target</dt><dd>{targetRepRange} reps</dd></div><div><dt>Last comparable set</dt><dd>{priorComparableSet.reps} reps @ {priorComparableSet.weight} kg<br /><small>Sample prior fixture</small></dd></div></dl>

          <div className="pace-set-list" role="table" aria-label="Working sets">
            <div role="row"><span>SET</span><span>REPS</span><span>WEIGHT</span></div>
            {workingSets.map((set) => (
              <button
                key={set.number}
                className={set.number === 4 && !set.saved ? "is-current" : ""}
                onClick={() => onEditSet(set.number)}
                aria-label={`${set.saved ? "Edit completed" : "Open"} set ${set.number}: ${set.reps} reps at ${set.weight} kilograms`}
              >
                <span>{set.saved ? <CheckIcon aria-label="Complete" /> : set.number}</span><strong>Set {set.number}</strong><span>{set.saved ? set.reps : targetRepRange}</span><span>{set.weight} kg</span>
              </button>
            ))}
          </div>

          <NextFocusCard visible={savedSet} exerciseName={nextExerciseName} totalExercises={plannedExerciseCount} onAdvance={onAdvanceExercise} />

          <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} />

          <button className="pace-finish" onClick={onFinish}>Finish workout</button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen-section active-screen tempo-active-layout">
      <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
      <div className="workout-progress">
        <span>EXERCISE 1 OF {plannedExerciseCount}</span>
        <strong>{Math.round(100 / plannedExerciseCount)}%</strong>
        <div aria-hidden="true"><i style={{ width: `${100 / plannedExerciseCount}%` }} /></div>
      </div>

      <div className="exercise-heading">
        <div>
          <p className="section-kicker">{workout.toUpperCase()}</p>
          <h1>{exerciseName}</h1>
          <span>Target {targetRepRange} reps · {plannedFirstExercise.prescription.split("×")[0]?.trim()} working sets</span>
        </div>
        <button className="icon-button" onClick={onSubstitute} aria-label="Exercise options">
          <DotsHorizontalIcon />
        </button>
      </div>

      <div className="rest-rail" aria-label={`Rest timer: ${restLabel}${restPaused ? ", paused" : " remaining"}`}>
        <ClockIcon aria-hidden="true" />
        <div><small>{restPaused ? "PAUSED" : "RESTING"}</small><strong>{restLabel}</strong></div>
        <span aria-hidden="true"><i /></span>
        <button aria-pressed={restPaused} onClick={() => onRestPaused((paused) => !paused)}>{restPaused ? "Resume" : "Pause"}</button>
        <button onClick={() => onRestSeconds((seconds) => seconds + 30)}>+30s</button>
      </div>

      <div className="last-performance">
        <small>SAMPLE PRIOR COMPARABLE SET</small>
        <strong>{priorComparableSet.weight} kg × {priorComparableSet.reps} reps</strong>
        <span>RIR {priorComparableSet.rir ?? "not recorded"}</span>
      </div>

      <div className="set-ledger" role="table" aria-label="Working sets">
        <div className="set-row set-header" role="row">
          <span>SET</span><span>KG</span><span>REPS</span><span>RIR</span>
        </div>
        {workingSets.map((set) => (
          <button
            className={`set-row ${set.saved ? "is-complete" : "is-current"}`}
            key={set.number}
            onClick={() => onEditSet(set.number)}
            aria-label={`${set.saved ? "Edit completed" : "Open"} set ${set.number}: ${set.weight} kilograms, ${set.reps} reps, RIR ${set.rir ?? "not recorded"}`}
          >
            <span>{set.saved ? <CheckIcon aria-label="Complete" /> : set.number}</span>
            <strong>{set.weight}</strong>
            <strong>{set.saved ? set.reps : targetRepRange}</strong>
            <strong>{set.rir ?? "—"}</strong>
          </button>
        ))}
      </div>

      <NextFocusCard visible={savedSet} exerciseName={nextExerciseName} totalExercises={plannedExerciseCount} onAdvance={onAdvanceExercise} />

      <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} />

      <div className="inline-actions">
        <button onClick={onSubstitute}>Replace exercise</button>
        <button onClick={onFinish}>Finish workout</button>
      </div>
    </section>
  );
}

function SessionScopeNotice({ countsAsExpected, workout }: { countsAsExpected: boolean; workout: ProgrammeWorkoutId }) {
  if (countsAsExpected) return null;
  return (
    <div className="session-scope-notice" role="status">
      <strong>Unplanned {workout} repeat</strong>
      <span>This sample session does not count as the expected occurrence; the programme sequence stays unchanged.</span>
    </div>
  );
}

function NextFocusCard({
  visible,
  exerciseName,
  totalExercises,
  onAdvance,
}: {
  visible: boolean;
  exerciseName: string;
  totalExercises: number;
  onAdvance: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="next-focus-card" role="region" aria-label={`Next exercise focus: ${exerciseName}`}>
      <small>NEXT FOCUS · EXERCISE 2 OF {totalExercises}</small>
      <strong>{exerciseName}</strong>
      <span>The next exercise can be reviewed here; its Set 1 entry is outside this ten-screen fixture.</span>
      <button onClick={onAdvance}>Go to {exerciseName}</button>
    </div>
  );
}

function ExerciseNoteControl({
  exerciseName,
  note,
  onSave,
}: {
  exerciseName: string;
  note: string;
  onSave: (note: string) => void;
}) {
  const keyboard = useKeyboard();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState(false);

  return (
    <div className="exercise-note-control">
      <button
        className="secondary-action"
        aria-expanded={open}
        onClick={() => {
          if (open) keyboard.hide();
          setOpen((current) => !current);
        }}
      >
        {open ? "Close exercise note" : `Add exercise note for ${exerciseName}`}
      </button>
      {open && (
        <div className="exercise-note-editor" role="region" aria-label={`Exercise note for ${exerciseName}`}>
          <label htmlFor={`exercise-note-${exerciseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>Private exercise note</label>
          <KeyboardInput
            id={`exercise-note-${exerciseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setSaved(false);
            }}
          />
          <button
            onClick={() => {
              onSave(draft.trim());
              setSaved(true);
            }}
            disabled={!draft.trim()}
          >Save exercise note in prototype</button>
          {saved && <small role="status">Exercise note saved in prototype state.</small>}
        </div>
      )}
    </div>
  );
}

function ActiveWorkoutDock({
  direction,
  savedSet,
  weight,
  reps,
  rir,
  onWeight,
  onReps,
  onRir,
  onQuickSave,
}: {
  direction: Direction;
  savedSet: boolean;
  weight: number;
  reps: number;
  rir: number | null;
  onWeight: (value: number) => void;
  onReps: (value: number) => void;
  onRir: (value: number | null) => void;
  onQuickSave: () => void;
}) {
  if (direction.id === "pace") {
    return (
      <aside className="active-set-dock active-set-dock-pace" aria-label="Open Pace current set controls">
        <div className="pace-entry-card">
          <div>
            <strong>SET 4 OF 4</strong>
            <span className="pace-rir-control">
              <button onClick={() => onRir(Math.max(0, (rir ?? 0) - 1))} aria-label="Decrease active RIR"><MinusIcon /></button>
              <b aria-label={`Current active RIR: ${rir ?? "not recorded"}`}>RIR {rir ?? "—"}</b>
              <button onClick={() => onRir(Math.min(10, (rir ?? -1) + 1))} aria-label="Increase active RIR"><PlusIcon /></button>
              <button onClick={() => onRir(null)} aria-label="Do not record active RIR" disabled={rir === null}>CLR</button>
            </span>
          </div>
          <div className="pace-quick-values">
            <div><small>WEIGHT (KG)</small><button onClick={() => onWeight(Math.max(0, weight - 2.5))} aria-label="Decrease active weight"><MinusIcon /></button><strong>{weight}</strong><button onClick={() => onWeight(weight + 2.5)} aria-label="Increase active weight"><PlusIcon /></button></div>
            <div><small>REPS</small><button onClick={() => onReps(Math.max(1, reps - 1))} aria-label="Decrease active reps"><MinusIcon /></button><strong>{reps}</strong><button onClick={() => onReps(reps + 1)} aria-label="Increase active reps"><PlusIcon /></button></div>
          </div>
          <button className="pace-save-set" onClick={onQuickSave}>{savedSet ? "Set 4 saved" : "Save set 4"} <ArrowRightIcon /></button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`active-set-dock active-set-dock-${direction.id}`} aria-label={`${direction.name} current set action`}>
      <PrimaryButton direction={direction} disabled={savedSet} onClick={onQuickSave}>
        {direction.id === "field"
          ? savedSet ? "SET 4 SAVED" : "COMPLETE SET 4"
          : savedSet ? "SET 4 LOGGED" : `${direction.primaryAction} 4`} <CheckIcon aria-hidden="true" />
      </PrimaryButton>
    </aside>
  );
}

function SetEntryScreen({
  direction,
  setNumber,
  initialWeight,
  initialReps,
  initialRir,
  previouslySaved,
  exerciseName,
  onSave,
  onNavigationGuard,
}: {
  direction: Direction;
  setNumber: WorkingSetNumber;
  initialWeight: number;
  initialReps: number;
  initialRir: number | null;
  previouslySaved: boolean;
  exerciseName: string;
  onSave: (weight: number, reps: number, rir: number | null) => void;
  onNavigationGuard: (guard: NavigationGuard | null) => void;
}) {
  const [entryWeight, setEntryWeight] = useState(initialWeight);
  const [entryReps, setEntryReps] = useState(initialReps);
  const [entryRir, setEntryRir] = useState<number | null>(initialRir);
  const [weightValid, setWeightValid] = useState(true);
  const [repsValid, setRepsValid] = useState(true);
  const entryValid = weightValid && repsValid;
  const entryDirty = !entryValid
    || entryWeight !== initialWeight
    || entryReps !== initialReps
    || entryRir !== initialRir;

  useLayoutEffect(() => {
    onNavigationGuard({
      dirty: entryDirty,
      canSave: entryValid,
      title: "Save this set before leaving?",
      description: entryValid
        ? `Set ${setNumber} has valid changes that have not been recorded yet.`
        : `Set ${setNumber} contains an invalid value. Correct it to save, discard the draft, or keep editing.`,
      savedConfirmation: `Set ${setNumber} saved before leaving.`,
      discardedConfirmation: `Set ${setNumber} draft discarded.`,
      save: () => {
        if (!entryValid) return false;
        onSave(entryWeight, entryReps, entryRir);
        return true;
      },
      discard: () => undefined,
    });
    return () => onNavigationGuard(null);
  }, [entryDirty, entryReps, entryRir, entryValid, entryWeight, onNavigationGuard, onSave, setNumber]);

  return (
    <section className="screen-section set-entry-screen">
      <p className="section-kicker">{exerciseName.toUpperCase()} · SET {setNumber} OF 4</p>
      <h1>{previouslySaved ? `Edit completed set ${setNumber}` : "Record the set"}</h1>
      <p className="section-lead">
        {previouslySaved
          ? `Recorded prototype observation: ${initialWeight} kg × ${initialReps} · RIR ${initialRir ?? "not recorded"}`
          : `Starting prototype value: ${initialWeight} kg × ${initialReps} · RIR ${initialRir ?? "not recorded"}`}
      </p>

      <div className="entry-grid">
        <Stepper
          label="WEIGHT (KG)"
          value={entryWeight}
          step={2.5}
          valueKind="weight"
          onValue={setEntryWeight}
          onValidityChange={setWeightValid}
        />
        <Stepper
          label="REPS"
          value={entryReps}
          step={1}
          valueKind="reps"
          onValue={setEntryReps}
          onValidityChange={setRepsValid}
        />
      </div>

      <fieldset className="rir-picker">
        <legend>REPS IN RESERVE · OPTIONAL</legend>
        <p>How many good repetitions did you have left?</p>
        <div className="rir-exact-control">
          <button type="button" onClick={() => setEntryRir((value) => Math.max(0, (value ?? 0) - 1))} aria-label="Decrease RIR"><MinusIcon /></button>
          <output aria-label={`Current RIR: ${entryRir ?? "not recorded"}`}><strong>{entryRir ?? "—"}</strong><small>{entryRir === null ? "not recorded" : "exact RIR"}</small></output>
          <button type="button" onClick={() => setEntryRir((value) => Math.min(10, (value ?? -1) + 1))} aria-label="Increase RIR"><PlusIcon /></button>
        </div>
        <button className="clear-rir" type="button" onClick={() => setEntryRir(null)} disabled={entryRir === null}>Do not record RIR</button>
      </fieldset>

      <div className="explanation-panel">
        <strong>Why {initialWeight} kg?</strong>
        <p>This is the current prototype value for this set and workout. You can keep or edit it; no change is applied automatically.</p>
      </div>

      <PrimaryButton
        direction={direction}
        disabled={!entryValid}
        onClick={() => {
          if (entryValid) onSave(entryWeight, entryReps, entryRir);
        }}
      >
        {previouslySaved ? "Update set" : direction.primaryAction} <CheckIcon aria-hidden="true" />
      </PrimaryButton>
    </section>
  );
}

function Stepper({
  label,
  value,
  step,
  valueKind,
  onValue,
  onValidityChange,
}: {
  label: string;
  value: number;
  step: number;
  valueKind: "weight" | "reps";
  onValue: (value: number) => void;
  onValidityChange: (valid: boolean) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  const [hint, setHint] = useState(`Direct entry or ${step} increments`);
  const inputId = `set-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => setDraft(String(value)), [value]);

  const validateDraft = (raw: string) => {
    const normalized = raw.trim().replace(",", ".");
    const parsed = Number(normalized);
    if (raw.trim() === "" || !Number.isFinite(parsed)) {
      return { valid: false, parsed, message: `Enter a valid ${valueKind === "reps" ? "rep count" : "weight"}` };
    }
    if (valueKind === "reps" && parsed < 1) {
      return { valid: false, parsed, message: "Reps must be at least 1 for a normal set" };
    }
    if (valueKind === "weight" && parsed < 0) {
      return { valid: false, parsed, message: "Weight must be zero or greater" };
    }
    if (parsed > 100_000) {
      return { valid: false, parsed, message: `${valueKind === "reps" ? "Reps" : "Weight"} must be 100,000 or less` };
    }
    if (valueKind === "reps" && !Number.isInteger(parsed)) {
      return { valid: false, parsed, message: "Reps must be a whole number" };
    }
    return { valid: true, parsed, message: `Direct entry or ${step} increments` };
  };

  const updateDraft = (raw: string) => {
    setDraft(raw);
    const result = validateDraft(raw);
    setInvalid(!result.valid);
    setHint(result.message);
    onValidityChange(result.valid);
  };

  const commitDraft = () => {
    const result = validateDraft(draft);
    if (!result.valid) return;
    onValue(result.parsed);
  };

  const applyStep = (next: number) => {
    setDraft(String(next));
    setInvalid(false);
    setHint(`Direct entry or ${step} increments`);
    onValidityChange(true);
    onValue(next);
  };

  const stepFromDraft = (delta: number) => {
    const result = validateDraft(draft);
    const base = result.valid ? result.parsed : value;
    const minimum = valueKind === "reps" ? 1 : 0;
    applyStep(Math.max(minimum, base + delta));
  };

  const restoreValue = () => {
    setDraft(String(value));
    setInvalid(false);
    setHint(`Restored last valid value: ${value}`);
    onValidityChange(true);
  };

  return (
    <div className="stepper">
      <label htmlFor={inputId}>{label}</label>
      <KeyboardInput
        id={inputId}
        type="text"
        inputMode={valueKind === "weight" ? "decimal" : "numeric"}
        value={draft}
        aria-invalid={invalid}
        aria-describedby={`${inputId}-hint`}
        onChange={(event) => updateDraft(event.target.value)}
        onBlur={commitDraft}
      />
      <small id={`${inputId}-hint`} className={invalid ? "is-error" : ""}>
        {hint}
      </small>
      {invalid && (
        <button className="restore-entry-value" type="button" onClick={restoreValue}>
          Restore {value}
        </button>
      )}
      <div>
        <button onClick={() => stepFromDraft(-step)} aria-label={`Decrease ${label.toLowerCase()}`}><MinusIcon /></button>
        <button onClick={() => stepFromDraft(step)} aria-label={`Increase ${label.toLowerCase()}`}><PlusIcon /></button>
      </div>
    </div>
  );
}

function SubstitutionScreen({
  direction,
  exerciseName,
  candidateExerciseName,
  exerciseMeta,
  onChoose,
}: {
  direction: Direction;
  exerciseName: string;
  candidateExerciseName: string;
  exerciseMeta: string;
  onChoose: (name: string, scope: "today" | "future") => void;
}) {
  const [reason, setReason] = useState("Equipment busy");
  const [scope, setScope] = useState<"today" | "future">("today");
  const [query, setQuery] = useState("");
  const alternatives = candidateExerciseName === "Back squat"
    ? [
        {
          name: "Goblet squat",
          fit: "Metadata match",
          matches: "Match: squat pattern · bilateral reps",
          mismatch: "Mismatch: dumbbell front-load instead of barbell back-load",
        },
        {
          name: "Hack squat machine",
          fit: "Metadata match",
          matches: "Match: squat pattern · bilateral reps",
          mismatch: "Mismatch: fixed-path machine equipment",
        },
        {
          name: "Leg press",
          fit: "Partial metadata match",
          matches: "Match: knee-dominant press · bilateral reps",
          mismatch: "Mismatch: seated machine pattern rather than a squat",
        },
      ]
    : candidateExerciseName === "Incline dumbbell press"
      ? [
          {
            name: "Incline chest press machine",
            fit: "Metadata match",
            matches: "Match: incline push · bilateral reps",
            mismatch: "Mismatch: fixed-path machine instead of per-hand dumbbells",
          },
          {
            name: "Incline barbell press",
            fit: "Metadata match",
            matches: "Match: incline push · external load",
            mismatch: "Mismatch: one shared bar load instead of per-hand loading",
          },
          {
            name: "Push-up",
            fit: "Partial metadata match",
            matches: "Match: horizontal push · bilateral reps",
            mismatch: "Mismatch: bodyweight load and flat torso angle",
          },
        ]
      : candidateExerciseName === "Romanian deadlift"
        ? [
            {
              name: "Dumbbell Romanian deadlift",
              fit: "Metadata match",
              matches: "Match: hinge pattern · bilateral reps",
              mismatch: "Mismatch: per-hand dumbbell loading instead of one bar",
            },
            {
              name: "45-degree back extension",
              fit: "Partial metadata match",
              matches: "Match: hip-extension pattern · bilateral reps",
              mismatch: "Mismatch: bodyweight-plus loading and different support angle",
            },
            {
              name: "Cable pull-through",
              fit: "Partial metadata match",
              matches: "Match: hinge pattern · bilateral reps",
              mismatch: "Mismatch: cable resistance and no free-weight load",
            },
          ]
        : candidateExerciseName === "Lat pulldown"
          ? [
              {
                name: "Assisted pull-up",
                fit: "Metadata match",
                matches: "Match: vertical pull · bilateral reps",
                mismatch: "Mismatch: assisted bodyweight load instead of cable-stack load",
              },
              {
                name: "Neutral-grip pulldown",
                fit: "Metadata match",
                matches: "Match: vertical pull · cable-stack reps",
                mismatch: "Mismatch: neutral hand position",
              },
              {
                name: "One-arm pulldown",
                fit: "Partial metadata match",
                matches: "Match: vertical pull · cable load",
                mismatch: "Mismatch: unilateral structure",
              },
            ]
          : candidateExerciseName === "Chest-supported row"
        ? [
            {
              name: "Seated cable row",
              fit: "Metadata match",
              matches: "Match: horizontal pull · bilateral reps",
              mismatch: "Mismatch: cable stack instead of per-hand dumbbells",
            },
            {
              name: "Chest-supported row machine",
              fit: "Metadata match",
              matches: "Match: horizontal pull · chest support",
              mismatch: "Mismatch: fixed-path machine equipment",
            },
            {
              name: "One-arm cable row",
              fit: "Partial metadata match",
              matches: "Match: horizontal pull · reps",
              mismatch: "Mismatch: unilateral structure and cable load",
            },
          ]
        : [
            {
              name: "Dumbbell bench press",
              fit: "Metadata match",
              matches: "Match: horizontal push · reps + external load",
              mismatch: "Mismatch: dumbbells use per-hand loading",
            },
            {
              name: "Chest press machine",
              fit: "Metadata match",
              matches: "Match: horizontal push · bilateral reps",
              mismatch: "Mismatch: fixed-path machine equipment",
            },
            {
              name: "Weighted push-up",
              fit: "Partial metadata match",
              matches: "Match: horizontal push · bilateral reps",
              mismatch: "Mismatch: bodyweight-plus load mode",
            },
          ];
  const visibleAlternatives = alternatives.filter((alternative) =>
    alternative.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section className="screen-section substitution-screen">
      <p className="section-kicker">REPLACE FOR TODAY</p>
      <h1>What needs to change?</h1>
      <p className="section-lead">The original exercise stays in the programme unless you choose otherwise.</p>

      <div className="reason-chips" aria-label="Replacement reason">
        {["Equipment busy", "Not comfortable", "Prefer another"].map((item) => (
          <button
            key={item}
            className={reason === item ? "is-selected" : ""}
            aria-pressed={reason === item}
            onClick={() => setReason(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="substitution-origin">
        <small>REPLACING</small>
        <strong>{exerciseName}</strong>
        <span>{exerciseMeta}</span>
        {candidateExerciseName !== exerciseName && <span>Alternatives remain based on the original planned movement: {candidateExerciseName}.</span>}
      </div>

      <div className="alternative-list">
        {visibleAlternatives.map((alternative, index) => (
          <article key={alternative.name}>
            <div className="alternative-rank">0{index + 1}</div>
            <div>
              <small>{alternative.fit}</small>
              <h2>{alternative.name}</h2>
              <p>{alternative.matches}</p>
              <p className="mismatch-copy">{alternative.mismatch}</p>
            </div>
            <button onClick={() => onChoose(alternative.name, scope)} aria-label={`Choose ${alternative.name}`}>
              <ArrowRightIcon />
            </button>
          </article>
        ))}
        {visibleAlternatives.length === 0 && <p className="empty-result">No listed match. Try a broader name.</p>}
      </div>

      <div className="explanation-panel">
        <strong>How matches are ranked</strong>
        <p>Movement pattern, measurement mode and equipment are shown with material mismatches. Unknown metadata stays unknown; no option is claimed equivalent.</p>
      </div>
      <label className="substitution-search" htmlFor="substitution-search">
        Search the listed alternatives
        <span><MagnifyingGlassIcon aria-hidden="true" /><KeyboardInput id="substitution-search" value={query} onChange={(event) => setQuery(event.target.value)} /></span>
      </label>
      <fieldset className="substitution-scope">
        <legend>APPLY THIS CHANGE TO</legend>
        <div>
          <button type="button" className={scope === "today" ? "is-selected" : ""} aria-pressed={scope === "today"} onClick={() => setScope("today")}>Today only</button>
          <button type="button" className={scope === "future" ? "is-selected" : ""} aria-pressed={scope === "future"} onClick={() => setScope("future")}>Future programme</button>
        </div>
      </fieldset>
      <PrimaryButton
        direction={direction}
        disabled={visibleAlternatives.length === 0}
        onClick={() => {
          const topMatch = visibleAlternatives[0];
          if (topMatch) onChoose(topMatch.name, scope);
        }}
      >
        {visibleAlternatives.length === 0
          ? "No listed match to use"
          : `Use top match · ${scope === "today" ? "today only" : "new programme version"}`}
      </PrimaryButton>
    </section>
  );
}

function CompletionScreen({
  direction,
  savedSet,
  recordedExerciseName,
  recordedWeight,
  recordedReps,
  workingSets,
  countsAsExpected,
  activeCompletedSetCount,
  workout,
  plannedExercises,
  nextWorkout,
  source,
  onDone,
}: {
  direction: Direction;
  savedSet: boolean;
  recordedExerciseName: string;
  recordedWeight: number;
  recordedReps: number;
  workingSets: WorkingSet[];
  countsAsExpected: boolean;
  activeCompletedSetCount: number;
  workout: ProgrammeWorkoutId;
  plannedExercises: ExerciseRow[];
  nextWorkout: ProgrammeWorkoutId;
  source: "fixture" | "active-finish";
  onDone: () => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const isFixture = source === "fixture";
  const isBenchPress = recordedExerciseName === "Barbell bench press";
  const latestSet = isFixture && isBenchPress ? "100 kg × 9" : `${recordedWeight} kg × ${recordedReps}`;
  const topRangeSets = workingSets.filter((set) => set.saved && set.reps >= 10).length;
  const repBestGain = isFixture && isBenchPress
    ? 1
    : isBenchPress && recordedWeight === 100 && recordedReps > 8
      ? recordedReps - 8
      : 0;
  const isRepBest = repBestGain > 0;
  const repBestCopy = repBestGain === 1
    ? "One more rep than your previous equivalent session."
    : `${repBestGain} more reps than your previous equivalent session.`;
  const plannedSetCount = plannedExercises.reduce((total, exercise) => {
    const plannedSets = Number.parseInt(exercise.prescription, 10);
    return total + (Number.isFinite(plannedSets) ? plannedSets : 0);
  }, 0);
  const completedSetCount = isFixture ? plannedSetCount : activeCompletedSetCount;
  const remainingSetCount = Math.max(0, plannedSetCount - completedSetCount);
  return (
    <section className="screen-section completion-screen">
      <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
      <div className="saved-seal"><CheckCircledIcon aria-hidden="true" /><span>Recorded in prototype state</span></div>
      <p className="section-kicker">{workout.toUpperCase()} · {isFixture ? "COMPLETE" : "FINISHED PARTIAL"}</p>
      <h1>Workout recorded.</h1>
      <p className="section-lead">
        52 minutes · {completedSetCount} working sets · {isFixture ? "all planned work complete" : `${remainingSetCount} planned working sets not completed`}
      </p>

      {completedSetCount > 0 ? (
        <div className="completion-highlight">
          <small>{isRepBest ? "NEW REP BEST" : "LATEST RECORDED SET"}</small>
          <h2>{recordedExerciseName} · {latestSet}</h2>
          <p>{isRepBest ? repBestCopy : "Shown as an observed prototype value; no record or target claim is inferred."}</p>
        </div>
      ) : (
        <div className="completion-highlight">
          <small>NO SETS RECORDED</small>
          <h2>{recordedExerciseName}</h2>
          <p>This prototype completion contains no observed set values for the current exercise.</p>
        </div>
      )}

      <dl className="completion-summary">
        <div><dt>Planned work</dt><dd>{completedSetCount} / {plannedSetCount} sets</dd></div>
        <div><dt>Session effort</dt><dd>{completedSetCount === 0 ? "Not recorded" : "Mostly RIR 1–3"}</dd></div>
        <div><dt>Next in sequence</dt><dd>{nextWorkout}</dd></div>
      </dl>

      <div className="recommendation-copy">
        <strong>No automatic target change</strong>
        <p>
          {completedSetCount === 0
            ? `No working sets were recorded for ${recordedExerciseName}. No progression or best-performance claim can be evaluated from this session.`
            : isBenchPress
            ? isFixture
              ? "1 of 4 bench-press sets reached the top of the 6–10 rep range. The configured all-sets rule did not qualify, so the current target remains unchanged."
              : topRangeSets > 0
                ? `${topRangeSets} of 4 ${recordedExerciseName} sets reached the top of the target range. The fourth planned set and later exercises were not completed, so the configured all-sets rule cannot qualify and no target changes are applied automatically.`
                : `The fourth planned ${recordedExerciseName} set and all later exercises were not completed. The configured all-sets rule cannot qualify from this session, so the current target remains unchanged.`
            : `This ${workout} fixture records observed work only. No exercise-specific progression or record rule is approved here, so no target or best-performance claim is made.`}
        </p>
      </div>

      <PrimaryButton direction={direction} onClick={onDone}>
        Return to Today <ArrowRightIcon aria-hidden="true" />
      </PrimaryButton>
      <button className="secondary-action" onClick={() => setNoteOpen((open) => !open)}>
        {noteOpen ? "Close private note" : "Add a private workout note"}
      </button>
      {noteOpen && (
        <div className="completion-note">
          <label htmlFor="completion-note">Private workout note</label>
          <KeyboardInput id="completion-note" value={note} onChange={(event) => { setNote(event.target.value); setNoteSaved(false); }} />
          <button onClick={() => setNoteSaved(true)} disabled={!note.trim()}>Save note in prototype</button>
          {noteSaved && <small role="status">Prototype note state saved for this review session.</small>}
        </div>
      )}
    </section>
  );
}

function HistoryScreen({
  direction,
  onExercise,
}: {
  direction: Direction;
  onExercise: () => void;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const selectedSession = historySessions.find((session) => session.id === selectedSessionId) ?? null;
  const visibleSessions = historySessions.filter((session) => (
    `${session.date} ${session.workout} ${session.duration} ${session.setCount} ${session.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  ));

  if (selectedSession) {
    const includesBenchPress = selectedSession.exercises.some((exercise) => exercise.name === "Barbell bench press");
    return (
      <section className="screen-section history-screen history-session-detail">
        <button className="history-detail-back" onClick={() => setSelectedSessionId(null)}>
          <ArrowLeftIcon aria-hidden="true" /> Back to History
        </button>
        <div role="region" aria-label={`${selectedSession.workout} session details from ${selectedSession.date}`}>
          <p className="section-kicker">{selectedSession.date} · {selectedSession.status}</p>
          <h1>{selectedSession.workout}</h1>
          <p className="section-lead">
            {selectedSession.duration} · {selectedSession.setCount} sample working sets in this prototype
          </p>

          <ol className="session-exercise-list" aria-label={`${selectedSession.workout} recorded exercises`}>
            {selectedSession.exercises.map((exercise, index) => (
              <li key={exercise.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{exercise.name}</strong><small>{exercise.result}</small></div>
              </li>
            ))}
          </ol>

          <div className="history-question">
            <small>SESSION RECORD</small>
            <strong>{selectedSession.status === "Short mode" ? "Sample finished in short mode" : "Sample completed record"}</strong>
            <span>This detail reflects the selected workout; it does not substitute a different exercise-progress view.</span>
          </div>
          {includesBenchPress && (
            <PrimaryButton direction={direction} onClick={onExercise}>
              View Barbell bench press progress
            </PrimaryButton>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="screen-section history-screen">
      <p className="section-kicker">TRAINING RECORD</p>
      <h1>History</h1>
      <div className="history-toolbar">
        <button className={view === "list" ? "is-selected" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}><RowsIcon /> List</button>
        <button className={view === "calendar" ? "is-selected" : ""} aria-pressed={view === "calendar"} onClick={() => setView("calendar")}><CalendarIcon /> Calendar</button>
        <button aria-label="Search history" aria-pressed={searchOpen} onClick={() => setSearchOpen((open) => !open)}><MagnifyingGlassIcon /></button>
      </div>

      {searchOpen && (
        <label className="history-search" htmlFor="history-search">
          Search workout history
          <KeyboardInput id="history-search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      )}

      <div className="month-strip">
        <div><small>AUGUST</small><strong>2 sessions</strong></div>
        <div><small>JULY</small><strong>11 sessions</strong></div>
        <div><small>JUNE</small><strong>10 sessions</strong></div>
      </div>

      {view === "calendar" && (
        <div className="history-calendar-summary" role="status">
          <strong>August 2026 · session days</strong>
          <p>3 Aug — Lower A · 6 Aug — Upper A. Calendar selection uses the same stored sessions as the list.</p>
        </div>
      )}

      <div className="history-list" aria-label={`${view} workout results`}>
        {visibleSessions.map((session) => (
          <button key={session.id} onClick={() => setSelectedSessionId(session.id)} aria-label={`Open ${session.workout} from ${session.date}`}>
            <span>{session.date}</span>
            <div><strong>{session.workout}</strong><small>{session.duration} · {session.setCount} sets</small></div>
            <b>{session.status}</b>
            <ArrowRightIcon aria-hidden="true" />
          </button>
        ))}
        {visibleSessions.length === 0 && <p className="empty-result">No workout matches that search.</p>}
      </div>

      <div className="history-question">
        <small>USEFUL QUESTION</small>
        <strong>How is bench press moving?</strong>
        <button onClick={onExercise}>View exercise progress <ArrowRightIcon /></button>
      </div>
      <PrimaryButton direction={direction} onClick={onExercise}>Review bench press</PrimaryButton>
    </section>
  );
}

function ExerciseProgressScreen({ direction }: { direction: Direction }) {
  const [showAll, setShowAll] = useState(false);
  const points = [78, 80, 79, 84, 86, 90];
  return (
    <section className="screen-section progress-screen">
      <p className="section-kicker">EXERCISE PROGRESS</p>
      <h1>Barbell bench press</h1>
      <p className="section-lead">Your best comparable working set, over the last six sessions.</p>

      <div className="progress-answer">
        <small>ANSWER</small>
        <h2>You added 10 kg while staying inside 6–10 reps.</h2>
        <p>Comparable sets rose from 90 kg × 8 to 100 kg × 9 between 22 June and 6 August.</p>
      </div>

      <figure className="trend-figure" aria-label="Comparable bench press performance rose across six sessions">
        <figcaption><span>BEST COMPARABLE SET</span><strong>100 kg × 9</strong></figcaption>
        <div className="trend-bars">
          {points.map((point, index) => (
            <div key={index}><i style={{ height: `${point}%` }} /><small>{index + 1}</small></div>
          ))}
        </div>
        <div className="axis-labels"><span>22 JUN</span><span>6 AUG</span></div>
      </figure>

      <dl className="progress-facts">
        <div><dt>Sessions logged</dt><dd>18</dd></div>
        <div><dt>Rep-range best</dt><dd>100 × 9</dd></div>
        <div><dt>Comparison basis</dt><dd>Same variation</dd></div>
      </dl>

      <div className="calculation-note">
        <strong>Why these sets compare</strong>
        <p>They use the same exercise variation, working-set role, load mode, laterality and rule version. Estimated 1RM stays unavailable until its formula and qualifying range are approved.</p>
      </div>
      {showAll && (
        <div className="progress-session-list" role="status">
          <strong>Comparable session sample</strong>
          <p>22 Jun · 90 kg × 8</p><p>14 Jul · 96 kg × 8</p><p>6 Aug · 100 kg × 9</p>
        </div>
      )}
      <PrimaryButton direction={direction} onClick={() => setShowAll((shown) => !shown)}>
        {showAll ? "Hide session sample" : "View session sample"}
      </PrimaryButton>
    </section>
  );
}

function ProgrammeEditorScreen({
  direction,
  initialSchedule,
  initialProgrammeName,
  initialExercises,
  onNavigationGuard,
  onSave,
}: {
  direction: Direction;
  initialSchedule: "flexible" | "fixed";
  initialProgrammeName: string;
  initialExercises: Record<ProgrammeWorkoutId, ExerciseRow[]>;
  onNavigationGuard: (guard: NavigationGuard | null) => void;
  onSave: (
    programmeName: string,
    exercises: Record<ProgrammeWorkoutId, ExerciseRow[]>,
    schedule: "flexible" | "fixed",
  ) => void;
}) {
  const [selectedWorkout, setSelectedWorkout] = useState<ProgrammeWorkoutId>("Upper A");
  const [programmeName, setProgrammeName] = useState(initialProgrammeName);
  const [draftSchedule, setDraftSchedule] = useState<"flexible" | "fixed">(initialSchedule);
  const [programmeNameError, setProgrammeNameError] = useState("");
  const [editorExercisesByWorkout, setEditorExercisesByWorkout] = useState<Record<ProgrammeWorkoutId, ExerciseRow[]>>(() => cloneProgrammeExercises(initialExercises));
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [prescriptionDraft, setPrescriptionDraft] = useState("");
  const [originalPrescription, setOriginalPrescription] = useState("");
  const [prescriptionError, setPrescriptionError] = useState("");
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editorStatus, setEditorStatus] = useState("");
  const editorExercises = editorExercisesByWorkout[selectedWorkout];
  const parsedNavigationPrescription = editingExercise ? parseSupportedPrescription(prescriptionDraft) : null;
  const programmeDirty = programmeName !== initialProgrammeName
    || draftSchedule !== initialSchedule
    || !programmeExercisesMatch(editorExercisesByWorkout, initialExercises)
    || Boolean(editingExercise && prescriptionDraft !== originalPrescription);
  const programmeCanSave = Boolean(programmeName.trim())
    && (!editingExercise || Boolean(parsedNavigationPrescription));

  useLayoutEffect(() => {
    onNavigationGuard({
      dirty: programmeDirty,
      canSave: programmeCanSave,
      title: "Save this programme before leaving?",
      description: programmeCanSave
        ? "This draft has valid unpublished changes. Saving publishes one new prototype programme version before navigation continues."
        : "This draft contains an invalid value. Correct it to save, discard the draft, or keep editing.",
      savedConfirmation: "Programme changes published before leaving.",
      discardedConfirmation: "Unpublished programme draft discarded.",
      save: () => {
        if (!programmeCanSave) return false;
        let exercisesToPublish = cloneProgrammeExercises(editorExercisesByWorkout);
        if (editingExercise && parsedNavigationPrescription) {
          exercisesToPublish = {
            ...exercisesToPublish,
            [selectedWorkout]: exercisesToPublish[selectedWorkout].map((exercise) => (
              exercise.name === editingExercise
                ? { ...exercise, prescription: parsedNavigationPrescription.normalized }
                : exercise
            )),
          };
        }
        onSave(programmeName.trim(), exercisesToPublish, draftSchedule);
        return true;
      },
      discard: () => undefined,
    });
    return () => onNavigationGuard(null);
  }, [
    draftSchedule,
    editingExercise,
    editorExercisesByWorkout,
    onNavigationGuard,
    onSave,
    parsedNavigationPrescription,
    prescriptionDraft,
    programmeCanSave,
    programmeDirty,
    programmeName,
    selectedWorkout,
  ]);

  const moveExercise = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= editorExercises.length) return;
    const movedExercise = editorExercises[index];
    setEditorExercisesByWorkout((current) => {
      const next = [...current[selectedWorkout]];
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...current,
        [selectedWorkout]: next.map((exercise, position) => ({ ...exercise, index: position + 1 })),
      };
    });
    setEditorStatus(`${movedExercise.name} moved ${delta < 0 ? "up" : "down"} in ${selectedWorkout}.`);
  };

  const openExerciseEditor = (name: string, prescription: string) => {
    if (editingExercise === name) return;
    if (editingExercise && prescriptionDraft !== originalPrescription) {
      setPrescriptionError("Save or cancel the current exercise edit before opening another exercise so the draft is not lost.");
      setEditorStatus("");
      return;
    }
    setEditingExercise(name);
    setPrescriptionDraft(prescription);
    setOriginalPrescription(prescription);
    setPrescriptionError("");
    setEditorStatus("");
  };

  const saveExerciseEdit = () => {
    if (!editingExercise) return;
    const nextPrescription = prescriptionDraft.trim();
    if (!nextPrescription) {
      setPrescriptionError("Target sets and reps are required; the exercise edit remains open.");
      setEditorStatus("");
      return;
    }

    const supportedPrescription = parseSupportedPrescription(nextPrescription);
    if (!supportedPrescription) {
      setPrescriptionError("Use 1–4 sets × 1–100 reps, for example 4 × 6–10; the exercise edit remains open.");
      setEditorStatus("");
      return;
    }

    setEditorExercisesByWorkout((current) => ({
      ...current,
      [selectedWorkout]: current[selectedWorkout].map((exercise) => (
        exercise.name === editingExercise
          ? { ...exercise, prescription: supportedPrescription.normalized }
          : exercise
      )),
    }));
    setPrescriptionError("");
    setEditorStatus(`${editingExercise} updated in ${selectedWorkout}.`);
    setEditingExercise(null);
    setOriginalPrescription("");
  };

  const addExercise = () => {
    const addition = programmeEditorAdditions[selectedWorkout];
    if (editorExercises.some((exercise) => exercise.name === addition.name)) {
      setEditorStatus(`${addition.name} is already in ${selectedWorkout}.`);
      return;
    }
    setEditorExercisesByWorkout((current) => ({
      ...current,
      [selectedWorkout]: [
        ...current[selectedWorkout],
        { ...addition, index: current[selectedWorkout].length + 1 },
      ],
    }));
    setEditorStatus(`${addition.name} added to ${selectedWorkout}.`);
  };

  const publishProgramme = () => {
    if (!programmeName.trim()) {
      setProgrammeNameError("Programme name is required before publishing a new version.");
      setEditorStatus("");
      return;
    }
    if (editingExercise) {
      if (!prescriptionDraft.trim()) {
        setPrescriptionError("Target sets and reps are required; resolve this edit before publishing.");
        setEditorStatus("");
        return;
      }
      if (!parseSupportedPrescription(prescriptionDraft)) {
        setPrescriptionError("Use 1–4 sets × 1–100 reps, for example 4 × 6–10; resolve this edit before publishing.");
        setEditorStatus("");
        return;
      }
      setPrescriptionError("Save or cancel this exercise edit before publishing so the valid draft is not lost.");
      setEditorStatus("");
      return;
    }
    onSave(programmeName.trim(), editorExercisesByWorkout, draftSchedule);
  };

  return (
    <section className="screen-section editor-screen">
      <p className="section-kicker">PROGRAMME EDITOR</p>
      <h1>{programmeName.trim() || "Untitled programme"}</h1>
      <label className="mobile-field" htmlFor="programme-name">
        <span className="field-label">Programme name</span>
        <KeyboardInput
          id="programme-name"
          value={programmeName}
          aria-invalid={Boolean(programmeNameError)}
          aria-describedby={programmeNameError ? "programme-name-error" : undefined}
          onChange={(event) => {
            setProgrammeName(event.target.value);
            if (event.target.value.trim()) setProgrammeNameError("");
          }}
        />
        {programmeNameError && <small id="programme-name-error" className="editor-error" role="alert">{programmeNameError}</small>}
      </label>

      <div className="editor-schedule">
        <span>ADVANCE WORKOUTS BY</span>
        <div className="segmented-control compact" role="radiogroup">
          <button
            role="radio"
            aria-checked={draftSchedule === "flexible"}
            className={draftSchedule === "flexible" ? "is-selected" : ""}
            onClick={() => setDraftSchedule("flexible")}
          >Flexible sequence</button>
          <button
            role="radio"
            aria-checked={draftSchedule === "fixed"}
            className={draftSchedule === "fixed" ? "is-selected" : ""}
            onClick={() => setDraftSchedule("fixed")}
          >Fixed weekdays</button>
        </div>
      </div>

      <div className="workout-tabs" aria-label="Programme workouts">
        {programmeWorkoutNames.map((workout) => (
          <button
            key={workout}
            className={selectedWorkout === workout ? "is-selected" : ""}
            aria-pressed={selectedWorkout === workout}
            onClick={() => {
              if (workout === selectedWorkout) return;
              if (editingExercise && prescriptionDraft !== originalPrescription) {
                setPrescriptionError("Save or cancel the current exercise edit before switching workouts so the draft is not lost.");
                setEditorStatus("");
                return;
              }
              setSelectedWorkout(workout);
              setEditorStatus(`${workout} selected.`);
              setEditingExercise(null);
              setOriginalPrescription("");
              setPrescriptionError("");
            }}
          >{workout}</button>
        ))}
      </div>

      <p className="editor-workout-label"><strong>{selectedWorkout}</strong> · prototype exercise order</p>

      <ol className="editor-list" aria-label={`${selectedWorkout} exercises`}>
        {editorExercises.map((exercise, index) => (
          <li key={exercise.name}>
            <div className="move-controls" aria-label={`Reorder ${exercise.name}`}>
              <button
                aria-label={`Move ${exercise.name} up`}
                disabled={index === 0}
                onClick={() => moveExercise(index, -1)}
              ><ChevronUpIcon /></button>
              <button
                aria-label={`Move ${exercise.name} down`}
                disabled={index === editorExercises.length - 1}
                onClick={() => moveExercise(index, 1)}
              ><ChevronDownIcon /></button>
            </div>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{exercise.name}</strong><small>{exercise.meta}</small></div>
            <b>{exercise.prescription}</b>
            <button aria-label={`Edit ${exercise.name}`} onClick={() => openExerciseEditor(exercise.name, exercise.prescription)}><Pencil2Icon /></button>
          </li>
        ))}
      </ol>

      {editingExercise && (
        <div className="editor-detail" role="region" aria-label={`Edit ${editingExercise}`}>
          <strong>Editing {editingExercise}</strong>
          <label htmlFor="exercise-prescription">
            Target sets and reps
            <KeyboardInput
              id="exercise-prescription"
              value={prescriptionDraft}
              aria-invalid={Boolean(prescriptionError)}
              aria-describedby={prescriptionError ? "exercise-prescription-error" : undefined}
              onChange={(event) => {
                setPrescriptionDraft(event.target.value);
                if (event.target.value.trim()) setPrescriptionError("");
              }}
            />
          </label>
          {prescriptionError && <small id="exercise-prescription-error" className="editor-error" role="alert">{prescriptionError}</small>}
          <div>
            <button onClick={saveExerciseEdit}>Save exercise edit</button>
            <button onClick={() => { setEditingExercise(null); setOriginalPrescription(""); setPrescriptionError(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <button className="add-exercise" onClick={addExercise}><PlusIcon /> Add exercise</button>
      {editorStatus && <p className="editor-status" role="status">{editorStatus}</p>}
      <div className="progression-rule">
        <small>EXAMPLE RULE · CONTENT REVIEW REQUIRED</small>
        <strong>Double progression example</strong>
        <p>This review fixture describes a possible rule. It does not apply a target change automatically.</p>
        <button aria-expanded={ruleOpen} onClick={() => setRuleOpen((open) => !open)}>
          {ruleOpen ? "Hide example rule" : "Review example rule"} {ruleOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
        {ruleOpen && (
          <p className="rule-detail" role="status">
            A future approved rule would need explicit qualifying sets, rep bounds, rounding, equipment increments and version history before it could make a suggestion.
          </p>
        )}
      </div>
      <div className="version-note">
        <strong>Publishes a new programme version</strong>
        <p>Completed and already-started workouts keep their original version. Changes begin at the next eligible not-started workout.</p>
      </div>
      <PrimaryButton direction={direction} onClick={publishProgramme}>Publish new version</PrimaryButton>
    </section>
  );
}

function BottomNavigation({
  direction,
  screen,
  workoutInProgress,
  onNavigate,
  onOpenReview,
}: {
  direction: Direction;
  screen: ScreenId;
  workoutInProgress: boolean;
  onNavigate: (screen: ScreenId) => void;
  onOpenReview: () => void;
}) {
  if (screen === "onboarding" || screen === "programme" || screen === "complete") return null;
  type NavItem = { id?: ScreenId; destination?: ScreenId; label: string; icon: typeof CalendarIcon; opensReview?: boolean };
  const workoutFlow = ["active", "set-entry", "substitution"].includes(screen);
  const workoutDestination: ScreenId = workoutInProgress || workoutFlow ? "active" : "today";
  const items: NavItem[] = direction.id === "tempo"
    ? [
        { id: workoutDestination, label: workoutInProgress || workoutFlow ? "Continue" : "Workout", icon: CheckCircledIcon },
        { id: "history", label: "History", icon: RowsIcon },
        { id: "exercise-progress", label: "Exercises", icon: BarChartIcon },
        { id: "programme-editor", label: "Plans", icon: Pencil2Icon },
        { label: "More", icon: DotsHorizontalIcon, opensReview: true },
      ]
    : direction.id === "field"
      ? [
          { id: workoutDestination, label: "Workout", icon: CheckCircledIcon },
          { id: "history", label: "History", icon: RowsIcon },
          { label: "Settings", icon: DotsHorizontalIcon, opensReview: true },
        ]
      : [
          { id: "today", label: "Today", icon: CalendarIcon },
          { id: "active", destination: workoutDestination, label: "Workout", icon: CheckCircledIcon },
          { id: "exercise-progress", label: "Progress", icon: BarChartIcon },
        ];
  return (
    <nav className="bottom-navigation" aria-label={`${direction.name} prototype navigation`} data-nav-count={items.length}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === screen || (item.id === "active" && workoutFlow);
        return (
          <button
            key={`${item.label}-${item.id ?? "review"}`}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
            aria-label={item.opensReview ? `${item.label} prototype review menu` : item.label}
            onClick={() => item.opensReview ? onOpenReview() : (item.destination ?? item.id) && onNavigate((item.destination ?? item.id) as ScreenId)}
          >
            <Icon aria-hidden="true" /><span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ProgressMarker({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="progress-marker">
      <span>{label}</span>
      <div>{Array.from({ length: total }, (_, index) => <i key={index} className={index < current ? "is-complete" : ""} />)}</div>
      <b>{current}/{total}</b>
    </div>
  );
}

function PrimaryButton({
  direction,
  children,
  onClick,
  disabled = false,
}: {
  direction: Direction;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return <button className="primary-button" data-direction={direction.id} onClick={onClick} disabled={disabled}>{children}</button>;
}
