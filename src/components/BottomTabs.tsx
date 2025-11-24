// the bottom tab bar

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';

type Props = {
  onPressHome?: () => void;
  onPressSaved?: () => void;
  onPressChat?: () => void;
};

export default function BottomTabs({ onPressHome, onPressSaved, onPressChat }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity style={styles.tab} onPress={onPressHome} activeOpacity={0.7}>
        <Icon name="home-outline" size={22} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={onPressSaved} activeOpacity={0.7}>
        <Icon name="bookmark-outline" size={22} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={onPressChat} activeOpacity={0.7}>
        <Icon name="chat-outline" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    marginTop: 2,
    fontSize: 11,
    color: '#333',
  },
});
