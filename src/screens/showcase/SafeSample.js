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
          <Text style={styles.errorIcon}>x</Text>
          <Text style={styles.errorMessage} numberOfLines={2}>
            {String(this.state.error.message || this.state.error)}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }

}


const styles = StyleSheet.create({
  fallback: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorIcon: { fontSize: 11, fontWeight: '700', color: '#da1e28', width: 14, textAlign: 'center' },
  errorMessage: { fontSize: 11, color: '#da1e28', flex: 1 }
});
