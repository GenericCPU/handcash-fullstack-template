/**
 * Weighted loot / openable-crate helpers — pure math, no DB.
 *
 * Use with your own persistence (e.g. Supabase `pool_entries` with `drop_rate` + `quantity`
 * as in RealWorldGoodz): filter rows with stock &gt; 0, map `drop_rate` → weights, call
 * {@link pickWeighted}, then atomically decrement the chosen row.
 *
 * @see docs/WEIGHTED_LOOT_POOLS.md
 */

export interface WeightedPick {
  /** Stable key for logging or DB id. */
  id: string
  /** Relative weight (e.g. normalized percent, or any positive numbers). */
  weight: number
}

export interface StockedPick extends WeightedPick {
  /** Units left in the pool for this row (loot table stock). */
  stock: number
}

/** Sum of weights; throws if empty or total ≤ 0. */
export function totalWeight(weights: readonly number[]): number {
  const t = weights.reduce((a, b) => a + b, 0)
  if (weights.length === 0 || t <= 0) {
    throw new Error("weighted-loot-pool: need at least one positive weight")
  }
  return t
}

/**
 * Roll a single index into `weights` using cumulative distribution.
 * `random` should return values in [0, 1).
 */
export function rollWeightedIndex(weights: readonly number[], random: () => number = Math.random): number {
  const total = totalWeight(weights)
  let r = random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r < 0) return i
  }
  return weights.length - 1
}

/** Pick one entry by relative weights. */
export function pickWeighted<T extends WeightedPick>(entries: readonly T[], random: () => number = Math.random): T {
  if (entries.length === 0) {
    throw new Error("weighted-loot-pool: empty entries")
  }
  const idx = rollWeightedIndex(
    entries.map((e) => e.weight),
    random,
  )
  return entries[idx]
}

/** Map admin "percent" drop rates to relative weights (sum need not be 100). */
export function normalizePercentWeights(percents: readonly number[]): number[] {
  const sum = percents.reduce((a, b) => a + Math.max(0, b), 0)
  if (sum <= 0) {
    const n = percents.length
    if (n === 0) throw new Error("weighted-loot-pool: empty percents")
    return percents.map(() => 1 / n)
  }
  return percents.map((p) => Math.max(0, p) / sum)
}

/** Only rows with stock &gt; 0; null if none. */
export function pickWeightedInStock<T extends StockedPick>(
  entries: readonly T[],
  random: () => number = Math.random,
): T | null {
  const available = entries.filter((e) => e.stock > 0 && e.weight > 0)
  if (available.length === 0) return null
  return pickWeighted(available, random)
}

/**
 * Draw `count` times **without replacement** from the identity of entries (same `id` only once).
 * Entries need not have `stock`; for physical stock, decrement in your DB after each pick.
 */
export function pickDistinctWeighted<T extends WeightedPick>(
  entries: readonly T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  const pool = [...entries]
  const out: T[] = []
  const n = Math.max(0, Math.min(count, entries.length))
  for (let k = 0; k < n && pool.length > 0; k++) {
    const pick = pickWeighted(pool, random)
    out.push(pick)
    const i = pool.findIndex((e) => e.id === pick.id)
    if (i >= 0) pool.splice(i, 1)
  }
  return out
}

/**
 * Draw `count` times **with replacement** (gacha / independent rolls). Ignores `stock`; enforce caps in your layer.
 */
export function rollIndependentWeighted<T extends WeightedPick>(
  entries: readonly T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  if (entries.length === 0 || count <= 0) return []
  const out: T[] = []
  for (let i = 0; i < count; i++) {
    out.push(pickWeighted(entries, random))
  }
  return out
}

/** Deterministic PRNG in [0,1) for tests or simulations (mulberry32). */
export function createMulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One roll: filter `stock > 0`, normalize `dropRatePercent` across remaining rows, return the winning row.
 */
export function rollOneLootRow<T extends { id: string; dropRatePercent: number; stock: number }>(
  rows: readonly T[],
  random: () => number = Math.random,
): T | null {
  const available = rows.filter((r) => r.stock > 0)
  if (available.length === 0) return null
  const weights = normalizePercentWeights(available.map((r) => r.dropRatePercent))
  const idx = rollWeightedIndex(weights, random)
  return available[idx]
}
