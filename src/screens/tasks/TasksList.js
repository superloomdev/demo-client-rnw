// Info: Tasks list screen. Consumes the dummy SDK (Lib.Sdk.tasks).
// Add/toggle/delete tasks; live retheme via updateTheme().
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';


import { useLib } from '../../app-core/contexts/lib-context.js';


export default function TasksList () {

  // Resolve the live lib, navigation helpers, themed components, and theme controller
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const ctl = Lib.ThemeContext.useThemeController();

  // Hold the tasks list, loading flag, and draft input in local state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');

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

  // Apply the tasks brand layer as a live retheme
  const shuffleAccent = function () {
    ctl.updateBrand('tasks');
  };

  // Resolve the divider color from the theme token
  const dividerColor = ctl && ctl.theme ? ctl.theme['color.border_subtle_01'] : null;

  // Render the tasks screen with header, input, list, and back link
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.View style={styles.header}>
        <C.Text size="xl" weight="semibold" color="text_primary">Tasks</C.Text>
        <C.Text size="sm" color="text_secondary">Track things you need to do.</C.Text>
      </C.View>

      <C.View style={styles.addRow}>
        <C.TextInput value={draft} onChangeText={setDraft} placeholder="Add a task..." style={styles.input} onSubmitEditing={addTask} returnKeyType="done" />
        <C.Button kind="primary" onPress={addTask}><C.Text color="text_on_color">Add</C.Text></C.Button>
      </C.View>

      <C.variant.ButtonPrimaryOutlined title="Shuffle accent" onPress={shuffleAccent} fullWidth />

      {loading ? (
        <C.View style={styles.loader}>
          <C.Text color="text_secondary">Loading...</C.Text>
        </C.View>
      ) : (
        <C.View background="layer_02" radius="radius_08" border={true} style={styles.list}>
          {tasks.map(function (task, idx) {
            // Render one row per task with toggle, title, and delete action
            return (
              <C.View key={task.id} style={[styles.row, idx > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: dividerColor } : null]}>
                <Pressable onPress={function () {
                  // Toggle the task's done state when the checkbox is pressed
                  toggle(task.id);
                }} hitSlop={8} style={styles.check}>
                  <C.Icon name={task.done ? 'checkbox' : 'checkbox_unchecked'} size="lg" color={task.done ? 'interactive' : 'text_secondary'} />
                </Pressable>
                <C.Text style={[styles.rowTitle, task.done ? styles.done : null]} color={task.done ? 'text_secondary' : 'text_primary'}>{task.title}</C.Text>
                <Pressable onPress={function () {
                  // Remove the task when the trash icon is pressed
                  remove(task.id);
                }} hitSlop={8}>
                  <C.Icon name="trash" size="md" color="support_error" />
                </Pressable>
              </C.View>
            );
          })}
          {Lib.Utils.isEmptyArray(tasks) ? <C.View style={styles.empty}><C.Text color="text_secondary">No tasks yet. Add one above.</C.Text></C.View> : null}
        </C.View>
      )}

      <Link href="/" asChild>
        <Pressable style={styles.home}><C.Text color="interactive" weight="medium">Back to launcher</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { gap: 4 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1 },
  loader: { alignItems: 'center', paddingVertical: 24 },
  list: { gap: 0, padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowTitle: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  check: { padding: 4 },
  empty: { paddingVertical: 24, alignItems: 'center' },
  home: { alignItems: 'center', paddingVertical: 16 }
});
