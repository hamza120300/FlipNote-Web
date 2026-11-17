# Notes Board — Features & Technical Documentation

> A local-first personal knowledge board: capture a thought instantly, organize it later.
> This document describes **what the app does** (features) and **how it is built** (technology & technical decisions).
> النسخة العربية لوصف الميزات المميزة: [FEATURES-AR.md](./FEATURES-AR.md)

---

## 1. Features

### 1.1 Categories
- Create, rename, and reorder (↑ / ↓ buttons on hover) categories in the sidebar.
- Each category has a color dot and an optional icon.
- Live card count shown next to every category.
- Deleting a category moves its cards to **Inbox** (the default category) — the Inbox itself cannot be deleted.
- Category names are trimmed and duplicates are rejected.

### 1.2 Cards (Notes)
- **Two card types** (chosen from the **+ New card** menu):
  - 📝 **Text note** — title + free-form body.
  - ☑ **Checklist** — interactive task list (see §1.3).
- Create a card with one click or `Ctrl+N`; the editor opens with the title focused immediately.
- Edit title and body; the card preview in the list updates **live** while typing.
- If a card has no title, the first line of the body is shown as its title.
- Per-card actions: **pin** 📌 (pinned cards always sort first), **favorite** ★, **duplicate** ⧉, **accent color** (8-color palette), **move to another category** (dropdown), **delete** (to Trash).
- **Grid / list view** toggle, persisted in settings.
- Per-card text direction (LTR/RTL) is auto-detected from the first strong character, so Arabic and English cards both render correctly side by side.

### 1.3 Checklist cards (Dual-Type Cards)
- Checklist items can be **checked off directly from the card in the list** — no need to open the editor.
- A smart **progress bar + counter** (e.g. `3/4`) is shown on the card, in the editor, and in review mode.
- Editor features: add item (`Enter`), edit item text inline, delete item, **Clear completed**.
- Works with Arabic and English items mixed in the same list.

### 1.4 Top Deck Review & Flip Mode 🌟
Turn any category (or smart collection / search result) into a fullscreen flashcard deck with the **🃏 Review** button:

- **3D flip animation** — click the card (or press `Space`/`Enter`) to flip between:
  - **Front:** the title / main idea + category + tags.
  - **Back:** the full details — body text, or the checklist with its progress.
- **Progress counter** — `3 / 12` with a live progress bar; **Next / Previous** navigation (also `←` / `→`, direction-aware in RTL).
- **Celebration screen** 🎉 when the deck is finished, showing how many cards were reviewed.
- `Esc` exits at any time. The deck is snapshotted when review starts, so edits elsewhere don't shuffle it.
- Perfect for meeting recaps, study flashcards, or a distraction-free daily task review.

### 1.5 Autosave & data safety
- Every change is persisted automatically after a **~500 ms debounce**.
- A visible indicator shows the save state: `Saved ✓` / `Saving…` / `Save failed`.
- On window close, pending changes are flushed with `navigator.sendBeacon`.
- If saving fails, the user is warned and the unsaved content stays in the editor.
- Deletes are **soft** (`deletedAt` timestamp) — nothing is destroyed until the user empties Trash.

### 1.6 Search
- Global search box, focusable with `Ctrl+K`.
- Searches **title, body, and tags** across all cards, filtered live while typing.
- Case-insensitive and **Arabic-aware**:
  - ignores diacritics / tashkeel (`ملاحظَة` ≡ `ملاحظة`),
  - normalizes letter variants: `أ / إ / آ → ا`, `ى → ي`, `ة → ه`.
- Multi-word queries match if **all** terms are found.

### 1.7 Tags
- Inline tag input in the editor with **autocomplete** suggestions from existing tags.
- `Enter` adds a tag, `Backspace` on an empty input removes the last one, ✕ removes a specific tag.
- Tags are normalized to lowercase and de-duplicated.
- **Untagged** smart view lists every card with no tags.

### 1.8 Smart collections (sidebar)
| Collection | Contents |
|---|---|
| 🗂️ All Notes | Every non-deleted card |
| ★ Favorites | Cards marked favorite |
| ◷ Recent | 20 most recently updated cards |
| 🏷️ Untagged | Cards with no tags |
| 🗑 Trash | Soft-deleted cards |

### 1.9 Trash
- Deleted cards go to Trash instead of being destroyed.
- Per-card **Restore** and **Delete forever** actions.
- **Empty Trash** purges everything after confirmation.

### 1.10 Backup — Export / Import
- **Export all**: downloads the entire database as a single versioned JSON file.
- **Import**: reads a previously exported JSON file and **merges by `id`** — the newer `updatedAt` wins, so re-importing is lossless and idempotent.

