import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATALOGUE, formatSet, makeId, type ExerciseMode, type ExerciseRecord, type RoutineRecord, type WorkoutRecord } from './src/domain/models';
import { deriveProgress, progressDescription } from './src/domain/progress';
import { workoutRepository } from './src/storage/workoutRepository';

type Tab = 'workouts' | 'history' | 'progress';

export default function App() {
  const [tab, setTab] = useState<Tab>('workouts');
  const [active, setActive] = useState<WorkoutRecord | null>(null);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [routines, setRoutines] = useState<RoutineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextActive, nextHistory, nextRoutines] = await Promise.all([
      workoutRepository.active(),
      workoutRepository.completed(),
      workoutRepository.routines(),
    ]);
    setActive(nextActive);
    setHistory(nextHistory);
    setRoutines(nextRoutines);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setLoading(false);
      Alert.alert('NextSet could not open your workout data', 'Your data was not changed. Please try reopening the app.');
    });
  }, [refresh]);

  const startBlank = async () => {
    await workoutRepository.start();
    await refresh();
  };

  const selectedHistory = history.find((workout) => workout.id === selectedHistoryId) ?? null;

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator color={COLORS.vermilion} /><Text style={styles.muted}>Opening your workout log…</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.wordmark}>NEXTSET</Text>
        <Text style={styles.headerNote}>Your training, saved on this phone</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'workouts' && (active ? (
          <ActiveWorkout workout={active} refresh={refresh} openPicker={() => setPickerOpen(true)} />
        ) : (
          <WorkoutsHome startBlank={startBlank} routines={routines} refresh={refresh} />
        ))}
        {tab === 'history' && <HistoryView history={history} select={setSelectedHistoryId} />}
        {tab === 'progress' && <ProgressView history={history} />}
      </ScrollView>
      <View style={styles.tabs} accessibilityRole="tablist">
        <TabButton label="Workouts" active={tab === 'workouts'} onPress={() => setTab('workouts')} />
        <TabButton label="History" active={tab === 'history'} onPress={() => setTab('history')} />
        <TabButton label="Progress" active={tab === 'progress'} onPress={() => setTab('progress')} />
      </View>
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
      />
    </SafeAreaView>
  );
}

function WorkoutsHome({ startBlank, routines, refresh }: { startBlank: () => Promise<void>; routines: RoutineRecord[]; refresh: () => Promise<void> }) {
  return <>
    <Text style={styles.eyebrow}>WORKOUTS</Text>
    <Text style={styles.title}>Log what you do today.</Text>
    <Text style={styles.lede}>Start with an empty workout. Routines are optional shortcuts, never a requirement.</Text>
    <Action label="Start workout" onPress={startBlank} />
    <Text style={styles.sectionLabel}>YOUR ROUTINES</Text>
    {routines.length === 0 ? <Text style={styles.muted}>Save a finished workout as a routine when you want to reuse its exercise list.</Text> : routines.map((routine) => (
      <View key={routine.id} style={styles.routineRow}>
        <View style={styles.flex}><Text style={styles.cardTitle}>{routine.name}</Text><Text style={styles.muted}>{routine.exercises.length} exercises · starts with no sets logged</Text></View>
        <SmallButton label="Start" onPress={async () => { await workoutRepository.startRoutine(routine); await refresh(); }} />
      </View>
    ))}
  </>;
}

function ActiveWorkout({ workout, refresh, openPicker }: { workout: WorkoutRecord; refresh: () => Promise<void>; openPicker: () => void }) {
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
    <View style={styles.titleRow}><Text style={styles.title}>Workout</Text><Text style={styles.setCount}>{setCount} sets logged</Text></View>
    {workout.exercises.length === 0 && <View style={styles.emptyPanel}><Text style={styles.cardTitle}>What are you training?</Text><Text style={styles.muted}>Add an exercise, then record the set you actually complete.</Text></View>}
    {workout.exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} refresh={refresh} />)}
    <OutlineAction label="Add exercise" onPress={openPicker} />
    <Action label="Finish workout" onPress={finish} />
  </>;
}

