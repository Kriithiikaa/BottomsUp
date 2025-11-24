import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import FeedItem from '../features/FeedItem';
import { getSavedEvents, SavedEvent, subscribeSavedEvents } from '../constants/storage';

export default function SavedScreen() {
  const [items, setItems] = useState<SavedEvent[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadSaved = async () => {
      const list = await getSavedEvents();
      if (mounted) setItems(list);
    };

    loadSaved();
    const unsubscribe = subscribeSavedEvents((list) => {
      if (mounted) setItems(list);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Events</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <FeedItem
            id={item.id}
            title={item.title || ''}
            subtitle={item.subtitle}
            location={item.location}
            image={item.image}
            onPress={() => {}}
            onShare={() => {}}
            saved
          />
        )}
        ListEmptyComponent={() => <Text style={styles.empty}>No saved events yet.</Text>}
        contentContainerStyle={items.length === 0 ? styles.emptyWrap : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, backgroundColor: '#f6f7f9' },
  header: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  emptyWrap: { flex: 1 },
});
