import express from 'express';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');
const TMP_PATH = DB_PATH + '.tmp';
const PORT = process.env.PORT || 4000;

const now = () => new Date().toISOString();

function seedDb() {
  return {
    schemaVersion: 1,
    categories: [
      {
        id: crypto.randomUUID(),
        name: 'Inbox',
        color: '#6366f1',
        icon: '📥',
        sortOrder: 0,
        isDefault: true,
        createdAt: now(),
        updatedAt: now(),
        deletedAt: null,
      },
    ],
    cards: [],
    settings: {
      language: 'en',
      theme: 'system',
      viewMode: 'grid',
    },
  };
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const db = seedDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

// Atomic write: write to temp file then rename over the original.
// OneDrive/antivirus can transiently lock the target on Windows (EPERM),
// so retry with backoff and fall back to a direct write as a last resort.
async function writeDbFile(json) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await fsp.writeFile(TMP_PATH, json, 'utf8');
      await fsp.rename(TMP_PATH, DB_PATH);
      return;
    } catch (err) {
      if (!['EPERM', 'EBUSY', 'EACCES'].includes(err.code)) throw err;
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }
  }
  // Fallback: non-atomic direct write beats losing the save entirely.
  await fsp.writeFile(DB_PATH, json, 'utf8');
  await fsp.unlink(TMP_PATH).catch(() => {});
}

// Writes are queued in sequence; .catch keeps the chain alive after a failure.
let writing = Promise.resolve();
function saveDb(db) {
  const result = writing
    .catch(() => {})
    .then(() => writeDbFile(JSON.stringify(db, null, 2)));
  writing = result;
  return result;
}

let db = loadDb();

const app = express();
app.use(express.json({ limit: '20mb' }));

app.get('/api/db', (_req, res) => {
  res.json(db);
});

// POST alias used by navigator.sendBeacon on window close.
app.post('/api/db', (req, res) => saveHandler(req, res));
app.put('/api/db', (req, res) => saveHandler(req, res));

async function saveHandler(req, res) {
  const body = req.body;
  if (!body || !Array.isArray(body.categories) || !Array.isArray(body.cards)) {
    return res.status(400).json({ error: 'Invalid database payload' });
  }
  db = body;
  try {
    await saveDb(db);
    res.json({ ok: true, savedAt: now() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write db.json: ' + err.message });
  }
}

app.listen(PORT, () => {
  console.log(`Notes Board API listening on http://localhost:${PORT} (db: ${DB_PATH})`);
});
