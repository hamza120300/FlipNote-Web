import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { detectDir, PALETTE, uuid, todayStr, parseLinks } from '../utils.js';
import IconPicker from './IconPicker.jsx';

export default function Editor({
  t,
  lang,
  card,
  categories,
  allCards,
  onOpenCard,
  onNewCategory,
  onClose,
}) {
  const { db, dispatch } = useStore();
  const [tagInput, setTagInput] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [linkQuery, setLinkQuery] = useState(null); // text typed after [[
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  // Focus title when a fresh empty card is selected.
  useEffect(() => {
    if (card && !card.title && !card.body) titleRef.current?.focus();
  }, [card?.id]);

  const allTags = useMemo(() => {
    const set = new Set();
    for (const c of db.cards) {
      if (!c.deletedAt) (c.tags || []).forEach((tg) => set.add(tg));
    }
    return [...set].sort();
  }, [db.cards]);

  if (!card) {
    return (
      <section className="editor-pane empty">
        <div className="empty-state">{t('selectCard')}</div>
      </section>
    );
  }

  const patch = (p) => dispatch({ type: 'UPDATE_CARD', id: card.id, patch: p });

  const addTag = (raw) => {
    const tag = raw.trim().replace(/^#/, '').toLowerCase();
    if (tag && !(card.tags || []).includes(tag)) {
      patch({ tags: [...(card.tags || []), tag] });
    }
    setTagInput('');
  };

  const suggestions = tagInput.trim()
    ? allTags
        .filter(
          (tg) =>
            tg.includes(tagInput.trim().toLowerCase()) &&
            !(card.tags || []).includes(tg)
        )
        .slice(0, 6)
    : [];

  /* ---------- card links ---------- */
  const liveCards = (allCards || []).filter(
    (c) => !c.deletedAt && c.id !== card.id
  );
  const findByTitle = (title) =>
    liveCards.find(
      (c) => c.title.trim().toLowerCase() === title.trim().toLowerCase()
    );
  const outgoingLinks = parseLinks(card.body).map((title) => ({
    title,
    target: findByTitle(title),
  }));
  const backlinks = card.title.trim()
    ? liveCards.filter((c) =>
        parseLinks(c.body).some(
          (l) => l.toLowerCase() === card.title.trim().toLowerCase()
        )
      )
    : [];

  // Detect "[[query" right before the cursor to offer link suggestions.
  const updateLinkQuery = (el) => {
    const upToCursor = el.value.slice(0, el.selectionStart ?? el.value.length);
    const m = upToCursor.match(/\[\[([^\[\]\n]*)$/);
    setLinkQuery(m ? m[1] : null);
  };

  const linkSuggestions =
    linkQuery !== null
      ? liveCards
          .filter(
            (c) =>
              c.title.trim() &&
              c.title.toLowerCase().includes(linkQuery.toLowerCase())
          )
          .slice(0, 6)
      : [];

  const insertLink = (title) => {
    const el = bodyRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, pos).replace(/\[\[([^\[\]\n]*)$/, `[[${title}]]`);
    const after = el.value.slice(pos);
    patch({ body: before + after });
    setLinkQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(before.length, before.length);
    });
  };

  return (
    <section className="editor-pane" dir={detectDir(card.title || card.body)}>
      <div className="editor-toolbar">
        <span className="icon-picker-wrap">
          <button
            className={`icon-btn ${card.icon ? 'active' : ''}`}
            title={t('icon')}
            onClick={() => setShowIconPicker((s) => !s)}
          >
            {card.icon || '😀'}
          </button>
          {showIconPicker && (
            <div className="icon-picker-popover">
              <IconPicker
                value={card.icon}
                onChange={(icon) => patch({ icon })}
                onClose={() => setShowIconPicker(false)}
              />
            </div>
          )}
        </span>
        <button
          className={`icon-btn ${card.isPinned ? 'active' : ''}`}
          title={card.isPinned ? t('unpin') : t('pin')}
          onClick={() => patch({ isPinned: !card.isPinned })}
        >
          📌
        </button>
        <button
          className={`icon-btn ${card.isFavorite ? 'active' : ''}`}
          title={card.isFavorite ? t('unfavorite') : t('favorite')}
          onClick={() => patch({ isFavorite: !card.isFavorite })}
        >
          ★
        </button>
        <button
          className={`icon-btn ${card.isArchived ? 'active' : ''}`}
          title={card.isArchived ? t('unarchive') : t('archiveAction')}
          onClick={() => {
            patch({ isArchived: !card.isArchived });
            if (!card.isArchived) onClose();
          }}
        >
          🗄️
        </button>
        <button
          className="icon-btn"
          title={t('duplicate')}
          onClick={() => dispatch({ type: 'DUPLICATE_CARD', id: card.id })}
        >
          ⧉
        </button>
        <select
          className="select"
          title={t('moveTo')}
          value={card.categoryId}
          onChange={(e) => {
            if (e.target.value === '__new__') {
              onNewCategory((id) => patch({ categoryId: id }));
            } else {
              patch({ categoryId: e.target.value });
            }
          }}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.depth ? '— ' : ''}
              {c.icon ? `${c.icon} ` : ''}
              {c.name}
            </option>
          ))}
          <option value="__new__">+ {t('newCategory')}…</option>
        </select>
        <div className="color-row" title={t('cardColor')}>
          <button
            className={`color-swatch none ${!card.color ? 'active' : ''}`}
            title={t('none')}
            onClick={() => patch({ color: null })}
          />
          {PALETTE.map((col) => (
            <button
              key={col}
              className={`color-swatch ${card.color === col ? 'active' : ''}`}
              style={{ background: col }}
              onClick={() => patch({ color: col })}
            />
          ))}
        </div>
        <span className="spacer" />
        <button
          className="icon-btn danger"
          title={t('delete')}
          onClick={() => {
            dispatch({ type: 'TRASH_CARD', id: card.id });
            onClose();
          }}
        >
          🗑
        </button>
        <button className="icon-btn" title={t('close')} onClick={onClose}>
          ✕
        </button>
      </div>

      <input
        ref={titleRef}
        className="editor-title"
        placeholder={t('titlePlaceholder')}
        value={card.title}
        onChange={(e) => patch({ title: e.target.value })}
        onKeyDown={(e) => e.key === 'Delete' && e.stopPropagation()}
      />
      {card.type === 'checklist' ? (
        <ChecklistEditor
          t={t}
          card={card}
          patch={patch}
          itemInput={itemInput}
          setItemInput={setItemInput}
        />
      ) : (
        <div className="body-wrap">
          <textarea
            ref={bodyRef}
            className="editor-body"
            placeholder={t('bodyPlaceholder')}
            value={card.body}
            onChange={(e) => {
              patch({ body: e.target.value });
              updateLinkQuery(e.target);
            }}
            onKeyUp={(e) => updateLinkQuery(e.target)}
            onClick={(e) => updateLinkQuery(e.target)}
            onBlur={() => setTimeout(() => setLinkQuery(null), 200)}
          />
          {linkSuggestions.length > 0 && (
            <div className="link-suggestions">
              {linkSuggestions.map((c) => (
                <button
                  key={c.id}
                  className="tag-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertLink(c.title.trim());
                  }}
                >
                  🔗 {c.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {(outgoingLinks.length > 0 || backlinks.length > 0) && (
        <div className="links-section">
          {outgoingLinks.length > 0 && (
            <div className="links-row">
              <span className="links-label">🔗 {t('links')}:</span>
              {outgoingLinks.map(({ title, target }) => (
                <button
                  key={title}
                  className={`tag-chip link-chip ${!target ? 'broken' : ''}`}
                  disabled={!target}
                  onClick={() => target && onOpenCard(target.id)}
                >
                  {title}
                </button>
              ))}
            </div>
          )}
          {backlinks.length > 0 && (
            <div className="links-row">
              <span className="links-label">↩ {t('backlinks')}:</span>
              {backlinks.map((c) => (
                <button
                  key={c.id}
                  className="tag-chip link-chip"
                  onClick={() => onOpenCard(c.id)}
                >
                  {c.title || t('untitled')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="editor-tags">
        {(card.tags || []).map((tag) => (
          <span key={tag} className="tag-chip removable">
            #{tag}
            <button
              className="tag-remove"
              onClick={() =>
                patch({ tags: card.tags.filter((x) => x !== tag) })
              }
            >
              ×
            </button>
          </span>
        ))}
        <span className="tag-input-wrap">
          <input
            className="tag-input"
            placeholder={t('tagsPlaceholder')}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                addTag(tagInput);
              } else if (
                e.key === 'Backspace' &&
                !tagInput &&
                card.tags?.length
              ) {
                patch({ tags: card.tags.slice(0, -1) });
              }
            }}
          />
          {suggestions.length > 0 && (
            <div className="tag-suggestions">
              {suggestions.map((s) => (
                <button key={s} className="tag-suggestion" onClick={() => addTag(s)}>
                  #{s}
                </button>
              ))}
            </div>
          )}
        </span>
      </div>
    </section>
  );
}

function ChecklistEditor({ t, card, patch, itemInput, setItemInput }) {
  const items = card.items || [];
  const doneCount = items.filter((i) => i.isDone).length;

  const setItems = (next) => patch({ items: next });

  const addItem = () => {
    const text = itemInput.trim();
    if (!text) return;
    setItems([...items, { id: uuid(), text, isDone: false, dueDate: null }]);
    setItemInput('');
  };

  return (
    <div className="checklist-editor">
      {items.length > 0 && (
        <div className="checklist-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
          <span className="checklist-count">
            {doneCount}/{items.length}
          </span>
          {doneCount > 0 && (
            <button
              className="btn small"
              onClick={() => setItems(items.filter((i) => !i.isDone))}
            >
              {t('clearCompleted')}
            </button>
          )}
        </div>
      )}

      <ul className="checklist-items">
        {items.map((item) => (
          <li key={item.id} className={item.isDone ? 'done' : ''}>
            <input
              type="checkbox"
              checked={item.isDone}
              onChange={() =>
                setItems(
                  items.map((i) =>
                    i.id === item.id ? { ...i, isDone: !i.isDone } : i
                  )
                )
              }
            />
            <input
              className="item-text"
              value={item.text}
              onChange={(e) =>
                setItems(
                  items.map((i) =>
                    i.id === item.id ? { ...i, text: e.target.value } : i
                  )
                )
              }
              onKeyDown={(e) => e.key === 'Delete' && e.stopPropagation()}
            />
            <input
              type="date"
              className={`item-date ${!item.isDone && item.dueDate && item.dueDate <= todayStr() ? 'overdue' : ''}`}
              title={t('dueDate')}
              value={item.dueDate || ''}
              onChange={(e) =>
                setItems(
                  items.map((i) =>
                    i.id === item.id
                      ? { ...i, dueDate: e.target.value || null }
                      : i
                  )
                )
              }
            />
            <button
              className="icon-btn danger"
              onClick={() => setItems(items.filter((i) => i.id !== item.id))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <input
        className="item-add-input"
        placeholder={t('addItemPlaceholder')}
        value={itemInput}
        onChange={(e) => setItemInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
          }
        }}
      />
    </div>
  );
}