### 1.11 Localization & RTL
- Full **Arabic / English** UI, switchable at runtime (Settings or `Ctrl+Shift+L`) with no reload.
- The whole layout **mirrors in RTL** (sidebar moves to the right) using CSS logical properties.
- Dates are formatted per locale with `Intl.DateTimeFormat`.
- No hard-coded user-facing strings — everything goes through the i18n dictionary.

### 1.12 Appearance
- **Light / Dark / System** themes (System follows the OS via `prefers-color-scheme`).
- Responsive: below 900 px the editor becomes a full-screen overlay.

### 1.13 Keyboard shortcuts
| Action | Shortcut |
|---|---|
| New card | `Ctrl+N` |
| Focus search | `Ctrl+K` |
| Switch language (AR ⇄ EN) | `Ctrl+Shift+L` |

---

## 2. Technology stack

| Layer | Technology | Why |
|---|---|---|
| UI | **React 18** (function components + hooks) | Component model fits the 3-pane layout; hooks keep state logic co-located |
| Build / dev server | **Vite 5** | Instant HMR, zero-config JSX, production build in ~1 s |
| API server | **Node.js + Express 4** | Minimal footprint — only 2 endpoints are needed |
| Database | **A plain JSON file** (`server/db.json`) | "JSON file for now" — zero setup, human-readable, trivially exportable; can be swapped for SQLite later |
| Styling | **Vanilla CSS** with custom properties | No framework needed; CSS variables power theming, logical properties power RTL |
| Dev orchestration | **concurrently** | `npm run dev` starts API + Vite together |

No other runtime dependencies — no state-management library, no CSS framework, no ORM.

---

## 3. Architecture & technical decisions

### 3.1 High-level architecture

```
┌─────────────────────────────┐        ┌──────────────────┐
│  React app (localhost:5173) │        │ Express API      │
│                             │  /api  │ (localhost:4000) │
│  StoreProvider (useReducer) │ ─────► │                  │
│   ├─ Sidebar                │ proxy  │ GET  /api/db     │
│   ├─ CardList               │ (Vite) │ PUT  /api/db     │
│   ├─ Editor                 │        │ POST /api/db ◄── sendBeacon
│   └─ SettingsModal          │        │        │         │
└─────────────────────────────┘        │        ▼         │
                                       │  server/db.json  │
                                       └──────────────────┘
```

- The client loads the **whole database once** (`GET /api/db`) into a single React
  `useReducer` store, mutates it locally through dispatched actions, and writes the
  whole state back (`PUT /api/db`) after a debounce. For a single-user, local-first
  app this is the simplest correct model.
- Vite's dev server **proxies `/api/*`** to the Express server, so the frontend never
  hard-codes the API origin.

### 3.2 Project structure

```
Notes React/
├── server/
│   ├── index.js          # Express API + atomic JSON persistence
│   └── db.json           # THE database (gitignored, auto-seeded)
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Layout, selection state, keyboard shortcuts
│   ├── store.jsx         # StoreProvider: reducer + autosave engine
│   ├── i18n.js           # EN/AR translation dictionaries
│   ├── utils.js          # UUID, Arabic search normalization, RTL detection
│   ├── styles.css        # Theming (CSS vars) + RTL (logical properties)
│   └── components/
│       ├── Sidebar.jsx       # Categories, smart collections, search, save indicator
│       ├── CardList.jsx      # Grid/list of cards, checklist previews, trash actions
│       ├── Editor.jsx        # Title/body or checklist editor, tags, toolbar
│       ├── ReviewMode.jsx    # Fullscreen flashcard review with 3D flip
│       └── SettingsModal.jsx # Language, theme, export/import
├── docs/                 # ← this documentation
├── index.html
├── vite.config.js
└── package.json
```

### 3.3 Data model (`server/db.json`)

```jsonc
{
  "schemaVersion": 1,
  "categories": [
    {
      "id": "uuid", "name": "Inbox", "color": "#6366f1", "icon": "📥",
      "sortOrder": 0, "isDefault": true,
      "createdAt": "ISO-8601", "updatedAt": "ISO-8601", "deletedAt": null
    }
  ],
  "cards": [
    {
      "id": "uuid", "title": "", "body": "", "type": "text | checklist",
      "items": [{ "id": "uuid", "text": "Buy milk", "isDone": false }],
      "categoryId": "uuid",
      "tags": ["work"], "isPinned": false, "isFavorite": false, "color": null,
      "createdAt": "ISO-8601", "updatedAt": "ISO-8601", "deletedAt": null
    }
  ],
  "settings": { "language": "en", "theme": "system", "viewMode": "grid" }
}
```

