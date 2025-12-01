import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

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

/* -----------------------------------------------------------
   HYBRID THEME (A + C)
------------------------------------------------------------ */
const lightTheme = {
  background: "#FFFFFF",
  textPrimary: "#222222",
  textSecondary: "#555555",
  tagBackground: "#EEE",
  tagText: "#444",
  saveButton: "#FF7A30", // Citrus orange
  saveText: "#FFFFFF",
  skipButton: "#F2F2F2",
  skipText: "#000",
  liveTag: "#FF3B30",
};

const darkTheme = {
  background: "#18181C",
  textPrimary: "#FFFFFF",
  textSecondary: "#B5B5B8",
  tagBackground: "#22252A",
  tagText: "#FFFFFF",
  saveButton: "#1A73E8", // Neon blue
  saveText: "#FFFFFF",
  skipButton: "#2A2A2E",
  skipText: "#FFFFFF",
  liveTag: "#FF375F",
};

export default function EventCard({ event, onSave, onSkip }: EventCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: event.image || "https://picsum.photos/600/400" }}
          style={styles.image}
        />
      </View>

      {/* TITLE + LIVE */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {event.title}
        </Text>

        {event.live && (
          <View style={[styles.liveTag, { backgroundColor: theme.liveTag }]}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* TIME */}
      <View style={styles.infoRow}>
        <Text style={styles.infoEmoji}>⏰</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          {event.time}
        </Text>
      </View>

      {/* LOCATION */}
      <View style={styles.infoRow}>
        <Text style={styles.infoEmoji}>📍</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          {event.location}
        </Text>
      </View>

      {/* TAGS */}
      <View style={styles.tagContainer}>
        {event.tags.map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: theme.tagBackground }]}
          >
            <Text style={[styles.tagText, { color: theme.tagText }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {/* DESCRIPTION */}
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {event.description}
      </Text>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        {/* SKIP */}
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: theme.skipButton }]}
          onPress={onSkip}
        >
          <Text style={{ fontSize: 18, marginRight: 4, color: theme.skipText }}>
            ✖️
          </Text>
          <Text style={[styles.skipText, { color: theme.skipText }]}>Skip</Text>
        </TouchableOpacity>

        {/* SAVE */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.saveButton }]}
          onPress={onSave}
        >
          <Text style={{ fontSize: 18, marginRight: 4, color: theme.saveText }}>
            ✔️
          </Text>
          <Text style={[styles.saveText, { color: theme.saveText }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* -----------------------------------------------------------
   STYLES (STRUCTURE ONLY — colors come from theme)
------------------------------------------------------------ */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
    alignSelf: "center",
    width: "92%",
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  liveText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  infoEmoji: {
    fontSize: 16,
    marginRight: 6,
  },

  infoText: {
    fontSize: 13,
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 6,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },

  tagText: {
    fontSize: 12,
  },

  description: {
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
    borderRadius: 10,
    paddingVertical: 10,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  skipText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  saveText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export {};
