import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeFeed, { HomeFeedItem } from '../features/HomeFeed';
import SwipeableCard from '../features/SwipeableCard';
import Icon from '../components/Icon';
import { EVENTS, Event } from '../constants/Events';

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

export default function HomeScreen() {
  const [view, setView] = useState<ViewMode>('Feed');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [eventsStack, setEventsStack] = useState<Event[]>([...EVENTS].reverse());

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top segmented switch (fixed above feed) */}
      <View style={styles.switchWrap}>
        <View style={styles.switchBg}>
          <TouchableOpacity
            style={[styles.switchBtn, styles.switchLeft, view === 'Feed' && styles.switchSelected]}
            onPress={() => setView('Feed')}
            activeOpacity={0.85}
          >
            <Icon name="view-list" size={16} color={view === 'Feed' ? '#111' : '#666'} />
            <Text style={[styles.switchText, view === 'Feed' && styles.switchTextSelected]}>For You</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, styles.switchRight, view === 'Cards' && styles.switchSelected]}
            onPress={() => setView('Cards')}
            activeOpacity={0.85}
          >
            <Icon name="calendar" size={16} color={view === 'Cards' ? '#111' : '#666'} />
            <Text style={[styles.switchText, view === 'Cards' && styles.switchTextSelected]}> Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
      {view === 'Feed' ? (
        // Render HomeFeed and allow it to toggle the parent view
        <HomeFeed onChangeView={(v) => setView(v)} currentView={view} events={feedItems} onFilteredChange={handleFilteredChange} />
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
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
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
  topSwitchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  topSwitchButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginHorizontal: 6,
  },
  topSwitchSelected: {
    backgroundColor: "#FF6347",
  },
  topSwitchText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "700",
  },
  topSwitchTextSelected: {
    color: "#fff",
  },
  switchWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  switchBg: {
    alignSelf: 'center',
    width: 300,
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    padding: 6,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
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
    shadowRadius: 6,
    elevation: 3,
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
