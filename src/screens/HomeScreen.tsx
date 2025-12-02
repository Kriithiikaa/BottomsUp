import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeFeed, { HomeFeedItem } from '../features/HomeFeed';
import SwipeableCard from '../features/SwipeableCard';
import { EVENTS, Event } from '../constants/Events';
import { saveEvent, removeSavedEvent, getSavedEvents, subscribeSavedEvents } from '../constants/storage';

const categories = ['All', 'sports', 'concerts', 'campus'] as const;
type Category = (typeof categories)[number];
type ViewMode = 'Feed' | 'Cards';

const formatEventTime = (iso?: string): string => {
  if (!iso) return 'Time TBD';
  try {
    const d = new Date(iso);
    const dateText = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
    return `${dateText} • All day`;
  } catch (e) {
    return 'Time TBD';
  }
};

type HomeScreenProps = {
  filterActive?: boolean;
  showSearch?: boolean;
  onHideSearch?: () => void;
};

export default function HomeScreen({
  filterActive,
  showSearch = false,
  onHideSearch,
}: HomeScreenProps) {
  const [view, setView] = useState<ViewMode>('Feed');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [eventsStack, setEventsStack] = useState<Event[]>([...EVENTS].reverse());
  const hideSearch = onHideSearch ?? (() => {});

  useEffect(() => {
    if (showSearch && view !== 'Feed') {
      setView('Feed');
    }
  }, [showSearch, view]);

  const handleSwipeRight = () => removeTopEvent();
  const handleSwipeLeft = () => removeTopEvent();

  const removeTopEvent = () =>
    setEventsStack((prev) => prev.slice(0, prev.length - 1));

  // Helper to convert event.date to 'today' | 'tomorrow' | 'later'
  const deriveWhen = (isoDate?: string): 'today' | 'tomorrow' | 'later' => {
    if (!isoDate) return 'later';
    try {
      const d = new Date(isoDate);
      const now = new Date();
      // normalize to midnight
      const md = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const mn = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diff = Math.round((md.getTime() - mn.getTime()) / (24 * 60 * 60 * 1000));
      if (diff === 0) return 'today';
      if (diff === 1) return 'tomorrow';
      return 'later';
    } catch (e) {
      return 'later';
    }
  };

  // map eventsStack into HomeFeed item shape
  const feedItems: HomeFeedItem[] = useMemo(
    () =>
      eventsStack.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: formatEventTime(e.date),
        location: e.location || 'Location TBD',
        image: e.image,
        when: deriveWhen(e.date),
        tags: e.category ? [e.category] : [],
        description: e.description,
        original: e,
      })),
    [eventsStack],
  );

  const [filteredFeedItems, setFilteredFeedItems] = useState<HomeFeedItem[] | null>(null);
  const handleFilteredChange = useCallback((items: HomeFeedItem[]) => {
    setFilteredFeedItems(items);
  }, []);

  const buildFallbackEvent = (item: HomeFeedItem): Event => ({
    id: item.id,
    title: item.title,
    description: item.subtitle || 'Details coming soon',
    image: item.image || 'https://picsum.photos/600/400?blur=2',
    category: (item.tags && item.tags[0]) || 'general',
    location: item.location,
  });

  const cardsEvents: Event[] = useMemo(() => {
    const baseItems = filteredFeedItems && filteredFeedItems.length ? filteredFeedItems : feedItems;
    const categoryFiltered =
      selectedCategory === 'All'
        ? baseItems
        : baseItems.filter((it) => (it.tags || []).some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase()));
    return categoryFiltered.map((it) => it.original || buildFallbackEvent(it));
  }, [filteredFeedItems, feedItems, selectedCategory]);

  const [savedIds, setSavedIds] = useState<string[]>([]);

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

  const toggleSaveForEvent = async (ev: Event) => {
    if (!ev || !ev.id) return;
    const isSaved = savedIds.includes(ev.id);
    try {
      // eslint-disable-next-line no-console
      console.log('[HomeScreen] toggleSaveForEvent', ev.id, isSaved ? 'unsave' : 'save');
      if (isSaved) {
        await removeSavedEvent(ev.id);
      } else {
        await saveEvent({ id: ev.id, title: ev.title, subtitle: ev.description, location: ev.location, image: ev.image });
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top segmented switch (fixed above feed) */}
      <View style={styles.switchWrap}>
        <View style={styles.switchRow}>
          <View style={styles.switchBg}>
            <TouchableOpacity
              style={[styles.switchBtn, styles.switchLeft, view === 'Feed' && styles.switchSelected]}
              onPress={() => { setView('Feed'); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.switchText, view === 'Feed' && styles.switchTextSelected]}>For You</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchBtn, styles.switchRight, view === 'Cards' && styles.switchSelected]}
              onPress={() => { setView('Cards'); hideSearch(); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.switchText, view === 'Cards' && styles.switchTextSelected]}>Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {view === 'Feed' ? (
        // Render HomeFeed
        <HomeFeed
          events={feedItems}
          onFilteredChange={handleFilteredChange}
          filterActive={filterActive}
          showSearch={showSearch}
        />
      ) : (
        // Render cards view
        <>
          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categorySelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextSelected,
                  ]}
                >
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Swipeable Cards */}
          <View style={styles.swiperContainer}>
            {cardsEvents.length === 0 ? (
              <Text style={styles.noEventsText}>No events to show</Text>
            ) : (
              cardsEvents.map((event) => (
                <SwipeableCard
                  key={event.id}
                  event={event}
                  saved={savedIds.includes(event.id)}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={() => {
                    // toggle saved state for this event; keep card visible so the heart stays
                    toggleSaveForEvent(event);
                  }}
                />
              ))
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  categorySelected: { backgroundColor: "#FF6347" },
  categoryText: { fontSize: 14, color: "#555", fontWeight: "bold" },
  categoryTextSelected: { color: "white" },
  swiperContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noEventsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  switchWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  switchBg: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f7',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e3e3e7',
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  switchLeft: {
    marginRight: 6,
  },
  switchRight: {
    marginLeft: 6,
  },
  switchSelected: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  switchText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  switchTextSelected: {
    color: '#111',
  },
});
