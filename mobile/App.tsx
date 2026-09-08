import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CATALOGUE_SECTIONS, formatSet, gramsToLoad, makeId, type ExerciseMode, type ExerciseRecord, type LoadUnit, type RoutineRecord, type SetRecord, type WorkoutRecord } from './src/domain/models';
import { deriveProgress, progressDescription } from './src/domain/progress';
import { workoutRepository } from './src/storage/workoutRepository';

type Tab = 'workouts' | 'history' | 'progress' | 'settings';
type UndoAction = { message: string; restore: () => Promise<void> };
const DEFAULT_WORKOUT_NAMES = ['Push', 'Pull', 'Legs', 'Arms'];

export default function App() {
  return <SafeAreaProvider><NextSetApp /></SafeAreaProvider>;
}

function NextSetApp() {
  const [tab, setTab] = useState<Tab>('workouts');
  const [active, setActive] = useState<WorkoutRecord | null>(null);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [routines, setRoutines] = useState<RoutineRecord[]>([]);
  const [workoutNameOptions, setWorkoutNameOptions] = useState<string[]>([]);
  const [loadUnit, setLoadUnit] = useState<LoadUnit>('kg');
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<{ set: SetRecord; mode: ExerciseMode } | null>(null);
  const [namingWorkout, setNamingWorkout] = useState<WorkoutRecord | null>(null);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const screenOpacity = useState(() => new Animated.Value(1))[0];
  const screenOffset = useState(() => new Animated.Value(0))[0];

  const refresh = useCallback(async () => {
    const [nextActive, nextHistory, nextRoutines, settings, nextWorkoutNameOptions] = await Promise.all([
      workoutRepository.active(),
      workoutRepository.completed(),
      workoutRepository.routines(),
      workoutRepository.settings(),
      workoutRepository.workoutNameOptions(),
    ]);
    setActive(nextActive);
    setHistory(nextHistory);
    setRoutines(nextRoutines);
    setLoadUnit(settings.loadUnit);
    setWorkoutNameOptions(nextWorkoutNameOptions);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setLoading(false);
      Alert.alert('NextSet could not open your workout data', 'Your data was not changed. Please try reopening the app.');
    });
  }, [refresh]);

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      screenOpacity.setValue(1);
      screenOffset.setValue(0);
      return;
    }
    screenOpacity.setValue(0);
    screenOffset.setValue(6);
    Animated.parallel([
      Animated.timing(screenOpacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(screenOffset, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [tab, reduceMotion, screenOpacity, screenOffset]);

  const startBlank = async () => {
    await workoutRepository.start();
    await refresh();
  };

  const offerUndo = useCallback((action: UndoAction) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoAction(action);
    undoTimer.current = setTimeout(() => setUndoAction(null), 6000);
  }, []);

  const undoLastDelete = async () => {
    if (!undoAction) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    await undoAction.restore();
    await refresh();
    setUndoAction(null);
  };

  const removeExercise = async (exercise: ExerciseRecord) => {
    await workoutRepository.deleteExercise(exercise.id);
    await refresh();
    offerUndo({ message: `${exercise.name} removed`, restore: () => workoutRepository.restoreExercise(exercise) });
  };

  const removeWorkout = async (workout: WorkoutRecord) => {
    await workoutRepository.deleteWorkout(workout.id);
    setSelectedHistoryId((selected) => selected === workout.id ? null : selected);
    await refresh();
    offerUndo({ message: 'Workout deleted', restore: () => workoutRepository.restoreWorkout(workout) });
  };

  const nameWorkout = async (workout: WorkoutRecord, name: string) => {
    await workoutRepository.renameWorkout(workout.id, name);
    await refresh();
  };

  const selectedHistory = history.find((workout) => workout.id === selectedHistoryId) ?? null;

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator color={COLORS.vermilion} /><Text style={styles.muted}>Opening your workout log…</Text></SafeAreaView>;
  }

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>NEXTSET</Text>
          <Text style={styles.headerNote}>Your training, saved on this phone</Text>
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        <Animated.View style={{ gap: 16, opacity: screenOpacity, transform: [{ translateY: screenOffset }] }}>
          {tab === 'workouts' && (active ? (
            <ActiveWorkout workout={active} unit={loadUnit} refresh={refresh} openPicker={() => setPickerOpen(true)} editSet={setEditingSet} removeExercise={removeExercise} nameWorkout={() => setNamingWorkout(active)} />
          ) : (
            <WorkoutsHome startBlank={startBlank} routines={routines} refresh={refresh} manageRoutine={setSelectedRoutineId} />
          ))}
          {tab === 'history' && <HistoryView history={history} select={setSelectedHistoryId} removeWorkout={removeWorkout} />}
          {tab === 'progress' && <ProgressView history={history} unit={loadUnit} />}
          {tab === 'settings' && <SettingsView unit={loadUnit} refresh={refresh} />}
        </Animated.View>
      </ScrollView>
      <SafeAreaView style={styles.tabSafeArea} edges={['bottom']}>
        <View style={styles.tabs} accessibilityRole="tablist">
          <TabButton label="Workouts" active={tab === 'workouts'} onPress={() => setTab('workouts')} />
          <TabButton label="History" active={tab === 'history'} onPress={() => setTab('history')} />
          <TabButton label="Progress" active={tab === 'progress'} onPress={() => setTab('progress')} />
          <TabButton label="Settings" active={tab === 'settings'} onPress={() => setTab('settings')} />
        </View>
      </SafeAreaView>
      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChoose={async (exercise) => {
          if (!active) return;
          await workoutRepository.addExercise(active.id, exercise);
          setPickerOpen(false);
          await refresh();
        }}
      />
      <WorkoutDetail
        workout={selectedHistory}
        onClose={() => setSelectedHistoryId(null)}
        onRepeat={async () => {
          if (!selectedHistory) return;
          await workoutRepository.repeat(selectedHistory);
          setSelectedHistoryId(null);
          setTab('workouts');
          await refresh();
        }}
        onSaveRoutine={async () => {
          if (!selectedHistory) return;
          await workoutRepository.saveRoutine(selectedHistory);
          await refresh();
          Alert.alert('Routine saved', 'It is an optional shortcut. It will not change this completed workout.');
        }}
        unit={loadUnit}
        onEditSet={(set, mode) => setEditingSet({ set, mode })}
        onDelete={async () => { if (selectedHistory) await removeWorkout(selectedHistory); }}
        refresh={refresh}
      />
      <RoutineDetail routine={routines.find((routine) => routine.id === selectedRoutineId) ?? null} onClose={() => setSelectedRoutineId(null)} refresh={refresh} />
      <SetEditSheet editing={editingSet} unit={loadUnit} onClose={() => setEditingSet(null)} refresh={refresh} />
      <WorkoutNameSheet workout={namingWorkout} savedNames={workoutNameOptions} onClose={() => setNamingWorkout(null)} onSave={nameWorkout} />
      {undoAction && <UndoBar message={undoAction.message} onUndo={undoLastDelete} />}
    </View>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);
  return reduced;
}