function ExerciseCard({ exercise, refresh }: { exercise: ExerciseRecord; refresh: () => Promise<void> }) {
  const [load, setLoad] = useState('');
  const [reps, setReps] = useState('');
  const [seconds, setSeconds] = useState('');
  const log = async () => {
    const parsedReps = Number(reps);
    const parsedLoad = Number(load.replace(',', '.'));
    const parsedSeconds = Number(seconds);
    if (exercise.mode === 'time' && (!Number.isInteger(parsedSeconds) || parsedSeconds <= 0)) return Alert.alert('Enter a whole number of seconds');
    if (exercise.mode !== 'time' && (!Number.isInteger(parsedReps) || parsedReps <= 0)) return Alert.alert('Enter whole-number reps');
    if (exercise.mode === 'weight' && (!Number.isFinite(parsedLoad) || parsedLoad < 0)) return Alert.alert('Enter a valid load in kilograms');
    await workoutRepository.logSet(exercise, { reps: parsedReps, loadKg: parsedLoad, seconds: parsedSeconds });
    setLoad(''); setReps(''); setSeconds('');
    await refresh();
  };
  return <View style={styles.exerciseCard}>
    <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></View><Text style={styles.setNumber}>{exercise.sets.length} SETS</Text></View>
    {exercise.sets.map((set, index) => <View style={styles.loggedSet} key={set.id}><Text style={styles.setNumber}>SET {index + 1}</Text><Text style={styles.setValue}>{formatSet(set, exercise.mode)}</Text></View>)}
    <View style={styles.inputs}>
      {exercise.mode === 'weight' && <NumericInput label="kg" value={load} onChangeText={setLoad} />}
      {exercise.mode !== 'time' && <NumericInput label="reps" value={reps} onChangeText={setReps} />}
      {exercise.mode === 'time' && <NumericInput label="seconds" value={seconds} onChangeText={setSeconds} />}
    </View>
    <Action label="Log set" onPress={log} compact />
  </View>;
}

function HistoryView({ history, select }: { history: WorkoutRecord[]; select: (id: string) => void }) {
  return <>
    <Text style={styles.eyebrow}>HISTORY</Text><Text style={styles.title}>Your actual workouts.</Text>
    {history.length === 0 ? <View style={styles.emptyPanel}><Text style={styles.cardTitle}>No completed workouts yet</Text><Text style={styles.muted}>Finished workouts will appear here, with exactly the sets you logged.</Text></View> : history.map((workout) => (
      <Pressable key={workout.id} onPress={() => select(workout.id)} accessibilityRole="button" accessibilityLabel={`Open ${workout.title}`} style={styles.historyCard}>
        <Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.muted}>{new Date(workout.completedAt ?? workout.startedAt).toLocaleDateString()} · {workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} sets</Text>
      </Pressable>
    ))}
  </>;
}

function ProgressView({ history }: { history: WorkoutRecord[] }) {
  const progress = useMemo(() => deriveProgress(history), [history]);
  return <>
    <Text style={styles.eyebrow}>PROGRESS</Text><Text style={styles.title}>What your log shows.</Text>
    <Text style={styles.lede}>These are observations from comparable recorded sets, not coaching advice or a fitness score.</Text>
    {progress.length === 0 ? <View style={styles.emptyPanel}><Text style={styles.cardTitle}>Nothing to compare yet</Text><Text style={styles.muted}>Finish a workout to start building a truthful record.</Text></View> : progress.map((record) => <View style={styles.progressCard} key={record.definitionKey}><Text style={styles.cardTitle}>{record.name}</Text><Text style={styles.mode}>{modeLabel(record.mode)}</Text><Text style={styles.muted}>{progressDescription(record)}</Text></View>)}
  </>;
}

