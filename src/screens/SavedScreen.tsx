import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavedEvents } from "../context/SavedEventsContext";

/* -----------------------------------------------------------
   HYBRID THEME
------------------------------------------------------------ */

const lightTheme = {
  background: "#FAFAFA",
  cardBackground: "#FFFFFF",
  textPrimary: "#222222",
  textSecondary: "#555555",
  statBox: "#F5F5F5",
  chipBackground: "#EEEEEE",
  chipActiveBackground: "#FF7A30",
  chipText: "#444444",
  chipTextActive: "#FFFFFF",
  border: "#E5E5E5",
  rsvpButton: "#FF7A30",
  rsvpButtonText: "#FFF",
  rsvpButtonInactive: "#FFF4EC",
  rsvpButtonInactiveText: "#FF7A30",
  liveBg: "#FF3B30",
  liveText: "#FFFFFF",
};

const darkTheme = {
  background: "#0D0D0F",
  cardBackground: "#18181C",
  textPrimary: "#FFFFFF",
  textSecondary: "#B5B5B8",
  statBox: "#1F1F24",
  chipBackground: "#22252A",
  chipActiveBackground: "#1A73E8",
  chipText: "#B5B5B8",
  chipTextActive: "#FFFFFF",
  border: "#2A2C30",
  rsvpButton: "#1A73E8",
  rsvpButtonText: "#FFFFFF",
  rsvpButtonInactive: "#102A47",
  rsvpButtonInactiveText: "#70A9FF",
  liveBg: "#FF453A",
  liveText: "#FFFFFF",
};

export default function SavedScreen() {
  const { savedEvents, toggleRSVP } = useSavedEvents();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  const [filter, setFilter] = useState<"all" | "rsvped" | "past">("all");

  const TODAY = new Date("Dec 2, 2025");
  const parseDate = (d: string) => new Date(d);

  const filteredList = useMemo(() => {
    if (filter === "all") return savedEvents;
    if (filter === "rsvped") return savedEvents.filter((ev) => ev.rsvped);
    if (filter === "past")
      return savedEvents.filter((ev) => parseDate(ev.date) < TODAY);
    return savedEvents;
  }, [filter, savedEvents]);

  const savedCount = savedEvents.length;
  const rsvpCount = savedEvents.filter((ev) => ev.rsvped).length;
  const todayCount = savedEvents.filter(
    (ev) => parseDate(ev.date).toDateString() === TODAY.toDateString()
  ).length;

  return (
    <SafeAreaView
      style={[styles.safeContainer, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.header, { color: theme.textPrimary }]}>
          Saved Events
        </Text>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.statBox, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {rsvpCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              RSVPed
            </Text>
          </View>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.statBox, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {savedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Saved
            </Text>
          </View>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.statBox, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {todayCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Today
            </Text>
          </View>
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {["all", "rsvped", "past"].map((key) => {
            const isActive = filter === key;
            const label =
              key === "all" ? "All" : key === "rsvped" ? "RSVPed" : "Past";

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key as any)}
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
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* EVENT LIST */}
        {filteredList.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No events available.
          </Text>
        ) : (
          filteredList.map((event) => (
            <View
              key={event.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* LIVE TAG — top right */}
              {event.live && (
                <View
                  style={[styles.liveTag, { backgroundColor: theme.liveBg }]}
                >
                  <Text style={{ color: theme.liveText, fontSize: 11 }}>
                    LIVE
                  </Text>
                </View>
              )}

              {/* TITLE */}
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {event.title}
              </Text>

              {/* INFO — plain, no emojis */}
              <Text style={[styles.info, { color: theme.textSecondary }]}>
                {event.date}
              </Text>
              <Text style={[styles.info, { color: theme.textSecondary }]}>
                {event.time}
              </Text>
              <Text style={[styles.info, { color: theme.textSecondary }]}>
                {event.location}
              </Text>

              {/* RSVP BUTTON */}
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  {
                    backgroundColor: event.rsvped
                      ? theme.rsvpButtonInactive
                      : theme.rsvpButton,
                  },
                ]}
                onPress={() => toggleRSVP(event.id)}
              >
                <Text
                  style={{
                    color: event.rsvped
                      ? theme.rsvpButtonInactiveText
                      : theme.rsvpButtonText,
                    fontWeight: "700",
                  }}
                >
                  {event.rsvped ? "✓ RSVP’d" : "RSVP"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -----------------------------------------------------------
   STYLES — layout only
------------------------------------------------------------ */
const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 },

  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statBox: {
    width: "30%",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },

  statNumber: { fontSize: 22, fontWeight: "700", marginBottom: 4 },

  statLabel: { fontSize: 14 },

  filterRow: { flexDirection: "row", marginBottom: 20 },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
  },

  card: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },

  liveTag: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  title: { fontSize: 17, fontWeight: "700", marginBottom: 6 },

  info: { fontSize: 14, marginBottom: 3 },

  rsvpButton: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});

export {};