function SheetModal({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(28)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      translateY.setValue(0);
      backdropOpacity.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [backdropOpacity, reduceMotion, translateY]);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    if (reduceMotion !== false) {
      onClose();
      return;
    }
    Animated.parallel([
      Animated.timing(translateY, { toValue: 360, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onClose(); });
  }, [backdropOpacity, onClose, reduceMotion, translateY]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => translateY.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 96 || gesture.vy > 0.75) {
        dismiss();
        return;
      }
      if (reduceMotion !== false) translateY.setValue(0);
      else Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    },
    onPanResponderTerminate: () => {
      if (reduceMotion !== false) translateY.setValue(0);
      else Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    },
  }), [dismiss, reduceMotion, translateY]);

  return <Modal visible transparent animationType="none" onRequestClose={dismiss}>
    <View style={styles.modalBackdrop} accessibilityViewIsModal>
      <Animated.View style={[styles.sheetBackdrop, { opacity: backdropOpacity }]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityRole="button" accessibilityLabel={`Dismiss ${label}`} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetKeyboard} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), transform: [{ translateY }] }]}>
          <View style={styles.sheetDragZone} {...panResponder.panHandlers} accessibilityLabel={`Swipe down to dismiss ${label}`}>
            <View style={styles.sheetHandle} />
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

function SwipeableRow({ children, onAction, actionLabel, accessibilityLabel }: { children: ReactNode; onAction: () => Promise<void>; actionLabel: string; accessibilityLabel: string }) {
  const reduceMotion = useReducedMotion();
  const translateX = useRef(new Animated.Value(0)).current;
  const startOffset = useRef(0);
  const isOpen = useRef(false);
  const actionWidth = 96;
  const settle = useCallback((toValue: number) => {
    isOpen.current = toValue < 0;
    if (reduceMotion !== false) translateX.setValue(toValue);
    else Animated.timing(translateX, { toValue, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [reduceMotion, translateX]);
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => { startOffset.current = isOpen.current ? -actionWidth : 0; },
    onPanResponderMove: (_, gesture) => translateX.setValue(Math.max(-actionWidth, Math.min(0, startOffset.current + gesture.dx))),
    onPanResponderRelease: (_, gesture) => {
      const endOffset = startOffset.current + gesture.dx;
      if (isOpen.current) {
        const closeRow = gesture.vx > 0.35 || gesture.dx > 18 || endOffset >= -44;
        settle(closeRow ? 0 : -actionWidth);
        return;
      }
      const openRow = endOffset < -44 || gesture.vx < -0.45;
      settle(openRow ? -actionWidth : 0);
    },
    onPanResponderTerminate: () => settle(0),
  }), [settle, translateX]);
  const act = () => {
    isOpen.current = false;
    translateX.setValue(0);
    safelyRun(onAction);
  };
  return <View style={styles.swipeRow}>
    <Pressable onPress={act} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.swipeAction, pressed && reduceMotion === false && styles.pressed]}><Text style={styles.swipeActionText}>{actionLabel}</Text></Pressable>
    <Animated.View style={[styles.swipeContent, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      <View accessibilityActions={[{ name: 'delete', label: accessibilityLabel }]} onAccessibilityAction={(event) => { if (event.nativeEvent.actionName === 'delete') act(); }}>
        {children}
      </View>
    </Animated.View>
  </View>;
}

function UndoBar({ message, onUndo }: { message: string; onUndo: () => Promise<void> }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.undoBar, { bottom: insets.bottom + 68 }]} accessibilityLiveRegion="polite">
    <Text style={styles.undoMessage}>{message}</Text>
    <Pressable onPress={() => safelyRun(onUndo)} accessibilityRole="button" accessibilityLabel={`Undo: ${message}`} style={({ pressed }) => [styles.undoButton, pressed && styles.undoPressed]}><Text style={styles.undoButtonText}>Undo</Text></Pressable>
  </View>;
}

