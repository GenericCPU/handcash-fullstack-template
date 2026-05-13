/**
 * HandCash Full-Stack Template — Chakra UI v3 system.
 *
 * Maps the template's existing CSS-variable design tokens (defined in
 * app/globals.css) into Chakra's token + semanticToken graph. CSS variables
 * remain the single source of truth so Tailwind utilities and Chakra
 * components agree on every surface, color, and radius.
 *
 * Color palettes are exposed via Chakra's `colorPalette` prop:
 *   <Button colorPalette="primary">…</Button>
 *
 * For each palette we define the seven semantic slots Chakra expects
 * (solid, contrast, fg, muted, subtle, emphasized, focusRing) so filled,
 * outline, ghost, subtle, and surface recipes all resolve correctly.
 */
import {
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react'

const config = defineConfig({
  cssVarsPrefix: 'hc',
  // Tailwind v4 already ships a preflight reset and app/globals.css owns
  // the body background/foreground + font stack. Letting Chakra inject
  // its own reset on top would stomp on sticky-header positioning,
  // heading margins, and line-heights — the page layout would drift.
  // We keep Tailwind as the single source of truth for base styles.
  preflight: false,
  conditions: {
    // Bridge Chakra's _dark/_light conditions to next-themes' class on <html>.
    light: '.light &, :root:not(.dark) &',
    dark: '.dark &',
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: 'var(--font-sans, "Geist", system-ui, sans-serif)' },
        heading: { value: 'var(--font-sans, "Geist", system-ui, sans-serif)' },
        mono: { value: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)' },
      },
      radii: {
        l1: { value: 'calc(var(--radius) - 4px)' },
        l2: { value: 'calc(var(--radius) - 2px)' },
        l3: { value: 'var(--radius)' },
      },
    },
    semanticTokens: {
      colors: {
        // Surface + foreground
        bg: {
          DEFAULT: { value: 'var(--background)' },
          subtle: { value: 'var(--muted)' },
          muted: { value: 'var(--secondary)' },
          surface: { value: 'var(--card)' },
          emphasized: { value: 'var(--accent)' },
          inverted: { value: 'var(--foreground)' },
          panel: { value: 'var(--popover)' },
          error: { value: 'var(--destructive)' },
        },
        fg: {
          DEFAULT: { value: 'var(--foreground)' },
          muted: { value: 'var(--muted-foreground)' },
          subtle: { value: 'var(--muted-foreground)' },
          inverted: { value: 'var(--background)' },
          error: { value: 'var(--destructive-foreground)' },
        },
        border: {
          DEFAULT: { value: 'var(--border)' },
          muted: { value: 'var(--input)' },
          subtle: { value: 'var(--border)' },
          emphasized: { value: 'var(--ring)' },
          error: { value: 'var(--destructive)' },
        },

        // Color palettes for <Button colorPalette="…">
        primary: {
          solid: { value: 'var(--primary)' },
          contrast: { value: 'var(--primary-foreground)' },
          fg: { value: 'var(--primary)' },
          muted: { value: 'color-mix(in oklab, var(--primary) 18%, transparent)' },
          subtle: { value: 'color-mix(in oklab, var(--primary) 10%, transparent)' },
          emphasized: { value: 'color-mix(in oklab, var(--primary) 28%, transparent)' },
          focusRing: { value: 'var(--ring)' },
        },
        accent: {
          solid: { value: 'var(--accent)' },
          contrast: { value: 'var(--accent-foreground)' },
          fg: { value: 'var(--accent-foreground)' },
          muted: { value: 'var(--accent)' },
          subtle: { value: 'var(--secondary)' },
          emphasized: { value: 'var(--accent)' },
          focusRing: { value: 'var(--ring)' },
        },
        danger: {
          solid: { value: 'var(--destructive)' },
          contrast: { value: 'var(--destructive-foreground)' },
          fg: { value: 'var(--destructive)' },
          muted: { value: 'color-mix(in oklab, var(--destructive) 18%, transparent)' },
          subtle: { value: 'color-mix(in oklab, var(--destructive) 10%, transparent)' },
          emphasized: { value: 'color-mix(in oklab, var(--destructive) 28%, transparent)' },
          focusRing: { value: 'var(--destructive)' },
        },
        // Neutral palette so colorPalette="gray" honors our tokens too
        gray: {
          solid: { value: 'var(--foreground)' },
          contrast: { value: 'var(--background)' },
          fg: { value: 'var(--foreground)' },
          muted: { value: 'var(--muted)' },
          subtle: { value: 'var(--muted)' },
          emphasized: { value: 'var(--accent)' },
          focusRing: { value: 'var(--ring)' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
export type System = typeof system
