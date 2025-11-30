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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../components/EventCard";

// ⭐ NEW: Global saved events system
import { useSavedEvents } from "../context/SavedEventsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

/* -----------------------------------------------------------
   MOCK EVENTS WITH FIXED DATES
------------------------------------------------------------ */
const MOCK_EVENTS = [
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
   HOMESCREEN COMPONENT
------------------------------------------------------------ */
export default function HomeScreen() {
  /* ⭐ NEW: Saved events context */
  const { saveEvent } = useSavedEvents();

  /* STATE */
  const [selected, setSelected] = useState("Today");
  const [isGroup, setIsGroup] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* DRAWER */
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.5)).current;

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

  /* SWIPE ANIM */
  const swipe = useRef(new Animated.ValueXY()).current;

  const rotate = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const animatedCardStyle = {
    transform: [...swipe.getTranslateTransform(), { rotate }],
  };

  /* -----------------------------------------------------------
     ⭐ UPDATED — SAVE EVENT WHEN SWIPING RIGHT
  ------------------------------------------------------------ */
  const handleSave = () => {
    const event = MOCK_EVENTS[currentIndex];
    if (event) {
      saveEvent(event); // 🔥 Add to global saved list
    }

    setCurrentIndex((prev) => (prev + 1 < MOCK_EVENTS.length ? prev + 1 : 0));
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => (prev + 1 < MOCK_EVENTS.length ? prev + 1 : 0));
  };

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(swipe, {
      toValue: { x, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      swipe.setValue({ x: 0, y: 0 });
      direction === "right" ? handleSave() : handleSkip();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,

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

  /* CURRENT + NEXT CARD */
  const currentEvent = MOCK_EVENTS[currentIndex];
  const nextEvent =
    currentIndex + 1 < MOCK_EVENTS.length
      ? MOCK_EVENTS[currentIndex + 1]
      : null;

  /* -----------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
          <Text style={{ fontSize: 28 }}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Bottoms Up!</Text>

        <TouchableOpacity>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* DRAWER */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <Text style={styles.drawerTitle}>Menu</Text>

            <TouchableOpacity style={styles.drawerItem}>
              <Text style={styles.drawerText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem}>
              <Text style={styles.drawerText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem}>
              <Text style={styles.drawerText}>Settings</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TOGGLE */}
        <View style={[styles.segmentContainer, styles.sectionGap]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              isGroup && styles.segmentButtonActive,
            ]}
            onPress={() => setIsGroup(true)}
          >
            <Text
              style={[styles.segmentText, isGroup && styles.segmentTextActive]}
            >
              Group Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              !isGroup && styles.segmentButtonActive,
            ]}
            onPress={() => setIsGroup(false)}
          >
            <Text
              style={[styles.segmentText, !isGroup && styles.segmentTextActive]}
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
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSelected(item)}
              style={[
                styles.filterChip,
                selected === item && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECTION TITLE */}
        <Text style={styles.sectionTitle}>Today’s Events</Text>

        {/* CARD STACK */}
        <View style={styles.cardArea}>
          {nextEvent && (
            <View style={styles.nextCard}>
              <EventCard
                event={nextEvent}
                onSave={handleSave}
                onSkip={handleSkip}
              />
            </View>
          )}

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -----------------------------------------------------------
   STYLES
------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 4,
  },

  menuButton: {
    padding: 4,
  },

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
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 100,
  },

  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.5,
    backgroundColor: "#fff",
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 200,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
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
    backgroundColor: "#f0f0f0",
    padding: 4,
    borderRadius: 20,
  },

  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  segmentButtonActive: {
    backgroundColor: "#000",
  },

  segmentText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },

  segmentTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  filterScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 40,
  },

  filterChip: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  filterChipActive: {
    backgroundColor: "#000",
  },

  filterText: {
    color: "#444",
    fontSize: 12,
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 18,
    marginBottom: 6,
    marginTop: 6,
  },

  cardArea: {
    marginTop: 12,
    minHeight: 420,
    justifyContent: "center",
  },

  topCard: {
    position: "absolute",
    width: "100%",
  },

  nextCard: {
    position: "absolute",
    width: "100%",
    opacity: 0.4,
    transform: [{ scale: 0.95 }],
  },
});