function WorkoutsHome({ startBlank, routines, refresh, manageRoutine }: { startBlank: () => Promise<void>; routines: RoutineRecord[]; refresh: () => Promise<void>; manageRoutine: (id: string) => void }) {
  return <>
    <Text style={styles.eyebrow}>WORKOUTS</Text>
    <Text style={styles.title}>Log what you do today.</Text>
    <Text style={styles.lede}>Start with an empty workout. Routines are optional shortcuts, never a requirement.</Text>
    <Action label="Start workout" onPress={startBlank} />
    <Text style={styles.sectionLabel}>YOUR ROUTINES</Text>
    {routines.length === 0 ? <Text style={styles.muted}>Save a finished workout as a routine when you want to reuse its exercise list.</Text> : routines.map((routine) => (
      <View key={routine.id} style={styles.routineRow}>
        <View style={styles.flex}><Text style={styles.cardTitle}>{routine.name}</Text><Text style={styles.muted}>{routine.exercises.length} exercises · starts with no sets logged</Text></View>
        <View><SmallButton label="Start" onPress={async () => { await workoutRepository.startRoutine(routine); await refresh(); }} /><SmallButton label="Manage" onPress={() => manageRoutine(routine.id)} /></View>
      </View>
    ))}
  </>;
}

function ActiveWorkout({ workout, unit, refresh, openPicker, editSet, removeExercise, nameWorkout }: { workout: WorkoutRecord; unit: LoadUnit; refresh: () => Promise<void>; openPicker: () => void; editSet: (editing: { set: SetRecord; mode: ExerciseMode }) => void; removeExercise: (exercise: ExerciseRecord) => Promise<void>; nameWorkout: () => void }) {
  const setCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const finish = async () => {
    const finished = await workoutRepository.finish(workout);
    if (!finished) {
      Alert.alert('Log a set before finishing', 'An empty workout is kept out of your history and progress.');
      return;
    }
    await refresh();
  };
  return <>
    <Text style={styles.eyebrow}>ACTIVE WORKOUT</Text>
    <View style={styles.titleRow}><Pressable onPress={nameWorkout} accessibilityRole="button" accessibilityLabel="Rename workout" style={({ pressed }) => [styles.workoutTitleButton, pressed && styles.undoPressed]}><Text style={styles.title}>{workout.title}</Text><Text style={styles.renameHint}>Edit name</Text></Pressable><Text style={styles.setCount}>{setCount} sets logged</Text></View>
    <Text style={styles.muted}>This active workout is saved locally and will be ready when you reopen NextSet.</Text>
    {workout.exercises.length === 0 && <View style={styles.emptyPanel}><Text style={styles.cardTitle}>What are you training?</Text><Text style={styles.muted}>Add an exercise, then record the set you actually complete.</Text><Pressable onPress={nameWorkout} accessibilityRole="button" accessibilityLabel="Name workout" style={({ pressed }) => [styles.nameWorkoutPrompt, pressed && styles.undoPressed]}><Text style={styles.nameWorkoutPromptTitle}>Name this workout</Text><Text style={styles.nameWorkoutPromptText}>Push, Pull, Legs, Arms, or a custom name</Text></Pressable></View>}
    {workout.exercises.map((exercise) => <SwipeableRow key={exercise.id} accessibilityLabel={`Remove ${exercise.name}`} actionLabel="Remove" onAction={() => removeExercise(exercise)}><ExerciseCard exercise={exercise} unit={unit} refresh={refresh} editSet={editSet} removeExercise={() => removeExercise(exercise)} /></SwipeableRow>)}
    <OutlineAction label="Add exercise" onPress={openPicker} />
    <Action label="Finish workout" onPress={finish} />
  </>;
}