function WorkoutDetail({ workout, onClose, onRepeat, onSaveRoutine }: { workout: WorkoutRecord | null; onClose: () => void; onRepeat: () => Promise<void>; onSaveRoutine: () => Promise<void> }) {
  if (!workout) return null;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}><View style={styles.sheet}><Text style={styles.eyebrow}>COMPLETED WORKOUT</Text><Text style={styles.title}>{workout.title}</Text>
      <ScrollView>{workout.exercises.map((exercise) => <View key={exercise.id} style={styles.detailExercise}><Text style={styles.cardTitle}>{exercise.name}</Text>{exercise.sets.map((set, index) => <Text key={set.id} style={styles.muted}>Set {index + 1} · {formatSet(set, exercise.mode)}</Text>)}</View>)}</ScrollView>
      <Action label="Repeat workout" onPress={onRepeat} /><OutlineAction label="Save as routine" onPress={onSaveRoutine} /><Text style={styles.helper}>Repeat starts a new workout now. Save as routine creates a reusable exercise template.</Text><SmallButton label="Close" onPress={onClose} />
    </View></View>
  </Modal>;
}

function ExercisePicker({ visible, onClose, onChoose }: { visible: boolean; onClose: () => void; onChoose: (exercise: Pick<ExerciseRecord, 'definitionKey' | 'name' | 'mode'>) => Promise<void> }) {
  const [customName, setCustomName] = useState('');
  const [customMode, setCustomMode] = useState<ExerciseMode>('weight');
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.sheet}>
    <Text style={styles.eyebrow}>ADD EXERCISE</Text><Text style={styles.title}>Choose an exercise</Text>
    <ScrollView>{CATALOGUE.map((exercise) => <Pressable key={exercise.definitionKey} style={styles.pickerRow} onPress={() => safelyRun(() => onChoose(exercise))}><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></Pressable>)}</ScrollView>
    <Text style={styles.sectionLabel}>CUSTOM EXERCISE</Text><TextInput value={customName} onChangeText={setCustomName} placeholder="Exercise name" placeholderTextColor={COLORS.muted} style={styles.textInput} accessibilityLabel="Custom exercise name" />
    <View style={styles.modeButtons}>{(['weight', 'bodyweight', 'time'] as ExerciseMode[]).map((mode) => <Pressable key={mode} onPress={() => setCustomMode(mode)} style={[styles.modeButton, customMode === mode && styles.modeButtonActive]}><Text style={customMode === mode ? styles.modeButtonTextActive : styles.modeButtonText}>{modeLabel(mode)}</Text></Pressable>)}</View>
    <Action label="Add custom exercise" onPress={async () => { if (!customName.trim()) return Alert.alert('Name your exercise first'); await onChoose({ definitionKey: `custom:${makeId()}`, name: customName.trim(), mode: customMode }); setCustomName(''); }} compact />
    <SmallButton label="Cancel" onPress={onClose} />
  </View></View></Modal>;
}

function safelyRun(action: () => void | Promise<void>) { Promise.resolve(action()).catch((error: unknown) => Alert.alert('Not saved', error instanceof Error ? error.message : 'Please try again. Your existing workout was not changed.')); }
function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={styles.tab}><Text style={active ? styles.tabActive : styles.tabText}>{label}</Text></Pressable>; }
function Action({ label, onPress, compact = false }: { label: string; onPress: () => void | Promise<void>; compact?: boolean }) { return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="button" style={[styles.action, compact && styles.actionCompact]}><Text style={styles.actionText}>{label}</Text></Pressable>; }
function OutlineAction({ label, onPress }: { label: string; onPress: () => void | Promise<void> }) { return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="button" style={styles.outlineAction}><Text style={styles.outlineText}>{label}</Text></Pressable>; }
function SmallButton({ label, onPress }: { label: string; onPress: () => void | Promise<void> }) { return <Pressable onPress={() => safelyRun(onPress)} accessibilityRole="button" style={styles.smallButton}><Text style={styles.smallButtonText}>{label}</Text></Pressable>; }
function NumericInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) { return <View style={styles.inputWrap}><TextInput value={value} onChangeText={onChangeText} keyboardType="decimal-pad" placeholder={label} placeholderTextColor={COLORS.muted} style={styles.input} accessibilityLabel={label} /><Text style={styles.inputLabel}>{label}</Text></View>; }
function modeLabel(mode: ExerciseMode) { return mode === 'weight' ? 'Weight + reps' : mode === 'bodyweight' ? 'Bodyweight + reps' : 'Time'; }

