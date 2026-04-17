/**
 * Classify item transfer destinations for HandCash Connect.
 * Handles: 3–50 chars after optional leading @/$.
 * Opaque: paymail or Bitcoin-style address — passed through to the SDK without handle resolution.
 */

export type ClassifiedDestination =
  | { kind: "handle"; clean: string; raw: string }
  | { kind: "opaque"; value: string; raw: string }

const HANDLE_PATTERN = /^[\w\-_.]{3,50}$/

/** Basic paymail shape */
const PAYMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Loose Bitcoin address detection (P2PKH / P2SH / bech32) */
const BTC_ADDRESS_PATTERN = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{20,})$/i

export function classifyTransferDestination(raw: string): ClassifiedDestination | null {
  const t = raw.trim()
  if (!t) return null
  if (PAYMAIL_PATTERN.test(t)) return { kind: "opaque", value: t, raw }
  if (BTC_ADDRESS_PATTERN.test(t)) return { kind: "opaque", value: t, raw }
  const clean = t.replace(/^[@$]+/, "")
  if (HANDLE_PATTERN.test(clean)) return { kind: "handle", clean, raw }
  return null
}

export function parseDestinationList(destinationsList: string[]): ClassifiedDestination[] | null {
  const out: ClassifiedDestination[] = []
  for (const raw of destinationsList) {
    const c = classifyTransferDestination(raw)
    if (!c) return null
    out.push(c)
  }
  return out
}
