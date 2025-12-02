import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FeedItem from '../features/FeedItem';
import EventDetailsModal from '../features/EventDetailsModal';
import { EVENTS } from '../constants/Events';
import {
  getSavedEvents,
  getRsvpedEvents,
  SavedEvent,
  subscribeSavedEvents,
  subscribeRsvpedEvents,
  removeSavedEvent,
  removeRsvpedEvent,
} from '../constants/storage';

export default function SavedScreen() {
  const [savedItems, setSavedItems] = useState<SavedEvent[]>([]);
  const [rsvpedItems, setRsvpedItems] = useState<SavedEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'rsvped'>('saved');
  const [selected, setSelected] = useState<SavedEvent | null>(null);

  const handleSwipeRemove = (item: SavedEvent) => {
    if (!item.id) return;
    if (activeTab === 'saved') {
      setSavedItems((prev) => prev.filter((x) => x.id !== item.id));
      removeSavedEvent(item.id);
    } else {
      setRsvpedItems((prev) => prev.filter((x) => x.id !== item.id));
      removeRsvpedEvent(item.id);
    }
    if (selected?.id === item.id) {
      setSelected(null);
    }
  };

  const selectedFull = useMemo(() => {
    if (!selected) return null;
    const event = EVENTS.find((e) => e.id === selected.id);
    return {
      ...selected,
      title: selected.title || event?.title,
      subtitle: selected.subtitle || event?.date,
      location: selected.location || event?.location,
      image: selected.image || event?.image,
      description: event?.description,
      tags: event?.category ? [event.category] : undefined,
    };
  }, [selected]);

  useEffect(() => {
    let mounted = true;

    const loadSaved = async () => {
      const [savedList, rsvpedList] = await Promise.all([getSavedEvents(), getRsvpedEvents()]);
      if (!mounted) return;
      setSavedItems(savedList);
      setRsvpedItems(rsvpedList);
    };

    loadSaved();
    const unsubSaved = subscribeSavedEvents((list) => {
      if (mounted) setSavedItems(list);
    });
    const unsubRsvped = subscribeRsvpedEvents((list) => {
      if (mounted) setRsvpedItems(list);
    });

    return () => {
      mounted = false;
      unsubSaved();
      unsubRsvped();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.tabWrap}>
        <View style={styles.tabBg}>
          <TouchableOpacity
            style={[styles.tabBtn, styles.tabLeft, activeTab === 'saved' && styles.tabBtnActive]}
            onPress={() => setActiveTab('saved')}
            activeOpacity={0.9}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, styles.tabRight, activeTab === 'rsvped' && styles.tabBtnActive]}
            onPress={() => setActiveTab('rsvped')}
            activeOpacity={0.9}
          >
            <Text style={[styles.tabText, activeTab === 'rsvped' && styles.tabTextActive]}>RSVP'd</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.header}>{activeTab === 'saved' ? 'Saved Events' : "RSVP'd Events"}</Text>
      <FlatList
        data={activeTab === 'saved' ? savedItems : rsvpedItems}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <FeedItem
            id={item.id}
            title={item.title || ''}
            subtitle={item.subtitle}
            location={item.location}
            image={item.image}
            onPress={() => setSelected(item)}
            onShare={() => {}}
            saved={activeTab === 'saved'}
            showHeart={true}
            rsvped={activeTab === 'rsvped'}
            onSwipeRight={() => handleSwipeRemove(item)}
            onSwipeLeft={() => handleSwipeRemove(item)}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>
            {activeTab === 'saved' ? 'No saved events yet.' : "No RSVP'd events yet."}
          </Text>
        )}
        contentContainerStyle={
          (activeTab === 'saved' ? savedItems.length : rsvpedItems.length) === 0 ? styles.emptyWrap : undefined
        }
      />
      <EventDetailsModal
        visible={!!selectedFull}
        onClose={() => setSelected(null)}
        id={selectedFull?.id}
        title={selectedFull?.title}
        subtitle={selectedFull?.subtitle}
        description={selectedFull?.description}
        location={selectedFull?.location}
        image={selectedFull?.image}
        tags={selectedFull?.tags}
        onRelatedSelect={(ev) => {
          setSelected({
            id: ev.id,
            title: ev.title,
            subtitle: ev.date,
            location: ev.location,
            image: ev.image,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, backgroundColor: '#f6f7f9' },
  tabWrap: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  tabBg: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f7',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e3e3e7',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabLeft: { marginRight: 6 },
  tabRight: { marginLeft: 6 },
  tabBtnActive: {
    backgroundColor: '#fff8f2',
    shadowColor: '#f59e42',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ffd9b0',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#8c3d00',
  },
  header: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  emptyWrap: { flex: 1 },
});
