export const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

export const now = () => new Date().toISOString();

// Normalize text for search: lowercase, strip Arabic diacritics (tashkeel),
// and unify common Arabic letter variants.
export function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

export function matchesSearch(card, query) {
  const q = normalizeText(query.trim());
  if (!q) return true;
  const haystack = normalizeText(
    [card.title, card.body, ...(card.tags || [])].join(' ')
  );
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function formatDate(iso, locale) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// Detect direction from the first strong character.
export function detectDir(text) {
  const m = (text || '').match(/[A-Za-z\u0600-\u06FF]/);
  if (!m) return 'auto';
  return /[\u0600-\u06FF]/.test(m[0]) ? 'rtl' : 'ltr';
}

export const PALETTE = [
  '#6366f1',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

export const EMOJIS = [
  '📥', '📝', '💼', '📚', '💡', '🏠', '❤️', '⭐',
  '🎯', '🛒', '✈️', '🎵', '💻', '🍕', '⚽', '🎓',
  '🔧', '📅', '🧠', '🔥', '🌙', '🎁', '🐱', '🌿',
];

// Local date (not UTC) as YYYY-MM-DD, for due-date comparisons.
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// window.confirm with a DOM fallback for embedded browsers that don't support it.
export function confirmBox(message) {
  try {
    return Promise.resolve(window.confirm(message));
  } catch {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      const modal = document.createElement('div');
      modal.className = 'modal';
      const p = document.createElement('p');
      p.textContent = message;
      p.style.margin = '0';
      const row = document.createElement('div');
      row.className = 'field row';
      const ok = document.createElement('button');
      ok.className = 'btn primary';
      ok.textContent = 'OK';
      const cancel = document.createElement('button');
      cancel.className = 'btn';
      cancel.textContent = '✕';
      const done = (v) => {
        backdrop.remove();
        resolve(v);
      };
      ok.onclick = () => done(true);
      cancel.onclick = () => done(false);
      backdrop.onclick = (e) => {
        if (e.target === backdrop) done(false);
      };
      row.append(ok, cancel);
      modal.append(p, row);
      backdrop.append(modal);
      document.body.append(backdrop);
      ok.focus();
    });
  }
}

// Parse quick-capture text: #tag adds tags, @Category targets a category.
export function parseCapture(text, categories) {
  const tags = [];
  let categoryId = null;
  let body = text.replace(/(^|\s)#([^\s#@]+)/g, (_m, pre, tag) => {
    const t = tag.toLowerCase();
    if (!tags.includes(t)) tags.push(t);
    return pre;
  });
  body = body.replace(/(^|\s)@([^\s#@]+)/g, (m, pre, name) => {
    const cat = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (cat && !categoryId) {
      categoryId = cat.id;
      return pre;
    }
    return m;
  });
  return { body: body.trim(), tags, categoryId };
}
