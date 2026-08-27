// Info: Tasks list screen. Consumes the dummy SDK (Lib.Sdk.tasks).
// Add/toggle/delete tasks; live retheme via updateTheme().
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';


import { useLib } from '../../app-core/contexts/lib-context.js';

const ACCENTS = ['#4F46E5', '#7C3AED', '#DB2777', '#EA580C', '#0EA5E9'];


export default function TasksList () {

  // Resolve the live lib, navigation helpers, themed components, and theme controller
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const ctl = Lib.ThemeContext.useThemeController();

  // Hold the tasks list, loading flag, draft input, and accent color index in local state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [accentIndex, setAccentIndex] = useState(0);

  // Reload tasks from the SDK, toggling the loading flag around the fetch
  const reload = useCallback(function () {
    // Show the loading indicator while fetching
    setLoading(true);
    // Fetch the list and update state once resolved
    Lib.Sdk.tasks.list().then(function (rows) {
      setTasks(rows);
      setLoading(false);
    });
  }, [Lib]);

  // Load tasks on mount and whenever reload changes
  useEffect(function () {
    reload();
  }, [reload]);

  // Create a new task from the draft, skipping empty submissions
  const addTask = function () {
    // Bail out if the draft is empty so we never create blank tasks
    if (Lib.Utils.isEmpty(draft.trim())) {
      // Skip creation when there is nothing to save
      return;
    }
    // Persist the task, then clear the draft and reload
    Lib.Sdk.tasks.create(draft.trim()).then(function () {
      setDraft(''); reload();
    });
  };

  // Toggle a task's done state and reload
  const toggle = function (id) {
    Lib.Sdk.tasks.toggle(id).then(reload);
  };
  // Delete a task by id and reload
  const remove = function (id) {
    Lib.Sdk.tasks.remove(id).then(reload);
  };

  // Cycle through accent colors and apply a live retheme
  const shuffleAccent = function () {
    const next = (accentIndex + 1) % ACCENTS.length;
    setAccentIndex(next);
    ctl.updateTheme({ color: { primary: ACCENTS[next] }, font: Lib.Themes.tasks.font });
  };

  // Render the tasks screen with input, accent shuffle, list, and back link
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.View style={styles.addRow}>
        <C.TextInput value={draft} onChangeText={setDraft} placeholder="Add a task..." style={styles.input} onSubmitEditing={addTask} returnKeyType="done" />
        <C.ButtonPrimary title="Add" icon="add" onPress={addTask} />
      </C.View>

      <C.variant.ButtonPrimaryTypeA title="Shuffle accent (live retheme)" icon="color-palette-outline" onPress={shuffleAccent} fullWidth />

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <C.Card style={styles.list}>
          {tasks.map(function (task, idx) {
            // Render one row per task with toggle, title, and delete action
            return (
              <C.View key={task.id} style={[styles.row, idx > 0 ? styles.rowDivider : null]}>
                <Pressable onPress={function () {
                  // Toggle the task's done state when the checkbox is pressed
                  toggle(task.id);
                }} style={styles.check}>
                  <C.Icon name={task.done ? 'checkbox' : 'square-outline'} size="lg" color={task.done ? 'APP_PRIMARY' : 'TEXT_MUTED'} />
                </Pressable>
                <C.Text style={[styles.rowTitle, task.done ? styles.done : null]} color={task.done ? 'text_muted' : 'text_primary'}>{task.title}</C.Text>
                <Pressable onPress={function () {
                  // Remove the task when the trash icon is pressed
                  remove(task.id);
                }} hitSlop={8}>
                  <C.Icon name="trash-outline" size="md" color="STATUS_DANGER" />
                </Pressable>
              </C.View>
            );
          })}
          {tasks.length === 0 ? <C.Text color="text_secondary">No tasks yet - add one above.</C.Text> : null}
        </C.Card>
      )}

      <Link href="/" asChild>
        <Pressable style={styles.home}><C.Text color="app_primary" weight="medium">Back to launcher</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1 },
  loader: { marginTop: 24 },
  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  rowTitle: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  check: {},
  home: { alignItems: 'center', paddingVertical: 12 }
});
