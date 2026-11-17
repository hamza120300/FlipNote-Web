import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from './store.jsx';
import { translations } from './i18n.js';
import { matchesSearch, uuid, PALETTE, parseCapture, todayStr } from './utils.js';
import Sidebar from './components/Sidebar.jsx';
import CardList from './components/CardList.jsx';
import Editor from './components/Editor.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import ReviewMode from './components/ReviewMode.jsx';
import QuickCapture from './components/QuickCapture.jsx';
import IconPicker from './components/IconPicker.jsx';

export default function App() {
  const { db, dispatch } = useStore();
  const [selection, setSelection] = useState({ type: 'smart', id: 'all' });
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [query, setQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  // null | { onCreate: (id) => void | null } — controls the new-category dialog
  const [catPrompt, setCatPrompt] = useState(null);
  const [showCapture, setShowCapture] = useState(false);
  const [templateCat, setTemplateCat] = useState(null);
  const searchRef = useRef(null);

  const lang = db?.settings?.language || 'en';
  const t = (key) => translations[lang][key] || key;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Theme + direction on <html>.
  useEffect(() => {
    if (!db) return;
    const theme = db.settings.theme || 'system';
    const dark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [db?.settings?.theme, lang]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowCapture(true);
      } else if (mod && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        createCard();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        dispatch({
          type: 'SET_SETTINGS',
          patch: { language: lang === 'ar' ? 'en' : 'ar' },
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const categories = useMemo(
    () =>
      (db?.categories || [])
        .filter((c) => !c.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [db]
  );
  const inbox = categories.find((c) => c.isDefault) || categories[0];

  // Tree-ordered list: each top-level category followed by its children.
  const orderedCategories = useMemo(() => {
    const tops = categories.filter((c) => !c.parentId);
    const out = [];
    for (const top of tops) {
      out.push({ ...top, depth: 0 });
      for (const child of categories.filter((c) => c.parentId === top.id)) {
        out.push({ ...child, depth: 1 });
      }
    }
    // Orphans whose parent is missing render at top level.
    for (const c of categories) {
      if (c.parentId && !categories.some((p) => p.id === c.parentId)) {
        out.push({ ...c, depth: 0 });
      }
    }
    return out;
  }, [categories]);

  const visibleCards = useMemo(() => {
    if (!db) return [];
    let cards = db.cards;
    if (selection.type === 'smart' && selection.id === 'trash') {
      cards = cards.filter((c) => c.deletedAt);
    } else if (selection.type === 'smart' && selection.id === 'archive') {
      cards = cards.filter((c) => !c.deletedAt && c.isArchived);
    } else {
      cards = cards.filter((c) => !c.deletedAt && !c.isArchived);
      if (selection.type === 'category') {
        // A parent category also shows its sub-categories' cards.
        const ids = [
          selection.id,
          ...categories
            .filter((c) => c.parentId === selection.id)
            .map((c) => c.id),
        ];
        cards = cards.filter((c) => ids.includes(c.categoryId));
      } else if (selection.id === 'favorites') {
        cards = cards.filter((c) => c.isFavorite);
      } else if (selection.id === 'untagged') {
        cards = cards.filter((c) => !c.tags || c.tags.length === 0);
      } else if (selection.id === 'today') {
        const today = todayStr();
        cards = cards.filter((c) =>
          (c.items || []).some(
            (i) => !i.isDone && i.dueDate && i.dueDate <= today
          )
        );
      }
    }
    if (query.trim()) cards = cards.filter((c) => matchesSearch(c, query));
    const sorted = [...cards].sort((a, b) => {
      if (!!b.isPinned - !!a.isPinned) return !!b.isPinned - !!a.isPinned;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
    if (selection.type === 'smart' && selection.id === 'recent') {
      return sorted.slice(0, 20);
    }
    return sorted;
  }, [db, selection, query, categories]);

  // Select the newest empty card after ADD_CARD: track card count.
  const prevCount = useRef(0);
  useEffect(() => {
    if (!db) return;
    if (db.cards.length === prevCount.current + 1) {
      const newest = [...db.cards].sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      )[0];
      if (newest && !newest.deletedAt && !newest.title && !newest.body) {
        setSelectedCardId(newest.id);
      }
    }
    prevCount.current = db.cards.length;
  }, [db?.cards.length]);

  if (!db) {
    return <div className="loading">Loading…</div>;
  }

  const selectedCard =
    db.cards.find((c) => c.id === selectedCardId && !c.deletedAt) || null;

  function createCard(cardType = 'text') {
    const categoryId =
      selection.type === 'category' ? selection.id : inbox?.id;
    if (!categoryId) return;
    dispatch({ type: 'ADD_CARD', categoryId, cardType });
  }

  // Open the new-category dialog; onCreate (optional) receives the new id.
  function requestNewCategory(onCreate) {
    setCatPrompt({ onCreate: typeof onCreate === 'function' ? onCreate : null });
  }

  function confirmNewCategory(rawName, icon, parentId) {
    const name = (rawName || '').trim();
    const prompt = catPrompt;
    setCatPrompt(null);
    if (!name) return;
    const existing = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    let id;
    if (existing) {
      id = existing.id;
    } else {
      id = uuid();
      dispatch({
        type: 'ADD_CATEGORY',
        id,
        name,
        icon: icon || '',
        parentId: parentId || null,
        color: PALETTE[categories.length % PALETTE.length],
      });
    }
    setSelection({ type: 'category', id });
    prompt?.onCreate?.(id);
  }

  function saveCapture(text) {
    const { body, tags, categoryId } = parseCapture(text, categories);
    if (!body && tags.length === 0) return;
    dispatch({
      type: 'ADD_CARD',
      categoryId: categoryId || inbox?.id,
      body,
      tags,
    });
  }

  return (
    <div className="app" dir={dir}>
      <Sidebar
        t={t}
        categories={orderedCategories}
        cards={db.cards}
        selection={selection}
        onSelect={(sel) => {
          setSelection(sel);
          setSelectedCardId(null);
        }}
        query={query}
        setQuery={setQuery}
        searchRef={searchRef}
        onQuickCapture={() => setShowCapture(true)}
        onEditTemplate={(cat) => setTemplateCat(cat)}
        onOpenSettings={() => setShowSettings(true)}
      />
      <CardList
        t={t}
        lang={lang}
        cards={visibleCards}
        categories={categories}
        selection={selection}
        selectedCardId={selectedCardId}
        onSelectCard={setSelectedCardId}
        onNewCard={createCard}
        onNewCategory={requestNewCategory}
        onStartReview={() => setReviewing(true)}
        viewMode={db.settings.viewMode || 'grid'}
        setViewMode={(v) =>
          dispatch({ type: 'SET_SETTINGS', patch: { viewMode: v } })
        }
        query={query}
      />
      <Editor
        t={t}
        lang={lang}
        card={selectedCard}
        categories={orderedCategories}
        allCards={db.cards}
        onOpenCard={setSelectedCardId}
        onNewCategory={requestNewCategory}
        onClose={() => setSelectedCardId(null)}
      />
      {showSettings && (
        <SettingsModal t={t} onClose={() => setShowSettings(false)} />
      )}
      {reviewing && (
        <ReviewMode
          t={t}
          cards={visibleCards}
          categories={categories}
          onClose={() => setReviewing(false)}
        />
      )}
      {catPrompt && (
        <NewCategoryDialog
          t={t}
          topCategories={categories.filter((c) => !c.parentId)}
          onConfirm={confirmNewCategory}
          onCancel={() => setCatPrompt(null)}
        />
      )}
      {templateCat && (
        <TemplateDialog
          t={t}
          category={templateCat}
          onSave={(template) => {
            dispatch({
              type: 'UPDATE_CATEGORY',
              id: templateCat.id,
              patch: { template },
            });
            setTemplateCat(null);
          }}
          onCancel={() => setTemplateCat(null)}
        />
      )}
      {showCapture && (
        <QuickCapture
          t={t}
          onSave={saveCapture}
          onClose={() => setShowCapture(false)}
        />
      )}
    </div>
  );
}

function NewCategoryDialog({ t, topCategories, onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(null);
  const [parentId, setParentId] = useState('');
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>📁 {t('newCategory')}</h2>
          <button className="icon-btn" onClick={onCancel}>
            ✕
          </button>
        </header>
        <input
          className="inline-input"
          autoFocus
          placeholder={t('categoryName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(name, icon, parentId || null);
            if (e.key === 'Escape') onCancel();
          }}
        />
        <label className="field">
          <span>{t('parentCategory')}</span>
          <select
            className="select"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">{t('topLevel')}</option>
            {topCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="field-label">{t('icon')}</div>
        <IconPicker value={icon} onChange={setIcon} />
        <div className="field row">
          <button
            className="btn primary"
            onClick={() => onConfirm(name, icon, parentId || null)}
          >
            {t('create')}
          </button>
          <button className="btn" onClick={onCancel}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateDialog({ t, category, onSave, onCancel }) {
  const [text, setText] = useState(category.template || '');
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal capture-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>
            📋 {t('template')} — {category.name}
          </h2>
          <button className="icon-btn" onClick={onCancel}>
            ✕
          </button>
        </header>
        <textarea
          className="capture-input"
          autoFocus
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        />
        <p className="capture-hint">{t('templateHint')}</p>
        <div className="field row">
          <button className="btn primary" onClick={() => onSave(text)}>
            {t('save')}
          </button>
          <button className="btn" onClick={onCancel}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
