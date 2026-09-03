// Info: Virtualized row list for the showcase galleries. Every gallery holds
// its whole roster, so the list must mount rows lazily: an eager ScrollView
// instantiates every Carbon component on mount, which is the memory cost the
// galleries were paying. FlatList windows the roster and keeps the scroll
// surface identical, so no component leaves the page.
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';


// Read one row's stable key from its descriptor
function keyExtractor (item) {

  // Return the descriptor key so FlatList can identify the row across windows
  return item.key;

}


export default function GalleryList ({ rows, renderRow, header, footer, testID }) {

  // Adapt the descriptor to the FlatList renderItem signature
  const renderItem = React.useCallback(function (info) {

    // Return the caller's rendered row for this descriptor
    return renderRow(info.item);

  }, [renderRow]);

  // Render the windowed list with the gallery's header and footer attached
  return (
    <FlatList
      testID={testID}
      data={rows}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews={false}
      contentContainerStyle={styles.content}
    />
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 960, width: '100%', alignSelf: 'center' }
});