**Sync-readiness** (spec §8): every entity uses a **UUID**, carries
`createdAt` / `updatedAt` / `deletedAt` (tombstones), and all writes flow through one
reducer — so a future sync engine or a real database can be dropped in without
changing the model.

### 3.4 Atomic writes (no data corruption)

The server never writes `db.json` in place. Every save:

1. writes the full JSON to `db.json.tmp`,
2. then **renames** the temp file over `db.json` (an atomic operation on the OS level),
3. writes are also **queued in sequence** (a promise chain), so two rapid saves can
   never interleave.

A crash mid-write therefore leaves the previous valid file untouched.

### 3.5 Autosave engine (`src/store.jsx`)

- Any dispatched action updates the in-memory state immediately (optimistic UI).
- A `useEffect` watching the state starts a **500 ms debounce timer**; when it fires,
  the whole state is `PUT` to the server.
- Save status (`saved` / `saving` / `error`) is exposed via context and rendered in
  the sidebar.
- `beforeunload` flushes any pending state with **`navigator.sendBeacon`** (the server
  accepts `POST /api/db` as an alias for this, since beacons can only POST).

### 3.6 Arabic-aware search (`src/utils.js`)

```js
normalizeText(text)
  .toLowerCase()
  .replace(/[\u064B-\u065F\u0670]/g, '')  // strip tashkeel
  .replace(/[أإآ]/g, 'ا')                  // alef variants
  .replace(/ى/g, 'ي')                      // alef maqsura
  .replace(/ة/g, 'ه')                      // ta marbuta
```

Both the query and the card text are normalized, so `ملاحظه` matches `ملاحظة`.

### 3.7 RTL & theming (CSS)

- **RTL**: the layout uses CSS **logical properties** (`border-inline-start`,
  `inset-inline-start`, `text-align: start`…) instead of left/right, so setting
  `<html dir="rtl">` mirrors the entire app with zero extra CSS.
- **Theming**: all colors are CSS custom properties on `:root`; dark mode swaps them
  via a `[data-theme='dark']` selector. "System" theme reads
  `prefers-color-scheme`.

### 3.8 i18n (`src/i18n.js`)

A lightweight dictionary (`translations.en` / `translations.ar`) with a `t(key)`
helper — no library needed at this size. The language also drives
`document.documentElement.dir` and `lang`, and date formatting through
`Intl.DateTimeFormat`.

### 3.9 Import / merge algorithm

Import never overwrites blindly. For categories and cards it builds a map by `id`
and keeps whichever copy has the **newer `updatedAt`** (last-write-wins), matching
the spec's conflict rule and making export → import round-trips lossless.

---

## 4. API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/db` | Returns the entire database as JSON |
| `PUT` | `/api/db` | Replaces the database (validated, atomically persisted) |
| `POST` | `/api/db` | Same as PUT — exists for `navigator.sendBeacon` on window close |

Invalid payloads (missing `categories` / `cards` arrays) are rejected with `400`;
write failures return `500` and the client shows **Save failed** while keeping the
content in the editor.

---

## 5. Running the project

```bash
npm install
npm run dev     # starts Express (:4000) + Vite (:5173) together
```

| Script | What it does |
|---|---|
| `npm run dev` | API + frontend with hot reload |
| `npm run server` | API only |
| `npm run client` | Frontend only |
| `npm run build` | Production build to `dist/` |

The database file `server/db.json` is created and seeded automatically (with the
Inbox category) on first run.

---

## 6. Roadmap (from the product spec)

| Release | Scope | Status |
|---|---|---|
| 1 — Foundation | Categories, cards, autosave, search, tags, trash, export/import, i18n/RTL, themes | ✅ **Done** |
| — Extras | **Dual-type cards (text / checklist)** with inline check-off & progress bar; **Top Deck Review & Flip Mode** with 3D flip, counter and celebration screen | ✅ **Done** |
| — Extras 2 | **Emoji icon picker** for categories & cards; **drag & drop** cards to categories/Trash; **Quick Capture** (`Ctrl+Shift+N`, `#tag` / `@Category` syntax); **due dates on checklist items** + Today smart view | ✅ **Done** |
| 2 — Signature | Quick Capture window, pinned floating cards | ⬜ Planned |
| 3 — Knowledge | Smart collection rule builder, card links & backlinks | ⬜ Planned |
| 4 — Productivity | Review mode, checklists, focus mode & timer | ⬜ Planned |
| 5 — Later | Cloud sync, attachments, templates, reminders, version history | ⬜ Planned |
