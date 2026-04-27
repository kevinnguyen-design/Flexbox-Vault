# Flex & Grid Vault Frontend Design

**Goal:** Implement a single-file, dependency-free visual CSS reference that works offline and is deployable via drag-and-drop.

## Architecture

- **Single File:** `index.html` containing all HTML, CSS (in `<style>`), and JS (in `<script>`).
- **Baked-in Data:** All content from the backend catalog is hardcoded into a JavaScript constant within the file to eliminate runtime dependencies and network requests.
- **State Management:** Simple object-based state tracking for:
  - Active tab (All, Flexbox, Grid, Patterns)
  - Search query
  - Active OS (Mac vs Windows) for shortcut hints
  - Mobile menu state

## Visual Design (Dark Theme)

- **Palette:**
  - Background: `#0d0d0d`
  - Sections: `#151515`
  - Cards/Surface: `#1e1e1e`
  - Borders: `#2a2a2a`
  - Accent (Indigo): `#6366f1`
  - Monospace (Cyan): `#a5f3fc`
- **Demo Palette:**
  - Indigo: `#6366f1`, Amber: `#f59e0b`, Emerald: `#10b981`, Red: `#ef4444`, Purple: `#8b5cf6`, Cyan: `#06b6d4`
- **Typography:**
  - Body: Inter (Google Fonts)
  - Code: JetBrains Mono (Google Fonts)

## Core Components

- **Sidebar (Nav Rail):** Desktop-only sticky left sidebar for quick navigation between sections and properties.
- **Top Bar:** Search input, top-level filter tabs (Flex/Grid/Patterns), and OS toggle.
- **Property Cards:** 
  - Header with property name (copyable).
  - Grid of visual demo boxes.
  - Hover tooltips showing exact CSS.
- **Demo Boxes:** Real DOM elements with inline styles applying the property value.
- **Callout Boxes:** Styled boxes for Tips, Gotchas, and Patterns.
- **Ad Slots:** Placeholder containers with dashed borders and specified dimensions.

## Key Interactions

- **Search:** Real-time filtering of properties and patterns. Hides non-matching sections.
- **Copy:** Click-to-copy functionality for property/value pairs and pattern CSS using `navigator.clipboard`.
- **Print:** Specialized stylesheet for a clean black-on-white two-column PDF layout.
- **Filtering:** Tab buttons to isolate Flexbox, Grid, or Patterns content.

## Technical Requirements

- **No Libraries:** No React, Vue, Tailwind, or even jQuery. Pure Vanilla JS and CSS.
- **Zero Assets:** No external images or SVGs (use CSS for icons if needed).
- **Offline Ready:** Once downloaded, the file must be fully functional without an internet connection (except for font loading, though system fallbacks should be provided).

## Testing Strategy

- **Visual Regression:** Manual check of demo box rendering across Chrome/Firefox/Safari.
- **Responsive:** Verify mobile drawer and single-column layout.
- **Print Preview:** Verify two-column layout and visibility of essential content only.
- **Functional:** Verify search, copy, and tab filtering.