function ExerciseCard({ exercise, unit, refresh, editSet, removeExercise }: { exercise: ExerciseRecord; unit: LoadUnit; refresh: () => Promise<void>; editSet: (editing: { set: SetRecord; mode: ExerciseMode }) => void; removeExercise: () => Promise<void> }) {
  const [load, setLoad] = useState('');
  const [reps, setReps] = useState('');
  const [seconds, setSeconds] = useState('');
  const log = async () => {
    const parsedReps = Number(reps);
    const parsedLoad = Number(load.replace(',', '.'));
    const parsedSeconds = Number(seconds);
    if (exercise.mode === 'time' && (!Number.isInteger(parsedSeconds) || parsedSeconds <= 0)) return Alert.alert('Enter a whole number of seconds');
    if (exercise.mode !== 'time' && (!Number.isInteger(parsedReps) || parsedReps <= 0)) return Alert.alert('Enter whole-number reps');
    if (exercise.mode === 'weight' && (!Number.isFinite(parsedLoad) || parsedLoad < 0)) return Alert.alert(`Enter a valid load in ${unit}`);
    await workoutRepository.logSet(exercise, { reps: parsedReps, load: parsedLoad, loadUnit: unit, seconds: parsedSeconds });
    setLoad(''); setReps(''); setSeconds('');
    await refresh();
  };
  return <View style={styles.exerciseCard}>
    <View style={styles.cardHeader}><View style={styles.flex}><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></View><View style={styles.exerciseActions}><Text style={styles.setNumber}>{exercise.sets.length} SETS</Text><Pressable onPress={() => safelyRun(removeExercise)} accessibilityRole="button" accessibilityLabel={`Remove ${exercise.name}`} style={({ pressed }) => [styles.removeExerciseButton, pressed && styles.undoPressed]}><Text style={styles.removeExerciseText}>Remove</Text></Pressable></View></View>
    {exercise.sets.map((set, index) => <Pressable onPress={() => editSet({ set, mode: exercise.mode })} accessibilityRole="button" accessibilityLabel={`Edit set ${index + 1}`} style={styles.loggedSet} key={set.id}><Text style={styles.setNumber}>SET {index + 1}</Text><Text style={styles.setValue}>{formatSet(set, exercise.mode, unit)}</Text></Pressable>)}
    <View style={styles.inputs}>
      {exercise.mode === 'weight' && <NumericInput label={unit} value={load} onChangeText={setLoad} />}
      {exercise.mode !== 'time' && <NumericInput label="reps" value={reps} onChangeText={setReps} />}
      {exercise.mode === 'time' && <NumericInput label="seconds" value={seconds} onChangeText={setSeconds} />}
    </View>
    <Action label="Log set" onPress={log} compact />
  </View>;
}

function HistoryView({ history, select, removeWorkout }: { history: WorkoutRecord[]; select: (id: string) => void; removeWorkout: (workout: WorkoutRecord) => Promise<void> }) {
  return <>
    <Text style={styles.eyebrow}>HISTORY</Text><Text style={styles.title}>Your actual workouts.</Text>
    {history.length === 0 ? <View style={styles.emptyPanel}><Text style={styles.cardTitle}>No completed workouts yet</Text><Text style={styles.muted}>Finished workouts will appear here, with exactly the sets you logged.</Text></View> : history.map((workout) => (
      <SwipeableRow key={workout.id} accessibilityLabel={`Delete ${workout.title}`} actionLabel="Delete" onAction={() => removeWorkout(workout)}>
        <Pressable onPress={() => select(workout.id)} accessibilityRole="button" accessibilityLabel={`Open ${workout.title}`} style={styles.historyCard}>
          <Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.muted}>{new Date(workout.completedAt ?? workout.startedAt).toLocaleDateString()} · {workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} sets</Text>
        </Pressable>
      </SwipeableRow>
    ))}
  </>;
}

function ProgressView({ history, unit }: { history: WorkoutRecord[]; unit: LoadUnit }) {
  const progress = useMemo(() => deriveProgress(history), [history]);
  return <>
    <Text style={styles.eyebrow}>PROGRESS</Text><Text style={styles.title}>What your log shows.</Text>
    <Text style={styles.lede}>These are observations from comparable recorded sets, not coaching advice or a fitness score.</Text>
    {progress.length === 0 ? <View style={styles.emptyPanel}><Text style={styles.cardTitle}>Nothing to compare yet</Text><Text style={styles.muted}>Finish a workout to start building a truthful record.</Text></View> : progress.map((record) => <View style={styles.progressCard} key={record.definitionKey}><Text style={styles.cardTitle}>{record.name}</Text><Text style={styles.mode}>{modeLabel(record.mode)}</Text><Text style={styles.muted}>{progressDescription(record, unit)}</Text></View>)}
  </>;
}

