# LinkedIn post — FlipNote Web

> Two versions: a full post and a shorter one. Add 2–3 screenshots (board view, flip mode, Arabic RTL) — posts with images perform much better.

---

## Version A — full post

Our IT team blocked Notion. 🚫

Fair enough — company data shouldn't live in a third-party cloud. But I still needed a place to think, plan, and keep track of what I'm doing every day.

So instead of looking for another SaaS that would probably get blocked too, I built my own: **FlipNote Web** — a local-first notes board that runs entirely on your own machine. No account. No cloud. No data leaving your laptop.

**What it does:**
📝 Notes and ☑ checklists in one board, organized in categories & sub-categories
⚡ Quick capture (Ctrl+Shift+Z) — save a thought in 2 seconds, organize later
📅 Due dates + a "Today" view across every list
🃏 Review & Flip mode — turn any category into 3D flashcards (great for meeting recaps and studying)
🔗 Links between notes with automatic backlinks — a tiny personal wiki
📋 Templates per category, 🗄️ archive, tags, drag & drop
🌍 Full Arabic / English UI with real RTL — not an afterthought
💾 Autosave with atomic writes — you never press Save, and a crash can't corrupt your data

**How it's built:**
React + Vite on the front, a ~100-line Express API on the back, and the "database" is… a single JSON file. Zero infrastructure. Export it, back it up, move it — it's just your data in plain text.

**What I learned:**
1️⃣ Constraints are a feature. Not being allowed to use the cloud forced a design that's simpler, faster, and more private than most notes apps.
2️⃣ Local-first is underrated. Autosave + atomic file writes + soft delete gave me "never lose anything" without a single server.
3️⃣ Bilingual/RTL from day one is 10x easier than bolting it on later. CSS logical properties did most of the work.
4️⃣ Building with an AI pair programmer (GitHub Copilot) turned a weekend idea into a working app in a day — I focused on *what* to build, it helped with the *how*.

It's open source — if your IT team also blocked your favorite tool, maybe this helps:
👉 https://github.com/hamza120300/FlipNote-Web

What tools has your IT team blocked, and what did you do about it? 👇

#LocalFirst #React #OpenSource #Productivity #Privacy #WebDevelopment #BuildInPublic #Notes #RTL #Arabic

---

## Version B — short post

IT blocked Notion at work. So I built my own notes app that runs 100% locally — no account, no cloud, no data leaving the laptop. 🔒

**FlipNote Web** → notes + checklists, quick capture, due dates, flashcard "flip mode" for reviewing, links & backlinks, templates, archive — all in Arabic & English with full RTL.

Stack: React + Vite + a tiny Express API. Database? A single JSON file. 😄

Open source here 👉 https://github.com/hamza120300/FlipNote-Web

Sometimes the best productivity tool is the one nobody can block.

#LocalFirst #React #OpenSource #Productivity #BuildInPublic

---

## Suggested screenshots
1. The main 3-pane board with a few categories, a checklist card showing `2/3` progress and a red overdue chip.
2. Flip mode mid-review (the back of a card) — it's the most visually distinctive feature.
3. The same board switched to Arabic (RTL) — shows the bilingual angle instantly.
4. (Optional) The Quick Capture box with `#tag @Category` text typed in.
