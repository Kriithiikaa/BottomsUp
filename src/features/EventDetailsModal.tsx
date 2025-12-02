//when clicked on a card

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  TextInput,
} from 'react-native';
import Icon from '../components/Icon';
import BackdropBlur from '../components/BackdropBlur';
// linear gradient removed — keep UI simple and dependency-free
import { saveEvent, removeSavedEvent, getSavedEvents, getRsvpedEvents, saveRsvpedEvent, removeRsvpedEvent, getEventNotesList, addEventNote, removeEventNote, updateEventNote, FriendNote } from '../constants/storage';
import { EVENTS, Event } from '../constants/Events';

type Props = {
  visible: boolean;
  onClose: () => void;
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  location?: string;
  image?: string;
  tags?: string[];
  onSavedChange?: (id: string | undefined, saved: boolean) => void;
  onRelatedSelect?: (event: Event) => void;
};

const defaultFriendNotes: FriendNote[] = [
  { id: 'default-1', author: 'Ritu', avatar: ':)', text: 'Leaving in 30 mins' },
  { id: 'default-2', author: 'Alex', avatar: ':)', text: 'Meet at the entrance?' },
];

export default function EventDetailsModal({
  visible,
  onClose,
  id,
  title,
  subtitle,
  description,
  location,
  image,
  tags,
  onSavedChange,
  onRelatedSelect,
}: Props) {
  const [rsvped, setRsvped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState<FriendNote[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteAction, setNoteAction] = useState<FriendNote | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const screenHeight = Dimensions.get('window').height;
  const collapsedTop = Math.max(screenHeight * 0.35, screenHeight - 520);
  const expandedTop = screenHeight * 0.1; // ~90% height visible
  const sheetY = useRef(new Animated.Value(screenHeight)).current; // animated top

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        const [savedList, rsvpedList] = await Promise.all([getSavedEvents(), getRsvpedEvents()]);
        if (!mounted) return;
        const isSaved = savedList.some((x) => x.id === id);
        const isRsvped = rsvpedList.some((x) => x.id === id);
        setSaved(isSaved);
        setRsvped(isRsvped);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const relatedEvent = useMemo(() => {
    const primaryTag = (tags && tags.length ? tags[0] : undefined)?.toLowerCase();
    if (!primaryTag) return null;
    return (
      EVENTS.find((ev) => ev.id !== id && ev.category && ev.category.toLowerCase() === primaryTag) ||
      null
    );
  }, [tags, id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setNotes([]);
        return;
      }
      try {
        const existing = await getEventNotesList(id);
        if (!mounted) return;
        setNotes(existing.length ? existing : defaultFriendNotes);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (visible) {
      sheetY.setValue(screenHeight);
      Animated.spring(sheetY, {
        toValue: collapsedTop,
        useNativeDriver: false,
        damping: 18,
        stiffness: 180,
      }).start();
    } else {
      sheetY.setValue(screenHeight);
    }
  }, [visible, collapsedTop, screenHeight, sheetY]);

  useEffect(() => {
    if (!visible) {
      setShowAddNote(false);
      setNewNoteText('');
      setEditingNoteId(null);
      setNoteAction(null);
      setSavingNote(false);
    }
  }, [visible]);

  const onRsvp = () => {
    const next = !rsvped;
    setRsvped(next);
    // If RSVP'ing from a saved event, remove it from saved list so it disappears there.
    if (next && saved && id) {
      setSaved(false);
      removeSavedEvent(id)
        .then(() => {
          if (typeof onSavedChange === 'function') onSavedChange(id, false);
        })
        .catch(() => {
          // ignore remove errors
        });
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.06, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    (async () => {
      try {
        if (next && id) {
          await saveRsvpedEvent({ id, title, subtitle, location, image });
        } else if (!next && id) {
          await removeRsvpedEvent(id);
        }
      } catch (err) {
        console.log('save rsvped event failed', err);
      }
    })();
  };

  const onToggleSaved = () => {
    const next = !saved;
    setSaved(next);
    (async () => {
      try {
        if (next && id) {
          await saveEvent({ id, title, subtitle, location, image });
        } else if (!next && id) {
          await removeSavedEvent(id);
        }
        if (typeof onSavedChange === 'function') onSavedChange(id, next);
      } catch (err) {
        console.log('toggle saved failed', err);
      }
    })();
  };

  const onShareEvent = async () => {
    try {
      const messageParts = [
        title || 'Check this event',
        subtitle ? `When: ${subtitle}` : null,
        location ? `Where: ${location}` : null,
      ].filter(Boolean);
      const message = messageParts.join('\n');
      await Share.share({ message });
    } catch (err) {
      console.log('share event failed', err);
    }
  };

  const onSubmitNote = async () => {
    if (!id || !newNoteText.trim()) return;
    try {
      setSavingNote(true);
      if (editingNoteId) {
        const updated: FriendNote = {
          id: editingNoteId,
          author: 'You',
          avatar: '🙂',
          text: newNoteText.trim(),
        };
        setNotes((prev) => prev.map((n) => (n.id === editingNoteId ? updated : n)));
        await updateEventNote(id, updated);
        setEditingNoteId(null);
      } else {
        const note: FriendNote = {
          id: `${Date.now()}`,
          author: 'You',
          avatar: '🙂',
          text: newNoteText.trim(),
        };
        await addEventNote(id, note);
        setNotes((prev) => [note, ...prev]);
      }
      setShowAddNote(false);
      setNewNoteText('');
    } catch (err) {
      console.log('save note failed', err);
    } finally {
      setSavingNote(false);
    }
  };

  const onDeleteNote = async (noteId: string) => {
    if (!id) return;
    try {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      await removeEventNote(id, noteId);
    } catch (err) {
      console.log('remove note failed', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <BackdropBlur />
        <TouchableOpacity style={styles.fullPress} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[styles.sheet, { top: sheetY }]}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            scrollEventThrottle={16}
            onScroll={(evt) => {
              if (evt.nativeEvent.contentOffset.y > 2) {
                Animated.spring(sheetY, {
                  toValue: expandedTop,
                  useNativeDriver: false,
                  damping: 18,
                  stiffness: 180,
                }).start();
              }
            }}
          >
            {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
            <Text style={[styles.title, image && styles.titleWithImage]}>{title}</Text>
            <View style={styles.metaSection}>
              {subtitle ? (
                <View style={[styles.metaRow, styles.metaTime]}>
                  <View style={styles.metaIcon}>
                    <Icon name="clock-outline" size={18} color="#1f5dcf" />
                  </View>
                  <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
              ) : null}
              {location ? (
                <View style={[styles.metaRow, styles.metaLocation]}>
                  <View style={[styles.metaIcon, styles.metaIconLocation]}>
                    <Icon name="map-marker" size={18} color="#e35555" />
                  </View>
                  <Text style={styles.location} numberOfLines={1}>{location}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.rsvpGlow}> 
                <Animated.View style={{ transform: [{ scale }] }}>
                  <TouchableOpacity
                    style={[styles.rsvpButton, rsvped && styles.rsvpActive]}
                    onPress={onRsvp}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.rsvpText, rsvped && styles.rsvpTextActive]}>
                      {rsvped ? 'You are in!' : 'Reserve Spot'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              <TouchableOpacity style={[styles.heartBtn, styles.heartBtnRight, saved && styles.heartBtnActive]} activeOpacity={0.8} onPress={onToggleSaved}>
                <Text style={[styles.heartIcon, saved && styles.heartIconActive]}>{saved ? '♥' : '♡'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.shareBtn]} activeOpacity={0.85} onPress={onShareEvent}>
                <Icon name="share-variant" size={22} color="#1f5dcf" />
              </TouchableOpacity>
            </View>

            {description ? (
              <>
                <View style={styles.separator} />
                <View style={styles.descriptionBlock}>
                  <Text style={styles.descriptionHeading}>Details</Text>
                  <Text style={styles.description}>{description}</Text>
                </View>
                <View style={styles.separator} />
              </>
            ) : null}

            <View style={styles.notesBlock}>
              <View style={styles.notesHeader}>
                <Text style={styles.notesHeading}>Notes from friends</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.notesCarousel}>
                <TouchableOpacity style={styles.addNoteCard} activeOpacity={0.9} onPress={() => setShowAddNote(true)}>
                  <Icon name="plus-circle" size={22} color="#1f5dcf" />
                  <Text style={styles.addNoteText}>Add your note</Text>
                </TouchableOpacity>
                {notes.map((n) => (
                  <TouchableOpacity key={n.id} style={styles.noteCard} activeOpacity={n.author === 'You' ? 0.85 : 1} onPress={n.author === 'You' ? () => setNoteAction(n) : undefined}>
                    <View style={styles.noteCardHeader}>
                      <View style={styles.noteAvatar}>
                        <Text style={styles.noteAvatarText}>{n.avatar || n.author?.slice(0, 1) || ':)'}</Text>
                      </View>
                      <Text style={styles.noteAuthor} numberOfLines={1}>{n.author || 'Friend'}</Text>
                    </View>
                    <Text style={styles.noteText} numberOfLines={1}>{n.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {relatedEvent ? (
              <>
                <View style={styles.separator} />
                <View style={styles.relatedBlock}>
                  <Text style={styles.relatedHeading}>You might like this</Text>
                  <TouchableOpacity style={styles.relatedCard} activeOpacity={0.9} onPress={() => onRelatedSelect && relatedEvent && onRelatedSelect(relatedEvent)}>
                    <Image source={{ uri: relatedEvent.image }} style={styles.relatedImage} />
                    <View style={styles.relatedMeta}>
                      <Text style={styles.relatedTitle} numberOfLines={1}>{relatedEvent.title}</Text>
                      {relatedEvent.location ? <Text style={styles.relatedLocation}>{relatedEvent.location}</Text> : null}
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </ScrollView>
        </Animated.View>

        {showAddNote ? (
          <View style={styles.addNoteOverlay}>
            <TouchableOpacity style={styles.addNoteBackdrop} activeOpacity={1} onPress={() => setShowAddNote(false)} />
            <View style={styles.addNoteSheet}>
              <Text style={styles.addNoteTitle}>{editingNoteId ? 'Edit your note' : 'Add a note'}</Text>
              <TextInput
                style={styles.addNoteInput}
                placeholder="Share a quick thought for friends"
                placeholderTextColor="#97a3ab"
                multiline
                value={newNoteText}
                onChangeText={setNewNoteText}
              />
              <View style={styles.addNoteActions}>
                <TouchableOpacity style={styles.addNoteCancel} activeOpacity={0.85} onPress={() => { setShowAddNote(false); setNewNoteText(''); }}>
                  <Text style={styles.addNoteCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addNotePost, (savingNote || !newNoteText.trim()) && styles.addNotePostDisabled]}
                  activeOpacity={0.85}
                  onPress={onSubmitNote}
                  disabled={savingNote || !newNoteText.trim()}
                >
                  <Text style={styles.addNotePostText}>{savingNote ? 'Posting...' : 'Post'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {noteAction ? (
          <View style={styles.actionOverlay}>
            <TouchableOpacity style={styles.actionBackdrop} activeOpacity={1} onPress={() => setNoteAction(null)} />
            <View style={styles.actionSheet}>
              <Text style={styles.actionTitle}>Your note</Text>
              <Text style={styles.actionPreview} numberOfLines={2}>{noteAction.text}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionEdit]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setNoteAction(null);
                    setShowAddNote(true);
                    setEditingNoteId(noteAction.id);
                    setNewNoteText(noteAction.text);
                  }}
                >
                  <Text style={styles.actionEditText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionDelete]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setNoteAction(null);
                    onDeleteNote(noteAction.id);
                  }}
                >
                  <Text style={styles.actionDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.actionCancel} onPress={() => setNoteAction(null)} activeOpacity={0.85}>
                <Text style={styles.actionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: Dimensions.get('window').height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 30,
    paddingBottom: 24,
    overflow: 'hidden',
    zIndex: 2,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  image: {
    width: '100%',
    height: 190,
    resizeMode: 'cover',
    borderRadius: 14,
    marginBottom: 14,
  },
  content: {
    paddingHorizontal: 16,
  },
  contentInner: {
    paddingBottom: 90,
  },
  fullPress: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  titleWithImage: {
    marginTop: 10,
  },
  subtitle: {
    marginLeft: 8,
    color: '#2d3748',
    fontSize: 14,
    fontWeight: '500',
  },
  location: {
    marginLeft: 8,
    color: '#57606a',
    fontSize: 13,
    fontWeight: '500',
  },
  description: {
    marginTop: 6,
    color: '#444',
    fontSize: 14,
    lineHeight: 18,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  metaTime: {
    marginTop: 4,
  },
  metaLocation: {
    marginTop: 0,
  },
  metaSection: {
    marginTop: 0,
    position: 'relative',
    paddingRight: 0,
  },
  metaIcon: {
    marginRight: 2,
  },
  metaIconLocation: {
    marginTop: 0,
  },
  topShareBtn: {
    display: 'none',
  },
  descriptionBlock: {
    marginTop: 5,
  },
  descriptionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 12,
    marginBottom: 8,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpGlow: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 0,
    padding: 0,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
    marginRight: 0,
  },
  rsvpButton: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    overflow: 'hidden',
  },
  rsvpActive: {
    backgroundColor: '#ffb26b',
  },
  rsvpText: {
    color: '#2b7cff',
    fontWeight: '700',
    fontSize: 15,
  },
  rsvpTextActive: {
    color: '#8c3d00',
  },
  heartBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    borderWidth: 1,
    borderColor: '#e5e6ed',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heartBtnRight: {
    marginLeft: 10,
  },
  heartBtnActive: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffcf99',
    shadowColor: '#f59e42',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  heartIcon: {
    fontSize: 22,
    color: '#d33a5c',
  },
  heartIconActive: {
    color: '#c45a00',
  },
  iconBtn: {
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    borderWidth: 1,
    borderColor: '#e5e6ed',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginLeft: 12,
  },
  shareBtn: {
    backgroundColor: '#eef5ff',
    borderColor: '#d8e7ff',
  },
  relatedBlock: {
    marginTop: 6,
    paddingVertical: 6,
    marginBottom: 12,
  },
  relatedHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e8ebf0',
  },
  relatedImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 10,
  },
  relatedMeta: {
    flex: 1,
    minWidth: 0,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  relatedCategory: {
    marginTop: 2,
    color: '#2b7cff',
    fontSize: 13,
    fontWeight: '700',
  },
  relatedLocation: {
    marginTop: 2,
    color: '#66707a',
    fontSize: 12,
  },
  notesBlock: {
    marginTop: 4,
    paddingVertical: 4,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notesHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  notesCarousel: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    gap: 10,
  },
  addNoteCard: {
    width: 120,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 10,
  },
  addNoteIcon: {
    marginBottom: 2,
  },
  addNoteText: {
    marginTop: 6,
    fontSize: 13,
    color: '#1f5dcf',
    fontWeight: '700',
    textAlign: 'center',
  },
  noteCard: {
    width: 180,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderColor: '#ececec',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
    position: 'relative',
  },
  noteAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#d9e6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f5dcf',
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    flexShrink: 1,
  },
  noteText: {
    fontSize: 13,
    color: '#3a4148',
    lineHeight: 17,
    marginTop: 2,
    flexShrink: 1,
  },
  addNoteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 30,
  },
  addNoteBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  addNoteSheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  addNoteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  addNoteInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#111',
    backgroundColor: '#fafbfc',
  },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 40,
  },
  actionBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  actionSheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  actionPreview: {
    marginTop: 8,
    color: '#444',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionEdit: {
    backgroundColor: '#eef5ff',
  },
  actionEditText: {
    color: '#1f5dcf',
    fontWeight: '700',
  },
  actionDelete: {
    backgroundColor: '#ffeef1',
  },
  actionDeleteText: {
    color: '#c13c54',
    fontWeight: '700',
  },
  actionCancel: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionCancelText: {
    color: '#4b5563',
    fontWeight: '700',
  },
  addNoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  addNoteCancel: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
  },
  addNoteCancelText: {
    color: '#444',
    fontWeight: '700',
  },
  addNotePost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2b7cff',
  },
  addNotePostDisabled: {
    backgroundColor: '#aac5ff',
  },
  addNotePostText: {
    color: '#fff',
    fontWeight: '700',
  },
});
