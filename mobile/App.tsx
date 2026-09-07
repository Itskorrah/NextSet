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
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CATALOGUE, formatSet, gramsToLoad, makeId, type ExerciseMode, type ExerciseRecord, type LoadUnit, type RoutineRecord, type SetRecord, type WorkoutRecord } from './src/domain/models';
import { deriveProgress, progressDescription } from './src/domain/progress';
import { workoutRepository } from './src/storage/workoutRepository';

type Tab = 'workouts' | 'history' | 'progress' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('workouts');
  const [active, setActive] = useState<WorkoutRecord | null>(null);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [routines, setRoutines] = useState<RoutineRecord[]>([]);
  const [loadUnit, setLoadUnit] = useState<LoadUnit>('kg');
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<{ set: SetRecord; mode: ExerciseMode } | null>(null);

  const refresh = useCallback(async () => {
    const [nextActive, nextHistory, nextRoutines, settings] = await Promise.all([
      workoutRepository.active(),
      workoutRepository.completed(),
      workoutRepository.routines(),
      workoutRepository.settings(),
    ]);
    setActive(nextActive);
    setHistory(nextHistory);
    setRoutines(nextRoutines);
    setLoadUnit(settings.loadUnit);
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
          <ActiveWorkout workout={active} unit={loadUnit} refresh={refresh} openPicker={() => setPickerOpen(true)} editSet={setEditingSet} />
        ) : (
          <WorkoutsHome startBlank={startBlank} routines={routines} refresh={refresh} manageRoutine={setSelectedRoutineId} />
        ))}
        {tab === 'history' && <HistoryView history={history} select={setSelectedHistoryId} />}
        {tab === 'progress' && <ProgressView history={history} unit={loadUnit} />}
        {tab === 'settings' && <SettingsView unit={loadUnit} refresh={refresh} />}
      </ScrollView>
      <View style={styles.tabs} accessibilityRole="tablist">
        <TabButton label="Workouts" active={tab === 'workouts'} onPress={() => setTab('workouts')} />
        <TabButton label="History" active={tab === 'history'} onPress={() => setTab('history')} />
        <TabButton label="Progress" active={tab === 'progress'} onPress={() => setTab('progress')} />
        <TabButton label="Settings" active={tab === 'settings'} onPress={() => setTab('settings')} />
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
        unit={loadUnit}
        onEditSet={(set, mode) => setEditingSet({ set, mode })}
        onDelete={async () => {
          if (!selectedHistory) return;
          await workoutRepository.deleteWorkout(selectedHistory.id);
          setSelectedHistoryId(null);
          await refresh();
        }}
        refresh={refresh}
      />
      <RoutineDetail routine={routines.find((routine) => routine.id === selectedRoutineId) ?? null} onClose={() => setSelectedRoutineId(null)} refresh={refresh} />
      <SetEditSheet editing={editingSet} unit={loadUnit} onClose={() => setEditingSet(null)} refresh={refresh} />
    </SafeAreaView>
  );
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

function ActiveWorkout({ workout, unit, refresh, openPicker, editSet }: { workout: WorkoutRecord; unit: LoadUnit; refresh: () => Promise<void>; openPicker: () => void; editSet: (editing: { set: SetRecord; mode: ExerciseMode }) => void }) {
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
    <View style={styles.titleRow}><Text style={styles.title}>{workout.title}</Text><Text style={styles.setCount}>{setCount} sets logged</Text></View>
    <Text style={styles.muted}>This active workout is saved locally and will be ready when you reopen NextSet.</Text>
    {workout.exercises.length === 0 && <View style={styles.emptyPanel}><Text style={styles.cardTitle}>What are you training?</Text><Text style={styles.muted}>Add an exercise, then record the set you actually complete.</Text></View>}
    {workout.exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} unit={unit} refresh={refresh} editSet={editSet} />)}
    <OutlineAction label="Add exercise" onPress={openPicker} />
    <Action label="Finish workout" onPress={finish} />
  </>;
}

