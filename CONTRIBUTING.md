# Contributing to FlipNote Web

Thanks for your interest! Contributions of all sizes are welcome — bug fixes, new features, translations, or docs.

## Quick start

```bash
git clone https://github.com/<your-username>/FlipNote-Web.git
cd FlipNote-Web
npm install
npm run dev        # app on http://localhost:5173, API on :4000
```

## How to contribute

1. **Fork** this repository and clone your fork.
2. **Create a branch** for your change:
   ```bash
   git checkout -b feature/short-description
   ```
3. **Make your change.** Keep it focused — one feature or fix per pull request.
4. **Test it** by running `npm run dev` and trying the feature in the browser. Run `npm run build` to make sure it compiles.
5. **Commit and push:**
   ```bash
   git commit -m "Add short description of the change"
   git push origin feature/short-description
   ```
6. **Open a Pull Request** against `main`. Describe what you changed and why, and add a screenshot if it's a UI change.

Don't want to write code? **Open an Issue** describing the bug or feature idea — that's a valuable contribution too.

## Project layout

| Path | What's there |
|---|---|
| `server/index.js` | Express API + atomic JSON persistence |
| `src/store.jsx` | Reducer (all data changes) + autosave |
| `src/App.jsx` | Layout, selection, filters, shortcuts, dialogs |
| `src/components/` | Sidebar, CardList, Editor, ReviewMode, QuickCapture, … |
| `src/i18n.js` | English + Arabic strings |
| `src/utils.js` | UUID, Arabic search normalization, link parsing, helpers |
| `docs/` | Feature & technical documentation |

## Guidelines

- **All user-facing text goes through `src/i18n.js`** — add both `en` and `ar` entries. No hard-coded strings.
- **Use CSS logical properties** (`margin-inline-start`, `inset-inline-end`, …) instead of left/right so RTL keeps working.
- **All data changes go through the reducer** in `src/store.jsx` — never mutate `db` directly.
- New card/category fields should default safely for existing data (old `db.json` files must keep loading).
- Keep dependencies minimal — the project intentionally has no UI framework or state library.
- Match the existing code style (Prettier-ish: 2 spaces, single quotes, trailing commas).

## Reporting bugs

Open an Issue with:
- what you did, what you expected, what happened
- browser + OS
- the error from the browser console or terminal, if any

Thanks for helping make FlipNote better! 🎉
