// Info: Notes list screen. Consumes the dummy SDK (Lib.Sdk.notes).
// Demonstrates freeform RawBox escape hatch.
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';


export default function NotesList () {

  // Resolve the live lib, navigation helpers, and themed components for rendering
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();

  // Hold the notes list, loading flag, and composer field values in local state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Reload notes from the SDK, toggling the loading flag around the fetch
  const reload = useCallback(function () {
    // Show the loading indicator while fetching
    setLoading(true);
    // Fetch the list and update state once resolved
    Lib.Sdk.notes.list().then(function (rows) {
      setNotes(rows); setLoading(false);
    });
  }, [Lib]);

  // Load notes on mount and whenever reload changes
  useEffect(function () {
    reload();
  }, [reload]);

  // Create a new note from the composer fields, skipping empty submissions
  const addNote = function () {
    // Bail out if both fields are empty so we never create blank notes
    if (Lib.Utils.isEmpty(title.trim()) && Lib.Utils.isEmpty(body.trim())) {
      // Skip creation when there is nothing to save
      return;
    }
    // Persist the note, then clear the composer and reload
    Lib.Sdk.notes.create(title.trim(), body.trim()).then(function () {
      setTitle(''); setBody(''); reload();
    });
  };

  // Delete a note by id and reload the list
  const remove = function (id) {
    Lib.Sdk.notes.remove(id).then(reload);
  };

  // Render the notes screen with composer, list, and back link
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.freeform.RawBox style={styles.banner}>
        <C.Text typeSet="caption02" weight="semibold" style={styles.bannerText}>freeform.RawBox - opts out of the design system on purpose</C.Text>
      </C.freeform.RawBox>

      <C.View background="layer_02" radius="radius_08" border={true} style={styles.composer}>
        <C.TextInput value={title} onChangeText={setTitle} placeholder="Note title" />
        <C.TextInput value={body} onChangeText={setBody} placeholder="Write something..." multiline style={styles.bodyInput} />
        <C.Button kind="primary" onPress={addNote} fullWidth><C.Text color="text_on_color">Save note</C.Text></C.Button>
      </C.View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        notes.map(function (note) {
          // Render one card per note with title, body, and delete action
          return (
            <C.View key={note.id} background="layer_02" radius="radius_08" border={true} style={styles.note}>
              <C.View style={styles.noteHead}>
                <C.Text typeSet="heading02" weight="semibold" style={styles.noteTitle}>{note.title}</C.Text>
                <Pressable onPress={function () {
                  // Remove the note when the trash icon is pressed
                  remove(note.id);
                }} hitSlop={8}>
                  <C.Icon name="trash-outline" size="md" color="support_error" />
                </Pressable>
              </C.View>
              {note.body ? <C.Text color="text_secondary">{note.body}</C.Text> : null}
              <C.Text typeSet="caption01" color="text_secondary">Updated {note.updatedAt}</C.Text>
            </C.View>
          );
        })
      )}

      <Link href="/" asChild>
        <Pressable style={styles.home}><C.Text color="interactive" weight="medium">Back to launcher</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  banner: { backgroundColor: '#111827', borderRadius: 10, padding: 12 },
  bannerText: { color: '#FBBF24' },
  composer: { gap: 10, padding: 16 },
  bodyInput: { minHeight: 80, textAlignVertical: 'top' },
  loader: { marginTop: 24 },
  note: { gap: 6, padding: 16 },
  noteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  noteTitle: { flex: 1 },
  home: { alignItems: 'center', paddingVertical: 12 }
});
