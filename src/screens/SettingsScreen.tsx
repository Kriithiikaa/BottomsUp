import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  // ✔ MUST stay first
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const isDark = colorScheme === "dark";

  const theme = {
    bg: isDark ? "#0d0f14" : "#ffffff",
    card: isDark ? "#12141b" : "#f7f7f7",
    text: isDark ? "#f0f4ff" : "#1a1a1a",
    subText: isDark ? "#9aa3b2" : "#666",
    accent: isDark ? "#3ea6ff" : "#ff8c42",
    border: isDark ? "#1c1f27" : "#e1e1e1",
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* PROFILE SECTION */}
      <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&q=80",
          }}
          style={styles.profileImage}
        />

        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.name, { color: theme.text }]}>
            Sumairah Rahman
          </Text>
          <Text style={[styles.joinDate, { color: theme.subText }]}>
            Joined: October 2025
          </Text>
        </View>
      </View>

      {/* SETTINGS LIST */}
      <View style={styles.section}>
        {/* ABOUT */}
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.border }]}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={[styles.itemText, { color: theme.text }]}>About</Text>
        </TouchableOpacity>

        {/* MODE */}
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.border }]}
          onPress={() => navigation.navigate("Mode")}
        >
          <Text style={[styles.itemText, { color: theme.text }]}>Mode</Text>
        </TouchableOpacity>

        {/* RESET PASSWORD */}
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.border }]}
        >
          <Text style={[styles.itemText, { color: theme.text }]}>
            Reset Password
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT placed safely at the bottom */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={[styles.logoutText, { color: theme.accent }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  name: {
    fontSize: 20,
    fontWeight: "600",
  },

  joinDate: {
    marginTop: 4,
    fontSize: 14,
  },

  section: {
    marginHorizontal: 15,
    borderRadius: 16,
    overflow: "hidden",
  },

  item: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },

  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },

  logoutWrapper: {
    marginTop: 40,
    marginBottom: 50,
    paddingHorizontal: 15,
  },

  logoutButton: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 12,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
