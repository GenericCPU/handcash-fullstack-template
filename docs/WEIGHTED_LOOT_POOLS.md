# Weighted loot pools and openable crates

Apps like **RealWorldGoodz** combine HandCash payments, item templates, and a **pool** of possible rewards. This doc ties that mental model to a small **reference implementation** in this template.

## Concepts (RealWorldGoodz–style)

| Concept | Typical meaning |
|--------|------------------|
| **Pool** | A product the user buys or a crate they open; has metadata (name, price, how many pulls). |
| **Pool entry / loot row** | One reward line: `item_template_id`, **stock** (`quantity` in DB), optional **drop weight** (`drop_rate` as percent in RWG admin). |
| **Draw** | One random choice of a row (then usually decrement stock and mint that template). |
| **Reveal** | UX step after payment/mint: show what rolled (RWG stores `shop_orders.minted_items`). |

Flow sketch:

1. User pays (or burns a key / crate item in other games).
2. Server loads **available** rows (`stock > 0`).
3. Server picks a row using **weights** (drop rates).
4. Server **atomically** decrements stock for that row (compare-and-set in DB to avoid double-spend).
5. Server mints the HandCash item from the chosen template.

## Reference code in this template

Pure functions (no HandCash, no DB) live in:

[`lib/weighted-loot-pool.ts`](../lib/weighted-loot-pool.ts)

Useful exports:

- **`pickWeighted`** — one roll among `{ id, weight }[]`.
- **`normalizePercentWeights`** — turn admin percents into relative weights even if they do not sum to 100.
- **`pickWeightedInStock`** — same, but only rows with `stock > 0`.
- **`rollIndependentWeighted`** — N gacha-style rolls with replacement (same row can win twice).
- **`pickDistinctWeighted`** — N pulls **without replacement** by `id` (good for “pick 3 different cosmetics” tables).
- **`createMulberry32`** — deterministic `random()` for tests or Monte Carlo simulations.

### Example: single crate open

```ts
import { pickWeightedInStock, createMulberry32 } from "@/lib/weighted-loot-pool"

const table = [
  { id: "common-1", weight: 70, stock: 1000 },
  { id: "rare-1", weight: 25, stock: 50 },
  { id: "legendary-1", weight: 5, stock: 2 },
]

const rng = createMulberry32(12345)
const winner = pickWeightedInStock(table, rng)
// Then: decrement stock for winner.id in DB, mint template mapped from winner.id
```

### Example: map RealWorldGoodz `drop_rate` + `quantity`

```ts
import { rollOneLootRow } from "@/lib/weighted-loot-pool"

type Row = { id: string; dropRatePercent: number; stock: number }

const rows: Row[] = poolEntriesFromSupabase.map((e) => ({
  id: e.id,
  dropRatePercent: e.drop_rate,
  stock: e.quantity,
}))

const chosen = rollOneLootRow(rows, Math.random)
```

After `chosen`, run your existing atomic `UPDATE pool_entries SET quantity = quantity - 1 WHERE id = ? AND quantity = ?` pattern (see RealWorldGoodz `app/api/shop/purchase/route.ts`).

## RealWorldGoodz reference implementation

| Location | Role |
|----------|------|
| [`RealWorldGoodz/lib/item-pools-storage.ts`](../../RealWorldGoodz/lib/item-pools-storage.ts) | CRUD for `pools` / `pool_entries`, `dropRate` on each entry. |
| [`RealWorldGoodz/scripts/003_create_item_pools_tables.sql`](../../RealWorldGoodz/scripts/003_create_item_pools_tables.sql) | Schema: `drop_rate`, `quantity`, `max_quantity`. |
| [`RealWorldGoodz/app/api/shop/purchase/route.ts`](../../RealWorldGoodz/app/api/shop/purchase/route.ts) | Payment → weighted roll among in-stock rows (`drop_rate` percents, normalized) → atomic decrement → mint. Uses [`RealWorldGoodz/lib/weighted-loot-pool.ts`](../../RealWorldGoodz/lib/weighted-loot-pool.ts) (same API as this template’s `lib/weighted-loot-pool.ts`). |
| [`RealWorldGoodz/pool_minting_specification_3a2748c8.plan.md`](../../RealWorldGoodz/pool_minting_specification_3a2748c8.plan.md) | Long-form design notes (Mongo-era + webhook flow; concepts still useful). |

## Forest Fighters (different pattern)

Forest Fighters uses **locked crate items + loot keys** and a configured template pool in env/admin, with burn-and-mint orchestration—not the same Supabase pool tables, but the **same math** applies when choosing which reward template fires after a key consumes a crate.

## Design notes

- **Weights vs probability**: Any positive numbers proportional to chance work; normalize percents when admins enter “70 / 25 / 5”.
- **Stock exhaustion**: Filter `stock > 0` before each roll; if the pool runs dry mid–multi-pull, either fail the transaction and roll back prior decrements (RWG pattern) or define pity rules.
- **Fairness / audits**: Log `chosen.id`, seed or `transactionId`, and weights snapshot for support tooling.
- **Regulated loot**: Some jurisdictions care about disclosure of odds; surface the normalized probabilities in UI.

For HandCash minting APIs, keep using `handcashService` / minter patterns from this template and RealWorldGoodz admin mint routes.
