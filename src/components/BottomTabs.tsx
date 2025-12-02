// src/components/BottomTabs.tsx

import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";

type Props = {
  activeTab: "home" | "saved" | "chat";
  onPressHome: () => void;
  onPressSaved: () => void;
  onPressChat: () => void;
};

/* -----------------------------------------------------------
   INLINE THEME (no external file needed)
------------------------------------------------------------ */

const lightTheme = {
  cardBackground: "#FFFFFF",
  textPrimary: "#222",
  textSecondary: "#777",
  tabIconActive: "#FF7A30", // citrus orange
  tabIconInactive: "#A0A0A0",
  border: "#E5E5E5",
};

const darkTheme = {
  cardBackground: "#18181C",
  textPrimary: "#FFFFFF",
  textSecondary: "#999",
  tabIconActive: "#1A73E8", // neon blue
  tabIconInactive: "#5A5F66",
  border: "#2A2C30",
};

export default function BottomTabs({
  activeTab,
  onPressHome,
  onPressSaved,
  onPressChat,
}: Props) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom || 10,
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.border,
        },
      ]}
    >
      {/* HOME TAB */}
      <TouchableOpacity style={styles.tab} onPress={onPressHome}>
        <Icon
          name={activeTab === "home" ? "home" : "home-outline"}
          size={30}
          color={
            activeTab === "home" ? theme.tabIconActive : theme.tabIconInactive
          }
        />

        {activeTab === "home" && (
          <Text style={[styles.label, { color: theme.tabIconActive }]}>
            Home
          </Text>
        )}
      </TouchableOpacity>

      {/* SAVED TAB */}
      <TouchableOpacity style={styles.tab} onPress={onPressSaved}>
        <Icon
          name={activeTab === "saved" ? "bookmark" : "bookmark-outline"}
          size={30}
          color={
            activeTab === "saved" ? theme.tabIconActive : theme.tabIconInactive
          }
        />

        {activeTab === "saved" && (
          <Text style={[styles.label, { color: theme.tabIconActive }]}>
            Saved
          </Text>
        )}
      </TouchableOpacity>

      {/* GROUP/CHAT TAB */}
      <TouchableOpacity style={styles.tab} onPress={onPressChat}>
        <Icon
          name={activeTab === "chat" ? "chat" : "chat-outline"}
          size={30}
          color={
            activeTab === "chat" ? theme.tabIconActive : theme.tabIconInactive
          }
        />

        {activeTab === "chat" && (
          <Text style={[styles.label, { color: theme.tabIconActive }]}>
            Groups
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* -----------------------------------------------------------
   STYLES
------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: "row",
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
});

export {};
