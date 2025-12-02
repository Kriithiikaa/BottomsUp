import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../components/EventCard";
import { useSavedEvents } from "../context/SavedEventsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

/* -----------------------------------------------------------
   EVENT TYPE
------------------------------------------------------------ */
type EventType = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  description: string;
  image?: string;
  live?: boolean;
};

/* -----------------------------------------------------------
   THEMES
------------------------------------------------------------ */
const lightTheme = {
  background: "#FAFAFA",
  cardBackground: "#FFFFFF",
  primary: "#FF7A30",
  primaryText: "#FFFFFF",
  textPrimary: "#222222",
  textSecondary: "#555555",
  chipBackground: "#EEEEEE",
  chipActiveBackground: "#FF7A30",
  chipText: "#444444",
  chipTextActive: "#FFFFFF",
  segmentBackground: "#F0F0F0",
  overlay: "rgba(0,0,0,0.35)",
};

const darkTheme = {
  background: "#0D0D0F",
  cardBackground: "#18181C",
  primary: "#1A73E8",
  primaryText: "#FFFFFF",
  textPrimary: "#FFFFFF",
  textSecondary: "#B5B5B8",
  chipBackground: "#22252A",
  chipActiveBackground: "#1A73E8",
  chipText: "#B5B5B8",
  chipTextActive: "#FFFFFF",
  segmentBackground: "#18181C",
  overlay: "rgba(0,0,0,0.55)",
};

/* -----------------------------------------------------------
   MOCK EVENTS
------------------------------------------------------------ */
const MOCK_EVENTS: EventType[] = [
  {
    id: "1",
    title: "Basketball vs State University",
    date: "Dec 2, 2025",
    time: "7:00 PM - 9:00 PM",
    location: "Sports Arena",
    tags: ["Sports", "Basketball"],
    description: "Join us for an exciting basketball game...",
    image: "https://picsum.photos/600/400?random=1",
    live: true,
  },
  {
    id: "2",
    title: "Jazz Night at the Quad",
    date: "Dec 3, 2025",
    time: "8:00 PM - 10:00 PM",
    location: "Quad Lawn",
    tags: ["Music", "Live"],
    description: "A relaxing evening with jazz bands performing.",
    image: "https://picsum.photos/600/400?random=2",
  },
  {
    id: "3",
    title: "Coding Bootcamp",
    date: "Dec 2, 2025",
    time: "5:00 PM - 7:00 PM",
    location: "Tech Hall",
    tags: ["Workshops", "Tech"],
    description: "Learn the basics of coding in just 2 hours!",
    image: "https://picsum.photos/600/400?random=3",
  },
  {
    id: "4",
    title: "Stand-Up Comedy Night",
    date: "Dec 3, 2025",
    time: "9:00 PM - 11:00 PM",
    location: "Student Lounge",
    tags: ["Comedy"],
    description: "Your favorite student comics take the stage.",
    image: "https://picsum.photos/600/400?random=4",
  },
];

const FILTERS = [
  "Today",
  "Tomorrow",
  "Sports",
  "Clubs",
  "Workshops",
  "Comedy",
  "Concerts",
  "Arts",
];

/* -----------------------------------------------------------
   DATE PARSER
------------------------------------------------------------ */
const parseDate = (dateStr: string) => {
  const cleaned = dateStr.replace(",", "");
  const [monthStr, dayStr, yearStr] = cleaned.split(" ");

  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  return new Date(Number(yearStr), monthMap[monthStr], Number(dayStr));
};

