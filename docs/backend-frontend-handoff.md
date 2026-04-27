# Backend to Frontend Handoff (Flex & Grid Vault)

## Ownership Split

- Backend ownership (this branch):
  - Canonical content catalog (properties, values, patterns, callouts)
  - API contract for search/filter/meta/ad-slot/shortcuts
  - Copy telemetry intake endpoint stub
- Frontend ownership (other agent):
  - Single `index.html` implementation with inline `<style>` and `<script>`
  - Rendering all demos as real DOM/CSS mini-previews
  - Copy interactions, tooltip UX, sticky headers/nav, print stylesheet
  - Mobile drawer, filter tabs, search highlighting, ad-slot placement markup

## API Base

- Default local base URL: `http://localhost:8787`

## Endpoints

- `GET /health`
- `GET /api/v1/meta`
- `GET /api/v1/catalog`
- `GET /api/v1/properties?layout=flexbox|grid&level=container|item&q=<term>`
- `GET /api/v1/patterns?layout=flexbox|grid|patterns&q=<term>`
- `GET /api/v1/callouts`
- `GET /api/v1/ad-slots`
- `GET /api/v1/search?q=<term>`
- `GET /api/v1/shortcuts?os=mac|windows`
- `POST /api/v1/telemetry/copy` with JSON body `{ source, value }`

## Contract Notes For Frontend Agent

- Property rendering:
  - `name` is property label.
  - `values[]` is canonical demo value list.
  - Build copy payload as `${name}: ${value}` for clickable property/value chips.
- Sections:
  - Use `GET /api/v1/catalog` for nav rail ordering and top-level filters.
  - Keep sections in exact order returned by `sections[]`.
- Search:
  - Global search should call `/api/v1/search`.
  - For local filtering within rendered cards, use `/api/v1/properties?q=` and `/api/v1/patterns?q=`.
- Callouts:
  - `type` maps to UI style: `tip` (indigo), `gotcha` (amber), `pattern` (emerald).
- Ad slots:
  - Render IDs exactly as returned (required for monetization selectors).
  - Respect `desktopOnly` and `mobileOnly`.
- OS toggle:
  - Use `/api/v1/shortcuts` for keyboard reference labels.
  - Detect default platform in frontend; this endpoint gives copy/search labels.

## Known Constraints

- Backend returns content + contract only; no server-side rendering.
- Telemetry endpoint is stateless stub now (acknowledges payload, does not persist).
- `display` property is shared across flex/grid in dataset (`values` contains both families); frontend may choose contextual subsets per section.
