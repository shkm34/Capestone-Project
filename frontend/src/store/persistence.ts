/**
 * Saves and loads Redux state (auth, progress, sync, userProfile) in IndexedDB
 * so it survives refresh and works offline.
 */

const DB_NAME = "logic-looper-db";
const STORE_NAME = "persisted-state";
const KEY = "root";

/** Shape of user profile we persist (matches API response). */
export interface PersistedUserProfile {
  id: string;
  email: string | null;
  streakCount: number;
  lastPlayed: string | null;
  totalPoints: number;
  stats: { puzzlesSolved: number; avgSolveTimeMs: number | null } | null;
  dailyScores: Array<{ date: string; puzzleId: string; score: number; timeTakenMs: number | null }>;
}

export interface PersistedState {
  auth: { userId: string | null; email: string | null; isGuest: boolean };
  progress: {
    completedByDate: Record<string, { solved: boolean; usedHint: boolean }>;
    streak: number;
  };
  sync: { pendingScores: unknown[]; lastSyncAt: string | null };
  userProfile: { user: PersistedUserProfile | null; lastFetchedAt: string | null };
}

/** Turn an IndexedDB request into a Promise (IDB API is event-based). */
function promiseFrom<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Open our database; create the store on first run. */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
  });
}

/** Loaded state may omit userProfile (old persisted data). */
type LoadedState = Omit<PersistedState, 'userProfile'> & { userProfile?: PersistedState['userProfile'] };

/** Read saved state from disk. Returns null if nothing saved or not in browser. */
export async function loadFromIndexedDB(): Promise<LoadedState | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const raw = await promiseFrom(store.get(KEY));
  db.close();
  return raw != null ? (raw as LoadedState) : null;
}

/** Write state to disk. */
export async function saveToIndexedDB(state: PersistedState): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(
    { auth: state.auth, progress: state.progress, sync: state.sync, userProfile: state.userProfile },
    KEY,
  );
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

const SAVE_DELAY_MS = 300;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export type GetState = () => {
  auth: PersistedState["auth"];
  progress: PersistedState["progress"];
  sync: PersistedState["sync"];
  userProfile: PersistedState["userProfile"];
};

/**
 * 1. Load saved state from IndexedDB and put it in Redux.
 * 2. When Redux changes, save to IndexedDB after a short delay (debounce).
 */
export async function initPersistence(store: {
  getState: GetState;
  dispatch: (a: unknown) => void;
  subscribe: (listener: () => void) => () => void;
}): Promise<void> {
  const saved = await loadFromIndexedDB();
  if (saved) {
    store.dispatch({ type: "auth/rehydrateAuth", payload: saved.auth });
    store.dispatch({
      type: "progress/rehydrateProgress",
      payload: saved.progress,
    });
    store.dispatch({ type: "sync/rehydrateSync", payload: saved.sync });
    if (saved.userProfile) {
      store.dispatch({ type: "userProfile/rehydrateUserProfile", payload: saved.userProfile });
    }
  }

  store.subscribe(() => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      const state = store.getState();
      saveToIndexedDB({
        auth: state.auth,
        progress: state.progress,
        sync: state.sync,
        userProfile: { user: state.userProfile.user, lastFetchedAt: state.userProfile.lastFetchedAt },
      }).catch((err) => console.warn("[persistence] save failed", err));
    }, SAVE_DELAY_MS);
  });
}
