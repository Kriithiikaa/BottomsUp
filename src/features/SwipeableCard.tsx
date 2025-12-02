import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
} from 'react-native';
import { Event } from '../constants/Events';

const screenWidth = Dimensions.get('window').width;

type Props = {
  event: Event;
  onSwipeRight: (event: Event) => void;
  onSwipeLeft: (event: Event) => void;
  saved?: boolean;
};

export default function SwipeableCard({
  event,
  onSwipeRight,
  onSwipeLeft,
  saved = false,
}: Props) {
  const position = useRef(new Animated.ValueXY()).current;
  const descriptionText = event.description || 'Details coming soon';

  // Feedback opacity for tick/cross
  const likeOpacity = position.x.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const rejectOpacity = position.x.interpolate({
    inputRange: [-150, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          // show a quick right-swipe feedback, call the handler, then return the card
          Animated.timing(position, {
            toValue: { x: 160, y: gesture.dy },
            duration: 160,
            useNativeDriver: false,
          }).start(() => {
            try {
              onSwipeRight(event);
            } catch (e) {
              // ignore
            }
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
          });
        } else if (gesture.dx < -120) {
          Animated.timing(position, {
            toValue: { x: -screenWidth - 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => onSwipeLeft(event));
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[position.getLayout(), styles.card]}
    >
      {/* Heart (like) and Cross feedback */}
      <Animated.View style={[styles.like, { opacity: likeOpacity }]}>
        <Text style={[styles.likeText, saved ? styles.heartSaved : styles.heartUnsaved]}>
          {saved ? '♥' : '♡'}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.reject, { opacity: rejectOpacity }]}>
        <Text style={styles.rejectText}>❌</Text>
      </Animated.View>

      {/* Persistent saved heart */}
      {saved ? (
        <Animated.View style={styles.savedBadge} pointerEvents="none">
          <Text style={styles.savedHeart}>♥</Text>
        </Animated.View>
      ) : null}

      {/* Card content */}
      <Image source={{ uri: event.image }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardDesc}>{descriptionText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    height: 400,
    borderRadius: 15,
    backgroundColor: 'white',
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    position: 'absolute',
  },
  cardImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#555' },

  like: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
  },
  likeText: { fontSize: 40, color: 'green', fontWeight: 'bold' },

  reject: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  rejectText: { fontSize: 40, color: 'red', fontWeight: 'bold' },
  heartSaved: { fontSize: 40, color: '#ff2f70', fontWeight: '900' },
  heartUnsaved: { fontSize: 40, color: '#ff2f70', fontWeight: '600' },
  savedBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 6,
  },
  savedHeart: { fontSize: 18, color: '#ff2f70', fontWeight: '900' },
});
