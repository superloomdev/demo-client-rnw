// Info: Per-component error boundary for the showcase galleries. Many Carbon
// components require specific props or children to render (Tabs needs Tab
// children, DataTable needs columns/rows, etc.), so rendering every registry
// entry with minimal props will throw for some. This boundary isolates each
// sample so one crashing component never takes down the whole gallery — it
// shows a neutral fallback instead.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default class SafeSample extends React.Component {

  constructor (props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError (error) {
    return { error: error };
  }

  componentDidCatch (error, info) { // eslint-disable-line no-unused-vars
    // Swallowed on purpose — the fallback UI is the showcase signal that a
    // component needs specific props to render.
  }

  render () {

    if (this.state.error) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>{this.props.name}</Text>
          <Text style={styles.fallbackNote}>Renders with required props</Text>
        </View>
      );
    }

    return this.props.children;
  }

}


const styles = StyleSheet.create({
  fallback: { padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', borderRadius: 8, gap: 2 },
  fallbackTitle: { fontSize: 13, fontWeight: '600', color: '#161616' },
  fallbackNote: { fontSize: 12, color: '#8d8d8d' }
});
