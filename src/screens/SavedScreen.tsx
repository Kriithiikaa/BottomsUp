import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavedEvents } from "../context/SavedEventsContext";

export default function SavedScreen() {
  const { savedEvents } = useSavedEvents();

  /* -----------------------------------------------------------
     FILTER STATE
  ----------------------------------------------------------- */
  const [filter, setFilter] = useState<"all" | "rsvped" | "past">("all");

  /* -----------------------------------------------------------
     DATE HELPERS
  ----------------------------------------------------------- */
  const TODAY = new Date("Dec 2, 2025");

  const parseDate = (d: string) => new Date(d);

  /* -----------------------------------------------------------
     FILTERED LIST (logic will expand later)
  ----------------------------------------------------------- */
  const filteredList = useMemo(() => {
    if (filter === "all") return savedEvents;
    if (filter === "rsvped") return []; // will add later
    if (filter === "past") {
      return savedEvents.filter((ev) => parseDate(ev.date) < TODAY);
    }
    return savedEvents;
  }, [filter, savedEvents]);

  /* -----------------------------------------------------------
     SUMMARY STATS
  ----------------------------------------------------------- */
  const savedCount = savedEvents.length;
  const rsvpCount = 0;
  const todayCount = savedEvents.filter(
    (ev) => parseDate(ev.date).toDateString() === TODAY.toDateString()
  ).length;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* TITLE */}
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
           FILTER BUTTONS
        ----------------------------------------------------------- */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilter("all")}
            style={[
              styles.filterChip,
              filter === "all" && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("rsvped")}
            style={[
              styles.filterChip,
              filter === "rsvped" && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "rsvped" && styles.filterTextActive,
              ]}
            >
              RSVPed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("past")}
            style={[
              styles.filterChip,
              filter === "past" && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "past" && styles.filterTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* -----------------------------------------------------------
           EVENTS LIST (COMPACT STYLE)
        ----------------------------------------------------------- */}
        {filteredList.length === 0 ? (
          <Text style={styles.emptyText}>No events available.</Text>
        ) : (
          filteredList.map((event, index) => (
            <View key={index} style={styles.savedItem}>
              {/* Thumbnail */}
              {event.image ? (
                <Image source={{ uri: event.image }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
              )}

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.time}>{event.time}</Text>
                <Text style={styles.location}>{event.location}</Text>
              </View>

              {/* LIVE Tag */}
              {event.live && <Text style={styles.liveTag}>LIVE</Text>}
            </View>
          ))
        )}
      </ScrollView>
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

  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

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

  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: "#555",
  },

  /* FILTERS */
  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  filterChip: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },

  filterChipActive: {
    backgroundColor: "#000",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  filterTextActive: {
    color: "#fff",
  },

  /* EMPTY */
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },

  /* -----------------------------------------------------------
     COMPACT SAVED EVENT ITEM
  ----------------------------------------------------------- */
  savedItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
  },

  thumbnailPlaceholder: {
    backgroundColor: "#ddd",
  },

  infoContainer: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },

  time: {
    fontSize: 13,
    color: "#666",
  },

  location: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  liveTag: {
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "#FF3B30",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
});

export {};
