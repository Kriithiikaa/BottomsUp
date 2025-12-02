// the logic for saved events

// Runtime-safe wrapper around AsyncStorage with in-memory fallback.
import { LogBox } from 'react-native';

type KV = { [k: string]: string };

let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // no-op; we'll use in-memory fallback
  console.warn('AsyncStorage not installed — using in-memory fallback for saved events.');
}

const memoryStore: KV = {};

export async function storageGet(key: string): Promise<string | null> {
  if (AsyncStorage) return AsyncStorage.getItem(key);
  return memoryStore[key] ?? null;
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (AsyncStorage) return AsyncStorage.setItem(key, value);
  memoryStore[key] = value;
}

export async function storageRemove(key: string): Promise<void> {
  if (AsyncStorage) return AsyncStorage.removeItem(key);
  delete memoryStore[key];
}

// Saved events helpers
const SAVED_KEY = 'SAVED_EVENTS_V1';
const RSVPED_KEY = 'RSVPED_EVENTS_V1';
const NOTES_KEY = 'EVENT_NOTES_V1';
const NOTES_LIST_KEY = 'EVENT_NOTES_LIST_V1';

export type SavedEvent = {
  id: string;
  title?: string;
  subtitle?: string;
  location?: string;
  image?: string;
};

export type FriendNote = {
  id: string;
  author: string;
  avatar?: string;
  text: string;
};

export async function getSavedEvents(): Promise<SavedEvent[]> {
  try {
    const raw = await storageGet(SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedEvent[];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('getSavedEvents parse error', e);
    return [];
  }
}

export async function saveEvent(evt: SavedEvent): Promise<void> {
  const list = await getSavedEvents();
  const exists = list.find((x) => x.id === evt.id);
  if (exists) return;
  list.unshift(evt);
  await storageSet(SAVED_KEY, JSON.stringify(list));
  // notify listeners
  notifySavedListeners(list);
}

export async function removeSavedEvent(id: string): Promise<void> {
  const list = await getSavedEvents();
  const next = list.filter((x) => x.id !== id);
  await storageSet(SAVED_KEY, JSON.stringify(next));
  // notify listeners
  notifySavedListeners(next);
}

// simple subscription API so UI can react to saved list changes
type SavedListener = (list: SavedEvent[]) => void;
const _savedListeners: SavedListener[] = [];

function notifySavedListeners(list: SavedEvent[]) {
  try {
    _savedListeners.forEach((cb) => {
      try {
        cb(list.slice());
      } catch (e) {
        // ignore listener errors
      }
    });
  } catch (e) {
    // ignore
  }
}

export function subscribeSavedEvents(cb: SavedListener): () => void {
  _savedListeners.push(cb);
  return () => {
    const idx = _savedListeners.indexOf(cb);
    if (idx >= 0) _savedListeners.splice(idx, 1);
  };
}

// RSVP'd events helpers (share the SavedEvent shape)
export async function getRsvpedEvents(): Promise<SavedEvent[]> {
  try {
    const raw = await storageGet(RSVPED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedEvent[];
  } catch (e) {
    console.log('getRsvpedEvents parse error', e);
    return [];
  }
}

export async function saveRsvpedEvent(evt: SavedEvent): Promise<void> {
  const list = await getRsvpedEvents();
  const exists = list.find((x) => x.id === evt.id);
  if (exists) return;
  list.unshift(evt);
  await storageSet(RSVPED_KEY, JSON.stringify(list));
  notifyRsvpedListeners(list);
}

export async function removeRsvpedEvent(id: string): Promise<void> {
  const list = await getRsvpedEvents();
  const next = list.filter((x) => x.id !== id);
  await storageSet(RSVPED_KEY, JSON.stringify(next));
  notifyRsvpedListeners(next);
}

type RsvpedListener = (list: SavedEvent[]) => void;
const _rsvpedListeners: RsvpedListener[] = [];

function notifyRsvpedListeners(list: SavedEvent[]) {
  try {
    _rsvpedListeners.forEach((cb) => {
      try {
        cb(list.slice());
      } catch (e) {
        // ignore listener errors
      }
    });
  } catch (e) {
    // ignore
  }
}

export function subscribeRsvpedEvents(cb: RsvpedListener): () => void {
  _rsvpedListeners.push(cb);
  return () => {
    const idx = _rsvpedListeners.indexOf(cb);
    if (idx >= 0) _rsvpedListeners.splice(idx, 1);
  };
}

// Per-event notes (simple map of id -> text)
type NoteMap = { [id: string]: string };

async function loadNotes(): Promise<NoteMap> {
  try {
    const raw = await storageGet(NOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NoteMap;
  } catch (e) {
    console.log('loadNotes parse error', e);
    return {};
  }
}

async function saveNotesMap(map: NoteMap): Promise<void> {
  try {
    await storageSet(NOTES_KEY, JSON.stringify(map));
  } catch (e) {
    console.log('saveNotesMap error', e);
  }
}

export async function getEventNote(id: string): Promise<string> {
  const map = await loadNotes();
  return map[id] || '';
}

export async function setEventNote(id: string, note: string): Promise<void> {
  const map = await loadNotes();
  if (note && note.trim().length > 0) {
    map[id] = note;
  } else {
    delete map[id];
  }
  await saveNotesMap(map);
}

// Notes list (for carousel of friend notes)
type NotesListMap = { [id: string]: FriendNote[] };

async function loadNotesListMap(): Promise<NotesListMap> {
  try {
    const raw = await storageGet(NOTES_LIST_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NotesListMap;
  } catch (e) {
    console.log('loadNotesListMap parse error', e);
    return {};
  }
}

async function saveNotesListMap(map: NotesListMap): Promise<void> {
  try {
    await storageSet(NOTES_LIST_KEY, JSON.stringify(map));
  } catch (e) {
    console.log('saveNotesListMap error', e);
  }
}

export async function getEventNotesList(eventId: string): Promise<FriendNote[]> {
  const map = await loadNotesListMap();
  return map[eventId] || [];
}

export async function addEventNote(eventId: string, note: FriendNote): Promise<void> {
  const map = await loadNotesListMap();
  const existing = map[eventId] || [];
  map[eventId] = [note, ...existing];
  await saveNotesListMap(map);
}

export async function removeEventNote(eventId: string, noteId: string): Promise<void> {
  const map = await loadNotesListMap();
  const existing = map[eventId] || [];
  const next = existing.filter((n) => n.id !== noteId);
  map[eventId] = next;
  await saveNotesListMap(map);
}

export async function updateEventNote(eventId: string, note: FriendNote): Promise<void> {
  const map = await loadNotesListMap();
  const existing = map[eventId] || [];
  map[eventId] = existing.map((n) => (n.id === note.id ? note : n));
  await saveNotesListMap(map);
}
