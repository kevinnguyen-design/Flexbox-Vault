# Flex & Grid Vault Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file, dependency-free `index.html` that serves as a visual CSS reference with baked-in data, real-time search, and live CSS previews.

**Architecture:** Monolithic HTML/CSS/JS file. Vanilla JS state management. CSS-only tooltips. Responsive two-column layout.

**Tech Stack:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript.

---

### Task 1: Basic HTML/CSS Shell

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html with base structure**
    Include doctype, head with Google Fonts (Inter, JetBrains Mono), and body with main layout divs (`#sidebar`, `#main`, `#top-bar`).

- [ ] **Step 2: Add core CSS variables and reset**
    Define colors from the spec in `:root`. Setup basic dark theme styles.

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: init index.html with base shell and theme"
```

### Task 2: Data Embedding

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Embed catalog data as a JS constant**
    Copy the data from `backend/src/data/catalog.js` (product, sections, properties, patterns, callouts, adSlots, meta) into a `<script>` tag as `const CATALOG = { ... };`.

- [ ] **Step 2: Set page meta tags from CATALOG.meta**
    Dynamically or statically set `<title>` and `<meta name="description">`.

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: embed catalog data into index.html"
```

### Task 3: Sidebar and Section Rendering

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement Nav Rail (Sidebar)**
    Loop through `CATALOG.sections` to generate the left sidebar navigation.

- [ ] **Step 2: Render Content Sections**
    Generate `<section>` tags for each item in `CATALOG.sections`. Include headers that are `position: sticky`.

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: render navigation and section containers"
```

### Task 4: Property Card Rendering

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement property card generation**
    For each section, filter `CATALOG.properties` and render cards. Cards should display property names as copyable chips.

- [ ] **Step 2: Implement visual demo box renderer**
    Create a function that takes a property and a value, and returns a DOM element with 3-4 colored boxes reflecting that property/value.

- [ ] **Step 3: Add CSS tooltips for demos**
    Use CSS `:hover` and `::after` or a small JS-assisted tooltip to show the exact CSS on hover.

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: implement property cards and live demos"
```

### Task 5: Interactions (Search and Tabs)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement top-level filters (Flexbox/Grid/Patterns)**
    Add logic to hide/show sections based on the selected tab.

- [ ] **Step 2: Implement search bar**
    Add input listener to filter cards in real-time. Use `element.hidden` or a `hidden` CSS class. Highlight matched text if possible.

- [ ] **Step 3: Implement Copy Mechanic**
    Use `navigator.clipboard.writeText` for property chips and pattern code blocks. Add the "Copied ✓" feedback.

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add search, tab filtering, and copy functionality"
```

### Task 6: Patterns and Callouts

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Render Patterns section**
    Implement the "Quick Patterns" section using `CATALOG.patterns`. Show live previews for each pattern.

- [ ] **Step 2: Render Callout boxes**
    Inject callouts (Tip, Gotcha, Pattern) into their respective sections as defined in `CATALOG.callouts`.

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: implement patterns and callout boxes"
```

### Task 7: Responsive Design and Ad Slots

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement Mobile Drawer**
    Add hamburger menu and transition styles for the nav rail on small screens.

- [ ] **Step 2: Implement Ad Slot placeholders**
    Render the specified `adSlots` with dashed borders and appropriate dimensions/visibility (desktop vs mobile).

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: add mobile responsiveness and ad slots"
```

### Task 8: Print Stylesheet and Final Polish

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement @media print**
    Add styles for the 2-column PDF layout. Hide interactive elements (search, tabs, sidebar). Ensure high contrast.

- [ ] **Step 2: Add "Download PDF" (Print) button logic**
    Hook up the button to `window.print()`.

- [ ] **Step 3: Final SEO and OS Toggle**
    Ensure OS toggle correctly swaps shortcut labels. Double-check all hover states and transitions.

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add print styles and final polish"
```
