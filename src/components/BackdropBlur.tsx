// creates a slight blur when a card is opened in homepage

import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function BackdropBlur({ children }: { children?: React.ReactNode }) {
  try {
    // Try the community blur package
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BlurView } = require('@react-native-community/blur');
    return <BlurView style={styles.fill} blurType="light" blurAmount={8}>{children}</BlurView>;
  } catch (e1) {
    try {
      // Try expo blur
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { BlurView } = require('expo-blur');
      return <BlurView intensity={60} style={styles.fill}>{children}</BlurView>;
    } catch (e2) {
      // Fallback to semi-transparent overlay
      return <View style={styles.fallback}>{children}</View>;
    }
  }
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});
