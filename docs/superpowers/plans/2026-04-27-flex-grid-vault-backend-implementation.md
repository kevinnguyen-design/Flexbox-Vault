# Flex & Grid Vault Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build backend data/API layer that fully covers handoff feature scope while front-end agent implements single-file `index.html` UI.

**Architecture:** Ship zero-dependency Node HTTP API that serves canonical catalog data for flex/grid properties, patterns, callouts, ad slots, and SEO metadata. Frontend consumes this API contract but keeps rendering and interactions client-side. Backend remains stateless with deterministic JSON payloads for easy Netlify/static fallback migration.

**Tech Stack:** Node.js (built-in `http`, `node:test`), ES modules, JSON-first API contracts.

---

### Task 1: Define backend scope and FE contract

**Files:**
- Create: `docs/backend-frontend-handoff.md`
- Create: `docs/superpowers/plans/2026-04-27-flex-grid-vault-backend-implementation.md`

- [x] Step 1: Enumerate all handoff requirements and classify ownership (`backend`, `frontend`, `shared`)
- [x] Step 2: Freeze API response shapes for properties, patterns, callouts, ad slots, SEO/meta, and search results
- [x] Step 3: Add explicit FE integration notes (required fields, assumptions, unresolved constraints)

### Task 2: Build failing API tests (TDD red)

**Files:**
- Create: `backend/test/api.test.js`

- [x] Step 1: Write tests for each endpoint contract and key filtering behavior
- [x] Step 2: Write tests that assert required content exists (all flex/grid properties and required value options)
- [x] Step 3: Run `node --test backend/test/api.test.js` and confirm failures before implementation

### Task 3: Implement API server and catalog data (TDD green)

**Files:**
- Create: `backend/src/data/catalog.js`
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`
- Create: `package.json`

- [x] Step 1: Implement canonical catalog dataset reflecting handoff scope
- [x] Step 2: Implement routing/handlers for:
  - `GET /health`
  - `GET /api/v1/meta`
  - `GET /api/v1/catalog`
  - `GET /api/v1/properties`
  - `GET /api/v1/patterns`
  - `GET /api/v1/callouts`
  - `GET /api/v1/ad-slots`
  - `GET /api/v1/search?q=...`
  - `GET /api/v1/shortcuts?os=mac|windows`
  - `POST /api/v1/telemetry/copy`
- [x] Step 3: Re-run tests until all pass

### Task 4: Documentation + baseline README

**Files:**
- Modify: `README.md`
- Create: `docs/backend-frontend-handoff.md`
- Modify: `.gitignore`

- [x] Step 1: Replace minimal README with baseline project doc (scope, architecture, quickstart, API table)
- [x] Step 2: Document FE-agent notes: expected rendering responsibilities and payload field usage
- [x] Step 3: Add Node-related ignore entries

### Task 5: Verification + git delivery

**Files:**
- Modify: all above as needed

- [x] Step 1: Run `node --test` and confirm exit code 0
- [x] Step 2: Run `node backend/src/server.js` smoke check (`/health`, `/api/v1/search`)
- [ ] Step 3: `git add -A`, commit, push branch
- [ ] Step 4: Report commit hash and FE handoff note
