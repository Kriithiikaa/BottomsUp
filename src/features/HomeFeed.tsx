import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import FeedItem from './FeedItem';
import SearchBar from './SearchBar';
import EventDetailsModal from './EventDetailsModal';
import Icon from '../components/Icon';
import { Event } from '../constants/Events';
import { getSavedEvents } from '../constants/storage';

export type HomeFeedItem = {
  id: string;
  title: string;
  subtitle?: string;
  location?: string;
  image?: string;
  when?: 'today' | 'tomorrow' | 'later';
  tags?: string[];
  description?: string;
  original?: Event;
};

type HomeFeedProps = {
  events?: HomeFeedItem[];
  onFilteredChange?: (items: HomeFeedItem[]) => void;
};

const SAMPLE_DATA: HomeFeedItem[] = [
  {
    id: 'evt-1',
    title: 'Sunset Rooftop Jam',
    subtitle: 'Live music + open mic',
    location: 'Midtown Commons',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=60',
    when: 'today',
    tags: ['Music', 'Community'],
    description: 'Sunset session with local bands and an open mic to close the night.',
  },
  {
    id: 'evt-2',
    title: 'Founder Coffee Chat',
    subtitle: 'Meet local builders',
    location: 'Grounded Beans',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=60',
    when: 'tomorrow',
    tags: ['Networking', 'Career'],
    description: 'Casual coffee with founders sharing early-stage lessons and Q&A.',
  },
  {
    id: 'evt-3',
    title: 'Trail Cleanup + Picnic',
    subtitle: 'Give back outdoors',
    location: 'Riverside Park',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60',
    when: 'later',
    tags: ['Outdoors', 'Community'],
    description: 'Bring gloves and energy—quick cleanup followed by a laid-back picnic.',
  },
];

export default function HomeFeed({ events, onFilteredChange }: HomeFeedProps) {
  const [selected, setSelected] = useState<HomeFeedItem | null>(null);
  const [whenFilter, setWhenFilter] = useState<'today' | 'tomorrow' | 'later' | 'all'>('all');
  const [showWhenMenu, setShowWhenMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getSavedEvents();
        if (!mounted) return;
        setSavedIds(list.map((s) => s.id));
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const tags = useMemo(() => ['Art','Campus','Community','Food','Music','Sports'], []);

  const toggleTag = (tag: string) => {
    setSelectedTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  };

  // prefer events passed from parent; otherwise use internal sample data
  const dataSource = events && events.length ? events : SAMPLE_DATA;

  const filteredData = useMemo(() => {
    return dataSource.filter((it) => {
      if (whenFilter !== 'all' && it.when !== whenFilter) return false;
      if (searchText && !it.title.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (selectedTags.length > 0 && !(it.tags || []).some((tg) => selectedTags.includes(tg))) return false;
      return true;
    });
  }, [whenFilter, searchText, selectedTags, dataSource]);

  // Notify parent when filtered data changes so the Plan view can mirror the same items
  useEffect(() => {
    if (typeof onFilteredChange === 'function') {
      onFilteredChange(filteredData);
    }
  }, [filteredData, onFilteredChange]);

  const renderItem = ({ item }: ListRenderItemInfo<HomeFeedItem>) => (
    <FeedItem
      id={item.id}
      title={item.title}
      subtitle={item.subtitle}
      location={item.location}
      image={item.image}
      onPress={() => setSelected(item)}
      onShare={() => console.log('Share', item.id)}
      saved={savedIds.includes(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Segmented control is handled by parent so it remains fixed above content */}
      {/* Top controls */}
      <View style={styles.topRow}>
        <View style={styles.leftControl}>
          <TouchableOpacity onPress={() => setShowWhenMenu((s) => !s)} activeOpacity={0.8}>
            <Text style={styles.eventsLabel}>Events</Text>
          </TouchableOpacity>

          {showWhenMenu ? (
            <View style={styles.whenMenu}>
              <TouchableOpacity onPress={() => { setWhenFilter('today'); setShowWhenMenu(false); }} style={[styles.whenItem, whenFilter === 'today' && styles.whenActive]}>
                <Text style={[styles.whenText, whenFilter === 'today' && styles.whenTextActive]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setWhenFilter('tomorrow'); setShowWhenMenu(false); }} style={[styles.whenItem, whenFilter === 'tomorrow' && styles.whenActive]}>
                <Text style={[styles.whenText, whenFilter === 'tomorrow' && styles.whenTextActive]}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setWhenFilter('later'); setShowWhenMenu(false); }} style={[styles.whenItem, whenFilter === 'later' && styles.whenActive]}>
                <Text style={[styles.whenText, whenFilter === 'later' && styles.whenTextActive]}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setWhenFilter('all'); setShowWhenMenu(false); }} style={[styles.whenItem, whenFilter === 'all' && styles.whenActive]}>
                <Text style={[styles.whenText, whenFilter === 'all' && styles.whenTextActive]}>All</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.rightControls}>
          <TouchableOpacity onPress={() => { setShowSearch((s) => !s); setShowTags(false); }} style={styles.iconBtn}>
            <Icon name="magnify" size={20} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowTags((s) => !s); setShowSearch(false); }} style={styles.iconBtn}>
            <Icon name="filter-variant" size={20} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {showWhenMenu ? (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWhenMenu(false)} />
      ) : null}

      {showSearch ? (
        <View style={styles.searchWrap}>
          <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search events and restaurants" />
        </View>
      ) : null}

      {showTags ? (
        <View style={styles.tagsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
            {tags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity key={tag} style={[styles.tagPill, active && styles.tagPillActive]} onPress={() => toggleTag(tag)}>
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <FlatList
        data={filteredData}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>{whenFilter === 'all' ? 'All Events' : whenFilter === 'today' ? 'Today' : whenFilter === 'tomorrow' ? 'Tomorrow' : 'Later'}</Text>
          </View>
        )}
      />

      <EventDetailsModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        id={selected?.id}
        title={selected?.title}
        subtitle={selected?.subtitle}
        description={selected?.description || selected?.original?.description}
        location={selected?.location}
        image={selected?.image}
        onSavedChange={(id, saved) => {
          if (!id) return;
          setSavedIds((prev) => {
            if (saved) return prev.includes(id) ? prev : [id, ...prev];
            return prev.filter((x) => x !== id);
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    paddingBottom: 100,
  },
  sectionHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 5,
    paddingBottom: 6,
  },
  leftControl: {
    flexDirection: 'column',
    position: 'relative',
  },
  eventsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  whenMenu: {
    position: 'absolute',
    top: 44,
    left: 0,
    minWidth: 120,
    marginTop: 8,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    elevation: 8,
    zIndex: 2000,
  },
  whenItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  whenText: {
    color: '#222',
  },
  whenActive: {
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
  },
  whenTextActive: {
    color: '#2b7cff',
    fontWeight: '600',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#f2f3f5',
  },
  searchWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  tagsWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  tagsScroll: {
    paddingVertical: 8,
  },
  tagPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
    marginRight: 8,
  },
  tagPillActive: {
    backgroundColor: '#2b7cff',
  },
  tagText: {
    color: '#333',
  },
  tagTextActive: {
    color: '#fff',
  },
});