function SettingsView({ unit, refresh }: { unit: LoadUnit; refresh: () => Promise<void> }) {
  const exportRecords = async () => {
    const payload = await workoutRepository.exportPayload();
    const file = new File(Paths.cache, `nextset-export-${new Date().toISOString().slice(0, 10)}.json`);
    file.create({ intermediates: true, overwrite: true });
    file.write(payload);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export NextSet workouts' });
      return;
    }
    Alert.alert('Export created', file.uri);
  };
  return <>
    <Text style={styles.eyebrow}>SETTINGS</Text><Text style={styles.title}>Your data, your defaults.</Text>
    <Text style={styles.sectionLabel}>LOAD UNIT</Text><Text style={styles.muted}>Changing units affects display and entry only. Recorded load stays exact.</Text>
    <View style={styles.modeButtons}>{(['kg', 'lb'] as LoadUnit[]).map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: unit === option }} onPress={() => safelyRun(async () => { await workoutRepository.setLoadUnit(option); await refresh(); })} style={[styles.modeButton, unit === option && styles.modeButtonActive]}><Text style={unit === option ? styles.modeButtonTextActive : styles.modeButtonText}>{option.toUpperCase()}</Text></Pressable>)}</View>
    <Text style={styles.sectionLabel}>DATA</Text><Text style={styles.muted}>Export creates a private JSON file you choose where to share. Export does not remove anything from NextSet.</Text>
    <OutlineAction label="Export workouts" onPress={exportRecords} />
    <Text style={styles.muted}>Delete all removes workouts, routines, settings and local audit records from this device.</Text>
    <OutlineAction label="Delete all local data" onPress={() => Alert.alert('Delete all NextSet data?', 'This cannot be undone from the app. Export first if you want a copy.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete all', style: 'destructive', onPress: () => safelyRun(async () => { await workoutRepository.deleteAll(); await refresh(); }) }])} />
  </>;
}

