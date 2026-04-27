# Flex & Grid Vault

Backend baseline for Flex & Grid Vault.  
Frontend agent owns single-file `index.html` UI implementation from handoff.

## What This Repo Now Contains

- Content/API backend for full handoff scope:
  - Flexbox container + item property catalogs
  - Grid container + item property catalogs
  - Quick pattern snippets
  - Callout inventory
  - Ad-slot definitions
  - SEO/meta payload
  - Search + OS shortcut mapping
- Test suite for API contract (`node:test`)
- Planning and FE handoff docs:
  - `docs/superpowers/plans/2026-04-27-flex-grid-vault-backend-implementation.md`
  - `docs/backend-frontend-handoff.md`

## Backend Quickstart

Requirements: Node 20+ (tested with Node 25).

```bash
npm test
npm start
```

Server starts on `http://localhost:8787`.

## API Endpoints

- `GET /health`
- `GET /api/v1/meta`
- `GET /api/v1/catalog`
- `GET /api/v1/properties?layout=flexbox|grid&level=container|item&q=<term>`
- `GET /api/v1/patterns?layout=flexbox|grid|patterns&q=<term>`
- `GET /api/v1/callouts`
- `GET /api/v1/ad-slots`
- `GET /api/v1/search?q=<term>`
- `GET /api/v1/shortcuts?os=mac|windows`
- `POST /api/v1/telemetry/copy`

## Frontend Integration Notes

- Use backend as source-of-truth for names, values, and ordering.
- Render live mini-previews client-side (real DOM/CSS).
- Build property copy text as `property: value`.
- Keep ad-slot IDs exactly as provided by `/api/v1/ad-slots`.
- Full FE contract details: `docs/backend-frontend-handoff.md`.
