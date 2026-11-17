# Notes Board — Features & Technical Documentation

> A local-first personal knowledge board: capture a thought instantly, organize it later.
> This document describes **what the app does** (features) and **how it is built** (technology & technical decisions).
> النسخة العربية لوصف الميزات المميزة: [FEATURES-AR.md](./FEATURES-AR.md)

---

## 1. Features

Each feature below includes **💡 Why it's useful** — the problem it solves for you.

### 1.1 Categories & Sub-categories
- Create, rename, and reorder (↑ / ↓ buttons on hover) categories in the sidebar.
- **Sub-categories**: a category can live inside another (e.g. *Study → Math, Physics*). Sub-categories are indented in the sidebar, and selecting a parent shows its own cards **plus** its children's cards.
- Each category has a color dot and an optional emoji icon.
- Live card count next to every category (parents include their children's counts).
- Deleting a category moves its cards to **Inbox** and promotes its sub-categories to the top level — nothing is lost.
- Create a category on the fly from the **+ New card** menu or from the editor's **Move to** dropdown — no need to leave what you're doing.

> 💡 **Why:** notes become useless when they pile up in one list. Categories give every note a home, and sub-categories let big areas (like Study or Work) stay organized without cluttering the sidebar.

### 1.2 Cards (Notes) — two types in one app
- **Two card types** (chosen from the **+ New card** menu):
  - 📝 **Text note** — title + free-form body.
  - ☑ **Checklist** — interactive task list (see §1.3).
- Create a card with one click or `Ctrl+N`; the editor opens with the title focused immediately.
- Live preview while typing; if a card has no title, its first line is shown as the title.
- Per-card actions: **pin** 📌 (always sorts first), **favorite** ★, **archive** 🗄️, **duplicate** ⧉, **emoji icon** 😀, **accent color**, **move to category**, **delete** (to Trash).
- **Grid / list view** toggle, persisted in settings.
- Per-card text direction (LTR/RTL) auto-detected, so Arabic and English cards render correctly side by side.

> 💡 **Why:** some thoughts are prose, some are to-do lists. Having both types in one board means you never need a second app, and capture never requires a decision up front.

### 1.3 Checklist cards with due dates
- Items can be **checked off directly from the card in the list** — no need to open the editor.
- Smart **progress bar + counter** (e.g. `3/4`) on the card, in the editor, and in review mode.
- **Due date per item** 📅 — a small date field in the editor; the card shows a date chip that **turns red when overdue**.
- Editor: add item (`Enter`), inline edit, delete, **Clear completed**.

> 💡 **Why:** a task you can tick in one click actually gets ticked. Due dates turn a static list into a plan, and the red overdue chip makes slipping deadlines impossible to miss.

### 1.4 Today smart view 📅
- A sidebar view collecting every card that has an **open checklist item due today or overdue**, with a live count.

> 💡 **Why:** instead of checking every list each morning, one click answers "what do I need to do *today*?" across all categories.

### 1.5 Top Deck Review & Flip Mode 🌟
Turn any category, smart view, or search result into a fullscreen flashcard deck with the **🃏 Review** button:

- **3D flip animation** — click (or `Space`/`Enter`) to flip between:
  - **Front:** icon + title / main idea + category + tags.
  - **Back:** full details — body text, or the checklist with its progress.
- **Progress counter** — `3 / 12` with a live bar; **Next / Previous** (also `←` / `→`, direction-aware in RTL).
- **Celebration screen 🎉** when the deck is finished.
- `Esc` exits; the deck is snapshotted at start so edits elsewhere don't shuffle it.
- Archived and trashed cards never appear in review.

> 💡 **Why:** notes you never revisit are notes you lose. Flip mode turns passive notes into active recall — ideal for studying, memorizing, and weekly reviews — and the celebration makes finishing a habit.

### 1.6 Card links & backlinks 🔗
- Type **`[[`** in a note's body to search your cards and insert a link like `[[Project plan]]`.
- A **Links** row under the editor shows every outgoing link as a clickable chip — click to jump to that card.
- A **Backlinks** row shows every card that links **to** the current card.
- Links to deleted/renamed cards appear as visibly **broken** (struck through) rather than silently vanishing.

> 💡 **Why:** knowledge is a network, not a list. Links connect a meeting note to its project, and backlinks answer "where is this mentioned?" automatically — a personal wiki with zero setup.

### 1.7 Templates per category 📋
- Each category can store a **template** (📋 button on hover in the sidebar).
- New **text cards** in that category start pre-filled with the template body.
- New **checklists** turn each template line into a ready-made item.
- Quick-captured notes are never overwritten by a template.

> 💡 **Why:** recurring notes (meeting minutes, daily standups, shopping lists) always start with the same skeleton. Templates remove that repeated typing and keep notes consistent.

### 1.8 Archive 🗄️
- Archive any card from the editor (🗄️ button) or by **dragging it onto Archive** in the sidebar.
- Archived cards leave all normal views, search, Today, and Review mode — but are never deleted.
- The Archive view lists them with one-click **Unarchive**.

> 💡 **Why:** finished work shouldn't clutter your board, but deleting feels risky. Archive keeps the board focused on what's active while preserving everything for reference.

### 1.9 Quick Capture ⚡
- `Ctrl+Shift+N` or the ⚡ button opens a minimal capture box from anywhere in the app.
- `Enter` saves · `Esc` discards · `Shift+Enter` for a new line.
- Inline syntax: **`#tag`** adds a tag, **`@Category`** files it into that category; otherwise it lands in **Inbox**.

> 💡 **Why:** ideas die in the seconds it takes to find the right folder. Quick Capture makes saving a thought instant and decision-free — organize later, capture now.

### 1.10 Icons & colors 🎨
- Pick an **emoji icon** for any category or card from a 24-emoji grid (plus "none").
- Pick an **accent color** per card and per category from a fixed palette.

> 💡 **Why:** visual anchors beat reading. A 🏠 next to Home or a red stripe on an urgent card lets you find things at a glance, before you've read a single word.

### 1.11 Drag & drop 🖱️
- Drag any card onto a **sidebar category** to move it there.
- Drag onto **Archive** to archive it, or onto **Trash** to delete it.
- Drop targets highlight with a dashed outline while dragging.

> 💡 **Why:** re-organizing with menus is friction; dragging a card where it belongs is instant and satisfying — so your board actually stays organized.

### 1.12 Autosave & data safety
- Every change persists automatically after a **~500 ms debounce**, with a visible `Saved ✓ / Saving… / Save failed` indicator.
- Failed saves **auto-retry** (handles OneDrive/antivirus file locks); pending changes flush on window close via `sendBeacon`.
- Writes are **atomic** (temp file + rename) — a crash can never corrupt the database.
- Deletes are **soft** — nothing is destroyed until you empty Trash.

> 💡 **Why:** the core promise of a notes app is *never lose anything*. You never press Save, and neither a crash, a power cut, nor a syncing OneDrive can take your notes.

### 1.13 Search (Arabic-aware)
- `Ctrl+K`; searches **title, body, and tags** live while typing.
- Case-insensitive and **Arabic-aware**: ignores diacritics/tashkeel (`ملاحظَة` ≡ `ملاحظة`) and normalizes letter variants (`أ/إ/آ → ا`, `ى → ي`, `ة → ه`).
- Multi-word queries match if **all** terms are found.

> 💡 **Why:** search is how you get notes *back out*. Arabic normalization means you find «ملاحظة» even if you typed «ملاحظه» — standard search engines in most apps miss this.

### 1.14 Tags
- Inline tag input with **autocomplete** from existing tags; `Enter` adds, ✕ removes.
- Normalized to lowercase and de-duplicated; **Untagged** smart view catches strays.

> 💡 **Why:** tags cut across categories — `#urgent` can live in Work *and* Home. They're the second axis of organization that folders can't provide.

### 1.15 Smart collections (sidebar)
| Collection | Contents |
|---|---|
| 🗂️ All Notes | Every active card |
| 📅 Today | Cards with checklist items due today or overdue |
| ★ Favorites | Cards marked favorite |
| ◷ Recent | 20 most recently updated cards |
| 🏷️ Untagged | Cards with no tags |
| 🗄️ Archive | Archived cards |
| 🗑 Trash | Soft-deleted cards |

> 💡 **Why:** the same notes, many lenses. Smart views answer common questions ("what changed recently?", "what's untagged?") without any manual filing.

### 1.16 Trash
- Deleted cards go to Trash; **Restore** or **Delete forever** per card; **Empty Trash** with confirmation.

> 💡 **Why:** everyone deletes the wrong thing eventually. Trash makes deletion reversible, so you can clean up without fear.

### 1.17 Backup — Export / Import
- **Export all** to a single versioned JSON file.
- **Import** merges by `id` — newer `updatedAt` wins, so round-trips are lossless.

> 💡 **Why:** your data stays *yours*. Plain JSON means no lock-in, easy backups, and a future migration path to any other tool or device.

### 1.18 Localization & RTL
- Full **Arabic / English** UI, switchable at runtime (`Ctrl+Shift+L`), layout fully mirrored in RTL via CSS logical properties, locale-aware dates.

> 💡 **Why:** bilingual users shouldn't settle for a half-translated UI. RTL as a first-class citizen means the Arabic experience is as polished as the English one.

### 1.19 Appearance
- **Light / Dark / System** themes; adjustable layout; editor becomes fullscreen on narrow windows.

> 💡 **Why:** a notes app is open all day — it should match your environment and never strain your eyes.

### 1.20 Keyboard shortcuts
| Action | Shortcut |
|---|---|
| New card | `Ctrl+N` |
| Quick capture | `Ctrl+Shift+N` |
| Focus search | `Ctrl+K` |
| Switch language (AR ⇄ EN) | `Ctrl+Shift+L` |
| Flip card (review) | `Space` / `Enter` |
| Next / previous (review) | `→` / `←` |
| Exit review / dialogs | `Esc` |

> 💡 **Why:** power users live on the keyboard. Every frequent action has a shortcut, so the mouse is optional.

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
      "parentId": null, "template": "",
      "sortOrder": 0, "isDefault": true,
      "createdAt": "ISO-8601", "updatedAt": "ISO-8601", "deletedAt": null
    }
  ],
  "cards": [
    {
      "id": "uuid", "title": "", "body": "", "type": "text | checklist",
      "items": [{ "id": "uuid", "text": "Buy milk", "isDone": false, "dueDate": "2026-11-17" }],
      "icon": null, "isArchived": false,
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
| — Extras 2 | **Emoji icon picker** for categories & cards; **drag & drop** cards to categories/Archive/Trash; **Quick Capture** (`Ctrl+Shift+N`, `#tag` / `@Category` syntax); **due dates on checklist items** + Today smart view | ✅ **Done** |
| — Extras 3 | **Card links & backlinks** (`[[` autocomplete, broken-link detection); **sub-categories** (two levels); **templates per category**; **Archive** hidden from all views & Review | ✅ **Done** |
| 2 — Signature | Quick Capture window, pinned floating cards | ⬜ Planned |
| 3 — Knowledge | Smart collection rule builder, card links & backlinks | ⬜ Planned |
| 4 — Productivity | Review mode, checklists, focus mode & timer | ⬜ Planned |
| 5 — Later | Cloud sync, attachments, templates, reminders, version history | ⬜ Planned |
