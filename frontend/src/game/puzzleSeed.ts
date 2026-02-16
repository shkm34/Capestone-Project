/** Shared deterministic seed derived from an ISO date (YYYY-MM-DD). */
export function seedFromIsoDate(iso: string): number {
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  }
  // Avoid zero seed so PRNG always advances.
  return hash || 1;
}

/** Simple seeded PRNG (LCG). Deterministic, no Math.random(). */
export function createPrng(seed: number) {
  let state = seed >>> 0;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  function nextInt(maxExclusive: number): number {
    state = (a * state + c) % m;
    return state % maxExclusive;
  }

  function nextBool(): boolean {
    return nextInt(2) === 1;
  }

  return { nextInt, nextBool };
}

/** Generic puzzle shape used by non-sequence puzzle types. */
export interface Puzzle<T> {
  type: string;
  seed: number;
  question: T;
  answer: any;
  explanation: string;
}

