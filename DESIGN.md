---
name: Augmented Classroom
description: Companion app that centralizes Google Classroom materials, deadlines, and Lyceum grades in one place.
colors:
  terracotta: "#a8481f"
  terracotta-foreground: "#fdfbfa"
  terracotta-tint: "#f0ddd0"
  terracotta-tint-foreground: "#8a3a19"
  neutral-bg: "#fafaf9"
  neutral-foreground: "#1c1917"
  neutral-card: "#ffffff"
  neutral-secondary: "#f2f1ef"
  neutral-muted-foreground: "#78716c"
  neutral-border: "#e7e5e2"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "calc(0.75rem * 0.6)"
  md: "calc(0.75rem * 0.8)"
  lg: "0.75rem"
  xl: "calc(0.75rem * 1.4)"
  "2xl": "calc(0.75rem * 1.8)"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.terracotta-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta}"
  button-outline:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.neutral-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.neutral-foreground}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  sidebar-item-active:
    backgroundColor: "{colors.terracotta-tint}"
    textColor: "{colors.terracotta-tint-foreground}"
    rounded: "{rounded.md}"
---

# Design System: Augmented Classroom

## 1. Overview

**Creative North Star: "A Mesa de Outono" (The Autumn Desk)**

A workspace at the end of a fall afternoon: tidy, quiet, almost entirely neutral — paper-white surfaces, warm graphite text, a single card stacked on another. The one thing that isn't neutral is deliberate: a dark terracotta, the color of a leaf on the desk, used exactly where attention should land — the primary action, the active sidebar item, a focus ring. Everything else stays out of the way so prazos, notas, and materials read clearly at a glance.

This system draws directly from Notion's restraint (neutral-first palette, sidebar as the permanent anchor, generous whitespace) but rejects Notion's cool grays for a warm-neutral base tinted toward the terracotta hue, and rejects any "corporate portal" density — the visual language this app exists to replace.

**Key Characteristics:**
- Warm-neutral base (near-white, near-black graphite) carries ~90% of every screen.
- One accent — dark terracotta — reserved for state, action, and emphasis only.
- Sidebar-anchored navigation, always visible, never collapsed into a hamburger.
- Flat surfaces with soft borders instead of heavy shadows; depth comes from layering, not elevation.

## 2. Colors

The palette is almost entirely neutral, warmed by a whisper of the terracotta hue rather than true gray or true cream — a Notion-style base with one intentional, autumn-colored exception.

### Primary
- **Dark Terracotta** (`#a8481f` / `oklch(0.48 0.12 35)`): the app's one accent. Primary button fill, active nav-link background pairing, links, focus rings, and the "downloaded"/"active" state markers. Never used for large background fills.

### Neutral
- **Paper** (`#fafaf9`): app background (`--background`). Warmed by a trace of the terracotta hue (chroma ~0.002) rather than true white or true cream — avoids reading as either sterile gray or sand-beige.
- **Graphite** (`#1c1917`): primary text (`--foreground`), warmed to match Paper's hue.
- **Card White** (`#ffffff`): card, popover, and sidebar surfaces (`--card`, `--sidebar`) — the one pure-white layer, sitting a shade lighter than Paper to read as "raised."
- **Warm Gray** (`#f2f1ef`): secondary/muted surface fill (`--secondary`, `--muted`) — pressed states, disabled fields, subtle section dividers.
- **Warm Gray Text** (`#78716c`): muted/secondary text (`--muted-foreground`) — timestamps, helper copy, counts.
- **Hairline** (`#e7e5e2`): borders and input strokes (`--border`, `--input`).
- **Terracotta Tint** (`#f0ddd0`): the accent's light background form (`--accent`) — active sidebar-item fill, selected-filter chip fill. Paired with **Terracotta Tint Text** (`#8a3a19`) as its foreground.

### Named Rules
**The One Leaf Rule.** Terracotta appears on at most one element per view at rest — the primary CTA, or the single active nav item, never both competing for the same glance. Hover/focus states may add a second, quieter terracotta touch (a ring, an underline), never a second fill.

## 3. Typography

**Body Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Label/Mono Font:** Geist Mono (with `ui-monospace, monospace` fallback)

**Character:** A humanist sans that stays legible at the small sizes a data-dense dashboard lives at (course lists, material tables, grade grids), with slightly more warmth than the current geometric Geist — closer to how Notion's own UI reads than to a marketing display face. Geist Mono stays for anything tabular or code-like (IDs, timestamps, grade values in the Lyceum tables), unchanged from today.

### Hierarchy
- **Headline** (600, 1.5rem, 1.25 line-height, -0.02em): page titles ("Turmas", "Downloads", "Boletim").
- **Title** (600, 1rem, 1.3 line-height, -0.01em): card titles, section headers, course names.
- **Body** (400, 0.875rem, 1.5 line-height): the default UI voice — list items, descriptions, form labels' companion text. Caps at 65–75ch wherever prose (announcements, material text) appears.
- **Label** (500, 0.75rem, 1.4 line-height): buttons, badges, table headers, nav item text.

