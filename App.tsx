import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import SavedScreen from "./src/screens/SavedScreen";
import ChatScreen from "./src/screens/ChatScreen";
import BottomTabs from "./src/components/BottomTabs";

// ⭐ ADD THIS:
import { SavedEventsProvider } from "./src/context/SavedEventsContext";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "saved" | "chat">("home");

  return (
    <SafeAreaProvider>
      {/* ⭐ Wrap ENTIRE APP in provider */}
      <SavedEventsProvider>
        <View style={styles.container}>
          {activeTab === "home" && <HomeScreen />}
          {activeTab === "saved" && <SavedScreen />}
          {activeTab === "chat" && <ChatScreen />}

          <BottomTabs
            activeTab={activeTab}
            onPressHome={() => setActiveTab("home")}
            onPressSaved={() => setActiveTab("saved")}
            onPressChat={() => setActiveTab("chat")}
          />
        </View>
      </SavedEventsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
