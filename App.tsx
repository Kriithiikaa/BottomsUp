/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import BottomTabs from './src/components/BottomTabs';
import SavedScreen from './src/screens/SavedScreen';
import ChatScreen from './src/screens/ChatScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<'home' | 'saved' | 'chat'>('home');

  return (
    <View style={styles.container as ViewStyle}>
      {screen === 'home' && <HomeScreen />}
      {screen === 'saved' && <SavedScreen />}
      {screen === 'chat' && <ChatScreen />}

      <BottomTabs
        onPressHome={() => setScreen('home')}
        onPressSaved={() => setScreen('saved')}
        onPressChat={() => setScreen('chat')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
