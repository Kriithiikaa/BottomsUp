//when clicked on a card

import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  GestureResponderEvent,
  Pressable,
  ScrollView,
} from 'react-native';
import Icon from '../components/Icon';
import BackdropBlur from '../components/BackdropBlur';
import { saveEvent, removeSavedEvent, getSavedEvents } from '../constants/storage';

type Props = {
  visible: boolean;
  onClose: () => void;
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  location?: string;
  image?: string;
  onSavedChange?: (id: string | undefined, saved: boolean) => void;
};

export default function EventDetailsModal({
  visible,
  onClose,
  id,
  title,
  subtitle,
  description,
  location,
  image,
  onSavedChange,
}: Props) {
  const [rsvped, setRsvped] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  // initialize rsvped based on saved events when the modal opens or id changes
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        const list = await getSavedEvents();
        if (!mounted) return;
        const exists = list.some((x) => x.id === id);
        setRsvped(exists);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onShare = async () => {
    try {
      const url = `https://myapp.example/events/${id || ''}`;
      await Share.share({
        message: `${title} — ${subtitle || ''}\n${url}`,
      });
    } catch (e) {
      console.log('Share failed', e);
    }
  };

  const onRsvp = (e?: GestureResponderEvent) => {
    const next = !rsvped;
    setRsvped(next);
    // subtle scale animation
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.06, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    // persist
    (async () => {
      try {
        if (next && id) {
          await saveEvent({ id, title, subtitle, location, image });
        } else if (!next && id) {
          await removeSavedEvent(id);
        }
        // notify parent (HomeFeed) so it can update the feed badge immediately
        if (typeof onSavedChange === 'function') onSavedChange(id, next);
      } catch (err) {
        console.log('save event failed', err);
      }
    })();
    console.log('RSVP', id, next);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <BackdropBlur />

        <Pressable style={styles.fullPress} onPress={onClose} />

        <View style={styles.card} onStartShouldSetResponder={() => true}>
          {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {location ? <Text style={styles.location}>{location}</Text> : null}

            <View style={styles.actionsRow}>
              <Animated.View style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                  style={[styles.rsvpButton, rsvped && styles.rsvpActive]}
                  onPress={onRsvp}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.rsvpText, rsvped && styles.rsvpTextActive]}>
                    {rsvped ? 'RSVP’d' : 'RSVP'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <Icon name="share-variant" size={20} color="#fff" />
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.close} onPress={onClose}>
              <Icon name="close" size={20} color="#333" />
            </TouchableOpacity>
            {/* Attendee note at the bottom */}
            <View style={styles.attendeeNoteWrap}>
              <View style={styles.attendeeNoteBox}>
                <Icon name="account-circle" size={28} color="#2b7cff" />
                <View style={{ flex: 1, marginLeft: 5 }}>
                  <Text style={styles.attendeeNoteText}>
                    <Text style={{ fontWeight: '700', color: '#2b7cff' }}>Riya:</Text> I'm leaving for the event in 30mins!
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
    zIndex: 2,
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  contentInner: {
    paddingBottom: 18,
  },
  fullPress: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    marginTop: 8,
    color: '#444',
    fontSize: 14,
  },
  location: {
    marginTop: 6,
    color: '#7a8a93',
    fontSize: 13,
  },
  description: {
    marginTop: 12,
    color: '#444',
    fontSize: 14,
    lineHeight: 18,
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    marginRight: 12,
  },
  rsvpActive: {
    backgroundColor: '#2b7cff',
  },
  rsvpText: {
    color: '#2b7cff',
    fontWeight: '600',
  },
  rsvpTextActive: {
    color: '#fff',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#111',
  },
  shareText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  close: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 6,
  },
  attendeeNoteWrap: {
    marginTop: 32,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#2b7cff',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 220,
    maxWidth: 340,
  },
  attendeeNoteText: {
    color: '#222',
    fontSize: 15,
  },
});
