# Notes Board

A local-first notes app: cards grouped into categories, with tags, pin/favorite, trash, search, export/import, light/dark theme, and Arabic/English UI with full RTL support.

- **Frontend:** React + Vite
- **Database:** a plain JSON file (`server/db.json`) served by a tiny Express API

## Run

```bash
npm install
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:4000 (Vite proxies `/api` to it)

All data is stored in `server/db.json`. Writes are atomic (temp file + rename) and the client autosaves with a ~500 ms debounce.

## Features (Release 1)

- **Dual-type cards** — 📝 text notes or ☑ interactive checklists with inline check-off and a smart progress bar (e.g. 3/4).
- **Top Deck Review & Flip Mode 🌟** — turn any category into a fullscreen flashcard deck: 3D flip (front = title, back = details/checklist), next/previous with a progress counter, and a celebration screen 🎉 at the end.
- **Card links & backlinks 🔗** — type `[[` to link cards; clickable link chips, automatic backlinks, broken links shown clearly.
- **Sub-categories** — nest categories (Study → Math, Physics); parents show their children's cards and counts.
- **Templates 📋** — per-category pre-filled content for new cards; checklist templates become ready-made items.
- **Archive 🗄️** — hide finished cards from all views and Review without deleting them; one-click unarchive.
- **Icons** — pick an emoji icon for any category or card (like colors).
- **Drag & drop** — drag cards onto sidebar categories to move them, onto Archive to archive, or onto Trash to delete.
- **Quick Capture ⚡** — `Ctrl+Shift+N` (or the ⚡ button) opens a mini input; `#tag` adds tags, `@Category` targets a category; saves to Inbox by default.
- **Due dates & Today view 📅** — set a due date per checklist item; the Today smart view shows everything due or overdue.
- **Categories** — create, rename, recolor-ready, reorder (↑/↓), delete (cards move to Inbox); live card counts in the sidebar.
- **Cards** — create (`Ctrl+N`), edit title/body, move between categories, duplicate, pin, favorite, accent color, grid/list view.
- **Autosave** — debounced persistence with a Saved / Saving… / Save failed indicator; flush on window close.
- **Search** — `Ctrl+K`, matches title/body/tags, case-insensitive, ignores Arabic diacritics (tashkeel) and normalizes letter variants (أ/إ/آ → ا, ى → ي, ة → ه).
- **Tags** — inline tag input with autocomplete; click ✕ to remove; Untagged smart view.
- **Smart collections** — All Notes, Favorites, Recent, Untagged, Trash.
- **Trash** — soft delete; restore, delete forever, empty trash.
- **Export / Import** — export everything to JSON; import merges by `id`, newer `updatedAt` wins.
- **i18n & RTL** — switch Arabic/English at runtime (`Ctrl+Shift+L` or Settings); layout mirrors in RTL; per-card direction auto-detected from the first strong character.
- **Themes** — light / dark / system.

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| New card | `Ctrl+N` |
| Search | `Ctrl+K` |
| Switch language | `Ctrl+Shift+L` |

## Data model

`server/db.json`:

```jsonc
{
  "schemaVersion": 1,
  "categories": [{ "id", "name", "color", "icon", "sortOrder", "isDefault", "createdAt", "updatedAt", "deletedAt" }],
  "cards": [{ "id", "title", "body", "categoryId", "tags", "isPinned", "isFavorite", "color", "createdAt", "updatedAt", "deletedAt" }],
  "settings": { "language", "theme", "viewMode" }
}
```

All ids are UUIDs and deletes are soft (`deletedAt`), so the model is ready for future cloud sync.

## Contributing

Pull requests and issues are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow and project guidelines.
