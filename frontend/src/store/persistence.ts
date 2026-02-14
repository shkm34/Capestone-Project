/**
 * Custom IndexedDB persistence for Redux. No redux-persist.
 * Persists auth, progress, sync slices so state survives refresh and works offline.
 */

const DB_NAME = 'logic-looper-db';
const STORE_NAME = 'persisted-state';
const KEY = 'root';

export interface PersistedState {
  auth: { userId: string | null; email: string | null; isGuest: boolean };
  progress: { completedByDate: Record<string, { solved: boolean; usedHint: boolean }>; streak: number };
  sync: { pendingScores: unknown[]; lastSyncAt: string | null };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
  });
}

export function loadFromIndexedDB(): Promise<PersistedState | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return openDB().then((db) => {
    return new Promise<PersistedState | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        db.close();
        const raw = req.result;
        if (raw == null) {
          resolve(null);
          return;
        }
        try {
          resolve(raw as PersistedState);
        } catch {
          resolve(null);
        }
      };
    });
  });
}

export function saveToIndexedDB(state: PersistedState): Promise<void> {
  if (typeof indexedDB === 'undefined') return Promise.resolve();
  return openDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const payload: PersistedState = {
        auth: state.auth,
        progress: state.progress,
        sync: state.sync,
      };
      store.put(payload, KEY);
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  });
}

const DEBOUNCE_MS = 300;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export type GetState = () => {
  auth: PersistedState['auth'];
  progress: PersistedState['progress'];
  sync: PersistedState['sync'];
};

/** Call after store is created: load from IndexedDB and dispatch rehydrate actions, then subscribe to save on changes. */
export function initPersistence(
  store: { getState: GetState; dispatch: (a: unknown) => void; subscribe: (listener: () => void) => () => void }
): Promise<void> {
  return loadFromIndexedDB().then((persisted) => {
    if (persisted) {
      store.dispatch({ type: 'auth/rehydrateAuth', payload: persisted.auth });
      store.dispatch({ type: 'progress/rehydrateProgress', payload: persisted.progress });
      store.dispatch({ type: 'sync/rehydrateSync', payload: persisted.sync });
    }

    store.subscribe(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        const state = store.getState();
        saveToIndexedDB({
          auth: state.auth,
          progress: state.progress,
          sync: state.sync,
        }).catch((err) => console.warn('[persistence] save failed', err));
      }, DEBOUNCE_MS);
    });
  });
}
