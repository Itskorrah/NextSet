import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type MouseEvent as ReactMouseEvent, type ReactNode, type SetStateAction } from "react";
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
import { BottomSheet, KeyboardInput, KeyboardTextarea, MobileScroll, useKeyboard, useKeyboardInsets } from "./mobile";

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
type NavigationDestination = ScreenId | "direction-gallery" | "completion-done";

type Direction = {
  id: DirectionId;
  name: string;
  strapline: string;
  personality: string;
  primaryAction: string;
};

type ExerciseRow = {
  id?: string;
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
  exerciseName?: string;
};
type WorkingSetValues = Omit<WorkingSet, "number" | "saved" | "exerciseName">;
type WorkingSetValuesByNumber = Record<WorkingSetNumber, WorkingSetValues>;

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
  status: "Completed" | "Short mode" | "Partial";
  sample?: boolean;
  note?: string;
  exerciseNotes?: Array<{
    exerciseName: string;
    note: string;
  }>;
  exercises: Array<{
    name: string;
    result: string;
  }>;
};

type CompletionSnapshot = {
  sessionId: string;
  workout: ProgrammeWorkoutId;
  nextWorkout: ProgrammeWorkoutId;
  countsAsExpected: boolean;
  plannedExercises: ExerciseRow[];
  recordedExerciseName: string;
  recordedWeight: number;
  recordedReps: number;
  recordedSets: WorkingSet[];
  completedSetCount: number;
  plannedSetCount: number;
  carryForwardRequested: boolean;
  exerciseNotes: Array<{
    exerciseName: string;
    note: string;
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

const workingSetSeedByWorkout: Record<ProgrammeWorkoutId, Record<WorkingSetNumber, Omit<WorkingSet, "number" | "saved" | "exerciseName">>> = {
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
  const normalizeOrder = (workout: ProgrammeWorkoutId, exercises: ExerciseRow[]) => exercises.map((exercise, position) => ({
    ...exercise,
    id: exercise.id ?? `${workout.toLowerCase().replaceAll(" ", "-")}-${exercise.index}-${exercise.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
    index: position + 1,
  }));
  return {
    "Upper A": normalizeOrder("Upper A", source["Upper A"]),
    "Lower A": normalizeOrder("Lower A", source["Lower A"]),
    "Upper B": normalizeOrder("Upper B", source["Upper B"]),
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
    minimumReps,
    maximumReps,
    normalized: `${sets} × ${minimumReps}${match[3] ? `–${maximumReps}` : ""}`,
  };
}

function hasComparableWorkingSetFixture(exercise: ExerciseRow, workout: ProgrammeWorkoutId) {
  return exercise.name === programmeEditorSeed[workout][0].name
    && exercise.prescription === programmeEditorSeed[workout][0].prescription;
}

function startingSetValuesForExercise(exercise: ExerciseRow, workout: ProgrammeWorkoutId) {
  const parsed = parseSupportedPrescription(exercise.prescription);
  const comparable = hasComparableWorkingSetFixture(exercise, workout);
  const neutral = { weight: 0, reps: parsed?.minimumReps ?? 1, rir: null };
  return {
    1: { ...(comparable ? workingSetSeedByWorkout[workout][1] : neutral) },
    2: { ...(comparable ? workingSetSeedByWorkout[workout][2] : neutral) },
    3: { ...(comparable ? workingSetSeedByWorkout[workout][3] : neutral) },
    4: { ...(comparable ? workingSetSeedByWorkout[workout][4] : neutral) },
  };
}

function LegacyPrototype() {
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
  const [completedSetNumbers, setCompletedSetNumbers] = useState<WorkingSetNumber[]>([1, 2, 3]);
  const [revisingSetNumbers, setRevisingSetNumbers] = useState<WorkingSetNumber[]>([]);
  const [completedSets, setCompletedSets] = useState(() => ({
    1: { ...workingSetSeedByWorkout["Upper A"][1] },
    2: { ...workingSetSeedByWorkout["Upper A"][2] },
    3: { ...workingSetSeedByWorkout["Upper A"][3] },
    4: { ...workingSetSeedByWorkout["Upper A"][4] },
  }));
  const [setOwners, setSetOwners] = useState<Record<WorkingSetNumber, string>>({
    1: "Barbell bench press",
    2: "Barbell bench press",
    3: "Barbell bench press",
    4: "Barbell bench press",
  });
  const [exerciseDrafts, setExerciseDrafts] = useState<Record<string, Partial<Record<WorkingSetNumber, WorkingSetValues>>>>({});
  const [editingSetNumber, setEditingSetNumber] = useState<WorkingSetNumber>(4);
  const [partialFinishOpen, setPartialFinishOpen] = useState(false);
  const [pendingGlobalNavigation, setPendingGlobalNavigation] = useState<NavigationDestination | null>(null);
  const [pendingGuardedActionOpen, setPendingGuardedActionOpen] = useState(false);
  const [completionSource, setCompletionSource] = useState<"fixture" | "active-finish">("fixture");
  const [completionSnapshot, setCompletionSnapshot] = useState<CompletionSnapshot | null>(null);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [runtimeHistorySessions, setRuntimeHistorySessions] = useState<HistorySession[]>([]);
  const [carryForwardRequested, setCarryForwardRequested] = useState(false);
  const [carryForwardNotice, setCarryForwardNotice] = useState<string | null>(null);
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
  const [activeSubstitutionReason, setActiveSubstitutionReason] = useState<string | null>(null);
  const [futureProgrammeNotice, setFutureProgrammeNotice] = useState<string | null>(null);
  const [hasComparableSetFixture, setHasComparableSetFixture] = useState(true);
  const [publishedProgrammeName, setPublishedProgrammeName] = useState("Full body · 3 sessions");
  const [publishedProgrammeExercises, setPublishedProgrammeExercises] = useState(() => cloneProgrammeExercises(programmeEditorSeed));
  const [activePlanExercises, setActivePlanExercises] = useState(() => cloneProgrammeExercises(programmeEditorSeed)["Upper A"]);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const [restSeconds, setRestSeconds] = useState(72);
  const [restPaused, setRestPaused] = useState(false);
  const [restActive, setRestActive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const navigationGuardRef = useRef<NavigationGuard | null>(null);
  const pendingGuardedActionRef = useRef<(() => void) | null>(null);
  const guardReturnFocusRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);
  const galleryMainRef = useRef<HTMLElement | null>(null);
  const routeFocusDelayRef = useRef(0);
  const runtimeSessionCounterRef = useRef(0);
  const finishingSessionRef = useRef(false);

  const direction = useMemo(
    () => (directionId ? directionById(directionId) : directions[0]),
    [directionId],
  );

  useLayoutEffect(() => {
    const focusTimer = window.setTimeout(() => {
      const main = directionId ? mainContentRef.current : galleryMainRef.current;
      const scroll = main?.closest<HTMLElement>('[data-testid="mobile-scroll"]');
      if (scroll) scroll.scrollTop = 0;
      main?.focus({ preventScroll: true });
    }, routeFocusDelayRef.current);
    return () => window.clearTimeout(focusTimer);
  }, [activeExerciseIndex, directionId, screen]);

  useEffect(() => {
    if (!restActive || restPaused || restSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRestSeconds((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [restActive, restPaused, restSeconds]);

  const plannedFirstExerciseSetCount = parseSupportedPrescription(activePlanExercises[0]?.prescription ?? "")?.sets ?? 0;
  const workingSets = useMemo<WorkingSet[]>(() => ([1, 2, 3, 4] as WorkingSetNumber[]).slice(0, Math.max(1, plannedFirstExerciseSetCount)).map((number) => {
    const stored = completedSets[number];
    const values = number === editingSetNumber ? { weight, reps, rir } : stored;
    return {
      number,
      ...values,
      saved: number === 4 ? savedSet : completedSetNumbers.includes(number),
      exerciseName: setOwners[number],
    };
  }), [completedSetNumbers, completedSets, editingSetNumber, plannedFirstExerciseSetCount, reps, rir, savedSet, setOwners, weight]);

  const editingSet = workingSets.find((set) => set.number === editingSetNumber) ?? workingSets[3];
  const completedSetCount = workingSets.filter((set) => set.saved).length;
  const firstExerciseComplete = completedSetCount >= plannedFirstExerciseSetCount && plannedFirstExerciseSetCount > 0;
  const activePlannedSetCount = activePlanExercises.reduce((total, exercise) => (
    total + (parseSupportedPrescription(exercise.prescription)?.sets ?? 0)
  ), 0);
  const activeNotAttemptedSetCount = Math.max(0, activePlannedSetCount - completedSetCount);
  const activeExerciseStableId = activePlanExercises[activeExerciseIndex]?.id;
  const publishedExerciseForActiveSnapshot = publishedProgrammeExercises[todayWorkout].find(
    (exercise) => exercise.id === activeExerciseStableId,
  ) ?? null;

  const dismissPrototypeKeyboard = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("keyboard")) {
      params.delete("keyboard");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
    keyboard.hide();
  };

  const navigate = (next: ScreenId) => {
    routeFocusDelayRef.current = reviewOpen || partialFinishOpen || pendingGlobalNavigation !== null || pendingGuardedActionOpen ? 220 : 0;
    dismissPrototypeKeyboard();
    setToast(null);
    setPendingGlobalNavigation(null);
    setPendingGuardedActionOpen(false);
    pendingGuardedActionRef.current = null;
    setScreen(next);
    setReviewOpen(false);
    setPartialFinishOpen(false);
  };

  const registerNavigationGuard = useCallback((guard: NavigationGuard | null) => {
    navigationGuardRef.current = guard;
  }, []);

  const returnToDirectionGallery = () => {
    routeFocusDelayRef.current = reviewOpen || partialFinishOpen || pendingGlobalNavigation !== null || pendingGuardedActionOpen ? 220 : 0;
    dismissPrototypeKeyboard();
    setToast(null);
    setReviewOpen(false);
    setPartialFinishOpen(false);
    setPendingGlobalNavigation(null);
    setPendingGuardedActionOpen(false);
    pendingGuardedActionRef.current = null;
    setDirectionId(null);
  };

  const performNavigationDestination = (destination: NavigationDestination) => {
    if (destination === "direction-gallery") returnToDirectionGallery();
    else if (destination === "completion-done") navigate("today");
    else navigate(destination);
  };

  const requestGlobalNavigation = (next: NavigationDestination) => {
    if (next === screen) {
      setReviewOpen(false);
      return;
    }
    const guard = navigationGuardRef.current;
    if (guard?.dirty) {
      guardReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dismissPrototypeKeyboard();
      setReviewOpen(false);
      setPartialFinishOpen(false);
      setPendingGlobalNavigation(next);
      return;
    }
    performNavigationDestination(next);
  };

  const requestGuardedAction = (action: () => void) => {
    const guard = navigationGuardRef.current;
    if (guard?.dirty) {
      guardReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dismissPrototypeKeyboard();
      setReviewOpen(false);
      setPartialFinishOpen(false);
      setPendingGlobalNavigation(null);
      pendingGuardedActionRef.current = action;
      setPendingGuardedActionOpen(true);
      return;
    }
    routeFocusDelayRef.current = 0;
    action();
  };

  const closePendingGuardAndReturnFocus = () => {
    const returnTarget = guardReturnFocusRef.current;
    setPendingGlobalNavigation(null);
    setPendingGuardedActionOpen(false);
    pendingGuardedActionRef.current = null;
    guardReturnFocusRef.current = null;
    window.setTimeout(() => {
      const target = returnTarget?.isConnected ? returnTarget : mainContentRef.current;
      target?.focus({ preventScroll: true });
    }, 220);
  };

  useEffect(() => {
    if (pendingGlobalNavigation === null && !pendingGuardedActionOpen) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closePendingGuardAndReturnFocus();
    };
    window.addEventListener("keydown", handleEscape, true);
    return () => window.removeEventListener("keydown", handleEscape, true);
  }, [pendingGlobalNavigation, pendingGuardedActionOpen]);

  const openSetEntry = (setNumber: WorkingSetNumber) => {
    requestGuardedAction(() => {
      const set = workingSets.find((item) => item.number === setNumber);
      if (set) {
        setWeight(set.weight);
        setReps(set.reps);
        setRir(set.rir);
      }
      setEditingSetNumber(setNumber);
      navigate("set-entry");
    });
  };

  const markCurrentSetDraft = (change: () => void) => {
    change();
    const currentWasSaved = editingSetNumber === 4
      ? savedSet
      : completedSetNumbers.includes(editingSetNumber);
    if (currentWasSaved) {
      setRevisingSetNumbers((current) => current.includes(editingSetNumber)
        ? current
        : [...current, editingSetNumber]);
      if (editingSetNumber === 4) setSavedSet(false);
      else setCompletedSetNumbers((current) => current.filter((number) => number !== editingSetNumber));
      setToast(`Set ${editingSetNumber} changed · save again to commit the revised values`);
    }
  };

  const updateCurrentSetWeight = (value: number) => {
    if (value === weight) return;
    markCurrentSetDraft(() => {
      setWeight(value);
      setCompletedSets((current) => ({
        ...current,
        [editingSetNumber]: { ...current[editingSetNumber], weight: value },
      }));
    });
  };

  const updateCurrentSetReps = (value: number) => {
    if (value === reps) return;
    markCurrentSetDraft(() => {
      setReps(value);
      setCompletedSets((current) => ({
        ...current,
        [editingSetNumber]: { ...current[editingSetNumber], reps: value },
      }));
    });
  };

  const updateCurrentSetRir = (value: number | null) => {
    if (value === rir) return;
    markCurrentSetDraft(() => {
      setRir(value);
      setCompletedSets((current) => ({
        ...current,
        [editingSetNumber]: { ...current[editingSetNumber], rir: value },
      }));
    });
  };

  const startOrRestartRestTimer = () => {
    setRestSeconds(90);
    setRestPaused(false);
    setRestActive(true);
  };

  const dismissRestTimer = () => {
    setRestActive(false);
    setRestPaused(false);
  };

  const switchActiveExerciseDrafts = (fromExercise: string, toExercise: string) => {
    const unsavedSets = workingSets.filter((set) => !set.saved);
    if (unsavedSets.length === 0) return;
    const fromDrafts = Object.fromEntries(unsavedSets.map((set) => [set.number, {
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
    }])) as Partial<Record<WorkingSetNumber, WorkingSetValues>>;
    const targetExercise = {
      ...(activePlanExercises[activeExerciseIndex] ?? activePlanExercises[0]),
      name: toExercise,
    };
    const neutralTargetValues = startingSetValuesForExercise(targetExercise, todayWorkout);
    const targetDrafts = exerciseDrafts[toExercise] ?? {};
    const nextCompletedSets: WorkingSetValuesByNumber = { ...completedSets };
    for (const set of unsavedSets) {
      nextCompletedSets[set.number] = { ...(targetDrafts[set.number] ?? neutralTargetValues[set.number]) };
    }
    const nextEditingSet = unsavedSets.some((set) => set.number === editingSetNumber)
      ? editingSetNumber
      : unsavedSets[0].number;
    setExerciseDrafts((current) => ({
      ...current,
      [fromExercise]: { ...(current[fromExercise] ?? {}), ...fromDrafts },
    }));
    setCompletedSets(nextCompletedSets);
    setSetOwners((current) => {
      const next = { ...current };
      for (const set of unsavedSets) next[set.number] = toExercise;
      return next;
    });
    setEditingSetNumber(nextEditingSet);
    setWeight(nextCompletedSets[nextEditingSet].weight);
    setReps(nextCompletedSets[nextEditingSet].reps);
    setRir(nextCompletedSets[nextEditingSet].rir);
    setRevisingSetNumbers([]);
  };

  const finishActiveWorkout = () => {
    if (finishingSessionRef.current) return;
    finishingSessionRef.current = true;
    const completedWorkout = todayWorkout;
    const nextWorkout = activeCountsAsExpected ? nextProgrammeWorkout[completedWorkout] : completedWorkout;
    const recordedSets = workingSets.filter((set) => set.saved).map((set) => ({ ...set }));
    const latestRecordedSet = recordedSets.at(-1) ?? null;
    const savedExerciseNotes = Object.entries(exerciseNotes)
      .filter(([, note]) => note.trim())
      .map(([exerciseName, note]) => ({ exerciseName, note }));
    const plannedSetCount = activePlanExercises.reduce((total, exercise) => (
      total + (parseSupportedPrescription(exercise.prescription)?.sets ?? 0)
    ), 0);
    const sessionId = `runtime-${completedWorkout.toLowerCase().replaceAll(" ", "-")}-${runtimeSessionCounterRef.current + 1}`;
    runtimeSessionCounterRef.current += 1;
    const snapshot: CompletionSnapshot = {
      sessionId,
      workout: completedWorkout,
      nextWorkout,
      countsAsExpected: activeCountsAsExpected,
      plannedExercises: activePlanExercises.map((exercise) => ({ ...exercise })),
      recordedExerciseName: lastRecordedExerciseName,
      recordedWeight: latestRecordedSet?.weight ?? 0,
      recordedReps: latestRecordedSet?.reps ?? 0,
      recordedSets,
      completedSetCount: recordedSets.length,
      plannedSetCount,
      carryForwardRequested,
      exerciseNotes: savedExerciseNotes,
    };
    const historyRecord: HistorySession = {
      id: sessionId,
      date: "TODAY · JUST RECORDED",
      workout: completedWorkout,
      duration: "Duration not modelled",
      setCount: recordedSets.length,
      status: recordedSets.length >= plannedSetCount ? "Completed" : "Partial",
      sample: false,
      exerciseNotes: savedExerciseNotes,
      exercises: [{
        name: lastRecordedExerciseName,
        result: recordedSets.length > 0
          ? `${recordedSets.length} recorded ${recordedSets.length === 1 ? "set" : "sets"} · last saved set in workout order ${latestRecordedSet?.weight} kg × ${latestRecordedSet?.reps}`
          : "No working sets recorded",
      }],
    };

    setCompletionSnapshot(snapshot);
    setRuntimeHistorySessions((current) => [historyRecord, ...current]);
    setWorkoutInProgress(false);
    setCompletionSource("active-finish");
    setLastCompletedWorkout(completedWorkout);
    setHasCompletedPrototypeWorkout(true);
    setTodayWorkout(nextWorkout);
    setActivePlanExercises(publishedProgrammeExercises[nextWorkout].map((exercise) => ({ ...exercise })));
    setActiveExerciseName(publishedProgrammeExercises[nextWorkout][0].name);
    setLastRecordedExerciseName(publishedProgrammeExercises[nextWorkout][0].name);
    setLastRecordedSet({
      weight: workingSetSeedByWorkout[nextWorkout][1].weight,
      reps: workingSetSeedByWorkout[nextWorkout][1].reps,
    });
    setHasComparableSetFixture(hasComparableWorkingSetFixture(publishedProgrammeExercises[nextWorkout][0], nextWorkout));
    setWeight(workingSetSeedByWorkout[nextWorkout][1].weight);
    setReps(workingSetSeedByWorkout[nextWorkout][1].reps);
    setRir(workingSetSeedByWorkout[nextWorkout][1].rir);
    setSavedSet(false);
    setCompletedSetNumbers([]);
    setRevisingSetNumbers([]);
    setCompletedSets({
      1: { ...workingSetSeedByWorkout[nextWorkout][1] },
      2: { ...workingSetSeedByWorkout[nextWorkout][2] },
      3: { ...workingSetSeedByWorkout[nextWorkout][3] },
      4: { ...workingSetSeedByWorkout[nextWorkout][4] },
    });
    setEditingSetNumber(1);
    setActiveExerciseIndex(0);
    setReplacementFromExercise(null);
    setActiveSubstitutionReason(null);
    setExerciseNotes({});
    setRestActive(false);
    setCarryForwardNotice(carryForwardRequested
      ? `Prototype review reminder: consider ${plannedSetCount - recordedSets.length} not-attempted sets from ${completedWorkout} before ${nextWorkout}. No work has been copied or scheduled.`
      : null);
    navigate("complete");
  };

  const returnToTodayAfterCompletion = () => requestGlobalNavigation("completion-done");

  const saveEditedSet = (nextWeight: number, nextReps: number, nextRir: number | null) => {
    const recordedSetNumber = editingSetNumber;
    const wasSaved = recordedSetNumber === 4
      ? savedSet
      : completedSetNumbers.includes(recordedSetNumber);
    const wasRevision = revisingSetNumbers.includes(recordedSetNumber);
    const recordedExerciseName = wasSaved || wasRevision
      ? setOwners[recordedSetNumber]
      : activeExerciseName;
    setWeight(nextWeight);
    setReps(nextReps);
    setRir(nextRir);
    if (recordedSetNumber === 4) {
      setSavedSet(true);
      setCompletedSets((current) => ({
        ...current,
        4: { weight: nextWeight, reps: nextReps, rir: nextRir },
      }));
    } else {
      setCompletedSets((current) => ({
        ...current,
        [recordedSetNumber]: { weight: nextWeight, reps: nextReps, rir: nextRir },
      }));
      setCompletedSetNumbers((current) => current.includes(recordedSetNumber)
        ? current
        : [...current, recordedSetNumber]);
    }
    setSetOwners((current) => ({ ...current, [recordedSetNumber]: recordedExerciseName }));
    setLastRecordedExerciseName(recordedExerciseName);
    setLastRecordedSet({ weight: nextWeight, reps: nextReps });
    setRevisingSetNumbers((current) => current.filter((number) => number !== recordedSetNumber));
    if (!wasSaved && !wasRevision) {
      setRestSeconds(90);
      setRestPaused(false);
      setRestActive(true);
    }
    if (!wasSaved && !wasRevision && recordedSetNumber < plannedFirstExerciseSetCount) {
      const nextSetNumber = (recordedSetNumber + 1) as WorkingSetNumber;
      const nextSetDraft = completedSets[nextSetNumber];
      setEditingSetNumber(nextSetNumber);
      setWeight(nextSetDraft.weight);
      setReps(nextSetDraft.reps);
      setRir(nextSetDraft.rir);
    }
    navigate("active");
    setToast(workoutInProgress
      ? `Set ${recordedSetNumber} ${wasSaved || wasRevision ? "updated" : "recorded"} in prototype state · ${nextWeight} kg × ${nextReps}`
      : `Sample set ${recordedSetNumber} fixture updated · no workout record created · ${nextWeight} kg × ${nextReps}`);
  };

  const saveQuickSet = (nextWeight: number, nextReps: number, nextRir: number | null) => {
    const recordedSetNumber = editingSetNumber;
    const wasSaved = recordedSetNumber === 4
      ? savedSet
      : completedSetNumbers.includes(recordedSetNumber);
    const wasRevision = revisingSetNumbers.includes(recordedSetNumber);
    const recordedExerciseName = wasSaved || wasRevision
      ? setOwners[recordedSetNumber]
      : activeExerciseName;
    const normalSetReps = Math.max(1, Math.trunc(nextReps));
    setWeight(nextWeight);
    setReps(normalSetReps);
    setRir(nextRir);
    if (recordedSetNumber === 4) {
      setSavedSet(true);
      setCompletedSets((current) => ({
        ...current,
        4: { weight: nextWeight, reps: normalSetReps, rir: nextRir },
      }));
    } else {
      setCompletedSets((current) => ({
        ...current,
        [recordedSetNumber]: { weight: nextWeight, reps: normalSetReps, rir: nextRir },
      }));
      setCompletedSetNumbers((current) => current.includes(recordedSetNumber)
        ? current
        : [...current, recordedSetNumber]);
    }
    setSetOwners((current) => ({ ...current, [recordedSetNumber]: recordedExerciseName }));
    setLastRecordedExerciseName(recordedExerciseName);
    setLastRecordedSet({ weight: nextWeight, reps: normalSetReps });
    setRevisingSetNumbers((current) => current.filter((number) => number !== recordedSetNumber));
    if (!wasSaved && !wasRevision) {
      setRestSeconds(90);
      setRestPaused(false);
      setRestActive(true);
    }
    if (!wasRevision && recordedSetNumber < plannedFirstExerciseSetCount) {
      const nextSetNumber = (recordedSetNumber + 1) as WorkingSetNumber;
      const nextSetDraft = completedSets[nextSetNumber];
      setEditingSetNumber(nextSetNumber);
      setWeight(nextSetDraft.weight);
      setReps(nextSetDraft.reps);
      setRir(nextSetDraft.rir);
    }
    setToast(workoutInProgress
      ? `Set ${recordedSetNumber} ${wasRevision ? "updated" : "recorded"} in prototype state · ${nextWeight} kg × ${normalSetReps}`
      : `Sample set ${recordedSetNumber} fixture updated · no workout record created · ${nextWeight} kg × ${normalSetReps}`);
  };

  const startWorkout = (countsAsExpected: boolean) => {
    const firstExercise = publishedProgrammeExercises[todayWorkout][0];
    finishingSessionRef.current = false;
    setActiveCountsAsExpected(countsAsExpected);
    setWorkoutInProgress(true);
    setActiveExerciseIndex(0);
    setReplacementFromExercise(null);
    setActiveSubstitutionReason(null);
    setFutureProgrammeNotice(null);
    setActivePlanExercises(publishedProgrammeExercises[todayWorkout].map((exercise) => ({ ...exercise })));
    setActiveExerciseName(firstExercise.name);
    setLastRecordedExerciseName(firstExercise.name);
    setLastRecordedSet({
      weight: workingSetSeedByWorkout[todayWorkout][1].weight,
      reps: workingSetSeedByWorkout[todayWorkout][1].reps,
    });
    setWeight(workingSetSeedByWorkout[todayWorkout][1].weight);
    setReps(workingSetSeedByWorkout[todayWorkout][1].reps);
    setRir(workingSetSeedByWorkout[todayWorkout][1].rir);
    setSavedSet(false);
    setCompletedSetNumbers([]);
    setRevisingSetNumbers([]);
    setCompletedSets({
      1: { ...workingSetSeedByWorkout[todayWorkout][1] },
      2: { ...workingSetSeedByWorkout[todayWorkout][2] },
      3: { ...workingSetSeedByWorkout[todayWorkout][3] },
      4: { ...workingSetSeedByWorkout[todayWorkout][4] },
    });
    setEditingSetNumber(1);
    setHasComparableSetFixture(hasComparableWorkingSetFixture(firstExercise, todayWorkout));
    setExerciseNotes({});
    setCarryForwardRequested(false);
    setCarryForwardNotice(null);
    setRestSeconds(90);
    setRestPaused(false);
    setRestActive(false);
    navigate("active");
    if (!countsAsExpected) setToast("Unplanned workout started · programme sequence unchanged");
  };

  if (!directionId) {
    return (
      <MobileScroll className="nextset-scroll review-scroll">
        <main
          ref={galleryMainRef}
          className="direction-gallery"
          tabIndex={-1}
          aria-label="NextSet visual direction prototypes"
        >
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
                  routeFocusDelayRef.current = 0;
                  dismissPrototypeKeyboard();
                  setToast(null);
                  setReviewOpen(false);
                  setPartialFinishOpen(false);
                  setPendingGlobalNavigation(null);
                  setPendingGuardedActionOpen(false);
                  pendingGuardedActionRef.current = null;
                  setDirectionId(item.id);
                  setScreen("onboarding");
                  setSchedule("flexible");
                  setWeight(100);
                  setReps(8);
                  setRir(null);
                  setSavedSet(false);
                  setCompletedSetNumbers([1, 2, 3]);
                  setRevisingSetNumbers([]);
                  setCompletedSets({
                    1: { ...workingSetSeedByWorkout["Upper A"][1] },
                    2: { ...workingSetSeedByWorkout["Upper A"][2] },
                    3: { ...workingSetSeedByWorkout["Upper A"][3] },
                    4: { ...workingSetSeedByWorkout["Upper A"][4] },
                  });
                  setEditingSetNumber(4);
                  setCompletionSource("fixture");
                  setCompletionSnapshot(null);
                  setCompletionNotes({});
                  setRuntimeHistorySessions([]);
                  setCarryForwardRequested(false);
                  setCarryForwardNotice(null);
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
                  setActiveSubstitutionReason(null);
                  setFutureProgrammeNotice(null);
                  setHasComparableSetFixture(true);
                  setPublishedProgrammeName("Full body · 3 sessions");
                  setPublishedProgrammeExercises(cloneProgrammeExercises(programmeEditorSeed));
                  setActivePlanExercises(cloneProgrammeExercises(programmeEditorSeed)["Upper A"]);
                  setExerciseNotes({});
                  setRestSeconds(72);
                  setRestPaused(false);
                  setRestActive(true);
                  setSelection(null);
                  finishingSessionRef.current = false;
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
        <main
          ref={mainContentRef}
          className={`app-content screen-${screen}`}
          data-testid={`screen-${screen}`}
          tabIndex={-1}
          aria-label={`${screenLabels[screen]} screen`}
        >
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
                setToast("No training goal selected · downstream goal logic is not modelled in this foundation prototype");
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
              carryForwardNotice={carryForwardNotice}
              onStart={() => {
                if (workoutInProgress) {
                  navigate("active");
                  return;
                }
                startWorkout(true);
              }}
              onUnplanned={() => startWorkout(false)}
              onEdit={() => navigate("programme-editor")}
            />
          )}
          {screen === "active" && (
            <ActiveWorkoutScreen
              direction={direction}
              activeSetNumber={editingSetNumber}
              firstExerciseComplete={firstExerciseComplete}
              weight={weight}
              reps={reps}
              rir={rir}
              activeExerciseIndex={activeExerciseIndex}
              replacementFromExercise={replacementFromExercise}
              substitutionReason={activeSubstitutionReason}
              futureProgrammeNotice={futureProgrammeNotice}
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
              onNavigationGuard={registerNavigationGuard}
              onAdvanceExercise={() => requestGuardedAction(() => {
                  setActiveExerciseIndex(1);
                  setReplacementFromExercise(null);
                  setActiveSubstitutionReason(null);
                  setActiveExerciseName(activePlanExercises[1]?.name ?? "Next planned exercise");
                  setToast("Focus moved to exercise 2 in prototype state");
                })}
              workingSets={workingSets}
              onEditSet={openSetEntry}
              onWeight={updateCurrentSetWeight}
              onReps={updateCurrentSetReps}
              onRir={updateCurrentSetRir}
              restSeconds={restSeconds}
              restPaused={restPaused}
              restActive={restActive}
              restIsSample={!workoutInProgress}
              onRestSeconds={setRestSeconds}
              onRestPaused={setRestPaused}
              onRestStart={startOrRestartRestTimer}
              onRestDismiss={dismissRestTimer}
              onSubstitute={() => requestGuardedAction(() => navigate("substitution"))}
              onRestoreOriginal={() => requestGuardedAction(() => {
                if (!replacementFromExercise) return;
                setActiveExerciseName(replacementFromExercise);
                if (completedSetCount === 0) setLastRecordedExerciseName(replacementFromExercise);
                setReplacementFromExercise(null);
                setActiveSubstitutionReason(null);
                setToast("Returned to the original exercise · its unrecorded set drafts remain available");
                window.setTimeout(() => mainContentRef.current?.focus({ preventScroll: true }), routeFocusDelayRef.current);
              })}
              onFinish={() => {
                if (!workoutInProgress) {
                  setToast("Review-only active fixture · start from Today before recording a completion");
                  return;
                }
                requestGuardedAction(() => {
                  setCarryForwardRequested(false);
                  setPartialFinishOpen(true);
                });
              }}
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
              reviewOnly={!workoutInProgress}
              restSeconds={restSeconds}
              restPaused={restPaused}
              restActive={restActive}
              restIsSample={!workoutInProgress}
              onRestSeconds={setRestSeconds}
              onRestPaused={setRestPaused}
              onRestStart={startOrRestartRestTimer}
              onRestDismiss={dismissRestTimer}
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
              currentPrescription={activePlanExercises[activeExerciseIndex]?.prescription ?? "Target not recorded"}
              effectiveWorkout={todayWorkout}
              programmeExerciseName={publishedExerciseForActiveSnapshot?.name ?? activeExerciseName}
              reviewOnly={!workoutInProgress}
              restSeconds={restSeconds}
              restPaused={restPaused}
              restActive={restActive}
              restIsSample={!workoutInProgress}
              onRestSeconds={setRestSeconds}
              onRestPaused={setRestPaused}
              onRestStart={startOrRestartRestTimer}
              onRestDismiss={dismissRestTimer}
              onChoose={(name, scope, reason) => {
                const programmeExerciseName = publishedExerciseForActiveSnapshot?.name ?? activeExerciseName;
                if (scope === "today") {
                  setReplacementFromExercise((current) => current ?? activeExerciseName);
                  setActiveExerciseName(name);
                  setActiveSubstitutionReason(reason);
                  if (completedSetCount === 0) setLastRecordedExerciseName(name);
                } else {
                  if (!activeExerciseStableId || !publishedExerciseForActiveSnapshot) {
                    navigate("active");
                    setToast("Future change not applied · this active exercise no longer exists in the published programme version");
                    return;
                  }
                  setPublishedProgrammeExercises((current) => ({
                    ...current,
                    [todayWorkout]: current[todayWorkout].map((exercise) => (
                      exercise.id === activeExerciseStableId
                        ? { ...exercise, name, meta: substitutionMetaByName[name] ?? "Future replacement · metadata review needed" }
                      : exercise
                    )),
                  }));
                  setFutureProgrammeNotice(workoutInProgress
                    ? `Next not-started ${todayWorkout} occurrence: ${programmeExerciseName} becomes ${name}. Reason: ${reason}. Current active workout (${activeExerciseName}) is unchanged.`
                    : `Published prototype programme: next not-started ${todayWorkout} occurrence changes ${programmeExerciseName} to ${name}. Reason: ${reason}. The sample active review fixture (${activeExerciseName}) is unchanged.`);
                }
                navigate("active");
                setToast(scope === "today"
                  ? workoutInProgress
                    ? `${name} selected for today only · reason recorded: ${reason}`
                    : `${name} selected in the active review fixture · no workout record created · reason: ${reason}`
                  : workoutInProgress
                    ? `${name} confirmed for the next not-started ${todayWorkout} occurrence · reason recorded: ${reason}`
                    : `${name} confirmed in the published prototype programme · sample active review fixture unchanged · reason: ${reason}`);
              }}
            />
          )}
          {screen === "complete" && (
            <CompletionScreen
              key={completionSource === "active-finish" && completionSnapshot ? completionSnapshot.sessionId : "fixture"}
              direction={direction}
              snapshot={completionSnapshot}
              source={completionSource}
              note={completionNotes[completionSource === "active-finish" && completionSnapshot ? completionSnapshot.sessionId : "fixture"] ?? ""}
              onSaveNote={(note) => {
                const sessionId = completionSource === "active-finish" && completionSnapshot
                  ? completionSnapshot.sessionId
                  : "fixture";
                setCompletionNotes((current) => ({ ...current, [sessionId]: note }));
                if (sessionId !== "fixture") {
                  setRuntimeHistorySessions((current) => current.map((session) => (
                    session.id === sessionId ? { ...session, note } : session
                  )));
                }
              }}
              onNavigationGuard={registerNavigationGuard}
              onDone={returnToTodayAfterCompletion}
              onHistory={() => requestGlobalNavigation("history")}
            />
          )}
          {screen === "history" && (
            <HistoryScreen
              direction={direction}
              sessions={[...runtimeHistorySessions, ...historySessions]}
              onExercise={() => navigate("exercise-progress")}
            />
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
          setNumber={editingSetNumber}
          savedSet={editingSet.saved}
          weight={weight}
          reps={reps}
          rir={rir}
          onWeight={updateCurrentSetWeight}
          onReps={updateCurrentSetReps}
          onRir={updateCurrentSetRir}
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
                if (item === "complete") {
                  if (screen === "complete") {
                    setReviewOpen(false);
                    return;
                  }
                  requestGuardedAction(() => {
                    setCompletionSource("fixture");
                    navigate("complete");
                  });
                  return;
                }
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
        title="Review incomplete workout"
        description={`${completedSetCount} ${completedSetCount === 1 ? "set is" : "sets are"} recorded and ${activeNotAttemptedSetCount} planned ${activeNotAttemptedSetCount === 1 ? "set is" : "sets are"} not attempted. ${completedSetCount > 0 ? `Recorded sets remain attributed to ${lastRecordedExerciseName}.` : `No observed set is attributed to ${activeExerciseName}.`}`}
        snap={0.58}
      >
        <div className="partial-finish-actions">
          <div className="schedule-choice" role="radiogroup" aria-label="Remaining-work disposition">
            <button
              type="button"
              role="radio"
              aria-checked={!carryForwardRequested}
              className={!carryForwardRequested ? "is-selected" : ""}
              onClick={() => setCarryForwardRequested(false)}
            >
              Leave as not attempted
              <small>The programme continues to {activeCountsAsExpected ? nextProgrammeWorkout[todayWorkout] : todayWorkout}.</small>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={carryForwardRequested}
              className={carryForwardRequested ? "is-selected" : ""}
              onClick={() => setCarryForwardRequested(true)}
            >
              Add prototype carry-forward reminder
              <small>Show a review reminder for {activeNotAttemptedSetCount} not-attempted sets. No set is copied or scheduled.</small>
            </button>
          </div>
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
        open={pendingGlobalNavigation !== null || pendingGuardedActionOpen}
        onOpenChange={(open) => {
          if (!open) closePendingGuardAndReturnFocus();
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
              const action = pendingGuardedActionRef.current;
              const guard = navigationGuardRef.current;
              if ((!destination && !action) || !guard?.canSave || !guard.save()) return;
              setPendingGlobalNavigation(null);
              setPendingGuardedActionOpen(false);
              pendingGuardedActionRef.current = null;
              guardReturnFocusRef.current = null;
              if (destination) performNavigationDestination(destination);
              else {
                routeFocusDelayRef.current = 220;
                action?.();
              }
              setToast(guard.savedConfirmation);
            }}
          >
            Save changes and leave
          </button>
          <button
            className="secondary-action"
            onClick={() => {
              const destination = pendingGlobalNavigation;
              const action = pendingGuardedActionRef.current;
              const guard = navigationGuardRef.current;
              if ((!destination && !action) || !guard) return;
              guard.discard();
              setPendingGlobalNavigation(null);
              setPendingGuardedActionOpen(false);
              pendingGuardedActionRef.current = null;
              guardReturnFocusRef.current = null;
              if (destination) performNavigationDestination(destination);
              else {
                routeFocusDelayRef.current = 220;
                action?.();
              }
              setToast(guard.discardedConfirmation);
            }}
          >
            Discard changes
          </button>
          <button className="secondary-action" onClick={closePendingGuardAndReturnFocus}>
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
      <button
        className="review-menu"
        onClick={onOpenReview}
        aria-label={`${screenLabels[screen]} · open prototype screen index`}
      >
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
        Choose a starting point for this review. The selection is not used to generate downstream suggestions in this foundation prototype.
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
        <CheckIcon aria-hidden="true" /> Foundation product principle · avoid punitive streaks; any future fixed-date miss must wait for the user’s choice.
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
      <p className="section-lead">Example content only · three sessions · common gym equipment · static 45–60 minute template estimate based on 16 planned sets and sample 2–3 minute rests. This is not calculated from user history; professional content review is required before release.</p>

      <article className="programme-feature is-selected">
        <div className="feature-topline">
          <span className="status-label">EXAMPLE · CONTENT REVIEW REQUIRED</span>
          <CheckCircledIcon aria-hidden="true" />
        </div>
        <h2>Full body · 3 sessions</h2>
        <p>A three-session structure showing rep-range fields and equipment substitution controls.</p>
        <dl>
          <div><dt>Frequency</dt><dd>3× weekly</dd></div>
          <div><dt>Duration</dt><dd>Static 45–60 min template estimate</dd></div>
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
            Fixed weekdays concept
            <small>Specific days are not modelled in this prototype</small>
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
  carryForwardNotice,
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
  carryForwardNotice: string | null;
  onStart: () => void;
  onUnplanned: () => void;
  onEdit: () => void;
}) {
  const isUpperA = workout === "Upper A";
  return (
    <section className="screen-section today-screen">
      <div className="today-date">
        <span>SAMPLE DATE · THURSDAY</span>
        <strong>6 AUG 2026</strong>
      </div>
      <p className="section-kicker">{schedule === "flexible" ? "NEXT IN YOUR SEQUENCE" : "FIXED-WEEKDAY CONCEPT · SPECIFIC DAYS NOT MODELLED"}</p>
      <h1>{workout}</h1>
      <p className="today-summary">{isUpperA ? "Horizontal push and pull" : workout === "Lower A" ? "Squat and hinge" : "Upper-body variation"} · {plannedExercises.length} exercises · duration not modelled in this prototype</p>

      <div className="focus-panel">
        <div>
          <small>MAIN FOCUS</small>
          <strong>{plannedExercises[0].name} · {plannedExercises[0].prescription}</strong>
        </div>
        <div>
          <small>LAST WORKOUT</small>
          <strong>{lastCompletedWorkout} · {hasCompletedPrototypeWorkout ? "just recorded" : "sample prior fixture · 3 days ago"}</strong>
        </div>
      </div>

      {carryForwardNotice && (
        <div className="session-scope-notice" role="status">
          <strong>One-time follow-up recorded</strong>
          <span>{carryForwardNotice}</span>
        </div>
      )}

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
  activeSetNumber,
  firstExerciseComplete,
  weight,
  reps,
  rir,
  activeExerciseIndex,
  replacementFromExercise,
  substitutionReason,
  futureProgrammeNotice,
  countsAsExpected,
  hasComparableSetFixture,
  workout,
  exerciseName,
  plannedFirstExercise,
  nextExerciseName,
  plannedExerciseCount,
  exerciseNote,
  onSaveExerciseNote,
  onNavigationGuard,
  onAdvanceExercise,
  workingSets,
  onEditSet,
  onWeight,
  onReps,
  onRir,
  restSeconds,
  restPaused,
  restActive,
  restIsSample,
  onRestSeconds,
  onRestPaused,
  onRestStart,
  onRestDismiss,
  onSubstitute,
  onRestoreOriginal,
  onFinish,
}: {
  direction: Direction;
  activeSetNumber: WorkingSetNumber;
  firstExerciseComplete: boolean;
  weight: number;
  reps: number;
  rir: number | null;
  activeExerciseIndex: number;
  replacementFromExercise: string | null;
  substitutionReason: string | null;
  futureProgrammeNotice: string | null;
  countsAsExpected: boolean;
  hasComparableSetFixture: boolean;
  workout: ProgrammeWorkoutId;
  exerciseName: string;
  plannedFirstExercise: ExerciseRow;
  nextExerciseName: string;
  plannedExerciseCount: number;
  exerciseNote: string;
  onSaveExerciseNote: (note: string) => void;
  onNavigationGuard: (guard: NavigationGuard | null) => void;
  onAdvanceExercise: () => void;
  workingSets: WorkingSet[];
  onEditSet: (setNumber: WorkingSetNumber) => void;
  onWeight: (value: number) => void;
  onReps: (value: number) => void;
  onRir: (value: number | null) => void;
  restSeconds: number;
  restPaused: boolean;
  restActive: boolean;
  restIsSample: boolean;
  onRestSeconds: Dispatch<SetStateAction<number>>;
  onRestPaused: Dispatch<SetStateAction<boolean>>;
  onRestStart: () => void;
  onRestDismiss: () => void;
  onSubstitute: () => void;
  onRestoreOriginal: () => void;
  onFinish: () => void;
}) {
  const restLabel = `${String(Math.floor(restSeconds / 60)).padStart(2, "0")}:${String(restSeconds % 60).padStart(2, "0")}`;
  const restExpired = restActive && restSeconds === 0;
  const restStatus = !restActive
    ? "REST TIMER IDLE"
    : restExpired
      ? "REST COMPLETE"
      : restPaused
        ? restIsSample ? "SAMPLE PAUSED" : "PAUSED"
        : restIsSample ? "SAMPLE RESTING" : "RESTING";
  const restAccessibleLabel = !restActive
    ? "Rest timer idle: start manually or save a set"
    : restExpired
      ? "Rest complete"
      : `${restIsSample ? "Sample " : ""}rest timer: ${restLabel}${restPaused ? ", paused" : " remaining"}`;
  const targetRepRange = plannedFirstExercise.prescription.split("×")[1]?.trim() ?? plannedFirstExercise.prescription;
  const priorComparableSet = priorComparableSetByWorkout[workout];
  const recordedSetCount = workingSets.filter((set) => set.saved).length;
  const setsAttributedToReplacedExercise = activeExerciseIndex === 0 ? recordedSetCount : 0;
  const previousRecordedSet = [...workingSets]
    .reverse()
    .find((set) => set.saved && set.number < activeSetNumber) ?? null;

  if (replacementFromExercise) {
    return (
      <section className="screen-section active-screen next-exercise-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <ReviewOnlyActiveNotice visible={restIsSample} />
        <FutureProgrammeNotice notice={futureProgrammeNotice} />
        <p className="section-kicker">{workout.toUpperCase()} · TODAY-ONLY REPLACEMENT SEGMENT</p>
        <h1>{exerciseName}</h1>
        <p className="section-lead">
          {setsAttributedToReplacedExercise > 0
            ? `${setsAttributedToReplacedExercise} previously recorded ${setsAttributedToReplacedExercise === 1 ? "set remains" : "sets remain"} attributed to ${replacementFromExercise}.`
            : `No sets were recorded for ${replacementFromExercise} before this replacement.`} No sets for {exerciseName} have been entered in prototype state.
        </p>
        <p className="section-lead">Unrecorded set drafts remain attached to {replacementFromExercise} and are recoverable by returning to it.</p>
        {substitutionReason && <p className="section-lead">Replacement reason recorded: {substitutionReason}.</p>}
        <CompactRestTimer accessibleLabel={restAccessibleLabel} status={restStatus} label={restActive ? restLabel : "Start manually or save set"} active={restActive} expired={restExpired} paused={restPaused} onSeconds={onRestSeconds} onPaused={onRestPaused} onStart={onRestStart} onDismiss={onRestDismiss} />
        <div className="next-exercise-ready" role="status">
          <CheckCircledIcon aria-hidden="true" /> Current replacement focus · set entry is outside this ten-screen review state
        </div>
        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} onNavigationGuard={onNavigationGuard} />
        <div className="inline-actions">
          <button onClick={onSubstitute}>Choose another replacement</button>
          <button onClick={onRestoreOriginal}>Return to {replacementFromExercise}</button>
          <button onClick={onFinish}>Finish workout</button>
        </div>
      </section>
    );
  }

  if (!hasComparableSetFixture) {
    return (
      <section className="screen-section active-screen next-exercise-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <ReviewOnlyActiveNotice visible={restIsSample} />
        <FutureProgrammeNotice notice={futureProgrammeNotice} />
        <p className="section-kicker">{workout.toUpperCase()} · EXERCISE 1 OF {plannedExerciseCount}</p>
        <h1>{exerciseName}</h1>
        <p className="section-lead">Target {targetRepRange} reps · {plannedFirstExercise.prescription.split("×")[0]?.trim()} working sets</p>
        <div className="next-exercise-ready" role="status">
          No comparable set sample exists for this reordered or replaced first exercise. No observations are prefilled or recorded.
        </div>
        <CompactRestTimer accessibleLabel={restAccessibleLabel} status={restStatus} label={restActive ? restLabel : "Start manually or save set"} active={restActive} expired={restExpired} paused={restPaused} onSeconds={onRestSeconds} onPaused={onRestPaused} onStart={onRestStart} onDismiss={onRestDismiss} />
        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} onNavigationGuard={onNavigationGuard} />
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
        <ReviewOnlyActiveNotice visible={restIsSample} />
        <FutureProgrammeNotice notice={futureProgrammeNotice} />
        <p className="section-kicker">{workout.toUpperCase()} · EXERCISE {activeExerciseIndex + 1} OF {plannedExerciseCount}</p>
        <h1>{exerciseName}</h1>
        <p className="section-lead">Focus advanced after the previous set was recorded. No sets for this exercise have been entered in prototype state.</p>
        <div className="next-exercise-ready" role="status">
          <CheckCircledIcon aria-hidden="true" /> Current focus · set entry is outside this ten-screen review state
        </div>
        <CompactRestTimer accessibleLabel={restAccessibleLabel} status={restStatus} label={restActive ? restLabel : "Start manually or save set"} active={restActive} expired={restExpired} paused={restPaused} onSeconds={onRestSeconds} onPaused={onRestPaused} onStart={onRestStart} onDismiss={onRestDismiss} />
        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} onNavigationGuard={onNavigationGuard} />
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
        <ReviewOnlyActiveNotice visible={restIsSample} />
        <FutureProgrammeNotice notice={futureProgrammeNotice} />
        <RecordingStateNotice recordedSetCount={recordedSetCount} />
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

        <div className="field-rest-row" aria-label={restAccessibleLabel}>
          <span role={restExpired ? "status" : undefined}>{restExpired ? "REST COMPLETE" : restActive ? `${restStatus} ${restLabel}` : restStatus}</span>
          <i aria-hidden="true" />
          <RestTimerActions active={restActive} expired={restExpired} paused={restPaused} onSeconds={onRestSeconds} onPaused={onRestPaused} onStart={onRestStart} onDismiss={onRestDismiss} />
        </div>

        {previousRecordedSet ? (
          <dl className="field-previous-set">
            <div><dt>Previous set</dt><dd>{previousRecordedSet.weight} kg</dd></div>
            <div><dt>Reps</dt><dd>{previousRecordedSet.reps}</dd></div>
            <div><dt>RIR</dt><dd>{previousRecordedSet.rir ?? "—"}</dd></div>
            <div><dt>Status</dt><dd><CheckIcon aria-label="Complete" /></dd></div>
          </dl>
        ) : (
          <div className="next-exercise-ready" role="status">No previous set in this active workout.</div>
        )}

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

        <div className="field-set-tabs" role="group" aria-label="Working set selection">
          {workingSets.map((set) => {
            const isCurrent = set.number === activeSetNumber && !set.saved;
            return (
              <button
                key={set.number}
                className={isCurrent ? "is-current" : ""}
                onClick={() => onEditSet(set.number)}
                aria-label={set.saved
                  ? `Edit completed set ${set.number}: ${set.weight} kilograms, ${set.reps} reps`
                  : `Open set ${set.number}: ${set.weight} kilograms, ${set.reps} reps; ${isCurrent ? "current" : "planned"} draft, target ${targetRepRange} reps, not saved`}
              >
                <span>SET {set.number}</span><strong>{set.weight} KG</strong><small>{set.saved ? `${set.reps} REPS` : isCurrent ? "CURRENT" : "PLANNED"}</small>
              </button>
            );
          })}
        </div>

        <NextFocusCard visible={firstExerciseComplete} exerciseName={nextExerciseName} totalExercises={plannedExerciseCount} onAdvance={onAdvanceExercise} />

        <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} onNavigationGuard={onNavigationGuard} />

        <div className="field-target-row"><span>TARGET RANGE</span><strong>{targetRepRange} REPS</strong><small>{plannedFirstExercise.meta}</small></div>
        <div className="inline-actions"><button onClick={onSubstitute}>Replace exercise</button><button onClick={onFinish}>Finish workout</button></div>
      </section>
    );
  }

  if (direction.id === "pace") {
    return (
      <section className="screen-section active-screen pace-active-layout">
        <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
        <ReviewOnlyActiveNotice visible={restIsSample} />
        <FutureProgrammeNotice notice={futureProgrammeNotice} />
        <RecordingStateNotice recordedSetCount={recordedSetCount} />
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

          <div className="pace-rest-card" aria-label={restAccessibleLabel}>
            <ClockIcon aria-hidden="true" /><div><small role={restExpired ? "status" : undefined}>{restStatus}</small><strong>{restActive ? restLabel : "Start manually or save set"}</strong></div><span aria-hidden="true"><i /></span>
            <RestTimerActions active={restActive} expired={restExpired} paused={restPaused} onSeconds={onRestSeconds} onPaused={onRestPaused} onStart={onRestStart} onDismiss={onRestDismiss} />
          </div>

          <dl className="pace-session-facts"><div><dt>Target</dt><dd>{targetRepRange} reps</dd></div><div><dt>Last comparable set</dt><dd>{priorComparableSet.reps} reps @ {priorComparableSet.weight} kg<br /><small>Sample prior fixture</small></dd></div></dl>

          <div className="pace-set-list" role="group" aria-label="Working sets">
            <div aria-hidden="true"><span>SET</span><span>REPS</span><span>WEIGHT</span></div>
            {workingSets.map((set) => {
              const isCurrent = set.number === activeSetNumber && !set.saved;
              return (
                <button
                  key={set.number}
                  className={isCurrent ? "is-current" : ""}
                  onClick={() => onEditSet(set.number)}
                  aria-label={set.saved
                    ? `Edit completed set ${set.number}: ${set.reps} reps at ${set.weight} kilograms`
                    : `Open set ${set.number}: ${set.reps} reps at ${set.weight} kilograms; ${isCurrent ? "current" : "planned"} draft, target ${targetRepRange} reps, not saved`}
                >
                  <span>{set.saved ? <CheckIcon aria-label="Complete" /> : set.number}</span><strong>Set {set.number}</strong><span>{set.saved ? set.reps : targetRepRange}</span><span>{set.weight} kg</span>
                </button>
              );
            })}
          </div>

          <NextFocusCard visible={firstExerciseComplete} exerciseName={nextExerciseName} totalExercises={plannedExerciseCount} onAdvance={onAdvanceExercise} />

          <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} onNavigationGuard={onNavigationGuard} />

          <button className="pace-finish" onClick={onFinish}>Finish workout</button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen-section active-screen tempo-active-layout">
      <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
      <ReviewOnlyActiveNotice visible={restIsSample} />
      <FutureProgrammeNotice notice={futureProgrammeNotice} />
      <RecordingStateNotice recordedSetCount={recordedSetCount} />
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

      <div className="rest-rail" aria-label={restAccessibleLabel}>
        <ClockIcon aria-hidden="true" />
        <div><small role={restExpired ? "status" : undefined}>{restStatus}</small><strong>{restActive ? restLabel : "Start manually or save set"}</strong></div>
        <span aria-hidden="true"><i /></span>
        <RestTimerActions active={restActive} expired={restExpired} paused={restPaused} onSeconds={onRestSeconds} onPaused={onRestPaused} onStart={onRestStart} onDismiss={onRestDismiss} />
      </div>

      <div className="last-performance">
        <small>SAMPLE PRIOR COMPARABLE SET</small>
        <strong>{priorComparableSet.weight} kg × {priorComparableSet.reps} reps</strong>
        <span>RIR {priorComparableSet.rir ?? "not recorded"}</span>
      </div>

      <div className="set-ledger" role="group" aria-label="Working sets">
        <div className="set-row set-header" aria-hidden="true">
          <span>SET</span><span>KG</span><span>REPS</span><span>RIR</span>
        </div>
        {workingSets.map((set) => {
          const isCurrent = set.number === activeSetNumber && !set.saved;
          return (
            <button
              className={`set-row ${set.saved ? "is-complete" : isCurrent ? "is-current" : "is-planned"}`}
              key={set.number}
              onClick={() => onEditSet(set.number)}
              aria-label={`${set.saved ? "Edit completed" : "Open"} set ${set.number}: ${set.weight} kilograms, ${set.reps} reps, RIR ${set.rir ?? "not recorded"}${set.saved ? "" : `; ${isCurrent ? "current" : "planned"} draft, target ${targetRepRange} reps, not saved`}`}
            >
              <span>{set.saved ? <CheckIcon aria-label="Complete" /> : set.number}</span>
              <strong>{set.weight}</strong>
              <strong>{set.saved ? set.reps : targetRepRange}</strong>
              <strong>{set.rir ?? "—"}</strong>
            </button>
          );
        })}
      </div>

      <NextFocusCard visible={firstExerciseComplete} exerciseName={nextExerciseName} totalExercises={plannedExerciseCount} onAdvance={onAdvanceExercise} />

      <ExerciseNoteControl key={exerciseName} exerciseName={exerciseName} note={exerciseNote} onSave={onSaveExerciseNote} onNavigationGuard={onNavigationGuard} />

      <div className="inline-actions">
        <button onClick={onSubstitute}>Replace exercise</button>
        <button onClick={onFinish}>Finish workout</button>
      </div>
    </section>
  );
}

function RestTimerActions({
  active,
  expired,
  paused,
  onSeconds,
  onPaused,
  onStart,
  onDismiss,
}: {
  active: boolean;
  expired: boolean;
  paused: boolean;
  onSeconds: Dispatch<SetStateAction<number>>;
  onPaused: Dispatch<SetStateAction<boolean>>;
  onStart: () => void;
  onDismiss: () => void;
}) {
  if (!active) {
    return (
      <div className="rest-timer-actions">
        <button type="button" onClick={onStart}>Start 90s rest</button>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="rest-timer-actions">
        <button type="button" onClick={onStart}>Restart 90s</button>
        <button type="button" onClick={onDismiss}>Dismiss rest</button>
      </div>
    );
  }

  return (
    <div className="rest-timer-actions">
      <button type="button" onClick={() => onSeconds((seconds) => Math.max(0, seconds - 30))}>−30s</button>
      <button type="button" onClick={() => onSeconds((seconds) => seconds + 30)}>+30s</button>
      <button type="button" aria-pressed={paused} onClick={() => onPaused((current) => !current)}>{paused ? "Resume" : "Pause"}</button>
      <button type="button" onClick={onStart}>Restart 90s</button>
      <button type="button" onClick={onDismiss}>Dismiss rest</button>
    </div>
  );
}

function CompactRestTimer({
  accessibleLabel,
  status,
  label,
  active,
  expired,
  paused,
  onSeconds,
  onPaused,
  onStart,
  onDismiss,
}: {
  accessibleLabel: string;
  status: string;
  label: string;
  active: boolean;
  expired: boolean;
  paused: boolean;
  onSeconds: Dispatch<SetStateAction<number>>;
  onPaused: Dispatch<SetStateAction<boolean>>;
  onStart: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rest-rail compact-rest-timer" aria-label={accessibleLabel}>
      <ClockIcon aria-hidden="true" />
      <div><small role={expired ? "status" : undefined}>{status}</small><strong>{label}</strong></div>
      <span aria-hidden="true"><i /></span>
      <RestTimerActions active={active} expired={expired} paused={paused} onSeconds={onSeconds} onPaused={onPaused} onStart={onStart} onDismiss={onDismiss} />
    </div>
  );
}

function SessionRestTimer({
  restSeconds,
  restPaused,
  restActive,
  restIsSample,
  onRestSeconds,
  onRestPaused,
  onRestStart,
  onRestDismiss,
}: {
  restSeconds: number;
  restPaused: boolean;
  restActive: boolean;
  restIsSample: boolean;
  onRestSeconds: Dispatch<SetStateAction<number>>;
  onRestPaused: Dispatch<SetStateAction<boolean>>;
  onRestStart: () => void;
  onRestDismiss: () => void;
}) {
  const restLabel = `${String(Math.floor(restSeconds / 60)).padStart(2, "0")}:${String(restSeconds % 60).padStart(2, "0")}`;
  const expired = restActive && restSeconds === 0;
  const status = !restActive
    ? "REST TIMER IDLE"
    : expired
      ? "REST COMPLETE"
      : restPaused
        ? restIsSample ? "SAMPLE PAUSED" : "PAUSED"
        : restIsSample ? "SAMPLE RESTING" : "RESTING";
  const accessibleLabel = !restActive
    ? "Rest timer idle: start manually or save a set"
    : expired
      ? "Rest complete"
      : `${restIsSample ? "Sample " : ""}rest timer: ${restLabel}${restPaused ? ", paused" : " remaining"}`;
  return (
    <CompactRestTimer
      accessibleLabel={accessibleLabel}
      status={status}
      label={restActive ? restLabel : "Start manually or save set"}
      active={restActive}
      expired={expired}
      paused={restPaused}
      onSeconds={onRestSeconds}
      onPaused={onRestPaused}
      onStart={onRestStart}
      onDismiss={onRestDismiss}
    />
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

function ReviewOnlyActiveNotice({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="next-exercise-ready" role="note">
      <strong>STATIC ACTIVE-WORKOUT REVIEW STATE</strong> · No user workout is in progress; any displayed set or timer state is sample-only and cannot create a workout record.
    </div>
  );
}

function FutureProgrammeNotice({ notice }: { notice: string | null }) {
  if (!notice) return null;
  return (
    <div className="session-scope-notice" role="status">
      <strong>Future programme version recorded</strong>
      <span>{notice}</span>
    </div>
  );
}

function RecordingStateNotice({ recordedSetCount }: { recordedSetCount: number }) {
  if (recordedSetCount > 0) return null;
  return (
    <div className="next-exercise-ready" role="status">
      No sets recorded yet. Displayed set values are editable starting drafts, not completed observations.
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
  const cardRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (visible) cardRef.current?.focus({ preventScroll: false });
  }, [visible]);

  if (!visible) return null;
  return (
    <div ref={cardRef} className="next-focus-card" role="region" tabIndex={-1} aria-label={`Next exercise focus: ${exerciseName}`}>
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
  onNavigationGuard,
}: {
  exerciseName: string;
  note: string;
  onSave: (note: string) => void;
  onNavigationGuard: (guard: NavigationGuard | null) => void;
}) {
  const keyboard = useKeyboard();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState(false);
  const savedStatusRef = useRef<HTMLElement | null>(null);
  const normalizedDraft = draft.trim();
  const dirty = normalizedDraft !== note;

  useLayoutEffect(() => {
    if (saved) savedStatusRef.current?.focus({ preventScroll: false });
  }, [saved]);

  useLayoutEffect(() => {
    onNavigationGuard(dirty ? {
      dirty: true,
      canSave: true,
      title: "Save exercise note before leaving?",
      description: `Your unsaved private note for ${exerciseName} would otherwise be discarded.`,
      savedConfirmation: `Exercise note for ${exerciseName} saved before leaving`,
      discardedConfirmation: `Unsaved exercise note for ${exerciseName} discarded`,
      save: () => {
        onSave(normalizedDraft);
        setDraft(normalizedDraft);
        setSaved(true);
        keyboard.hide();
        return true;
      },
      discard: () => {
        setDraft(note);
        setSaved(false);
        keyboard.hide();
      },
    } : null);
    return () => onNavigationGuard(null);
  }, [dirty, exerciseName, keyboard, normalizedDraft, note, onNavigationGuard, onSave]);

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
              onSave(normalizedDraft);
              setDraft(normalizedDraft);
              setSaved(true);
              keyboard.hide();
            }}
            disabled={!dirty}
          >Save exercise note in prototype</button>
          {saved && <small ref={savedStatusRef} tabIndex={-1} role="status">Exercise note saved in prototype state.</small>}
        </div>
      )}
    </div>
  );
}

function ActiveWorkoutDock({
  direction,
  setNumber,
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
  setNumber: WorkingSetNumber;
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
            <strong>SET {setNumber} OF 4</strong>
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
          <button className="pace-save-set" onClick={onQuickSave} disabled={savedSet}>{savedSet ? `Set ${setNumber} saved` : `Save set ${setNumber}`} <ArrowRightIcon aria-hidden="true" /></button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`active-set-dock active-set-dock-${direction.id}`} aria-label={`${direction.name} current set action`}>
      <PrimaryButton direction={direction} disabled={savedSet} onClick={onQuickSave}>
        {direction.id === "field"
          ? savedSet ? `SET ${setNumber} SAVED` : `COMPLETE SET ${setNumber}`
          : savedSet ? `SET ${setNumber} LOGGED` : `${direction.primaryAction} ${setNumber}`} <CheckIcon aria-hidden="true" />
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
  reviewOnly,
  restSeconds,
  restPaused,
  restActive,
  restIsSample,
  onRestSeconds,
  onRestPaused,
  onRestStart,
  onRestDismiss,
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
  reviewOnly: boolean;
  restSeconds: number;
  restPaused: boolean;
  restActive: boolean;
  restIsSample: boolean;
  onRestSeconds: Dispatch<SetStateAction<number>>;
  onRestPaused: Dispatch<SetStateAction<boolean>>;
  onRestStart: () => void;
  onRestDismiss: () => void;
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
      title: reviewOnly ? "Update this sample set before leaving?" : "Save this set before leaving?",
      description: entryValid
        ? reviewOnly
          ? `Sample set ${setNumber} has valid review-state changes. No workout record will be created.`
          : `Set ${setNumber} has valid changes that have not been recorded yet.`
        : `Set ${setNumber} contains an invalid value. Correct it to save, discard the draft, or keep editing.`,
      savedConfirmation: reviewOnly
        ? `Sample set ${setNumber} fixture updated before leaving · no workout record created.`
        : `Set ${setNumber} saved before leaving.`,
      discardedConfirmation: reviewOnly ? `Sample set ${setNumber} fixture draft discarded.` : `Set ${setNumber} draft discarded.`,
      save: () => {
        if (!entryValid) return false;
        onSave(entryWeight, entryReps, entryRir);
        return true;
      },
      discard: () => undefined,
    });
    return () => onNavigationGuard(null);
  }, [entryDirty, entryReps, entryRir, entryValid, entryWeight, onNavigationGuard, onSave, reviewOnly, setNumber]);

  return (
    <section className="screen-section set-entry-screen">
      <p className="section-kicker">{exerciseName.toUpperCase()} · SET {setNumber} OF 4</p>
      <h1>{previouslySaved ? `Edit completed set ${setNumber}` : "Record the set"}</h1>
      <p className="section-lead">
        {previouslySaved
          ? `Recorded prototype observation: ${initialWeight} kg × ${initialReps} · RIR ${initialRir ?? "not recorded"}`
          : `Starting prototype value: ${initialWeight} kg × ${initialReps} · RIR ${initialRir ?? "not recorded"}`}
      </p>
      {reviewOnly && (
        <div className="next-exercise-ready" role="note">
          <strong>STATIC SET-ENTRY REVIEW STATE</strong> · Updating this sample changes review state only; no workout record or History entry is created.
        </div>
      )}
      <SessionRestTimer restSeconds={restSeconds} restPaused={restPaused} restActive={restActive} restIsSample={restIsSample} onRestSeconds={onRestSeconds} onRestPaused={onRestPaused} onRestStart={onRestStart} onRestDismiss={onRestDismiss} />

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
        {reviewOnly ? "Update sample set fixture" : previouslySaved ? "Update set" : direction.primaryAction} <CheckIcon aria-hidden="true" />
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
      <small id={`${inputId}-hint`} className={invalid ? "is-error" : ""} aria-live="polite">
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
  currentPrescription,
  effectiveWorkout,
  programmeExerciseName,
  reviewOnly,
  restSeconds,
  restPaused,
  restActive,
  restIsSample,
  onRestSeconds,
  onRestPaused,
  onRestStart,
  onRestDismiss,
  onChoose,
}: {
  direction: Direction;
  exerciseName: string;
  candidateExerciseName: string;
  exerciseMeta: string;
  currentPrescription: string;
  effectiveWorkout: ProgrammeWorkoutId;
  programmeExerciseName: string;
  reviewOnly: boolean;
  restSeconds: number;
  restPaused: boolean;
  restActive: boolean;
  restIsSample: boolean;
  onRestSeconds: Dispatch<SetStateAction<number>>;
  onRestPaused: Dispatch<SetStateAction<boolean>>;
  onRestStart: () => void;
  onRestDismiss: () => void;
  onChoose: (name: string, scope: "today" | "future", reason: string) => void;
}) {
  const [reason, setReason] = useState("No reason provided");
  const [scope, setScope] = useState<"today" | "future">("today");
  const [query, setQuery] = useState("");
  const [pendingFutureName, setPendingFutureName] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLElement | null>(null);
  const futureChoiceTriggerRef = useRef<HTMLButtonElement | null>(null);
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
  const pendingFutureAlternative = alternatives.find((alternative) => alternative.name === pendingFutureName) ?? null;
  const requestChoice = (name: string, trigger?: HTMLButtonElement | null) => {
    if (scope === "future") {
      futureChoiceTriggerRef.current = trigger ?? null;
      setPendingFutureName(name);
    }
    else onChoose(name, "today", reason);
  };

  useLayoutEffect(() => {
    if (pendingFutureAlternative) confirmationRef.current?.focus({ preventScroll: false });
  }, [pendingFutureName]);
  return (
    <section className="screen-section substitution-screen">
      <p className="section-kicker">EXERCISE SUBSTITUTION</p>
      <h1>What needs to change?</h1>
      <p className="section-lead">The original exercise stays in the programme unless you choose otherwise.</p>
      <div className="next-exercise-ready" role="note">
        <strong>STATIC PROTOTYPE MATCH FIXTURE</strong> · These alternatives and their order are not computed or safety-approved recommendations.
      </div>
      {reviewOnly && (
        <div className="next-exercise-ready" role="note">
          <strong>STATIC SUBSTITUTION SESSION REVIEW</strong> · No workout is in progress. Active review-fixture changes cannot create a workout record; future changes update the published prototype programme.
        </div>
      )}
      <SessionRestTimer restSeconds={restSeconds} restPaused={restPaused} restActive={restActive} restIsSample={restIsSample} onRestSeconds={onRestSeconds} onRestPaused={onRestPaused} onRestStart={onRestStart} onRestDismiss={onRestDismiss} />

      <div className="reason-chips" aria-label="Replacement reason">
        {["No reason provided", "Equipment busy", "Not comfortable", "Prefer another"].map((item) => (
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
            <button onClick={(event) => requestChoice(alternative.name, event.currentTarget)} aria-label={`Choose ${alternative.name}`}>
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
          <button type="button" className={scope === "today" ? "is-selected" : ""} aria-pressed={scope === "today"} onClick={() => { setScope("today"); setPendingFutureName(null); }}>{reviewOnly ? "Active review fixture only" : "Today only"}</button>
          <button type="button" className={scope === "future" ? "is-selected" : ""} aria-pressed={scope === "future"} onClick={() => setScope("future")}>Future programme</button>
        </div>
      </fieldset>
      {pendingFutureAlternative && (
        <section ref={confirmationRef} tabIndex={-1} className="explanation-panel" aria-label="Confirm future programme substitution">
          <strong>Confirm the version boundary</strong>
          <p>{reviewOnly ? "Current review fixture" : "Current active workout"}: {exerciseName} remains unchanged.</p>
          <p>{reviewOnly ? "New published prototype programme version" : "New programme version"}: replace {programmeExerciseName} with {pendingFutureAlternative.name} at the next not-started {effectiveWorkout} occurrence.</p>
          <p>Reason retained: {reason}. {pendingFutureAlternative.mismatch}</p>
          <p>Preserved: set and rep target {currentPrescription} for this reps-based fixture. Cleared: no planned load is migrated. Changed: equipment metadata follows the selected alternative.</p>
          <div className="partial-finish-actions">
            <button
              type="button"
              className="primary-button"
              data-direction={direction.id}
              onClick={() => onChoose(pendingFutureAlternative.name, "future", reason)}
            >
              Confirm future programme change
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                setPendingFutureName(null);
                window.setTimeout(() => futureChoiceTriggerRef.current?.focus({ preventScroll: true }), 0);
              }}
            >
              Cancel future change
            </button>
          </div>
        </section>
      )}
      <PrimaryButton
        direction={direction}
        disabled={visibleAlternatives.length === 0}
        onClick={(event) => {
          const topMatch = visibleAlternatives[0];
          if (topMatch) requestChoice(topMatch.name, event.currentTarget);
        }}
      >
        {visibleAlternatives.length === 0
          ? "No listed match to use"
          : `Use top match · ${scope === "today" ? reviewOnly ? "active review fixture only" : "today only" : "new programme version"}`}
      </PrimaryButton>
    </section>
  );
}

function CompletionScreen({
  direction,
  snapshot,
  source,
  note,
  onSaveNote,
  onNavigationGuard,
  onDone,
  onHistory,
}: {
  direction: Direction;
  snapshot: CompletionSnapshot | null;
  source: "fixture" | "active-finish";
  note: string;
  onSaveNote: (note: string) => void;
  onNavigationGuard: (guard: NavigationGuard | null) => void;
  onDone: () => void;
  onHistory: () => void;
}) {
  const keyboard = useKeyboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note);
  const [noteSaved, setNoteSaved] = useState(false);
  const savedStatusRef = useRef<HTMLElement | null>(null);
  const isFixture = source === "fixture";
  const workout = isFixture ? "Upper A" : snapshot?.workout ?? "Upper A";
  const nextWorkout = isFixture ? "Lower A" : snapshot?.nextWorkout ?? workout;
  const countsAsExpected = isFixture ? true : snapshot?.countsAsExpected ?? true;
  const plannedExercises = isFixture ? exerciseRows : snapshot?.plannedExercises ?? [];
  const recordedExerciseName = isFixture ? "Barbell bench press" : snapshot?.recordedExerciseName ?? plannedExercises[0]?.name ?? "No exercise recorded";
  const recordedWeight = isFixture ? 100 : snapshot?.recordedWeight ?? 0;
  const recordedReps = isFixture ? 9 : snapshot?.recordedReps ?? 0;
  const recordedSets = isFixture
    ? ([
        { number: 1, ...workingSetSeedByWorkout["Upper A"][1], saved: true },
        { number: 2, ...workingSetSeedByWorkout["Upper A"][2], saved: true },
        { number: 3, ...workingSetSeedByWorkout["Upper A"][3], saved: true },
        { number: 4, weight: 100, reps: 9, rir: 1, saved: true },
      ] satisfies WorkingSet[])
    : snapshot?.recordedSets ?? [];
  const isBenchPress = recordedExerciseName === "Barbell bench press";
  const latestSet = isFixture && isBenchPress ? "100 kg × 9" : `${recordedWeight} kg × ${recordedReps}`;
  const topRangeSets = recordedSets.filter((set) => set.saved && set.reps >= 10).length;
  const repBestGain = isFixture && isBenchPress ? 1 : 0;
  const isRepBest = repBestGain > 0;
  const repBestCopy = repBestGain === 1
    ? "One more rep than your previous equivalent session."
    : `${repBestGain} more reps than your previous equivalent session.`;
  const plannedSetCount = isFixture
    ? plannedExercises.reduce((total, exercise) => total + (parseSupportedPrescription(exercise.prescription)?.sets ?? 0), 0)
    : snapshot?.plannedSetCount ?? 0;
  const completedSetCount = isFixture ? plannedSetCount : snapshot?.completedSetCount ?? 0;
  const remainingSetCount = Math.max(0, plannedSetCount - completedSetCount);
  const normalizedNoteDraft = noteDraft.trim();
  const noteDirty = normalizedNoteDraft !== note;

  useLayoutEffect(() => {
    if (noteSaved) savedStatusRef.current?.focus({ preventScroll: false });
  }, [noteSaved]);

  useLayoutEffect(() => {
    onNavigationGuard(noteDirty ? {
      dirty: true,
      canSave: true,
      title: isFixture ? "Update sample completion note before leaving?" : "Save workout note before leaving?",
      description: isFixture
        ? "This unsaved sample note changes the completion fixture only; it does not create a workout or History record."
        : "Your unsaved private completion note would otherwise be discarded.",
      savedConfirmation: isFixture
        ? "Sample completion-note fixture updated · no workout or History record created"
        : "Private workout note saved before leaving",
      discardedConfirmation: isFixture ? "Unsaved sample completion note discarded" : "Unsaved private workout note discarded",
      save: () => {
        onSaveNote(normalizedNoteDraft);
        setNoteDraft(normalizedNoteDraft);
        setNoteSaved(true);
        keyboard.hide();
        return true;
      },
      discard: () => {
        setNoteDraft(note);
        setNoteSaved(false);
        keyboard.hide();
      },
    } : null);
    return () => onNavigationGuard(null);
  }, [isFixture, keyboard, normalizedNoteDraft, note, noteDirty, onNavigationGuard, onSaveNote]);

  return (
    <section className="screen-section completion-screen">
      <SessionScopeNotice countsAsExpected={countsAsExpected} workout={workout} />
      <div className="saved-seal"><CheckCircledIcon aria-hidden="true" /><span>{isFixture ? "Sample completion fixture" : "Recorded in prototype state"}</span></div>
      <p className="section-kicker">{workout.toUpperCase()} · {isFixture ? "COMPLETE SAMPLE" : remainingSetCount > 0 ? "FINISHED PARTIAL" : "COMPLETE"}</p>
      <h1>{isFixture ? "Sample completion state." : "Workout recorded."}</h1>
      <p className="section-lead">
        {isFixture ? "Sample duration · 52 minutes" : "Duration not modelled in this prototype"} · {completedSetCount} working sets · {isFixture ? "all planned work complete" : `${remainingSetCount} planned working sets not attempted`}
      </p>

      {completedSetCount > 0 ? (
        <div className="completion-highlight">
          <small>{isRepBest ? "NEW REP BEST" : "LAST SAVED SET IN WORKOUT ORDER"}</small>
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
        <div><dt>Not attempted</dt><dd>{remainingSetCount} sets</dd></div>
        {!isFixture && <div><dt>Remaining-work choice</dt><dd>{snapshot?.carryForwardRequested ? "Prototype review reminder only · no sets copied or scheduled" : "Left as not attempted"}</dd></div>}
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
                ? `${topRangeSets} of ${recordedSets.length} recorded ${recordedExerciseName} sets reached the top of the target range. Planned work remains not attempted, so the configured all-sets rule cannot qualify and no target changes are applied automatically.`
                : `Planned ${recordedExerciseName} work and later exercises remain not attempted. The configured all-sets rule cannot qualify from this session, so the current target remains unchanged.`
            : `This ${workout} fixture records observed work only. No exercise-specific progression or record rule is approved here, so no target or best-performance claim is made.`}
        </p>
      </div>

      <PrimaryButton direction={direction} onClick={onDone}>
        Return to Today <ArrowRightIcon aria-hidden="true" />
      </PrimaryButton>
      <button className="secondary-action" onClick={onHistory}>{isFixture ? "View sample workout in History" : "View recorded workout in History"}</button>
      <button className="secondary-action" onClick={() => setNoteOpen((open) => !open)}>
        {noteOpen ? "Close private note" : "Add a private workout note"}
      </button>
      {noteOpen && (
        <div className="completion-note">
          <label htmlFor="completion-note">Private workout note</label>
          <KeyboardInput id="completion-note" value={noteDraft} onChange={(event) => { setNoteDraft(event.target.value); setNoteSaved(false); }} />
          <button
            onClick={() => {
              onSaveNote(normalizedNoteDraft);
              setNoteDraft(normalizedNoteDraft);
              setNoteSaved(true);
              keyboard.hide();
            }}
            disabled={!noteDirty}
          >{isFixture ? "Update sample completion-note fixture" : "Save note in prototype"}</button>
          {noteSaved && <small ref={savedStatusRef} tabIndex={-1} role="status">{isFixture ? "Sample completion-note fixture updated · no workout record or History entry created." : "Prototype note saved with this workout record."}</small>}
        </div>
      )}
    </section>
  );
}

function HistoryScreen({
  direction,
  sessions,
  onExercise,
}: {
  direction: Direction;
  sessions: HistorySession[];
  onExercise: () => void;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const sessionTriggerIdRef = useRef<string | null>(null);
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;
  const visibleSessions = sessions.filter((session) => (
    `${session.date} ${session.workout} ${session.duration} ${session.setCount} ${session.status} ${session.note ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  ));
  const augustSessionCount = sessions.filter((session) => session.date.includes("AUG") || session.date.startsWith("TODAY")).length;
  const julySessionCount = sessions.filter((session) => session.date.includes("JUL")).length;
  const juneSessionCount = sessions.filter((session) => session.date.includes("JUN")).length;

  useLayoutEffect(() => {
    if (selectedSessionId) detailRef.current?.focus({ preventScroll: false });
  }, [selectedSessionId]);

  if (selectedSession) {
    const includesBenchPress = selectedSession.exercises.some((exercise) => exercise.name === "Barbell bench press");
    return (
      <section className="screen-section history-screen history-session-detail">
        <button
          className="history-detail-back"
          onClick={() => {
            const sourceSessionId = sessionTriggerIdRef.current;
            setSelectedSessionId(null);
            window.setTimeout(() => {
              if (!sourceSessionId) return;
              document.querySelector<HTMLButtonElement>(`[data-history-session-id="${sourceSessionId}"]`)
                ?.focus({ preventScroll: true });
            }, 0);
          }}
        >
          <ArrowLeftIcon aria-hidden="true" /> Back to History
        </button>
        <div ref={detailRef} tabIndex={-1} role="region" aria-label={`${selectedSession.workout} session details from ${selectedSession.date}`}>
          <p className="section-kicker">{selectedSession.date} · {selectedSession.status}</p>
          <h1>{selectedSession.workout}</h1>
          <p className="section-lead">
            {selectedSession.duration} · {selectedSession.setCount} {selectedSession.sample === false ? "recorded" : "sample"} working {selectedSession.setCount === 1 ? "set" : "sets"} in this prototype
          </p>

          <ol className="session-exercise-list" aria-label={`${selectedSession.workout} ${selectedSession.sample === false ? "recorded" : "sample"} exercises`}>
            {selectedSession.exercises.map((exercise, index) => (
              <li key={exercise.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{exercise.name}</strong><small>{exercise.result}</small></div>
              </li>
            ))}
          </ol>

          {selectedSession.note && (
            <div className="history-question" role="region" aria-label="Private workout note">
              <small>PRIVATE WORKOUT NOTE</small>
              <strong>{selectedSession.note}</strong>
            </div>
          )}
          {selectedSession.exerciseNotes && selectedSession.exerciseNotes.length > 0 && (
            <div className="history-question" role="region" aria-label="Saved exercise notes">
              <small>SAVED EXERCISE NOTES</small>
              {selectedSession.exerciseNotes.map((exerciseNote) => (
                <span key={exerciseNote.exerciseName}><strong>{exerciseNote.exerciseName}</strong> · {exerciseNote.note}</span>
              ))}
            </div>
          )}

          <div className="history-question">
            <small>SESSION RECORD</small>
            <strong>{selectedSession.sample === false
              ? `${selectedSession.status} workout record`
              : selectedSession.status === "Short mode" ? "Sample finished in short mode" : "Sample completed record"}</strong>
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
        <button
          aria-label="Search history"
          aria-pressed={searchOpen}
          onClick={() => {
            if (searchOpen) setQuery("");
            setSearchOpen((open) => !open);
          }}
        ><MagnifyingGlassIcon /></button>
      </div>

      {searchOpen && (
        <label className="history-search" htmlFor="history-search">
          Search workout history
          <KeyboardInput id="history-search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      )}

      <div className="month-strip">
        <div><small>AUGUST</small><strong>{augustSessionCount} shown</strong></div>
        <div><small>JULY</small><strong>{julySessionCount} shown</strong></div>
        <div><small>JUNE</small><strong>{juneSessionCount} shown</strong></div>
      </div>
      <p className="history-sample-disclaimer">Static dated rows are prototype samples; month counts include only the rows shown in this prototype.</p>

      {view === "calendar" && (
        <div className="history-calendar-summary" role="status">
          <strong>August 2026 · session days</strong>
          <p>3 Aug — Lower A · 6 Aug — Upper A{sessions.some((session) => session.sample === false) ? " · Today — newly recorded session" : ""}. Calendar selection uses the same stored sessions as the list.</p>
        </div>
      )}

      <div className="history-list" aria-label={`${view} workout results`}>
        {visibleSessions.map((session) => (
          <button
            key={session.id}
            data-history-session-id={session.id}
            onClick={() => {
              sessionTriggerIdRef.current = session.id;
              setSelectedSessionId(session.id);
            }}
            aria-label={`Open ${session.workout} from ${session.date}: ${session.sample === false ? "recorded" : "sample"} ${session.status.toLowerCase()}, ${session.setCount} ${session.setCount === 1 ? "set" : "sets"}`}
          >
            <span>{session.date}</span>
            <div><strong>{session.workout}</strong><small>{session.duration} · {session.setCount} {session.sample === false ? "recorded" : "sample"} {session.setCount === 1 ? "set" : "sets"}</small></div>
            <b>{session.sample === false ? session.status : `Sample · ${session.status}`}</b>
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
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
  const sourceDetailRef = useRef<HTMLElement | null>(null);
  const sourceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const observations = [
    { date: "22 Jun", fullDate: "22 June 2026", result: "90 kg × 8 reps", height: 78 },
    { date: "29 Jun", fullDate: "29 June 2026", result: "92.5 kg × 8 reps", height: 80 },
    { date: "8 Jul", fullDate: "8 July 2026", result: "92.5 kg × 9 reps", height: 79 },
    { date: "14 Jul", fullDate: "14 July 2026", result: "96 kg × 8 reps", height: 84 },
    { date: "28 Jul", fullDate: "28 July 2026", result: "97.5 kg × 9 reps", height: 86 },
    { date: "6 Aug", fullDate: "6 August 2026", result: "100 kg × 9 reps", height: 90 },
  ];
  const selectedObservation = selectedSourceIndex === null ? null : observations[selectedSourceIndex];

  useLayoutEffect(() => {
    if (selectedSourceIndex !== null) sourceDetailRef.current?.focus({ preventScroll: false });
  }, [selectedSourceIndex]);

  return (
    <section className="screen-section progress-screen">
      <p className="section-kicker">EXERCISE PROGRESS · PROTOTYPE SAMPLE</p>
      <h1>Barbell bench press</h1>
      <p className="section-lead">Sample comparable working-set history across six fixture sessions.</p>

      <div className="progress-answer">
        <small>SAMPLE ANSWER</small>
        <h2>This fixture adds 10 kg while staying inside 6–10 reps.</h2>
        <p>Comparable sets rose from 90 kg × 8 to 100 kg × 9 between 22 June and 6 August.</p>
      </div>

      <figure className="trend-figure" aria-label="Comparable bench press performance rose across six sessions">
        <figcaption><span>BEST COMPARABLE SET</span><strong>100 kg × 9</strong></figcaption>
        <div className="trend-bars">
          {observations.map((observation, index) => (
            <div key={observation.date}><i style={{ height: `${observation.height}%` }} /><small>{index + 1}</small></div>
          ))}
        </div>
        <div className="axis-labels"><span>22 JUN</span><span>6 AUG</span></div>
      </figure>

      <dl className="progress-facts">
        <div><dt>Sample sessions plotted</dt><dd>6</dd></div>
        <div><dt>Rep-range best</dt><dd>100 × 9</dd></div>
        <div><dt>Comparison basis</dt><dd>Same variation</dd></div>
      </dl>

      <div className="calculation-note">
        <strong>Why these sets compare</strong>
        <p>They use the same exercise variation, working-set role, load mode, laterality and rule version. Estimated 1RM stays unavailable until its formula and qualifying range are approved.</p>
      </div>
      {showAll && (
        <div className="progress-session-list" id="progress-observations">
          <strong>All six plotted observations</strong>
          <ol aria-label="Six plotted comparable-session observations">
            {observations.map((observation, index) => (
              <li key={observation.date}>
                <button
                  type="button"
                  aria-label={`Open source workout from ${observation.fullDate}: ${observation.result}`}
                  onClick={(event) => {
                    sourceTriggerRef.current = event.currentTarget;
                    setSelectedSourceIndex(index);
                  }}
                >
                  <span>{observation.date}</span>
                  <strong>{observation.result}</strong>
                  <ArrowRightIcon aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          {selectedObservation && (
            <section
              ref={sourceDetailRef}
              className="progress-source-detail"
              tabIndex={-1}
              aria-label={`Source workout from ${selectedObservation.fullDate}`}
            >
              <p className="section-kicker">SOURCE WORKOUT · PROTOTYPE FIXTURE</p>
              <h2>Upper A · {selectedObservation.fullDate}</h2>
              <p><strong>Barbell bench press</strong> · best comparable working set {selectedObservation.result}</p>
              <p>This review detail links the plotted observation to its sample source workout. Unshown workout data is not inferred.</p>
              <button
                className="secondary-action"
                type="button"
                onClick={() => {
                  setSelectedSourceIndex(null);
                  window.setTimeout(() => sourceTriggerRef.current?.focus({ preventScroll: true }), 0);
                }}
              >
                Back to plotted observations
              </button>
            </section>
          )}
        </div>
      )}
      <button
        className="primary-button"
        data-direction={direction.id}
        aria-expanded={showAll}
        aria-controls="progress-observations"
        onClick={() => setShowAll((shown) => !shown)}
      >
        {showAll ? "Hide session sample" : "View session sample"}
      </button>
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
  const programmeNameInputRef = useRef<HTMLInputElement | null>(null);
  const prescriptionInputRef = useRef<HTMLInputElement | null>(null);
  const exerciseEditorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editorExercises = editorExercisesByWorkout[selectedWorkout];
  const parsedNavigationPrescription = editingExercise ? parseSupportedPrescription(prescriptionDraft) : null;
  const programmeDirty = programmeName !== initialProgrammeName
    || draftSchedule !== initialSchedule
    || !programmeExercisesMatch(editorExercisesByWorkout, initialExercises)
    || Boolean(editingExercise && prescriptionDraft !== originalPrescription);
  const programmeCanSave = Boolean(programmeName.trim())
    && (!editingExercise || Boolean(parsedNavigationPrescription));

  const focusProgrammeNameInput = () => {
    window.setTimeout(() => programmeNameInputRef.current?.focus({ preventScroll: false }), 0);
  };

  const focusPrescriptionInput = () => {
    window.setTimeout(() => prescriptionInputRef.current?.focus({ preventScroll: false }), 0);
  };

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

  const openExerciseEditor = (name: string, prescription: string, trigger: HTMLButtonElement) => {
    if (editingExercise === name) return;
    if (editingExercise && prescriptionDraft !== originalPrescription) {
      setPrescriptionError("Save or cancel the current exercise edit before opening another exercise so the draft is not lost.");
      setEditorStatus("");
      focusPrescriptionInput();
      return;
    }
    exerciseEditorTriggerRef.current = trigger;
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
      focusPrescriptionInput();
      return;
    }

    const supportedPrescription = parseSupportedPrescription(nextPrescription);
    if (!supportedPrescription) {
      setPrescriptionError("Use 1–4 sets × 1–100 reps, for example 4 × 6–10; the exercise edit remains open.");
      setEditorStatus("");
      focusPrescriptionInput();
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
    window.setTimeout(() => exerciseEditorTriggerRef.current?.focus({ preventScroll: true }), 0);
  };

  const cancelExerciseEdit = () => {
    setEditingExercise(null);
    setOriginalPrescription("");
    setPrescriptionError("");
    window.setTimeout(() => exerciseEditorTriggerRef.current?.focus({ preventScroll: true }), 0);
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
    if (!programmeDirty) {
      setEditorStatus("No unpublished changes to publish.");
      return;
    }
    if (!programmeName.trim()) {
      setProgrammeNameError("Programme name is required before publishing a new version.");
      setEditorStatus("");
      focusProgrammeNameInput();
      return;
    }
    if (editingExercise) {
      if (!prescriptionDraft.trim()) {
        setPrescriptionError("Target sets and reps are required; resolve this edit before publishing.");
        setEditorStatus("");
        focusPrescriptionInput();
        return;
      }
      if (!parseSupportedPrescription(prescriptionDraft)) {
        setPrescriptionError("Use 1–4 sets × 1–100 reps, for example 4 × 6–10; resolve this edit before publishing.");
        setEditorStatus("");
        focusPrescriptionInput();
        return;
      }
      setPrescriptionError("Save or cancel this exercise edit before publishing so the valid draft is not lost.");
      setEditorStatus("");
      focusPrescriptionInput();
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
          ref={programmeNameInputRef}
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
        <div className="segmented-control compact" role="radiogroup" aria-label="Advance workouts by">
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
          >Fixed weekdays concept · Specific days are not modelled in this prototype</button>
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
                focusPrescriptionInput();
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
            <button aria-label={`Edit ${exercise.name}`} onClick={(event) => openExerciseEditor(exercise.name, exercise.prescription, event.currentTarget)}><Pencil2Icon /></button>
          </li>
        ))}
      </ol>

      {editingExercise && (
        <div className="editor-detail" role="region" aria-label={`Edit ${editingExercise}`}>
          <strong>Editing {editingExercise}</strong>
          <label htmlFor="exercise-prescription">
            Target sets and reps
            <KeyboardInput
              ref={prescriptionInputRef}
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
            <button onClick={cancelExerciseEdit}>Cancel</button>
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
      <PrimaryButton direction={direction} disabled={!programmeDirty} onClick={publishProgramme}>
        {programmeDirty ? "Publish new version" : "No changes to publish"}
      </PrimaryButton>
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
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  return <button className="primary-button" data-direction={direction.id} onClick={onClick} disabled={disabled}>{children}</button>;
}

// Disposable logging-first study. The earlier direction study remains available
// at ?review=legacy; no prototype state is a durable workout database.
type LFMode = "weighted" | "bodyweight" | "timed";
type LFUnit = "kg" | "lb";
type LFDefinition = { id: string; name: string; mode: LFMode; basis?: string; custom?: boolean };
type LFSet = { id: string; grams: number | null; reps: number | null; seconds: number | null; enteredUnit: LFUnit };
type LFExercise = { id: string; definition: LFDefinition; sets: LFSet[]; targets: LFSet[] };
type LFRevision = { id: string; at: number; description: string };
type LFWorkout = { id: string; name: string; startedAt: number; finishedAt?: number; notes: string; exercises: LFExercise[]; revisions: LFRevision[] };
type LFRoutine = { id: string; name: string; exercises: LFExercise[] };
type LFView = "workouts" | "active" | "history" | "detail" | "progress";
type LFSheet = "picker" | "set" | "finish" | "routine" | "rename" | "delete-workout" | "discard-workout" | "delete-set" | "remove-exercise" | "active-conflict" | "units" | "audit" | null;
type LFSetEditor = { workoutId: string; exerciseId: string; setId?: string; weight: string; reps: string; seconds: string; original: string };

const lfCatalogue: LFDefinition[] = [
  { id: "bench-barbell-total", name: "Barbell bench press", mode: "weighted", basis: "Total barbell weight" },
  { id: "squat-barbell-total", name: "Barbell squat", mode: "weighted", basis: "Total barbell weight" },
  { id: "deadlift-barbell-total", name: "Barbell deadlift", mode: "weighted", basis: "Total barbell weight" },
  { id: "lat-pulldown-machine", name: "Lat pulldown", mode: "weighted", basis: "Machine weight" },
  { id: "row-cable-seated", name: "Seated cable row", mode: "weighted", basis: "Machine weight" },
  { id: "press-dumbbell-per-hand", name: "Dumbbell shoulder press", mode: "weighted", basis: "Weight per dumbbell" },
  { id: "curl-dumbbell-per-hand", name: "Dumbbell curl", mode: "weighted", basis: "Weight per dumbbell" },
  { id: "pushup-unweighted", name: "Push-up", mode: "bodyweight" },
  { id: "pullup-unweighted", name: "Pull-up", mode: "bodyweight" },
  { id: "plank-unweighted", name: "Plank", mode: "timed" },
  { id: "walk-duration", name: "Walking", mode: "timed" },
];
const lfId = () => crypto.randomUUID();
const lfSetCount = (workout: LFWorkout) => workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0);
const lfUnitMass = (unit: LFUnit) => unit === "kg" ? 1000 : 453.59237;
const lfWeight = (grams: number, unit: LFUnit) => Number((grams / lfUnitMass(unit)).toFixed(2)).toString();
const lfModeLabel = (mode: LFMode) => mode === "weighted" ? "Weight + reps" : mode === "bodyweight" ? "Bodyweight · reps" : "Time · seconds";
const lfDate = (at: number) => new Date(at).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
const lfTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const lfResult = (set: LFSet, mode: LFMode, unit: LFUnit) => mode === "weighted" ? `${lfWeight(set.grams ?? 0, unit)} ${unit} × ${set.reps} reps` : mode === "bodyweight" ? `${set.reps} reps` : `${set.seconds} sec`;
const lfCloneExercises = (exercises: LFExercise[]): LFExercise[] => exercises.map((exercise) => ({ id: lfId(), definition: { ...exercise.definition }, sets: [], targets: (exercise.sets.length ? exercise.sets : exercise.targets).map((set) => ({ ...set, id: lfId() })) }));
const lfSetDraft = (editor: Pick<LFSetEditor, "weight" | "reps" | "seconds">) => JSON.stringify([editor.weight, editor.reps, editor.seconds]);

export default function Prototype() {
  return new URLSearchParams(window.location.search).get("review") === "legacy" ? <LegacyPrototype /> : <LoggingFirstPrototype />;
}

function LoggingFirstPrototype() {
  const keyboard = useKeyboard();
  const { bottomInset, isKeyboardVisible } = useKeyboardInsets();
  const [view, setView] = useState<LFView>("workouts");
  const [active, setActive] = useState<LFWorkout | null>(null);
  const [history, setHistory] = useState<LFWorkout[]>([]);
  const [routines, setRoutines] = useState<LFRoutine[]>([]);
  const [customExercises, setCustomExercises] = useState<LFDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unit, setUnit] = useState<LFUnit>("kg");
  const [sheet, setSheet] = useState<LFSheet>(null);
  const [editor, setEditor] = useState<LFSetEditor | null>(null);
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [customMode, setCustomMode] = useState<LFMode>("weighted");
  const [nameDraft, setNameDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [formOriginal, setFormOriginal] = useState("");
  const [guardDraft, setGuardDraft] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletedWorkout, setDeletedWorkout] = useState<LFWorkout | null>(null);
  const [removeExerciseId, setRemoveExerciseId] = useState<string | null>(null);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [progressExerciseId, setProgressExerciseId] = useState("");
  const focusHeading = useRef<HTMLHeadingElement | null>(null);
  const selected = history.find((workout) => workout.id === selectedId) ?? null;
  const current = view === "active" ? active : selected;
  const editorWorkout = editor ? active?.id === editor.workoutId ? active : history.find((workout) => workout.id === editor.workoutId) : null;
  const editorExercise = editorWorkout?.exercises.find((exercise) => exercise.id === editor?.exerciseId);
  const totalSets = active ? lfSetCount(active) : 0;
  const remainingSeconds = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;
  const sheetDirty = sheet === "set" ? !!editor && lfSetDraft(editor) !== editor.original : sheet === "picker" ? !!customName.trim() : sheet === "routine" || sheet === "rename" ? JSON.stringify([nameDraft, notesDraft]) !== formOriginal : false;

  useEffect(() => {
    if (!restEndsAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [restEndsAt]);
  useEffect(() => {
    if (!active && !history.length && !routines.length) return;
    const warnReload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnReload);
    return () => window.removeEventListener("beforeunload", warnReload);
  }, [active, history.length, routines.length]);
  useEffect(() => { focusHeading.current?.focus({ preventScroll: true }); }, [view]);

  function navigate(next: LFView) { keyboard.hide(); setView(next); setNotice(""); }
  function openSheet(next: LFSheet) { keyboard.hide(); setError(""); setGuardDraft(false); setSheet(next); }
  function closeSheet(force = false) {
    keyboard.hide();
    if (!force && sheetDirty) { setGuardDraft(true); return; }
    setSheet(null); setGuardDraft(false); setError("");
  }
  function startWorkout(source?: { name: string; exercises: LFExercise[] }) {
    if (active) { openSheet("active-conflict"); return; }
    const workout: LFWorkout = { id: lfId(), name: source?.name ?? "Workout", startedAt: Date.now(), notes: "", exercises: source ? lfCloneExercises(source.exercises) : [], revisions: [] };
    setActive(workout); setRestEndsAt(null); navigate("active");
  }
  function openPicker() { setQuery(""); setCustomName(""); setCustomMode("weighted"); openSheet("picker"); }
  function addExercise(definition: LFDefinition) {
    if (!active) return;
    setActive({ ...active, exercises: [...active.exercises, { id: lfId(), definition, sets: [], targets: [] }] });
    setCustomName(""); closeSheet(true); setNotice(`${definition.name} added`);
  }
  function addCustomExercise() {
    if (!customName.trim()) { setError("Enter an exercise name."); return; }
    const definition: LFDefinition = { id: lfId(), name: customName.trim(), mode: customMode, basis: customMode === "weighted" ? "Total external weight" : undefined, custom: true };
    setCustomExercises((items) => [...items, definition]); addExercise(definition);
  }
  function previousExercise(definitionId: string, excludeId?: string) {
    for (const workout of history) {
      if (workout.id === excludeId) continue;
      const exercise = workout.exercises.filter((item) => item.definition.id === definitionId && item.sets.length).at(-1);
      if (exercise) return { workout, exercise };
    }
    return null;
  }
  function openSet(workout: LFWorkout, exercise: LFExercise, set?: LFSet) {
    const previous = previousExercise(exercise.definition.id, workout.id);
    const seed = set ?? exercise.targets[exercise.sets.length] ?? exercise.sets.at(-1) ?? previous?.exercise.sets.at(-1);
    const draft: LFSetEditor = { workoutId: workout.id, exerciseId: exercise.id, setId: set?.id, weight: seed?.grams != null ? lfWeight(seed.grams, unit) : "", reps: seed?.reps != null ? String(seed.reps) : "", seconds: seed?.seconds != null ? String(seed.seconds) : "", original: "" };
    draft.original = lfSetDraft(draft); setEditor(draft); openSheet("set");
  }
  function updateWorkout(workout: LFWorkout, description: string) {
    if (active?.id === workout.id) setActive(workout);
    else setHistory((items) => items.map((item) => item.id === workout.id ? { ...workout, revisions: [...workout.revisions, { id: lfId(), at: Date.now(), description }] } : item));
  }
  function saveSet() {
    if (!editor || !editorWorkout || !editorExercise) return;
    const mode = editorExercise.definition.mode;
    const normalisedWeight = editor.weight.replace(",", ".");
    if (mode === "weighted" && (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(normalisedWeight) || Number(normalisedWeight) < 0 || Number(normalisedWeight) > 2000)) { setError("Enter a weight from 0 to 2,000, with up to 2 decimal places."); return; }
    if (mode !== "timed" && (!/^\d+$/.test(editor.reps) || Number(editor.reps) < 1 || Number(editor.reps) > 1000)) { setError("Enter a whole number of reps from 1 to 1,000."); return; }
    if (mode === "timed" && (!/^\d+$/.test(editor.seconds) || Number(editor.seconds) < 1 || Number(editor.seconds) > 86400)) { setError("Enter a whole number of seconds from 1 to 86,400."); return; }
    const oldSet = editorExercise.sets.find((item) => item.id === editor.setId);
    const keepsDisplayedWeight = mode === "weighted" && !!oldSet && editor.weight === lfWeight(oldSet.grams ?? 0, unit);
    const recorded: LFSet = {
      id: editor.setId ?? lfId(),
      grams: mode === "weighted" ? (keepsDisplayedWeight ? oldSet?.grams ?? null : Math.round(Number(normalisedWeight) * lfUnitMass(unit))) : null,
      reps: mode !== "timed" ? Number(editor.reps) : null,
      seconds: mode === "timed" ? Number(editor.seconds) : null,
      enteredUnit: keepsDisplayedWeight ? oldSet?.enteredUnit ?? unit : unit,
    };
    updateWorkout({ ...editorWorkout, exercises: editorWorkout.exercises.map((exercise) => exercise.id === editor.exerciseId ? { ...exercise, sets: editor.setId ? exercise.sets.map((item) => item.id === editor.setId ? recorded : item) : [...exercise.sets, recorded] } : exercise) }, `${editorExercise.definition.name}: ${oldSet ? `${lfResult(oldSet, mode, unit)} → ` : "added "}${lfResult(recorded, mode, unit)}.`);
    closeSheet(true); setNotice(editor.setId ? "Set updated" : "Set logged");
  }
  function logQuickSet(workout: LFWorkout, exercise: LFExercise, seed: LFSet) {
    if (!active || workout.id !== active.id) return;
    const recorded = { ...seed, id: lfId() };
    setActive({ ...workout, exercises: workout.exercises.map((item) => item.id === exercise.id ? { ...item, sets: [...item.sets, recorded] } : item) });
    setNow(Date.now()); setRestEndsAt(Date.now() + 90000); setNotice("Set logged · 90 sec rest started");
  }
  function deleteSet() {
    if (!editor || !editorWorkout || !editorExercise) return;
    if (editorWorkout.finishedAt && lfSetCount(editorWorkout) === 1) { setError("This is the workout’s only set. Delete the workout from its details instead."); return; }
    const removed = editorExercise.sets.find((set) => set.id === editor.setId);
    updateWorkout({ ...editorWorkout, exercises: editorWorkout.exercises.map((exercise) => exercise.id === editor.exerciseId ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== editor.setId) } : exercise) }, `${editorExercise.definition.name}: deleted ${removed ? lfResult(removed, editorExercise.definition.mode, unit) : "set"}.`);
    closeSheet(true); setNotice("Set deleted");
  }
  function finishWorkout() {
    if (!active || !lfSetCount(active)) { setError("Log at least one set before saving a workout. You can also discard this workout."); return; }
    const finished = { ...active, finishedAt: Date.now() };
    setHistory((items) => [finished, ...items]); setSelectedId(finished.id); setActive(null); setRestEndsAt(null); closeSheet(true); navigate("detail"); setNotice("Workout recorded in this preview");
  }
  function openRename() {
    if (!current) return;
    setNameDraft(current.name); setNotesDraft(current.notes); setFormOriginal(JSON.stringify([current.name, current.notes])); openSheet("rename");
  }
  function openRoutine() {
    if (!current) return;
    setNameDraft(current.name); setNotesDraft(""); setFormOriginal(JSON.stringify([current.name, ""])); openSheet("routine");
  }
  function saveRoutine() {
    if (!current || !nameDraft.trim()) { setError("Give this routine a name."); return; }
    if (!current.exercises.length) { setError("Add an exercise before saving a routine."); return; }
    setRoutines((items) => [...items, { id: lfId(), name: nameDraft.trim(), exercises: lfCloneExercises(current.exercises) }]); closeSheet(true); setNotice("Routine added to Workouts");
  }
  function saveWorkoutDetails() {
    if (!current || !nameDraft.trim()) { setError("Enter a workout name."); return; }
    updateWorkout({ ...current, name: nameDraft.trim(), notes: notesDraft.trim() }, "Workout name or notes changed."); closeSheet(true); setNotice("Workout details updated");
  }

  const historyExercises = useMemo(() => {
    const definitions = new Map<string, LFDefinition>();
    for (const workout of history) for (const exercise of workout.exercises) if (exercise.sets.length) definitions.set(exercise.definition.id, exercise.definition);
    return [...definitions.values()];
  }, [history]);
  const progressDefinition = historyExercises.find((definition) => definition.id === progressExerciseId) ?? historyExercises[0];
  const progressRows = progressDefinition ? history.slice().reverse().flatMap((workout) => {
    const sets = workout.exercises.filter((item) => item.definition.id === progressDefinition.id).flatMap((item) => item.sets);
    if (!sets.length) return [];
    const best = sets.reduce((a, b) => progressDefinition.mode === "weighted" ? (b.grams ?? 0) > (a.grams ?? 0) || b.grams === a.grams && (b.reps ?? 0) > (a.reps ?? 0) ? b : a : progressDefinition.mode === "bodyweight" ? (b.reps ?? 0) > (a.reps ?? 0) ? b : a : (b.seconds ?? 0) > (a.seconds ?? 0) ? b : a);
    return [{ workout, best, value: progressDefinition.mode === "weighted" ? (best.grams ?? 0) / lfUnitMass(unit) : progressDefinition.mode === "bodyweight" ? best.reps ?? 0 : best.seconds ?? 0 }];
  }) : [];
  const timedProgress = progressDefinition?.mode === "timed";
  const maxValue = Math.max(...progressRows.map((row) => row.value), 1);
  const latestRecord = progressRows.reduce<(typeof progressRows)[number] | null>((best, row) => !best || row.value > best.value || row.value === best.value && (row.best.reps ?? 0) > (best.best.reps ?? 0) ? row : best, null);
  const calendarNow = new Date();
  const thisWeekStart = new Date(calendarNow.getFullYear(), calendarNow.getMonth(), calendarNow.getDate() - ((calendarNow.getDay() + 6) % 7)).getTime();
  const previousWeekStart = new Date(calendarNow.getFullYear(), calendarNow.getMonth(), calendarNow.getDate() - ((calendarNow.getDay() + 6) % 7) - 7).getTime();
  const thisWeekCount = history.filter((workout) => (workout.finishedAt ?? 0) >= thisWeekStart).length;
  const previousWeekCount = history.filter((workout) => (workout.finishedAt ?? 0) >= previousWeekStart && (workout.finishedAt ?? 0) < thisWeekStart).length;
  const currentTab = view === "active" ? "workouts" : view === "detail" ? "history" : view;
  const heading = view === "workouts" ? "Your workout.\nYour way." : view === "active" ? active?.name ?? "Workout" : view === "history" ? "Your training,\non record." : view === "detail" ? selected?.name ?? "Workout" : "A little perspective.";
  const sheetTitle = guardDraft ? "Discard changes?" : sheet === "picker" ? "Add exercise" : sheet === "set" ? editor?.setId ? "Edit set" : "Log set" : sheet === "finish" ? "Finish workout?" : sheet === "routine" ? "Save as routine" : sheet === "rename" ? "Workout details" : sheet === "delete-workout" ? "Delete workout?" : sheet === "discard-workout" ? "Discard this workout?" : sheet === "delete-set" ? "Delete set?" : sheet === "remove-exercise" ? "Remove exercise?" : sheet === "active-conflict" ? "Workout in progress" : sheet === "units" ? "Weight units" : "Edit history";

  function renderExercise(exercise: LFExercise, index: number, workout: LFWorkout, editable: boolean) {
    const previous = previousExercise(exercise.definition.id, workout.id);
    const quickSeed = exercise.targets[exercise.sets.length] ?? exercise.sets.at(-1) ?? previous?.exercise.sets.at(-1);
    return <section className="lf-exercise" key={exercise.id} aria-label={exercise.definition.name}>
      <div className="lf-exercise-heading"><span className="lf-index">{String(index + 1).padStart(2, "0")}</span><div><h2>{exercise.definition.name}</h2><p>{lfModeLabel(exercise.definition.mode)}{exercise.definition.basis ? ` · ${exercise.definition.basis}` : ""}</p></div>{editable && <button className="lf-icon-button" aria-label={`Remove ${exercise.definition.name}`} onClick={() => { setRemoveExerciseId(exercise.id); openSheet("remove-exercise"); }}><MinusIcon /></button>}</div>
      {editable && previous && <p className="lf-previous">Last time <strong>{lfResult(previous.exercise.sets.at(-1)!, exercise.definition.mode, unit)}</strong><span>{lfDate(previous.workout.finishedAt!)} · final recorded set</span></p>}
      {exercise.targets.length > 0 && <p className="lf-target">Reference: {exercise.targets.length} {exercise.targets.length === 1 ? "set" : "sets"} · {lfResult(exercise.targets[0], exercise.definition.mode, unit)}{exercise.targets.length > 1 ? " first set" : ""}. Change or skip as you like.</p>}
      {exercise.sets.length ? <div className="lf-sets"><div className="lf-set-header"><span>Set</span><span>Recorded</span><span className="lf-sr-only">Action</span></div>{exercise.sets.map((set, setIndex) => <button className="lf-set-row" key={set.id} aria-label={`Edit set ${setIndex + 1} for ${exercise.definition.name}`} onClick={() => openSet(workout, exercise, set)}><span>{setIndex + 1}<CheckIcon aria-hidden="true" /></span><strong>{lfResult(set, exercise.definition.mode, unit)}</strong><Pencil2Icon aria-hidden="true" /></button>)}</div> : <p className="lf-unlogged">No sets logged{workout.finishedAt ? " · not attempted" : " yet"}</p>}
      {editable && quickSeed && <div className="lf-quick-set"><p>Next set <strong>{lfResult(quickSeed, exercise.definition.mode, unit)}</strong></p><button className="lf-primary" aria-label={`Log ${lfResult(quickSeed, exercise.definition.mode, unit)} for ${exercise.definition.name}`} onClick={() => logQuickSet(workout, exercise, quickSeed)}><CheckIcon /> Log set</button><button className="lf-text-button" onClick={() => openSet(workout, exercise)}>Edit values</button></div>}
      {editable && <button className="lf-add-set" aria-label={`Add set for ${exercise.definition.name}`} onClick={() => openSet(workout, exercise)}><PlusIcon /> {quickSeed ? "Add different set" : "Log a set"}</button>}
    </section>;
  }

  return <main className="lf-app" data-testid="logging-first">
    <header className="lf-header"><div><span className="lf-brand">NEXTSET<span aria-hidden="true"> /</span></span><small>Preview · resets on reload</small></div><button className="lf-unit-button" aria-label={`Weight units: ${unit}`} onClick={() => openSheet("units")}>{unit}<ChevronDownIcon /></button></header>
    <div className="lf-scroll-region">
      <MobileScroll key={view} className="lf-scroll"><div className="lf-content">
        {(view === "active" || view === "detail") && <button className="lf-back" onClick={() => navigate(view === "active" ? "workouts" : "history")}><ArrowLeftIcon />{view === "active" ? "Workouts" : "History"}</button>}
        <div className="lf-page-heading"><p className="lf-eyebrow">{view === "workouts" ? "The workout notebook" : view === "active" ? "In progress" : view === "history" ? "History" : view === "detail" ? selected?.finishedAt ? `${lfDate(selected.finishedAt)} · ${new Date(selected.finishedAt).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}` : "Workout" : "Progress"}</p><h1 tabIndex={-1} ref={focusHeading}>{heading}</h1></div>
        {view === "workouts" && <>
          <p className="lf-intro">Show up. Log what you do.<br />Find your own rhythm.</p>
          {active ? <div className="lf-resume"><p className="lf-eyebrow">Workout in progress</p><h2>{active.name}</h2><p>{lfSetCount(active)} sets logged · {active.exercises.length} exercises</p><button className="lf-primary" onClick={() => navigate("active")}>Resume workout <ArrowRightIcon /></button></div> : <button className="lf-primary lf-start" onClick={() => startWorkout()}>Start workout <PlusIcon /></button>}
          <p className="lf-subtle lf-start-caption">{active ? "Your entries stay here while you explore." : "Start with a blank page. No setup needed."}</p>
          <section className="lf-section"><div className="lf-section-heading"><h2>Routines</h2><span>Optional</span></div>{routines.length ? <div className="lf-list">{routines.map((routine) => <button key={routine.id} className="lf-list-row" aria-label={`Start routine ${routine.name}`} onClick={() => startWorkout(routine)}><RowsIcon /><span><strong>{routine.name}</strong><small>{routine.exercises.length} exercises · start when you like</small></span><ArrowRightIcon /></button>)}</div> : <div className="lf-empty-routines"><RowsIcon aria-hidden="true" /><p>A little less setup, next time.<span>Save any workout as a routine when you want to use it again.</span></p></div>}</section>
          <section className="lf-section"><div className="lf-section-heading"><h2>Last workout</h2>{history.length > 0 && <button className="lf-text-button" onClick={() => navigate("history")}>See all <ArrowRightIcon /></button>}</div>{history[0] ? <div className="lf-last"><button className="lf-list-row" onClick={() => { setSelectedId(history[0].id); navigate("detail"); }}><span><strong>{history[0].name}</strong><small>{lfDate(history[0].finishedAt!)} · {lfSetCount(history[0])} sets</small></span><ArrowRightIcon /></button><button className="lf-secondary" onClick={() => startWorkout(history[0])}><ReloadIcon /> Repeat workout</button></div> : <p className="lf-subtle">Your first finished workout will appear here.</p>}</section>
        </>}
        {view === "active" && active && <>
          <div className="lf-workout-summary"><span><strong>{totalSets}</strong> {totalSets === 1 ? "set" : "sets"} logged</span><button className="lf-text-button" onClick={openRename}><Pencil2Icon /> Details</button></div>
          {active.notes && <p className="lf-note">{active.notes}</p>}
          {restEndsAt && <div className="lf-rest" role="status"><ClockIcon /><strong>{remainingSeconds ? lfTime(remainingSeconds) : "Rest finished"}</strong><span>{remainingSeconds ? "Rest" : "Continue when ready"}</span><button className="lf-text-button" onClick={() => setRestEndsAt(null)}>Dismiss</button></div>}
          {!active.exercises.length ? <div className="lf-blank"><div className="lf-blank-mark" aria-hidden="true"><PlusIcon /></div><h2>What are you training?</h2><p>Add your first exercise, then record each set as you go.</p><button className="lf-primary" onClick={openPicker}><PlusIcon /> Add exercise</button></div> : <>{active.exercises.map((exercise, index) => renderExercise(exercise, index, active, true))}<button className="lf-secondary lf-add-exercise" onClick={openPicker}><PlusIcon /> Add exercise</button></>}
          <div className="lf-workout-tools"><button className="lf-text-button" onClick={() => { setNow(Date.now()); setRestEndsAt(Date.now() + 90000); }}><ClockIcon /> {restEndsAt ? "Restart 90 sec rest" : "Rest timer · 90 sec"}</button><button className="lf-text-button lf-danger" onClick={() => openSheet("discard-workout")}>Discard workout</button></div>
        </>}
        {view === "history" && <>{history.length ? <><p className="lf-intro">{history.length} {history.length === 1 ? "workout" : "workouts"} recorded in this preview.</p><div className="lf-history-list">{history.map((workout) => <button className="lf-history-row" key={workout.id} onClick={() => { setSelectedId(workout.id); navigate("detail"); }}><span className="lf-date-block">{lfDate(workout.finishedAt!)}</span><span><strong>{workout.name}</strong><small>{lfSetCount(workout)} sets · {workout.exercises.filter((exercise) => exercise.sets.length).length} exercises</small>{workout.revisions.length > 0 && <small>Edited · revision {workout.revisions.length + 1}</small>}</span><ArrowRightIcon /></button>)}</div></> : <div className="lf-empty-page"><RowsIcon /><h2>Your log starts here.</h2><p>Finish a workout to keep its exercises, sets and notes together.</p><button className="lf-primary" onClick={() => active ? navigate("active") : startWorkout()}>{active ? "Resume workout" : "Start workout"}<ArrowRightIcon /></button></div>}</>}
        {view === "detail" && selected && <>
          <div className="lf-result-summary"><div><strong>{lfSetCount(selected)}</strong><span>sets logged</span></div><div><strong>{selected.exercises.filter((exercise) => exercise.sets.length).length}</strong><span>exercises recorded</span></div></div>
          {selected.exercises.some((exercise) => exercise.sets.length < Math.max(1, exercise.targets.length)) && <p className="lf-partial">{selected.exercises.filter((exercise) => !exercise.sets.length).length > 0 ? `${selected.exercises.filter((exercise) => !exercise.sets.length).length} exercises had no sets recorded. ` : ""}Only the sets you logged are included.</p>}
          <button className="lf-primary" onClick={() => startWorkout(selected)}>Repeat workout <ReloadIcon /></button><p className="lf-subtle lf-start-caption">Copies exercises and reference values. Sets start unlogged.</p>
          <button className="lf-secondary" onClick={openRoutine}><PlusIcon /> Save as routine</button>
          {selected.notes && <p className="lf-note">{selected.notes}</p>}
          <div className="lf-detail-exercises">{selected.exercises.map((exercise, index) => renderExercise(exercise, index, selected, false))}</div>
          <button className="lf-secondary" onClick={openRename}><Pencil2Icon /> Edit workout</button>
          {selected.revisions.length > 0 && <button className="lf-text-button" onClick={() => openSheet("audit")}>View edits · revision {selected.revisions.length + 1}</button>}
          <button className="lf-text-button lf-danger lf-delete-workout" onClick={() => openSheet("delete-workout")}>Delete workout</button>
        </>}
        {view === "progress" && <>{history.length ? <>
          <p className="lf-intro">Patterns from the workouts you’ve recorded.</p><section className="lf-section lf-frequency"><div className="lf-section-heading"><h2>Workout frequency</h2></div><div className="lf-frequency-numbers"><div><strong>{thisWeekCount}</strong><span>This week so far</span></div><div><strong>{previousWeekCount}</strong><span>Last week</span></div></div><p className="lf-subtle">Monday–Sunday · local time. This week is incomplete; no target or streak.</p></section>
          <section className="lf-section"><div className="lf-section-heading"><h2>Exercise performance</h2></div><label className="lf-field">Exercise<select aria-label="Progress exercise" value={progressDefinition?.id ?? ""} onChange={(event) => setProgressExerciseId(event.target.value)}>{historyExercises.map((definition) => <option key={definition.id} value={definition.id}>{definition.name}{definition.custom ? " (custom)" : ""}</option>)}</select></label>
            {progressDefinition && latestRecord && <><div className="lf-personal-best"><span>{timedProgress ? "Longest recorded set" : progressDefinition.mode === "weighted" ? "Heaviest recorded set" : "Most reps in one set"}</span><strong>{lfResult(latestRecord.best, progressDefinition.mode, unit)}</strong><small>{progressDefinition.basis ?? lfModeLabel(progressDefinition.mode)} · {lfDate(latestRecord.workout.finishedAt!)}</small></div>
              {progressRows.length < 2 ? <p className="lf-progress-prompt">One workout is a starting point. Record this exercise in another workout to see it over time.</p> : <><p className="lf-subtle">{timedProgress ? "Longest set" : progressDefinition.mode === "weighted" ? "Heaviest set" : "Most reps in a set"} per workout · {progressRows.length} workouts. {timedProgress ? "Longer is not automatically better." : "A change in load or reps is a record of performance, not a fitness score."}</p><div className="lf-chart" role="img" aria-label={`${progressDefinition.name}: ${progressRows.map((row) => `${lfDate(row.workout.finishedAt!)} ${lfResult(row.best, progressDefinition.mode, unit)}`).join("; ")}. Full values in the table below.`}>{progressRows.slice(-8).map((row, index) => <div className="lf-chart-column" key={row.workout.id}><span className="lf-chart-bar" style={{ height: `${Math.max(2, row.value / maxValue * 100)}%` }} /><span>{index + Math.max(1, progressRows.length - 7)}</span></div>)}</div></>}
              <div className="lf-trend-table"><table><caption>{progressDefinition.name} · recorded values</caption><thead><tr><th scope="col">Workout</th><th scope="col">{timedProgress ? "Longest set" : progressDefinition.mode === "weighted" ? "Heaviest set" : "Most reps"}</th></tr></thead><tbody>{progressRows.map((row, index) => <tr key={row.workout.id}><th scope="row">{index + 1}. {lfDate(row.workout.finishedAt!)}</th><td>{lfResult(row.best, progressDefinition.mode, unit)}</td></tr>)}</tbody></table></div><p className="lf-subtle">Same exercise and measurement only. Edits and deletions update these values. No estimated strength or combined weight score.</p>
            </>}
          </section>
        </> : <div className="lf-empty-page"><BarChartIcon /><h2>Progress starts with a record.</h2><p>Log workouts to see your frequency and exercise performance. No goals or programme needed.</p><button className="lf-primary" onClick={() => active ? navigate("active") : startWorkout()}>{active ? "Resume workout" : "Start workout"}<ArrowRightIcon /></button></div>}</>}
        {notice && <div className="lf-inline-notice" role="status"><CheckCircledIcon />{notice}</div>}
        {deletedWorkout && <div className="lf-undo"><p>“{deletedWorkout.name}” deleted from history.</p><button className="lf-secondary" onClick={() => { setHistory((items) => [...items, deletedWorkout].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))); setDeletedWorkout(null); setNotice("Workout restored"); }}>Undo deletion</button></div>}
      </div></MobileScroll>
    </div>
    {!isKeyboardVisible && <footer className={`lf-footer ${view === "active" ? "lf-footer-active" : ""}`} style={{ bottom: bottomInset }}>
      {view === "active" && active && <div className="lf-finish-bar"><span>{totalSets} {totalSets === 1 ? "set" : "sets"} logged</span><button className="lf-primary" onClick={() => openSheet("finish")}>Finish workout <CheckIcon /></button></div>}
      <nav className="lf-tabs" aria-label="Main navigation">{([{ id: "workouts", label: "Workouts", Icon: RowsIcon }, { id: "history", label: "History", Icon: ClockIcon }, { id: "progress", label: "Progress", Icon: BarChartIcon }] as const).map(({ id, label, Icon }) => <button key={id} aria-current={currentTab === id ? "page" : undefined} onClick={() => navigate(id)}><Icon aria-hidden="true" /><span>{label}</span></button>)}</nav>
    </footer>}
    <BottomSheet open={sheet !== null} onOpenChange={(open) => { if (!open) closeSheet(); }} title={sheetTitle} description={guardDraft ? "Your last recorded values will stay unchanged." : sheet === "set" ? editorExercise?.definition.name : undefined} snap={sheet === "picker" ? 0.86 : 0.76}>
      <div className="lf-sheet">
        {guardDraft ? <><p>Your changes haven’t been recorded. Keep editing or discard this draft.</p><button className="lf-primary" onClick={() => setGuardDraft(false)}>Keep editing</button><button className="lf-secondary lf-danger" onClick={() => closeSheet(true)}>Discard changes</button></> : <>
        {sheet === "picker" && <>
          <label className="lf-field lf-search"><MagnifyingGlassIcon /><KeyboardInput aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="lf-picker-list">{[...lfCatalogue, ...customExercises].filter((definition) => definition.name.toLowerCase().includes(query.toLowerCase())).map((definition) => <button className="lf-list-row" key={definition.id} onClick={() => addExercise(definition)}><span><strong>{definition.name}</strong><small>{lfModeLabel(definition.mode)}{definition.custom ? " · custom" : ""}</small></span><PlusIcon /></button>)}</div>
          {![...lfCatalogue, ...customExercises].some((definition) => definition.name.toLowerCase().includes(query.toLowerCase())) && <p>No matches. Add your own exercise below.</p>}
          <details className="lf-custom"><summary>Add a custom exercise</summary><label className="lf-field">Exercise name<KeyboardInput aria-label="Custom exercise name" value={customName} maxLength={80} placeholder="e.g. Chest press machine" onChange={(event) => setCustomName(event.target.value)} /></label><fieldset className="lf-mode-options"><legend>What do you record?</legend>{(["weighted", "bodyweight", "timed"] as const).map((mode) => <button key={mode} aria-pressed={customMode === mode} onClick={() => setCustomMode(mode)}>{lfModeLabel(mode)}</button>)}</fieldset>{customMode === "weighted" && <p className="lf-subtle">Record total external weight. Use a distinct name for a different machine or variation.</p>}<button className="lf-primary" onClick={addCustomExercise}>Add custom exercise</button></details>
          <button className="lf-text-button" onClick={() => closeSheet()}>Cancel</button>
        </>}
        {sheet === "set" && editor && editorExercise && <>
          <p className="lf-subtle">{editorExercise.definition.basis ?? lfModeLabel(editorExercise.definition.mode)}. {editor.setId ? "Changes replace this set only." : "Review the values, then log the set you did."}</p>
          <div className="lf-set-inputs">{editorExercise.definition.mode === "weighted" && <label className="lf-field">Weight ({unit})<KeyboardInput aria-label={`Weight (${unit})`} inputMode="decimal" value={editor.weight} placeholder="0" onChange={(event) => setEditor({ ...editor, weight: event.target.value })} /></label>}{editorExercise.definition.mode !== "timed" ? <label className="lf-field">Reps<KeyboardInput aria-label="Reps" inputMode="numeric" value={editor.reps} placeholder="0" onChange={(event) => setEditor({ ...editor, reps: event.target.value })} /></label> : <label className="lf-field">Duration (seconds)<KeyboardInput aria-label="Duration (seconds)" inputMode="numeric" value={editor.seconds} placeholder="0" onChange={(event) => setEditor({ ...editor, seconds: event.target.value })} /></label>}</div>
          <button className="lf-primary" onClick={saveSet}>{editor.setId ? "Save changes" : "Log set"}<CheckIcon /></button><button className="lf-secondary" onClick={() => closeSheet()}>Cancel</button>{editor.setId && <button className="lf-text-button lf-danger" onClick={() => openSheet("delete-set")}>Delete set</button>}
        </>}
        {sheet === "finish" && active && <>
          <p className="lf-finish-count"><strong>{totalSets}</strong> {totalSets === 1 ? "set" : "sets"} logged</p>
          {!totalSets ? <p>There’s nothing to save yet. Log at least one set, or discard this workout.</p> : <><p>Your recorded sets will appear in History.</p>{active.exercises.some((exercise) => exercise.sets.length < Math.max(1, exercise.targets.length)) && <div className="lf-partial"><strong>Some exercises or reference sets are unlogged.</strong><p>Only recorded sets count. Unlogged work is kept as context, with no scheduling changes.</p></div>}<button className="lf-primary" onClick={finishWorkout}>Save workout <CheckIcon /></button></>}
          <button className="lf-secondary" onClick={() => closeSheet(true)}>Keep logging</button>{!totalSets && <button className="lf-text-button lf-danger" onClick={() => openSheet("discard-workout")}>Discard workout</button>}
        </>}
        {(sheet === "routine" || sheet === "rename") && <>
          {sheet === "routine" && <p>A reusable starting point with your exercises and reference values. No dates, schedule or completed sets.</p>}
          <label className="lf-field">{sheet === "routine" ? "Routine name" : "Workout name"}<KeyboardInput aria-label={sheet === "routine" ? "Routine name" : "Workout name"} value={nameDraft} maxLength={80} onChange={(event) => setNameDraft(event.target.value)} /></label>
          {sheet === "rename" && <label className="lf-field">Notes (optional)<KeyboardTextarea aria-label="Workout notes" rows={3} value={notesDraft} maxLength={1000} onChange={(event) => setNotesDraft(event.target.value)} placeholder="Anything you want to remember" /></label>}
          <button className="lf-primary" onClick={sheet === "routine" ? saveRoutine : saveWorkoutDetails}>{sheet === "routine" ? "Save routine" : "Save details"}</button><button className="lf-secondary" onClick={() => closeSheet()}>Cancel</button>
        </>}
        {sheet === "delete-workout" && selected && <><p>Remove “{selected.name}” and its {lfSetCount(selected)} sets from History and Progress? Saved routines stay unchanged.</p><p className="lf-subtle">You can undo this deletion here until another workout is deleted or the preview reloads.</p><button className="lf-secondary" onClick={() => closeSheet(true)}>Keep workout</button><button className="lf-primary lf-danger-fill" onClick={() => { setDeletedWorkout(selected); setHistory((items) => items.filter((workout) => workout.id !== selected.id)); closeSheet(true); navigate("history"); }}>Delete workout</button></>}
        {sheet === "discard-workout" && active && <><p>Discard “{active.name}” and its {totalSets} recorded sets? It won’t be added to History. This cannot be undone.</p><button className="lf-primary" onClick={() => closeSheet(true)}>Keep workout</button><button className="lf-secondary lf-danger" onClick={() => { setActive(null); setRestEndsAt(null); closeSheet(true); navigate("workouts"); }}>Discard workout</button></>}
        {sheet === "delete-set" && <><p>Remove this set from the workout? History edits retain a revision record. This action cannot be undone here.</p><button className="lf-secondary" onClick={() => openSheet("set")}>Keep set</button><button className="lf-primary lf-danger-fill" onClick={deleteSet}>Delete set</button></>}
        {sheet === "remove-exercise" && active && <><p>Remove {active.exercises.find((exercise) => exercise.id === removeExerciseId)?.definition.name} and all its recorded sets from this workout? This cannot be undone.</p><button className="lf-primary" onClick={() => closeSheet(true)}>Keep exercise</button><button className="lf-secondary lf-danger" onClick={() => { setActive({ ...active, exercises: active.exercises.filter((exercise) => exercise.id !== removeExerciseId) }); closeSheet(true); }}>Remove exercise</button></>}
        {sheet === "active-conflict" && <><p>Finish or discard your current workout before starting another. Your existing sets are still here.</p><button className="lf-primary" onClick={() => { closeSheet(true); navigate("active"); }}>Resume workout</button><button className="lf-secondary" onClick={() => closeSheet(true)}>Cancel</button></>}
        {sheet === "units" && <><p>Choose how weights are displayed. Existing recorded weights keep their value.</p>{(["kg", "lb"] as const).map((value) => <button className="lf-unit-option" key={value} aria-pressed={unit === value} onClick={() => { setUnit(value); closeSheet(true); }}>{value === "kg" ? "Kilograms (kg)" : "Pounds (lb)"}{unit === value && <CheckIcon />}</button>)}</>}
        {sheet === "audit" && selected && <><p className="lf-subtle">Changes to this completed workout in the current preview.</p>{selected.revisions.map((revision, index) => <div className="lf-audit-row" key={revision.id}><strong>Revision {index + 2} · {new Date(revision.at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}</strong><p>{revision.description}</p></div>)}<button className="lf-secondary" onClick={() => closeSheet(true)}>Done</button></>}
        {error && <p className="lf-error" role="alert">{error}</p>}
        </>}
      </div>
    </BottomSheet>
  </main>;
}