/* -----------------------------------------------------------
   HOMESCREEN
------------------------------------------------------------ */
export default function HomeScreen() {
  // ⭐ Hook order stays the same
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const { saveEvent } = useSavedEvents();

  const [selected, setSelected] = useState("Today");
  const [isGroup, setIsGroup] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.5)).current;

  // Overlay feedback text
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelText = useRef<"save" | "skip" | null>(null);

  /* SIDE MENU */
  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH * 0.5,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setMenuOpen(false));
  };

  /* -----------------------------------------------------------
     FILTER LOGIC
  ------------------------------------------------------------ */
  const parsedToday = parseDate("Dec 2, 2025");
  const parsedTomorrow = parseDate("Dec 3, 2025");

  let filteredEvents: EventType[] = [];

  if (selected === "Today") {
    filteredEvents = MOCK_EVENTS.filter((e) => {
      const d = parseDate(e.date);
      return (
        d.getFullYear() === parsedToday.getFullYear() &&
        d.getMonth() === parsedToday.getMonth() &&
        d.getDate() === parsedToday.getDate()
      );
    });
  } else if (selected === "Tomorrow") {
    filteredEvents = MOCK_EVENTS.filter((e) => {
      const d = parseDate(e.date);
      return (
        d.getFullYear() === parsedTomorrow.getFullYear() &&
        d.getMonth() === parsedTomorrow.getMonth() &&
        d.getDate() === parsedTomorrow.getDate()
      );
    });
  } else {
    filteredEvents = MOCK_EVENTS.filter((e) =>
      e.tags.some((tag) => tag.toLowerCase() === selected.toLowerCase())
    );
  }

  const handleFilterSelect = (item: string) => {
    setSelected(item);
    setCurrentIndex(0);
  };

  /* -----------------------------------------------------------
     OVERLAY LABEL ANIMATION
  ------------------------------------------------------------ */
  const triggerOverlayLabel = (type: "save" | "skip") => {
    labelText.current = type;
    labelOpacity.setValue(1);

    Animated.timing(labelOpacity, {
      toValue: 0,
      delay: 250,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  /* -----------------------------------------------------------
     SWIPE LOGIC
  ------------------------------------------------------------ */
  const swipe = useRef(new Animated.ValueXY()).current;

  const rotate = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const animatedCardStyle = {
    transform: [...swipe.getTranslateTransform(), { rotate }],
  };

  // Live swipe label opacity
  const dynamicOpacitySave = swipe.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 3],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const dynamicOpacitySkip = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 3, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  /* ACTION HANDLERS */
  const handleSave = () => {
    const event = filteredEvents[currentIndex];
    if (event) saveEvent(event);

    triggerOverlayLabel("save");

    setCurrentIndex((prev) =>
      prev + 1 < filteredEvents.length ? prev + 1 : 0
    );
  };

  const handleSkip = () => {
    triggerOverlayLabel("skip");

    setCurrentIndex((prev) =>
      prev + 1 < filteredEvents.length ? prev + 1 : 0
    );
  };

  const forceSwipe = (direction: "left" | "right") => {
    Animated.timing(swipe, {
      toValue: {
        x: direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH,
        y: 0,
      },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      swipe.setValue({ x: 0, y: 0 });
      direction === "right" ? handleSave() : handleSkip();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,

      onPanResponderMove: Animated.event([null, { dx: swipe.x, dy: swipe.y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: (_, g) => {
        const threshold = 120;
        if (g.dx > threshold) return forceSwipe("right");
        if (g.dx < -threshold) return forceSwipe("left");

        Animated.spring(swipe, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const currentEvent = filteredEvents[currentIndex];
  const nextEvent =
    currentIndex + 1 < filteredEvents.length
      ? filteredEvents[currentIndex + 1]
      : null;

  /* -----------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
          <Text style={[styles.menuIcon, { color: theme.textPrimary }]}>☰</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Bottoms Up!
        </Text>

        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.profileImage}
        />
      </View>

      {/* DRAWER */}
      {menuOpen && (
        <TouchableOpacity
          style={[styles.drawerOverlay, { backgroundColor: theme.overlay }]}
          onPress={closeMenu}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.drawer,
              {
                backgroundColor: theme.cardBackground,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.drawerTitle, { color: theme.textPrimary }]}>
              Menu
            </Text>

            <TouchableOpacity style={styles.drawerItem}>
              <Text style={[styles.drawerText, { color: theme.textSecondary }]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem}>
              <Text style={[styles.drawerText, { color: theme.textSecondary }]}>
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem}>
              <Text style={[styles.drawerText, { color: theme.textSecondary }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* MODE TOGGLE */}
        <View
          style={[
            styles.segmentContainer,
            styles.sectionGap,
            { backgroundColor: theme.segmentBackground },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.segmentButton,
              isGroup && { backgroundColor: theme.primary },
            ]}
            onPress={() => setIsGroup(true)}
          >
            <Text
              style={[
                styles.segmentText,
                isGroup
                  ? { color: theme.primaryText }
                  : { color: theme.textSecondary },
              ]}
            >
              Group Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              !isGroup && { backgroundColor: theme.primary },
            ]}
            onPress={() => setIsGroup(false)}
          >
            <Text
              style={[
                styles.segmentText,
                !isGroup
                  ? { color: theme.primaryText }
                  : { color: theme.textSecondary },
              ]}
            >
              Personal Home
            </Text>
          </TouchableOpacity>
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScroll, styles.sectionGap]}
        >
          {FILTERS.map((item) => {
            const isActive = selected === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => handleFilterSelect(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? theme.chipActiveBackground
                      : theme.chipBackground,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isActive ? theme.chipTextActive : theme.chipText,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SECTION TITLE */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {selected === "Today"
            ? "Today’s Events"
            : selected === "Tomorrow"
            ? "Tomorrow’s Events"
            : `${selected} Events`}
        </Text>

        {/* SWIPE DECK */}
        <View style={styles.cardArea}>
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No Events Found
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
                Try selecting a different filter.
              </Text>
            </View>
          ) : (
            <>
              {/* CENTER OVERLAY LABEL (after action) */}
              <Animated.Text
                style={[
                  styles.overlayLabel,
                  {
                    opacity: labelOpacity,
                    color: labelText.current === "save" ? "#28D85A" : "#FF4F4F",
                  },
                ]}
              >
                {labelText.current === "save"
                  ? "Saved ✓"
                  : labelText.current === "skip"
                  ? "Skipped ✕"
                  : ""}
              </Animated.Text>

              {/* LIVE SWIPE LABELS */}
              <Animated.Text
                style={[
                  styles.overlayLabel,
                  { opacity: dynamicOpacitySave, color: "#28D85A" },
                ]}
              >
                Saved ✓
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.overlayLabel,
                  { opacity: dynamicOpacitySkip, color: "#FF4F4F" },
                ]}
              >
                Skipped ✕
              </Animated.Text>

              {/* NEXT CARD */}
              {nextEvent && (
                <View style={styles.nextCard}>
                  <EventCard
                    event={nextEvent}
                    onSave={handleSave}
                    onSkip={handleSkip}
                  />
                </View>
              )}

              {/* CURRENT CARD */}
              {currentEvent && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[styles.topCard, animatedCardStyle]}
                >
                  <EventCard
                    event={currentEvent}
                    onSave={handleSave}
                    onSkip={handleSkip}
                  />
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -----------------------------------------------------------
   STYLES
------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 4,
  },

  menuButton: { padding: 4 },

  menuIcon: { fontSize: 28 },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.5,
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 200,
  },

  drawerTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 25,
  },

  drawerItem: {
    paddingVertical: 12,
  },

  drawerText: {
    fontSize: 16,
    fontWeight: "500",
  },

  sectionGap: {
    marginTop: 14,
  },

  segmentContainer: {
    flexDirection: "row",
    alignSelf: "center",
    padding: 4,
    borderRadius: 20,
  },

  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  segmentText: {
    fontSize: 13,
    fontWeight: "600",
  },

  filterScroll: {
    flexDirection: "row",
    paddingHorizontal: 15,
    height: 40,
  },

  filterChip: {
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 18,
    marginBottom: 30,
    marginTop: 6,
  },

  cardArea: {
    marginTop: 12,
    minHeight: 420,
    justifyContent: "center",
    alignItems: "center",
  },

  overlayLabel: {
    position: "absolute",
    top: 150,
    width: "100%",
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    zIndex: 20,
  },

  emptyContainer: {
    height: 420,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },

  topCard: {
    position: "absolute",
    width: "100%",
    zIndex: 5,
  },

  nextCard: {
    position: "absolute",
    width: "100%",
    opacity: 0.4,
    transform: [{ scale: 0.95 }],
    zIndex: 2,
  },
});

export {};
