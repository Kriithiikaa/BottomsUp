import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavedEvents } from "../context/SavedEventsContext";

export default function SavedScreen() {
  const { savedEvents, rsvpedEvents, rsvpEvent } = useSavedEvents();

  const [filter, setFilter] = useState<"all" | "rsvped" | "past">("all");

  // Toast overlay animation
  const [toast, setToast] = useState("");
  const toastOpacity = useState(new Animated.Value(0))[0];

  // Fixed date for now
  const TODAY = new Date("Dec 2, 2025");
  const parseDate = (d: string) => new Date(d);

  /* -----------------------------------------------------------
     FILTERED LIST
  ----------------------------------------------------------- */
  const filteredList = useMemo(() => {
    if (filter === "all") return savedEvents;
    if (filter === "rsvped") return rsvpedEvents;
    if (filter === "past") {
      return savedEvents.filter((ev) => parseDate(ev.date) < TODAY);
    }
    return savedEvents;
  }, [filter, savedEvents, rsvpedEvents]);

  /* -----------------------------------------------------------
     STATS
  ----------------------------------------------------------- */
  const savedCount = savedEvents.length;
  const rsvpCount = rsvpedEvents.length;

  const todayCount = savedEvents.filter(
    (ev) => parseDate(ev.date).toDateString() === TODAY.toDateString()
  ).length;

  /* -----------------------------------------------------------
     TOAST FUNCTION
  ----------------------------------------------------------- */
  const showToast = (msg: string) => {
    setToast(msg);

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 1200);
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.header}>Saved Events</Text>

        {/* -----------------------------------------------------------
           SUMMARY BOXES
        ----------------------------------------------------------- */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{rsvpCount}</Text>
            <Text style={styles.statLabel}>RSVPed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        {/* -----------------------------------------------------------
           FILTERS
        ----------------------------------------------------------- */}
        <View style={styles.filterRow}>
          {["all", "rsvped", "past"].map((type) => {
            const label =
              type === "all" ? "All" : type === "rsvped" ? "RSVPed" : "Past";

            return (
              <TouchableOpacity
                key={type}
                onPress={() => setFilter(type as any)}
                style={[
                  styles.filterChip,
                  filter === type && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === type && styles.filterTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* -----------------------------------------------------------
           EVENT LIST
        ----------------------------------------------------------- */}
        {filteredList.length === 0 ? (
          <Text style={styles.emptyText}>No events available.</Text>
        ) : (
          filteredList.map((event) => {
            const isRSVPed = event.rsvped === true;

            return (
              <View key={event.id} style={styles.savedItem}>
                {/* Title + LIVE */}
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{event.title}</Text>
                  {event.live && <Text style={styles.liveTag}>LIVE</Text>}
                </View>

                <Text style={styles.time}>{event.time}</Text>
                <Text style={styles.location}>{event.location}</Text>

                {/* RSVP BUTTON */}
                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    isRSVPed && styles.rsvpButtonActive,
                  ]}
                  onPress={() => {
                    if (!isRSVPed) {
                      rsvpEvent(event);
                      showToast("RSVP sent");
                    }
                  }}
                >
                  <Text
                    style={[styles.rsvpText, isRSVPed && styles.rsvpTextActive]}
                  >
                    {isRSVPed ? "RSVP’d ✓" : "RSVP"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* -----------------------------------------------------------
         TOAST OVERLAY
      ----------------------------------------------------------- */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

/* -----------------------------------------------------------
   STYLES
----------------------------------------------------------- */
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 },

  header: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  /* SUMMARY */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  statNumber: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 14, color: "#555" },

  /* FILTERS */
  filterRow: { flexDirection: "row", marginBottom: 20 },
  filterChip: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  filterChipActive: { backgroundColor: "#000" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#555" },
  filterTextActive: { color: "#fff" },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },

  /* EVENT CARD */
  savedItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111", flexShrink: 1 },

  time: { fontSize: 13, color: "#666" },
  location: { fontSize: 12, color: "#888", marginBottom: 10 },

  /* RSVP BUTTON — FIXED CENTERING */
  rsvpButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
    minWidth: 150,

    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  rsvpButtonActive: {
    backgroundColor: "#2ECC71",
  },

  rsvpText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  rsvpTextActive: {
    color: "#fff",
  },

  /* LIVE TAG */
  liveTag: {
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "#FF3B30",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  /* TOAST — CENTERED FIX */
  toast: {
    position: "absolute",
    top: "50%", // Center of screen
    left: 0,
    right: 0,
    alignItems: "center",
    transform: [{ translateY: -30 }], // Small upward shift to look perfect
  },
  toastText: {
    backgroundColor: "#000",
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    fontWeight: "600",
    overflow: "hidden",
  },
});
