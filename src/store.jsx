import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { uuid, now } from './utils.js';

const StoreContext = createContext(null);

export function reducer(db, action) {
  const ts = now();
  switch (action.type) {
    case 'LOAD':
      return action.db;

    /* ---------- categories ---------- */
    case 'ADD_CATEGORY': {
      const name = action.name.trim();
      if (!name) return db;
      const exists = db.categories.some(
        (c) => !c.deletedAt && c.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) return db;
      const cat = {
        id: action.id || uuid(),
        name,
        color: action.color || '#6366f1',
        icon: action.icon || '',
        parentId: action.parentId || null,
        template: '',
        sortOrder: db.categories.length,
        isDefault: false,
        createdAt: ts,
        updatedAt: ts,
        deletedAt: null,
      };
      return { ...db, categories: [...db.categories, cat] };
    }
    case 'UPDATE_CATEGORY':
      return {
        ...db,
        categories: db.categories.map((c) =>
          c.id === action.id ? { ...c, ...action.patch, updatedAt: ts } : c
        ),
      };
    case 'DELETE_CATEGORY': {
      const cat = db.categories.find((c) => c.id === action.id);
      if (!cat || cat.isDefault) return db;
      const inbox = db.categories.find((c) => c.isDefault && !c.deletedAt);
      return {
        ...db,
        categories: db.categories.map((c) => {
          if (c.id === action.id) return { ...c, deletedAt: ts, updatedAt: ts };
          // Orphaned sub-categories move to the top level.
          if (c.parentId === action.id)
            return { ...c, parentId: null, updatedAt: ts };
          return c;
        }),
        cards: db.cards.map((card) =>
          card.categoryId === action.id && !card.deletedAt
            ? { ...card, categoryId: inbox ? inbox.id : card.categoryId, updatedAt: ts }
            : card
        ),
      };
    }
    case 'REORDER_CATEGORY': {
      const moving = db.categories.find((c) => c.id === action.id);
      if (!moving) return db;
      // Reorder among siblings (same parent) only.
      const siblings = db.categories
        .filter(
          (c) => !c.deletedAt && (c.parentId || null) === (moving.parentId || null)
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const from = siblings.findIndex((c) => c.id === action.id);
      const to = from + action.delta;
      if (from < 0 || to < 0 || to >= siblings.length) return db;
      const order = [...siblings];
      const [moved] = order.splice(from, 1);
      order.splice(to, 0, moved);
      // Reassign the original sortOrder slots within the sibling group.
      const slots = siblings.map((c) => c.sortOrder);
      const sortMap = new Map(order.map((c, i) => [c.id, slots[i]]));
      return {
        ...db,
        categories: db.categories.map((c) =>
          sortMap.has(c.id) ? { ...c, sortOrder: sortMap.get(c.id) } : c
        ),
      };
    }

    /* ---------- cards ---------- */
    case 'ADD_CARD': {
      // Apply the category template unless explicit content was provided.
      const cat = db.categories.find((c) => c.id === action.categoryId);
      const tpl = (cat?.template || '').trim();
      const cardType = action.cardType || 'text';
      let body = action.body || '';
      let items = [];
      if (tpl && !body) {
        if (cardType === 'checklist') {
          items = tpl
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((text) => ({ id: uuid(), text, isDone: false, dueDate: null }));
        } else {
          body = tpl;
        }
      }
      const card = {
        id: uuid(),
        title: action.title || '',
        body,
        type: cardType,
        items,
        icon: null,
        isArchived: false,
        categoryId: action.categoryId,
        tags: action.tags || [],
        isPinned: false,
        isFavorite: false,
        color: null,
        createdAt: ts,
        updatedAt: ts,
        deletedAt: null,
      };
      return { ...db, cards: [card, ...db.cards] };
    }
    case 'UPDATE_CARD':
      return {
        ...db,
        cards: db.cards.map((c) =>
          c.id === action.id ? { ...c, ...action.patch, updatedAt: ts } : c
        ),
      };
    case 'DUPLICATE_CARD': {
      const src = db.cards.find((c) => c.id === action.id);
      if (!src) return db;
      const copy = {
        ...src,
        id: uuid(),
        isPinned: false,
        createdAt: ts,
        updatedAt: ts,
        deletedAt: null,
      };
      return { ...db, cards: [copy, ...db.cards] };
    }
    case 'TRASH_CARD':
      return {
        ...db,
        cards: db.cards.map((c) =>
          c.id === action.id ? { ...c, deletedAt: ts, updatedAt: ts } : c
        ),
      };
    case 'RESTORE_CARD':
      return {
        ...db,
        cards: db.cards.map((c) =>
          c.id === action.id ? { ...c, deletedAt: null, updatedAt: ts } : c
        ),
      };
    case 'PURGE_CARD':
      return { ...db, cards: db.cards.filter((c) => c.id !== action.id) };
    case 'EMPTY_TRASH':
      return { ...db, cards: db.cards.filter((c) => !c.deletedAt) };

    /* ---------- settings / import ---------- */
    case 'SET_SETTINGS':
      return { ...db, settings: { ...db.settings, ...action.patch } };
    case 'IMPORT': {
      // Merge by id; newer updatedAt wins.
      const mergeById = (current, incoming) => {
        const map = new Map(current.map((e) => [e.id, e]));
        for (const item of incoming || []) {
          const existing = map.get(item.id);
          if (!existing || (item.updatedAt || '') > (existing.updatedAt || '')) {
            map.set(item.id, item);
          }
        }
        return [...map.values()];
      };
      return {
        ...db,
        categories: mergeById(db.categories, action.db.categories),
        cards: mergeById(db.cards, action.db.cards),
        settings: { ...db.settings, ...(action.db.settings || {}) },
      };
    }
    default:
      return db;
  }
}

export function StoreProvider({ children }) {
  const [db, dispatch] = useReducer(reducer, null);
  const [saveState, setSaveState] = useState('saved'); // saved | saving | error
  const loaded = useRef(false);
  const timer = useRef(null);
  const retries = useRef(0);
  const dbRef = useRef(null);
  dbRef.current = db;

  useEffect(() => {
    fetch('/api/db')
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: 'LOAD', db: data });
        setTimeout(() => (loaded.current = true), 0);
      })
      .catch(() => setSaveState('error'));
  }, []);

  const persist = async () => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/db', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbRef.current),
      });
      if (!res.ok) throw new Error('save failed');
      retries.current = 0;
      setSaveState('saved');
    } catch {
      setSaveState('error');
      // Auto-retry transient failures (e.g. OneDrive file locks).
      if (retries.current < 10) {
        retries.current += 1;
        clearTimeout(timer.current);
        timer.current = setTimeout(persist, 2000);
      }
    }
  };

  // Debounced autosave on every change after initial load.
  useEffect(() => {
    if (!db || !loaded.current) return;
    setSaveState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, 500);
    return () => clearTimeout(timer.current);
  }, [db]);

  // Flush on window close.
  useEffect(() => {
    const flush = () => {
      if (!dbRef.current || !loaded.current) return;
      try {
        navigator.sendBeacon?.(
          '/api/db',
          new Blob([JSON.stringify(dbRef.current)], { type: 'application/json' })
        );
      } catch {
        /* best effort */
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  return (
    <StoreContext.Provider value={{ db, dispatch, saveState }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
