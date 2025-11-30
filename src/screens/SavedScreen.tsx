import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavedEvents } from "../context/SavedEventsContext";
import EventCard from "../components/EventCard";

export default function SavedScreen() {
  const { savedEvents } = useSavedEvents();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.header}>Saved Events</Text>

        {savedEvents.length === 0 ? (
          <Text style={styles.emptyText}>
            You haven't saved any events yet — swipe right to save!
          </Text>
        ) : (
          savedEvents.map((event) => (
            <View key={event.id} style={styles.cardWrapper}>
              {/* ⭐ Scale card down ONLY here */}
              <View style={styles.scaledCard}>
                <EventCard event={event} onSave={() => {}} onSkip={() => {}} />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20, // fixes title being under dynamic island
    paddingBottom: 80,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    marginTop: 10,
  },

  /* 🟦 CARD WRAPPER */
  cardWrapper: {
    width: "100%",
    marginBottom: 20,
    alignSelf: "center",
  },

  /* 🟩 SCALE EVENTCARD — ONLY HERE */
  scaledCard: {
    transform: [{ scale: 0.88 }], // ⭐ make card smaller
    width: "100%",
    alignSelf: "center",

    // tighten spacing
    marginBottom: -10,
  },
});