const COLORS = { paper: '#F5F0E6', surface: '#FFFDF8', ink: '#1F211E', muted: '#64665E', line: '#D9D2C5', vermilion: '#A9412C', olive: '#69744B' };
const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.paper }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: COLORS.paper }, header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line }, wordmark: { color: COLORS.ink, letterSpacing: 2, fontSize: 14, fontWeight: '800' }, headerNote: { color: COLORS.muted, fontSize: 12, marginTop: 3 }, content: { padding: 20, paddingBottom: 110, gap: 16 }, eyebrow: { color: COLORS.olive, fontSize: 12, fontWeight: '800', letterSpacing: 1.3 }, title: { color: COLORS.ink, fontSize: 30, lineHeight: 36, fontWeight: '700' }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, setCount: { color: COLORS.olive, fontSize: 13, fontWeight: '700' }, lede: { color: COLORS.muted, fontSize: 16, lineHeight: 23 }, muted: { color: COLORS.muted, fontSize: 14, lineHeight: 20 }, sectionLabel: { color: COLORS.ink, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 16 }, action: { minHeight: 52, borderRadius: 4, backgroundColor: COLORS.vermilion, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, actionCompact: { minHeight: 48 }, actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }, outlineAction: { minHeight: 52, borderWidth: 1, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, outlineText: { color: COLORS.ink, fontSize: 16, fontWeight: '800' }, smallButton: { minHeight: 48, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, smallButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' }, emptyPanel: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 18, gap: 8 }, routineRow: { flexDirection: 'row', gap: 8, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, alignItems: 'center' }, flex: { flex: 1 }, cardTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '700' }, exerciseCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 16, gap: 12 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, mode: { color: COLORS.olive, fontSize: 12, fontWeight: '700', marginTop: 3 }, setNumber: { color: COLORS.muted, fontSize: 11, fontWeight: '800', letterSpacing: .7 }, loggedSet: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, paddingTop: 10 }, setValue: { color: COLORS.ink, fontVariant: ['tabular-nums'], fontWeight: '700' }, inputs: { flexDirection: 'row', gap: 8 }, inputWrap: { flex: 1, borderBottomWidth: 1, borderColor: COLORS.ink, paddingBottom: 4 }, input: { color: COLORS.ink, minHeight: 48, fontSize: 19, fontWeight: '700', padding: 0 }, inputLabel: { color: COLORS.muted, fontSize: 12 }, historyCard: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.line, paddingVertical: 16, gap: 5 }, progressCard: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.line, paddingVertical: 16, gap: 5 }, tabs: { flexDirection: 'row', minHeight: 64, borderTopWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingBottom: 4 }, tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' }, tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' }, tabActive: { color: COLORS.vermilion, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' }, modalBackdrop: { flex: 1, backgroundColor: '#1F211E88', justifyContent: 'flex-end' }, sheet: { maxHeight: '90%', backgroundColor: COLORS.paper, padding: 20, gap: 14, borderTopLeftRadius: 16, borderTopRightRadius: 16 }, detailExercise: { paddingVertical: 11, gap: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line }, helper: { color: COLORS.muted, fontSize: 13, lineHeight: 19 }, pickerRow: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line }, textInput: { minHeight: 48, color: COLORS.ink, fontSize: 16, borderBottomWidth: 1, borderColor: COLORS.ink }, modeButtons: { flexDirection: 'row', gap: 6 }, modeButton: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: COLORS.line, justifyContent: 'center', alignItems: 'center', padding: 6 }, modeButtonActive: { backgroundColor: COLORS.olive, borderColor: COLORS.olive }, modeButtonText: { color: COLORS.ink, fontSize: 12, fontWeight: '700', textAlign: 'center' }, modeButtonTextActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
