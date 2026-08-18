// Info: Notes list screen. Consumes the dummy SDK (Lib.Sdk.notes).
// Demonstrates freeform RawBox escape hatch.
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');


export default function NotesList () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const reload = useCallback(function () {
    setLoading(true);
    Lib.Sdk.notes.list().then(function (rows) {
      setNotes(rows); setLoading(false);
    });
  }, [Lib]);

  useEffect(function () {
    reload();
  }, [reload]);

  const addNote = function () {
    if (Lib.Utils.isEmpty(title.trim()) && Lib.Utils.isEmpty(body.trim())) {
      return;
    }
    Lib.Sdk.notes.create(title.trim(), body.trim()).then(function () {
      setTitle(''); setBody(''); reload();
    });
  };

  const remove = function (id) {
    Lib.Sdk.notes.remove(id).then(reload);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.freeform.RawBox style={styles.banner}>
        <C.Text size="sm" weight="semibold" style={styles.bannerText}>freeform.RawBox - opts out of the design system on purpose</C.Text>
      </C.freeform.RawBox>

      <C.Card style={styles.composer}>
        <C.TextInput value={title} onChangeText={setTitle} placeholder="Note title" />
        <C.TextInput value={body} onChangeText={setBody} placeholder="Write something..." multiline style={styles.bodyInput} />
        <C.ButtonPrimary title="Save note" icon="save-outline" onPress={addNote} fullWidth />
      </C.Card>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        notes.map(function (note) {
          return (
            <C.Card key={note.id} style={styles.note}>
              <C.View style={styles.noteHead}>
                <C.Text size="lg" weight="semibold" style={styles.noteTitle}>{note.title}</C.Text>
                <Pressable onPress={function () {
                  remove(note.id);
                }} hitSlop={8}>
                  <C.Icon name="trash-outline" size="md" color="STATUS_DANGER" />
                </Pressable>
              </C.View>
              {note.body ? <C.Text color="text_secondary">{note.body}</C.Text> : null}
              <C.Text size="xs" color="text_muted">Updated {note.updatedAt}</C.Text>
            </C.Card>
          );
        })
      )}

      <Link href="/" asChild>
        <Pressable style={styles.home}><C.Text color="app_primary" weight="medium">Back to launcher</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  banner: { backgroundColor: '#111827', borderRadius: 10, padding: 12 },
  bannerText: { color: '#FBBF24' },
  composer: { gap: 10 },
  bodyInput: { minHeight: 80, textAlignVertical: 'top' },
  loader: { marginTop: 24 },
  note: { gap: 6 },
  noteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  noteTitle: { flex: 1 },
  home: { alignItems: 'center', paddingVertical: 12 }
});
