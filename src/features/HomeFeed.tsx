import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FeedItem from './FeedItem';
import EventDetailsModal from './EventDetailsModal';
import Icon from '../components/Icon';
import { Event } from '../constants/Events';
import { getSavedEvents, saveEvent, removeSavedEvent, subscribeSavedEvents, getRsvpedEvents, subscribeRsvpedEvents } from '../constants/storage';

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
  filterActive?: boolean;
  showSearch?: boolean;
};

const WHEN_OPTIONS: Array<'today' | 'tomorrow' | 'later'> = ['today', 'tomorrow', 'later'];

const toFeedItemFromEvent = (ev: Event): HomeFeedItem => ({
  id: ev.id,
  title: ev.title,
  subtitle: ev.date,
  location: ev.location,
  image: ev.image,
  when: undefined,
  tags: ev.category ? [ev.category] : [],
  description: ev.description,
  original: ev,
});

export default function HomeFeed({
  events,
  onFilteredChange,
  filterActive,
  showSearch = true,
}: HomeFeedProps) {
  const [selected, setSelected] = useState<HomeFeedItem | null>(null);
  const [timeFilters, setTimeFilters] = useState<Array<'today' | 'tomorrow' | 'later'>>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [rsvpedIds, setRsvpedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeSavedEvents((list) => {
      if (mounted) setSavedIds(list.map((s) => s.id));
    });
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
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeRsvpedEvents((list) => {
      if (mounted) setRsvpedIds(list.map((r) => r.id));
    });
    (async () => {
      try {
        const list = await getRsvpedEvents();
        if (!mounted) return;
        setRsvpedIds(list.map((r) => r.id));
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const tags = useMemo(() => ['Art','Campus','Community','Food','Music','Sports'], []);
  const selectAllTimes = () => setTimeFilters([]);
  const toggleTime = (when: 'today' | 'tomorrow' | 'later') => {
    setTimeFilters((prev) => {
      const exists = prev.includes(when);
      const next = exists ? prev.filter((w) => w !== when) : [...prev, when];
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  };

  const saveItem = (item: HomeFeedItem) => {
    if (!item.id) return;
    setSavedIds((prev) => {
      if (prev.includes(item.id as string)) return prev;
      try {
        // eslint-disable-next-line no-console
        console.log('[HomeFeed] saveItem', item.id);
        saveEvent({ id: item.id, title: item.title, subtitle: item.subtitle, location: item.location, image: item.image });
      } catch (e) {
        // ignore
      }
      return [item.id, ...prev];
    });
  };

  const unsaveItem = (item: HomeFeedItem) => {
    if (!item.id) return;
    setSavedIds((prev) => {
      if (!prev.includes(item.id as string)) return prev;
      try {
        // eslint-disable-next-line no-console
        console.log('[HomeFeed] unsaveItem', item.id);
        removeSavedEvent(item.id as string);
      } catch (e) {
        // ignore
      }
      return prev.filter((x) => x !== item.id);
    });
  };

  const dataSource = useMemo(() => (events && events.length ? events : []), [events]);

  const filteredData = useMemo(() => {
    return dataSource.filter((it) => {
      if (timeFilters.length && it.when && !timeFilters.includes(it.when)) return false;
      if (searchText && !it.title.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (selectedTags.length > 0 && !(it.tags || []).some((tg) => selectedTags.includes(tg))) return false;
      return true;
    });
  }, [timeFilters, searchText, selectedTags, dataSource]);

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
      rsvped={rsvpedIds.includes(item.id)}
      onSwipeRight={() => saveItem(item)}
      onSwipeLeft={() => unsaveItem(item)}
    />
  );

  return (
    <View style={styles.container}>
      {showSearch ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchShell}>
            <Icon name="magnify" size={18} color="#9AA0A6" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search here"
              placeholderTextColor="#9AA0A6"
              style={styles.searchInput}
            />
          </View>
        </View>
      ) : null}

      {filterActive ? (
        <View style={styles.tagsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
            <TouchableOpacity
              key="all"
              style={[styles.tagPill, timeFilters.length === 0 && styles.tagPillActive]}
              onPress={selectAllTimes}
              activeOpacity={0.85}
            >
              <Text style={[styles.tagText, timeFilters.length === 0 && styles.tagTextActive]}>All</Text>
            </TouchableOpacity>
            {WHEN_OPTIONS.map((when) => {
              const active = timeFilters.includes(when);
              return (
                <TouchableOpacity
                  key={when}
                  style={[styles.tagPill, active && styles.tagPillActive]}
                  onPress={() => toggleTime(when)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    {when === 'today' ? 'Today' : when === 'tomorrow' ? 'Tomorrow' : 'Later'}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
            <Text style={styles.sectionHeader}>
              {timeFilters.length === 0
                ? 'All Events'
                : timeFilters.length === 1
                ? timeFilters[0] === 'today'
                  ? 'Today'
                  : timeFilters[0] === 'tomorrow'
                  ? 'Tomorrow'
                  : 'Later'
                : 'Filtered Events'}
            </Text>
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
        tags={selected?.tags}
        onRelatedSelect={(ev) => {
          setSelected(toFeedItemFromEvent(ev));
        }}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e8e8eb',
    height: 48,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#222',
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
    backgroundColor: '#ffb26b',
  },
  tagText: {
    color: '#333',
  },
  tagTextActive: {
    color: '#8c3d00',
  },
});