function RoutineDetail({ routine, onClose, refresh }: { routine: RoutineRecord | null; onClose: () => void; refresh: () => Promise<void> }) {
  const [name, setName] = useState('');
  useEffect(() => setName(routine?.name ?? ''), [routine?.id]);
  if (!routine) return null;
  return <SheetModal onClose={onClose} label="routine editor">
    <Text style={styles.eyebrow}>ROUTINE</Text><TextInput value={name} onChangeText={setName} style={styles.titleInput} accessibilityLabel="Routine name" />
    <ScrollView keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} keyboardShouldPersistTaps="handled" onScrollBeginDrag={() => Keyboard.dismiss()}>{routine.exercises.map((exercise) => <View key={`${exercise.definitionKey}-${exercise.position}`} style={styles.detailExercise}><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></View>)}</ScrollView>
    <Action label="Save routine name" onPress={async () => { await workoutRepository.renameRoutine(routine.id, name); await refresh(); }} />
    <OutlineAction label="Delete routine" onPress={() => Alert.alert('Delete this routine?', 'Completed workouts are kept.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => safelyRun(async () => { await workoutRepository.deleteRoutine(routine.id); onClose(); await refresh(); }) }])} />
    <SmallButton label="Close" onPress={onClose} />
  </SheetModal>;
}

function SetEditSheet({ editing, unit, onClose, refresh }: { editing: { set: SetRecord; mode: ExerciseMode } | null; unit: LoadUnit; onClose: () => void; refresh: () => Promise<void> }) {
  const [load, setLoad] = useState('');
  const [reps, setReps] = useState('');
  const [seconds, setSeconds] = useState('');
  useEffect(() => {
    if (!editing) return;
    setLoad(editing.set.loadGrams === null ? '' : String(Number(gramsToLoad(editing.set.loadGrams, unit).toFixed(2))));
    setReps(editing.set.reps === null ? '' : String(editing.set.reps));
    setSeconds(editing.set.durationSeconds === null ? '' : String(editing.set.durationSeconds));
  }, [editing?.set.id, unit]);
  if (!editing) return null;
  const save = async () => {
    const parsedLoad = Number(load.replace(',', '.'));
    const parsedReps = Number(reps);
    const parsedSeconds = Number(seconds);
    await workoutRepository.updateSet(editing.set.id, { reps: reps.trim() === '' ? undefined : parsedReps, load: load.trim() === '' ? undefined : parsedLoad, loadUnit: unit, seconds: seconds.trim() === '' ? undefined : parsedSeconds });
    onClose();
    await refresh();
  };
  return <SheetModal onClose={onClose} label="set editor">
    <ScrollView contentContainerStyle={styles.setEditorContent} keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} keyboardShouldPersistTaps="handled" alwaysBounceVertical onScrollBeginDrag={() => Keyboard.dismiss()}>
      <Text style={styles.eyebrow}>EDIT SET</Text><Text style={styles.title}>{modeLabel(editing.mode)}</Text>
      <View style={styles.inputs}>{editing.mode === 'weight' && <NumericInput label={unit} value={load} onChangeText={setLoad} />}{editing.mode !== 'time' && <NumericInput label="reps" value={reps} onChangeText={setReps} />}{editing.mode === 'time' && <NumericInput label="seconds" value={seconds} onChangeText={setSeconds} />}</View>
      <Action label="Save set" onPress={save} /><OutlineAction label="Delete set" onPress={() => Alert.alert('Delete this set?', 'Progress will be recalculated from the remaining recorded sets.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => safelyRun(async () => { await workoutRepository.deleteSet(editing.set.id); onClose(); await refresh(); }) }])} /><SmallButton label="Cancel" onPress={onClose} />
    </ScrollView>
  </SheetModal>;
}

function WorkoutNameSheet({ workout, savedNames, onClose, onSave }: { workout: WorkoutRecord | null; savedNames: string[]; onClose: () => void; onSave: (workout: WorkoutRecord, name: string) => Promise<void> }) {
  const [customName, setCustomName] = useState('');
  useEffect(() => setCustomName(''), [workout?.id]);
  if (!workout) return null;
  const savedCustomNames = savedNames.filter((name) => !DEFAULT_WORKOUT_NAMES.some((defaultName) => defaultName.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0));
  const saveName = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Enter a workout name first.');
    await onSave(workout, trimmed);
    onClose();
  };
  return <SheetModal onClose={onClose} label="workout name">
    <Text style={styles.eyebrow}>WORKOUT NAME</Text><Text style={styles.title}>What are you training?</Text><Text style={styles.muted}>Naming is optional. It helps you scan your History later.</Text>
    <Text style={styles.sectionLabel}>QUICK CHOICES</Text>
    <View style={styles.nameChoices}>{DEFAULT_WORKOUT_NAMES.map((name) => <Pressable key={name} onPress={() => safelyRun(() => saveName(name))} accessibilityRole="button" style={({ pressed }) => [styles.nameChoice, pressed && styles.undoPressed]}><Text style={styles.nameChoiceText}>{name}</Text></Pressable>)}</View>
    {savedCustomNames.length > 0 && <><Text style={styles.sectionLabel}>YOUR RECENT NAMES</Text><View style={styles.nameChoices}>{savedCustomNames.map((name) => <Pressable key={name} onPress={() => safelyRun(() => saveName(name))} accessibilityRole="button" style={({ pressed }) => [styles.nameChoice, pressed && styles.undoPressed]}><Text style={styles.nameChoiceText}>{name}</Text></Pressable>)}</View></>}
    <Text style={styles.sectionLabel}>CUSTOM NAME</Text><TextInput value={customName} onChangeText={setCustomName} placeholder="e.g. Upper body" placeholderTextColor={COLORS.muted} style={styles.textInput} accessibilityLabel="Custom workout name" returnKeyType="done" onSubmitEditing={() => safelyRun(() => saveName(customName))} />
    <Action label="Save custom name" onPress={() => saveName(customName)} compact /><SmallButton label="Keep as Workout" onPress={onClose} />
  </SheetModal>;
}

function WorkoutDetail({ workout, onClose, onRepeat, onSaveRoutine, unit, onEditSet, onDelete, refresh }: { workout: WorkoutRecord | null; onClose: () => void; onRepeat: () => Promise<void>; onSaveRoutine: () => Promise<void>; unit: LoadUnit; onEditSet: (set: SetRecord, mode: ExerciseMode) => void; onDelete: () => Promise<void>; refresh: () => Promise<void> }) {
  const [title, setTitle] = useState('');
  useEffect(() => setTitle(workout?.title ?? ''), [workout?.id]);
  if (!workout) return null;
  return <SheetModal onClose={onClose} label="completed workout">
    <Text style={styles.eyebrow}>COMPLETED WORKOUT</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.titleInput} accessibilityLabel="Workout name" />
      <SmallButton label="Save name" onPress={async () => { await workoutRepository.renameWorkout(workout.id, title); await refresh(); }} />
      <ScrollView keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} keyboardShouldPersistTaps="handled" onScrollBeginDrag={() => Keyboard.dismiss()}>{workout.exercises.map((exercise) => <View key={exercise.id} style={styles.detailExercise}><Text style={styles.cardTitle}>{exercise.name}</Text>{exercise.sets.map((set, index) => <Pressable key={set.id} onPress={() => onEditSet(set, exercise.mode)} accessibilityRole="button"><Text style={styles.muted}>Set {index + 1} · {formatSet(set, exercise.mode, unit)} · Edit</Text></Pressable>)}</View>)}</ScrollView>
      <Action label="Repeat workout" onPress={onRepeat} /><OutlineAction label="Save as routine" onPress={onSaveRoutine} /><Text style={styles.helper}>Repeat starts a new workout now. Save as routine creates a reusable exercise template.</Text><OutlineAction label="Delete workout" onPress={onDelete} /><SmallButton label="Close" onPress={onClose} />
  </SheetModal>;
}

