# Team message — FlipNote Web

> Copy-paste into Teams / email. Adjust names and tone as you like.

---

**Subject: A local notes app to replace Notion (no cloud, no account, runs on your laptop)**

Hi team,

Since Notion is blocked on our machines, I built a small notes app we can run **100% locally** — no account, no internet, no data leaving your laptop. I've been using it daily and wanted to share it in case it helps you too.

**🔗 Repo:** https://github.com/hamza120300/FlipNote-Web

### What it gives you
- **Notes + checklists in one board**, organized in categories and sub-categories (Work → Project A, Project B…)
- **Quick capture** (`Ctrl+Shift+N`) — jot a thought in 2 seconds, sort it later
- **Checklists with due dates** and a **"Today"** view that shows everything due/overdue across all lists
- **Review / flip mode** — turn any category into flashcards to recap meetings or study
- **Links between notes** (`[[Note title]]`) with automatic backlinks — a mini personal wiki
- **Templates** per category (e.g. a meeting-notes skeleton), **archive**, **tags**, **search** (Arabic-aware), **drag & drop**
- **Arabic / English UI** with full RTL, light/dark theme
- **Autosave** — you never press Save, and nothing is lost on crash

### Where your data lives
Everything is stored in **one JSON file on your own machine**: `server/db.json`.
No server, no sync, no third party. You can **Export** it to a JSON file anytime from Settings as a backup, and **Import** it on another machine.

### How to run it (≈ 2 minutes)
You need **Node.js** (v18 or newer). If it's not installed, download it from https://nodejs.org (LTS). It's a standard developer tool — check with IT if you're unsure.

```bash
git clone https://github.com/hamza120300/FlipNote-Web.git
cd FlipNote-Web
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser. That's it.

> Tip: keep the terminal window open while you use the app (it runs the local server). To stop it, press `Ctrl+C`.
> Tip: clone it **outside** OneDrive-synced folders if you can — it works either way, but it avoids occasional file-lock retries.

### Shortcuts worth knowing
| Action | Shortcut |
|---|---|
| Quick capture | `Ctrl+Shift+N` |
| New card | `Ctrl+N` |
| Search | `Ctrl+K` |
| Switch Arabic / English | `Ctrl+Shift+L` |

It's open source, so if you have ideas or hit any issue, tell me (or open an issue on the repo) — I'm happy to add things the team needs.

### Want to add a feature yourself? 🛠️
Contributions are very welcome — it's a normal GitHub workflow:

1. **Fork** the repo on GitHub (button top-right) and clone your fork.
2. Create a branch for your change:
   ```bash
   git checkout -b feature/my-idea
   ```
3. Make your change, test it with `npm run dev`, then commit and push:
   ```bash
   git commit -m "Add my idea"
   git push origin feature/my-idea
   ```
4. Open a **Pull Request** from your branch to `main` on GitHub — I'll review and merge it.

Not comfortable with git yet? No problem — just **open an Issue** on the repo describing the feature or bug, and I'll take it from there. More details in `CONTRIBUTING.md` in the repo.

Thanks,
[Your name]
