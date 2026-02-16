/** Shared deterministic pseudo-random generator from an ISO date (YYYY-MM-DD). */
export function seedFromIsoDate(iso: string): number {
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  }
  return hash;
}