function ExercisePicker({ visible, onClose, onChoose }: { visible: boolean; onClose: () => void; onChoose: (exercise: Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode'>) => Promise<void> }) {
  const [customName, setCustomName] = useState('');
  const [customMode, setCustomMode] = useState<ExerciseMode>('weight');
  if (!visible) return null;
  return <SheetModal onClose={onClose} label="add exercise">
    <Text style={styles.eyebrow}>ADD EXERCISE</Text><Text style={styles.title}>Choose an exercise</Text>
    <ScrollView keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} keyboardShouldPersistTaps="handled" onScrollBeginDrag={() => Keyboard.dismiss()}>{CATALOGUE_SECTIONS.map((section) => <View key={section.title} style={styles.pickerSection}><Text accessibilityRole="header" style={styles.pickerSectionTitle}>{section.title}</Text>{section.exercises.map((exercise) => <Pressable key={exercise.definitionKey} style={styles.pickerRow} onPress={() => safelyRun(() => onChoose(exercise))}><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></Pressable>)}</View>)}</ScrollView>
    <Text style={styles.sectionLabel}>CUSTOM EXERCISE</Text><TextInput value={customName} onChangeText={setCustomName} placeholder="Exercise name" placeholderTextColor={COLORS.muted} style={styles.textInput} accessibilityLabel="Custom exercise name" />
    <View style={styles.modeButtons}>{(['weight', 'bodyweight', 'time'] as ExerciseMode[]).map((mode) => <Pressable key={mode} onPress={() => setCustomMode(mode)} style={[styles.modeButton, customMode === mode && styles.modeButtonActive]}><Text style={customMode === mode ? styles.modeButtonTextActive : styles.modeButtonText}>{modeLabel(mode)}</Text></Pressable>)}</View>
    <Action label="Add custom exercise" onPress={async () => { if (!customName.trim()) return Alert.alert('Name your exercise first'); await onChoose({ definitionKey: `custom:${makeId()}`, name: customName.trim(), mode: customMode }); setCustomName(''); }} compact />
    <SmallButton label="Cancel" onPress={onClose} />
  </SheetModal>;
}

function safelyRun(action: () => void | Promise<void>) { Promise.resolve(action()).catch((error: unknown) => Alert.alert('Not saved', error instanceof Error ? error.message : 'Please try again. Your existing workout was not changed.')); }
function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const reduceMotion = useReducedMotion();
  const indicator = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion === null) return;
    Animated.timing(indicator, { toValue: active ? 1 : 0, duration: reduceMotion ? 0 : 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [active, indicator, reduceMotion]);
  return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.tab, pressed && reduceMotion === false && styles.pressed]}>
    <Text style={active ? styles.tabActive : styles.tabText}>{label}</Text>
    <Animated.View pointerEvents="none" style={[styles.tabIndicator, { opacity: indicator, transform: [{ scaleX: indicator }] }]} />
  </Pressable>;
}
function Action({ label, onPress, compact = false }: { label: string; onPress: () => void | Promise<void>; compact?: boolean }) { const reduceMotion = useReducedMotion(); return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="button" style={({ pressed }) => [styles.action, compact && styles.actionCompact, pressed && reduceMotion === false && styles.pressed]}><Text style={styles.actionText}>{label}</Text></Pressable>; }
function OutlineAction({ label, onPress }: { label: string; onPress: () => void | Promise<void> }) { const reduceMotion = useReducedMotion(); return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="button" style={({ pressed }) => [styles.outlineAction, pressed && reduceMotion === false && styles.pressed]}><Text style={styles.outlineText}>{label}</Text></Pressable>; }
function SmallButton({ label, onPress }: { label: string; onPress: () => void | Promise<void> }) { const reduceMotion = useReducedMotion(); return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="button" style={({ pressed }) => [styles.smallButton, pressed && reduceMotion === false && styles.pressed]}><Text style={styles.smallButtonText}>{label}</Text></Pressable>; }
function NumericInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) { return <View style={styles.inputWrap}><TextInput value={value} onChangeText={onChangeText} keyboardType="decimal-pad" placeholder={label} placeholderTextColor={COLORS.muted} style={styles.input} accessibilityLabel={label} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} /><Text style={styles.inputLabel}>{label}</Text></View>; }
function modeLabel(mode: ExerciseMode) { return mode === 'weight' ? 'Weight + reps' : mode === 'bodyweight' ? 'Bodyweight + reps' : 'Time'; }