function ExerciseCard({ exercise, unit, refresh, editSet }: { exercise: ExerciseRecord; unit: LoadUnit; refresh: () => Promise<void>; editSet: (editing: { set: SetRecord; mode: ExerciseMode }) => void }) {
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
    <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></View><Text style={styles.setNumber}>{exercise.sets.length} SETS</Text></View>
    {exercise.sets.map((set, index) => <Pressable onPress={() => editSet({ set, mode: exercise.mode })} accessibilityRole="button" accessibilityLabel={`Edit set ${index + 1}`} style={styles.loggedSet} key={set.id}><Text style={styles.setNumber}>SET {index + 1}</Text><Text style={styles.setValue}>{formatSet(set, exercise.mode, unit)}</Text></Pressable>)}
    <View style={styles.inputs}>
      {exercise.mode === 'weight' && <NumericInput label={unit} value={load} onChangeText={setLoad} />}
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
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.sheet}>
    <Text style={styles.eyebrow}>ROUTINE</Text><TextInput value={name} onChangeText={setName} style={styles.titleInput} accessibilityLabel="Routine name" />
    <ScrollView>{routine.exercises.map((exercise) => <View key={`${exercise.definitionKey}-${exercise.position}`} style={styles.detailExercise}><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.mode}>{modeLabel(exercise.mode)}</Text></View>)}</ScrollView>
    <Action label="Save routine name" onPress={async () => { await workoutRepository.renameRoutine(routine.id, name); await refresh(); }} />
    <OutlineAction label="Delete routine" onPress={() => Alert.alert('Delete this routine?', 'Completed workouts are kept.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => safelyRun(async () => { await workoutRepository.deleteRoutine(routine.id); onClose(); await refresh(); }) }])} />
    <SmallButton label="Close" onPress={onClose} />
  </View></View></Modal>;
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
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.sheet}>
    <Text style={styles.eyebrow}>EDIT SET</Text><Text style={styles.title}>{modeLabel(editing.mode)}</Text>
    <View style={styles.inputs}>{editing.mode === 'weight' && <NumericInput label={unit} value={load} onChangeText={setLoad} />}{editing.mode !== 'time' && <NumericInput label="reps" value={reps} onChangeText={setReps} />}{editing.mode === 'time' && <NumericInput label="seconds" value={seconds} onChangeText={setSeconds} />}</View>
    <Action label="Save set" onPress={save} /><OutlineAction label="Delete set" onPress={() => Alert.alert('Delete this set?', 'Progress will be recalculated from the remaining recorded sets.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => safelyRun(async () => { await workoutRepository.deleteSet(editing.set.id); onClose(); await refresh(); }) }])} /><SmallButton label="Cancel" onPress={onClose} />
  </View></View></Modal>;
}

function WorkoutDetail({ workout, onClose, onRepeat, onSaveRoutine, unit, onEditSet, onDelete, refresh }: { workout: WorkoutRecord | null; onClose: () => void; onRepeat: () => Promise<void>; onSaveRoutine: () => Promise<void>; unit: LoadUnit; onEditSet: (set: SetRecord, mode: ExerciseMode) => void; onDelete: () => Promise<void>; refresh: () => Promise<void> }) {
  const [title, setTitle] = useState('');
  useEffect(() => setTitle(workout?.title ?? ''), [workout?.id]);
  if (!workout) return null;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}><View style={styles.sheet}><Text style={styles.eyebrow}>COMPLETED WORKOUT</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.titleInput} accessibilityLabel="Workout name" />
      <SmallButton label="Save name" onPress={async () => { await workoutRepository.renameWorkout(workout.id, title); await refresh(); }} />
      <ScrollView>{workout.exercises.map((exercise) => <View key={exercise.id} style={styles.detailExercise}><Text style={styles.cardTitle}>{exercise.name}</Text>{exercise.sets.map((set, index) => <Pressable key={set.id} onPress={() => onEditSet(set, exercise.mode)} accessibilityRole="button"><Text style={styles.muted}>Set {index + 1} · {formatSet(set, exercise.mode, unit)} · Edit</Text></Pressable>)}</View>)}</ScrollView>
      <Action label="Repeat workout" onPress={onRepeat} /><OutlineAction label="Save as routine" onPress={onSaveRoutine} /><Text style={styles.helper}>Repeat starts a new workout now. Save as routine creates a reusable exercise template.</Text><OutlineAction label="Delete workout" onPress={() => Alert.alert('Delete this workout?', 'This removes its recorded sets and changes your progress.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => safelyRun(onDelete) }])} /><SmallButton label="Close" onPress={onClose} />
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
  app: { flex: 1, backgroundColor: COLORS.paper }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: COLORS.paper }, header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line }, wordmark: { color: COLORS.ink, letterSpacing: 2, fontSize: 14, fontWeight: '800' }, headerNote: { color: COLORS.muted, fontSize: 12, marginTop: 3 }, content: { padding: 20, paddingBottom: 110, gap: 16 }, eyebrow: { color: COLORS.olive, fontSize: 12, fontWeight: '800', letterSpacing: 1.3 }, title: { color: COLORS.ink, fontSize: 30, lineHeight: 36, fontWeight: '700' }, titleInput: { color: COLORS.ink, fontSize: 28, lineHeight: 36, fontWeight: '700', borderBottomWidth: 1, borderColor: COLORS.ink, minHeight: 48 }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, setCount: { color: COLORS.olive, fontSize: 13, fontWeight: '700' }, lede: { color: COLORS.muted, fontSize: 16, lineHeight: 23 }, muted: { color: COLORS.muted, fontSize: 14, lineHeight: 20 }, sectionLabel: { color: COLORS.ink, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 16 }, action: { minHeight: 52, borderRadius: 4, backgroundColor: COLORS.vermilion, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, actionCompact: { minHeight: 48 }, actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }, outlineAction: { minHeight: 52, borderWidth: 1, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, outlineText: { color: COLORS.ink, fontSize: 16, fontWeight: '800' }, smallButton: { minHeight: 48, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, smallButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' }, emptyPanel: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 18, gap: 8 }, routineRow: { flexDirection: 'row', gap: 8, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, alignItems: 'center' }, flex: { flex: 1 }, cardTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '700' }, exerciseCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 16, gap: 12 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, mode: { color: COLORS.olive, fontSize: 12, fontWeight: '700', marginTop: 3 }, setNumber: { color: COLORS.muted, fontSize: 11, fontWeight: '800', letterSpacing: .7 }, loggedSet: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, paddingTop: 10 }, setValue: { color: COLORS.ink, fontVariant: ['tabular-nums'], fontWeight: '700' }, inputs: { flexDirection: 'row', gap: 8 }, inputWrap: { flex: 1, borderBottomWidth: 1, borderColor: COLORS.ink, paddingBottom: 4 }, input: { color: COLORS.ink, minHeight: 48, fontSize: 19, fontWeight: '700', padding: 0 }, inputLabel: { color: COLORS.muted, fontSize: 12 }, historyCard: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.line, paddingVertical: 16, gap: 5 }, progressCard: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.line, paddingVertical: 16, gap: 5 }, tabs: { flexDirection: 'row', minHeight: 64, borderTopWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingBottom: 4 }, tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' }, tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' }, tabActive: { color: COLORS.vermilion, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' }, modalBackdrop: { flex: 1, backgroundColor: '#1F211E88', justifyContent: 'flex-end' }, sheet: { maxHeight: '90%', backgroundColor: COLORS.paper, padding: 20, gap: 14, borderTopLeftRadius: 16, borderTopRightRadius: 16 }, detailExercise: { paddingVertical: 11, gap: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line }, helper: { color: COLORS.muted, fontSize: 13, lineHeight: 19 }, pickerRow: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line }, textInput: { minHeight: 48, color: COLORS.ink, fontSize: 16, borderBottomWidth: 1, borderColor: COLORS.ink }, modeButtons: { flexDirection: 'row', gap: 6 }, modeButton: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: COLORS.line, justifyContent: 'center', alignItems: 'center', padding: 6 }, modeButtonActive: { backgroundColor: COLORS.olive, borderColor: COLORS.olive }, modeButtonText: { color: COLORS.ink, fontSize: 12, fontWeight: '700', textAlign: 'center' }, modeButtonTextActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
