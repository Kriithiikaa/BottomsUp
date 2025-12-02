import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";

const lightTheme = {
  background: "#FAFAFA",
  cardBackground: "#FFFFFF",
  textPrimary: "#222222",
  textSecondary: "#555555",
  primary: "#FF7A30",
};

const darkTheme = {
  background: "#0D0D0F",
  cardBackground: "#18181C",
  textPrimary: "#FFFFFF",
  textSecondary: "#B5B5B8",
  primary: "#1A73E8",
};

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Title */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        About Bottoms Up!
      </Text>

      {/* Card */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>
          What is Bottoms Up?
        </Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Bottoms Up! is your go-to campus event discovery app — helping
          students easily find what’s happening around them, connect with
          groups, and never miss out on the best events happening today,
          tomorrow, and beyond.
        </Text>

        <Text
          style={[styles.body, { color: theme.textSecondary, marginTop: 10 }]}
        >
          Swipe through curated events, save your favorites, and RSVP to stay
          organized. Whether you're into sports, clubs, concerts, comedy nights,
          or workshops — Bottoms Up! keeps you updated and engaged.
        </Text>

        {/* Section */}
        <Text
          style={[styles.heading, { color: theme.textPrimary, marginTop: 25 }]}
        >
          Our Mission
        </Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>
          To bring the student community together by making it simpler and more
          exciting to explore events on and around campus. We believe
          discovering what’s happening should feel fun, intuitive, and
          effortless.
        </Text>

        {/* Section */}
        <Text
          style={[styles.heading, { color: theme.textPrimary, marginTop: 25 }]}
        >
          App Version
        </Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Bottoms Up! — Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

/* -----------------------------------------------------------
   STYLES
------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
