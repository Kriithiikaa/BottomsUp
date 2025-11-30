// src/components/BottomTabs.tsx

import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";

type Props = {
  activeTab: "home" | "saved" | "chat";
  onPressHome: () => void;
  onPressSaved: () => void;
  onPressChat: () => void;
};

export default function BottomTabs({
  activeTab,
  onPressHome,
  onPressSaved,
  onPressChat,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {/* HOME TAB */}
      <TouchableOpacity style={styles.tab} onPress={onPressHome}>
        <Icon
          name={activeTab === "home" ? "home" : "home-outline"}
          size={30} // bigger icon
          color={activeTab === "home" ? "#000" : "#777"}
        />
        {activeTab === "home" && <Text style={styles.label}>Home</Text>}
      </TouchableOpacity>

      {/* SAVED TAB */}
      <TouchableOpacity style={styles.tab} onPress={onPressSaved}>
        <Icon
          name={activeTab === "saved" ? "bookmark" : "bookmark-outline"}
          size={30} // bigger icon
          color={activeTab === "saved" ? "#000" : "#777"}
        />
        {activeTab === "saved" && <Text style={styles.label}>Saved</Text>}
      </TouchableOpacity>

      {/* CHAT/GROUPS TAB */}
      <TouchableOpacity style={styles.tab} onPress={onPressChat}>
        <Icon
          name={activeTab === "chat" ? "chat" : "chat-outline"}
          size={30} // bigger icon
          color={activeTab === "chat" ? "#000" : "#777"}
        />
        {activeTab === "chat" && <Text style={styles.label}>Groups</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 78, // slightly taller for bigger icon+label
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
    fontSize: 13, // bigger label
    fontWeight: "700",
    color: "#000",
    marginTop: 4,
  },
});