### Named Rules
**The No-Display Rule.** This is a tool, not a poster: no display-size headline anywhere in the product. 1.5rem/24px is the largest text in the app.

## 4. Elevation

Flat by default. Depth comes from a single step of surface layering (Paper background → Card White surface → 1px Hairline border) rather than shadows. The existing `shadow-sm` on cards is a near-invisible ambient lift (`0 1px 2px rgba(0,0,0,0.04)`-scale), present to separate a card from the page, not to imply floating or interactivity.

### Shadow Vocabulary
- **Ambient card lift** (`shadow-sm`, effectively `0 1px 3px rgba(0,0,0,0.06)`): default state for every card, list row, and panel. Constant, not a hover effect.
- **Modal lift** (existing dialog shadow via `ring-1 ring-foreground/10`): dialogs and alert dialogs use a hairline ring instead of a heavier shadow, keeping the flat-surface language even when something floats above the page.

### Named Rules
**The Flat-By-Default Rule.** No shadow deepens on hover. Interactive feedback comes from a background-color shift (`hover:bg-muted`) or the terracotta ring, never from lifting a card further off the page.

## 5. Components

### Buttons
- **Shape:** rounded-md corners (`~10px`, `min(var(--radius-md), 10-12px)` depending on size).
- **Primary:** Dark Terracotta fill (`#a8481f`), Terracotta Foreground text (`#fdfbfa`), 6px/12px padding at default size.
- **Hover / Focus:** primary hover darkens fill slightly (`bg-primary/80` equivalent in the new palette); focus-visible adds a 3px terracotta ring at 50% opacity plus a matching border — never a shadow.
- **Outline / Ghost / Secondary:** outline uses Card White fill with a Hairline border; ghost is transparent until hover (`hover:bg-muted`); secondary uses Warm Gray fill. All three keep Graphite text — none of them touch terracotta except on focus.
- **Destructive:** unchanged red family (`oklch(0.577 0.245 27.325)`), reserved for delete/clear actions (clear downloads history, clear credentials, disconnect Lyceum).

### Cards / Containers
- **Corner Style:** `rounded-2xl` (~21px) for content cards (course cards, material rows, download rows); `rounded-xl` for dialogs.
- **Background:** Card White on Paper background.
- **Shadow Strategy:** ambient card lift only (see Elevation).
- **Border:** 1px Hairline (`--border`).
- **Internal Padding:** 16px (md) default, 24px (lg) for standalone sections like the Settings panel.

### Inputs / Fields
- **Style:** Hairline stroke, Card White or Paper background, `rounded-lg`.
- **Focus:** border shifts to Terracotta, no glow — consistent with the Flat-By-Default rule.
- **Error / Disabled:** error state uses the destructive red border/ring family; disabled drops to 50% opacity, no fill change.

### Navigation (Sidebar)
- **Style:** fixed-width collapsible sidebar (240px open / 68px collapsed), Card White surface, Hairline right border, permanently visible — never a hamburger, never overlaid.
- **Default:** Warm Gray Text (70% opacity) icon + label.
- **Active:** Terracotta Tint fill (`#f0ddd0`) with Terracotta Tint Text (`#8a3a19`) — this is the One Leaf Rule's primary showcase.
- **Hover:** Terracotta Tint at 60% opacity, no text color change.
- **Collapsed state:** icons only, centered in a 40px square; labels fade via the same 150ms opacity/y motion used for every collapsible label in the sidebar.

### Sidebar Chip (signature component)
The Lyceum sub-nav uses the same active/hover treatment as top-level items but indented and one size down (36px row height vs 40px), signaling hierarchy through size and indent rather than a new visual language.

## 6. Do's and Don'ts

### Do:
- **Do** keep terracotta to one accent role per screen — primary button, active nav item, or focus ring, never decorative.
- **Do** use the warm-neutral base (Paper/Graphite/Hairline) for everything that isn't a call to action or an active state.
- **Do** keep the sidebar permanently visible and collapsible-by-width, never collapsed into an off-canvas drawer or hamburger menu.
- **Do** prefer a background-color or border-color shift for hover/focus feedback over shadow or scale changes.

### Don't:
- **Don't** use gray-on-cream "SaaS landing" styling — this is a product surface, not a marketing page; no hero sections, no gradient text, no glassmorphism.
- **Don't** let terracotta bleed into large background fills; it is a leaf on the desk, not the tablecloth.
- **Don't** reproduce the dense, corporate-portal look of the Lyceum academic system this app exists to replace — that anti-reference (from PRODUCT.md) applies to every screen, including the Lyceum grade views rendered inside this app.
- **Don't** add a shadow that deepens on hover or a card that lifts on interaction — depth is layering, not elevation.
- **Don't** introduce a second display/heading typeface; Inter carries every size, weight does the differentiating.
