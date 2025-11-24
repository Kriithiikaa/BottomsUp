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

export type SavedEvent = {
  id: string;
  title?: string;
  subtitle?: string;
  location?: string;
  image?: string;
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
