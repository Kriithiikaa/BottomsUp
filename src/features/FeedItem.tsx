import React, { useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
  PanResponder,
} from 'react-native';

type Props = {
  id?: string;
  title: string;
  subtitle?: string; // e.g., time text
  location?: string;
  image?: string; // uri
  onPress?: (e?: GestureResponderEvent) => void;
  onShare?: () => void;
  saved?: boolean;
  rsvped?: boolean;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  showHeart?: boolean;
};

export default function FeedItem({
  title,
  subtitle,
  location,
  image,
  onPress,
  onShare,
  saved = false,
  rsvped = false,
  onSwipeRight,
  onSwipeLeft,
  showHeart = false,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  const heartOpacity = translateX.interpolate({
    inputRange: [0, 10, 140],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });
  const heartScale = translateX.interpolate({
    inputRange: [0, 140],
    outputRange: [0.9, 1.25],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 6,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => {
        const clampedX = Math.max(Math.min(gesture.dx, 140), -140);
        translateX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 70) {
          Animated.timing(translateX, {
            toValue: 160,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (onSwipeRight) onSwipeRight();
          });
        } else if (gesture.dx < -70) {
          Animated.timing(translateX, {
            toValue: -160,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (onSwipeLeft) onSwipeLeft();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View style={[styles.rowWrapper, rsvped && styles.rowWrapperRsvped, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      <TouchableOpacity style={styles.inner} activeOpacity={0.9} onPress={onPress}>
        <View style={styles.leftThumb}>
          {image ? (
            <Image source={{ uri: image }} style={styles.thumbImage} />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
        </View>

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {location ? <Text style={styles.location}>{location}</Text> : null}
        </View>

        {rsvped ? (
          <View style={styles.savedBadge} pointerEvents="none">
            <Text style={styles.savedText}>You're In</Text>
          </View>
        ) : null}

        {(showHeart || saved) ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heartOverlay,
              saved
                ? { opacity: 1, transform: [{ scale: 1.1 }] }
                : { opacity: heartOpacity, transform: [{ scale: heartScale }] },
            ]}
          >
            <Text style={styles.heartOverlayIcon}>♥</Text>
          </Animated.View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#2b2b23',
    overflow: 'hidden',
  },
  rowWrapperRsvped: {
    opacity: 0.72,
    backgroundColor: '#24241e',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  leftThumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: '#222',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#cfcfcf',
  },
  location: {
    marginTop: 4,
    fontSize: 13,
    color: '#9da1a3',
  },
  savedBadge: {
    position: 'absolute',
    right: 18,
    top: 12,
    backgroundColor: '#ffb26b',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 4,
  },
  savedText: {
    color: '#8c3d00',
    fontWeight: '700',
    fontSize: 12,
  },
  heartOverlay: {
    position: 'absolute',
    right: 10,
    top: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
    zIndex: 5,
    elevation: 6,
  },
  heartOverlayIcon: {
    fontSize: 22,
    color: '#ff8a3d',
    fontWeight: '800',
  },
});
