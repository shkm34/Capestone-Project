# Offline-first flow: Auth from server → IDB → Rehydrate

## How it works today (current code)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. App loads                                                             │
│    initStorePersistence()                                                │
│         │                                                                │
│         ▼                                                                │
│    loadFromIndexedDB()  ──►  ONE blob: { auth, progress, sync, userProfile }  │
│         │                     (whoever was last saved – e.g. User A)      │
│         ▼                                                                │
│    Rehydrate EVERYTHING into Redux  (auth + progress + sync + userProfile) │
│         │                                                                │
│         ▼                                                                │
│    getSession()  ──►  Server says: "current user = User B"              │
│         │                                                                │
│         ▼                                                                │
│    if (rehydratedUserId !== sessionUser.id)  ──►  CLEAR progress/sync/profile  │
│    dispatch(setUser(sessionUser))                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Your point:** IndexedDB is **not** synced with the server. We rehydrate from **whatever was last in IDB** (old user’s data), then we correct by clearing when the session user is different. So:

- **New user (B)** after another user (A): we briefly have A’s data, then we clear and set B → correct.
- **Same user (A)** after logout then login: we might have cleared (if rehydrated userId was null) or kept A’s data → fragile.

So yes: **states get hydrated from the same older IndexedDB data first; only then we apply server auth and optionally clear.** That matches the code.

---

## What should happen (design you described)

1. **When any user logs in** → **auth comes from the server** (getSession).
2. **That auth is what we trust** → we **save it to IndexedDB** (so IDB reflects “current user”).
3. **Rehydrate other states** (progress, sync, userProfile) **only when they belong to that user**:
   - Load the single IDB blob.
   - Use **auth from server** (session user).
   - If the **persisted blob’s auth.userId** equals **session user id** → the blob is for this user → **rehydrate progress/sync/profile** from that blob.
   - Otherwise → do **not** rehydrate progress/sync/profile (or set them to initial); they will be filled by app use and then persisted.

So the order becomes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Load blob from IndexedDB (read-only; do not apply to Redux yet).     │
│ 2. getSession()  ──►  Auth from SERVER (source of truth for “who is in”). │
│ 3. dispatch(setUser(sessionUser))  ──►  Auth in Redux = server auth.     │
│ 4. If persistedBlob.auth.userId === sessionUser.id:                     │
│      Rehydrate progress, sync, userProfile from that blob.               │
│    Else:                                                                 │
│      Leave progress/sync/profile at initial (or fetch from server later).│
│ 5. Store subscribes: on any state change, save to IDB (auth + progress  │
│    + sync + userProfile). So IDB always holds “current user’s” state.   │
└─────────────────────────────────────────────────────────────────────────┘
```

So: **auth from server → save to IDB (via normal persist) → rehydrate other states only when IDB data is for that user.** Progress persistence stays mandatory (we still persist progress in the single blob).

---

## Is this good for “offline-first until online”?

Yes, with one clarification.

- **Offline-first:** App works from local state (Redux). Progress is persisted in IndexedDB so it survives refresh and works offline. No need to hit the server for every read.
- **Until online:** When online, we:
  - Use **server for auth** (who is logged in) so we never show the wrong user.
  - Optionally sync progress/scores to the server when back online (you already have flushPendingScores, etc.).

So the design is:

- **Auth:** Server is source of truth on login; we persist it to IDB and use it to decide whether to rehydrate the rest.
- **Progress (and sync/profile):** Persisted in IDB for the current user only (one blob). Rehydrated only when the persisted blob belongs to the current (server) user.

That keeps a **single IDB container**, **mandatory progress persistence**, and **correct per-user UI** without creating many IDB keys. It fits “offline-first until online” because:

1. We trust server for **identity** (auth) when we have a session.
2. We use IDB for **durability and offline** (progress + sync + profile) for that user only.
3. When the user changes, we don’t rehydrate old user’s progress; when the same user is back, we do rehydrate their progress.