const COLORS = { paper: '#F5F0E6', surface: '#FFFDF8', ink: '#1F211E', muted: '#64665E', line: '#D9D2C5', vermilion: '#A9412C', olive: '#69744B' };
const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.paper },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: COLORS.paper },
  headerSafeArea: { backgroundColor: COLORS.paper },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line },
  wordmark: { color: COLORS.ink, letterSpacing: 2, fontSize: 14, fontWeight: '800' },
  headerNote: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  content: { padding: 20, paddingBottom: 24 },
  eyebrow: { color: COLORS.olive, fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: COLORS.ink, fontSize: 30, lineHeight: 36, fontWeight: '700' },
  workoutTitleButton: { flexShrink: 1, minHeight: 48, justifyContent: 'center' },
  renameHint: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginTop: 1 },
  titleInput: { color: COLORS.ink, fontSize: 28, lineHeight: 36, fontWeight: '700', borderBottomWidth: 1, borderColor: COLORS.ink, minHeight: 48 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  setCount: { color: COLORS.olive, fontSize: 13, fontWeight: '700' },
  lede: { color: COLORS.muted, fontSize: 16, lineHeight: 23 },
  muted: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  sectionLabel: { color: COLORS.ink, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 16 },
  action: { minHeight: 52, borderRadius: 8, backgroundColor: COLORS.vermilion, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  actionCompact: { minHeight: 48 },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  outlineAction: { minHeight: 52, borderWidth: 1, borderColor: COLORS.ink, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  outlineText: { color: COLORS.ink, fontSize: 16, fontWeight: '800' },
  smallButton: { minHeight: 48, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  smallButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  emptyPanel: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, padding: 18, gap: 8 },
  nameWorkoutPrompt: { minHeight: 48, borderTopWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, marginTop: 6, paddingTop: 12 },
  nameWorkoutPromptTitle: { color: COLORS.vermilion, fontSize: 14, fontWeight: '800' },
  nameWorkoutPromptText: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  routineRow: { flexDirection: 'row', gap: 8, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, alignItems: 'center' },
  flex: { flex: 1 },
  cardTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '700' },
  exerciseCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  exerciseActions: { alignItems: 'flex-end', gap: 2 },
  removeExerciseButton: { minHeight: 48, minWidth: 64, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'flex-end' },
  removeExerciseText: { color: COLORS.vermilion, fontSize: 12, fontWeight: '800' },
  mode: { color: COLORS.olive, fontSize: 12, fontWeight: '700', marginTop: 3 },
  setNumber: { color: COLORS.muted, fontSize: 11, fontWeight: '800', letterSpacing: .7 },
  loggedSet: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, paddingTop: 10 },
  setValue: { color: COLORS.ink, fontVariant: ['tabular-nums'], fontWeight: '700' },
  inputs: { flexDirection: 'row', gap: 8 },
  inputWrap: { flex: 1, borderBottomWidth: 1, borderColor: COLORS.ink, paddingBottom: 4 },
  input: { color: COLORS.ink, minHeight: 48, fontSize: 19, fontWeight: '700', padding: 0 },
  inputLabel: { color: COLORS.muted, fontSize: 12 },
  historyCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, padding: 18, gap: 6, shadowColor: COLORS.ink, shadowOpacity: 0.035, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  progressCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, padding: 18, gap: 6 },
  tabSafeArea: { backgroundColor: COLORS.surface, borderTopWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line },
  tabs: { flexDirection: 'row', minHeight: 60, backgroundColor: COLORS.surface, paddingHorizontal: 8 },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  tabActive: { color: COLORS.vermilion, fontSize: 13, fontWeight: '800' },
  tabIndicator: { position: 'absolute', bottom: 5, width: 28, height: 3, borderRadius: 2, backgroundColor: COLORS.vermilion },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#1F211E88' },
  sheetKeyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', backgroundColor: COLORS.paper, paddingHorizontal: 20, gap: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetDragZone: { minHeight: 34, alignItems: 'center', justifyContent: 'center', marginHorizontal: -20 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: COLORS.muted, opacity: 0.55 },
  setEditorContent: { gap: 14 },
  nameChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nameChoice: { minHeight: 48, minWidth: '47%', flexGrow: 1, borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface },
  nameChoiceText: { color: COLORS.ink, fontSize: 15, fontWeight: '800' },
  swipeRow: { overflow: 'hidden', borderRadius: 12, backgroundColor: COLORS.vermilion },
  swipeContent: { backgroundColor: COLORS.paper },
  swipeAction: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 96, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.vermilion, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  swipeActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  undoBar: { position: 'absolute', left: 12, right: 12, minHeight: 52, paddingLeft: 16, paddingRight: 8, borderRadius: 12, backgroundColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: COLORS.ink, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  undoMessage: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', flex: 1 },
  undoButton: { minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  undoButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },
  undoPressed: { opacity: 0.68 },
  detailExercise: { paddingVertical: 11, gap: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line },
  helper: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  pickerRow: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line },
  pickerSection: { paddingTop: 12 },
  pickerSectionTitle: { color: COLORS.olive, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  textInput: { minHeight: 48, color: COLORS.ink, fontSize: 16, borderBottomWidth: 1, borderColor: COLORS.ink },
  modeButtons: { flexDirection: 'row', gap: 6 },
  modeButton: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, justifyContent: 'center', alignItems: 'center', padding: 6 },
  modeButtonActive: { backgroundColor: COLORS.olive, borderColor: COLORS.olive },
  modeButtonText: { color: COLORS.ink, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  modeButtonTextActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
