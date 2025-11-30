import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

type SimpleEvent = {
  title: string;
  time: string;
  location: string;
  tags: string[];
  description: string;
  image?: string;
  live?: boolean;
};

type EventCardProps = {
  event: SimpleEvent;
  onSave: () => void;
  onSkip: () => void;
};

export default function EventCard({ event, onSave, onSkip }: EventCardProps) {
  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: event.image || "https://picsum.photos/600/400" }}
          style={styles.image}
        />
      </View>

      {/* TITLE + LIVE */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{event.title}</Text>
        {event.live && (
          <View style={styles.liveTag}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* TIME */}
      <View style={styles.infoRow}>
        <Text style={styles.infoEmoji}>⏰</Text>
        <Text style={styles.infoText}>{event.time}</Text>
      </View>

      {/* LOCATION */}
      <View style={styles.infoRow}>
        <Text style={styles.infoEmoji}>📍</Text>
        <Text style={styles.infoText}>{event.location}</Text>
      </View>

      {/* TAGS */}
      <View style={styles.tagContainer}>
        {event.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* DESCRIPTION */}
      <Text style={styles.description}>{event.description}</Text>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={{ fontSize: 18, marginRight: 4 }}>✖️</Text>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={{ fontSize: 18, marginRight: 4, color: "#fff" }}>
            ✔️
          </Text>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  imageWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#e5e5e5",
    height: 220,
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },

  liveTag: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  liveText: {
    color: "#444",
    fontSize: 11,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  /* NEW EMOJI ICON STYLE */
  infoEmoji: {
    fontSize: 16,
    marginRight: 6,
  },

  infoText: {
    color: "#444",
    fontSize: 13,
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 6,
  },

  tag: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },

  tagText: {
    color: "#444",
    fontSize: 12,
  },

  description: {
    color: "#555",
    fontSize: 13,
    marginVertical: 6,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  skipButton: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingVertical: 10,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  skipText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});
