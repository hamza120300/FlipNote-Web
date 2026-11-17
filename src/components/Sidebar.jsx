import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { PALETTE, todayStr, confirmBox } from '../utils.js';
import IconPicker from './IconPicker.jsx';

export default function Sidebar({
  t,
  categories,
  cards,
  selection,
  onSelect,
  query,
  setQuery,
  searchRef,
  onQuickCapture,
  onOpenSettings,
}) {
  const { dispatch, saveState } = useStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [iconPickerId, setIconPickerId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const liveCards = cards.filter((c) => !c.deletedAt);
  const countFor = (catId) =>
    liveCards.filter((c) => c.categoryId === catId).length;
  const trashCount = cards.filter((c) => c.deletedAt).length;
  const today = todayStr();

  const smart = [
    { id: 'all', label: t('allNotes'), icon: '🗂️', count: liveCards.length },
    {
      id: 'today',
      label: t('today'),
      icon: '📅',
      count: liveCards.filter((c) =>
        (c.items || []).some((i) => !i.isDone && i.dueDate && i.dueDate <= today)
      ).length,
    },
    {
      id: 'favorites',
      label: t('favorites'),
      icon: '★',
      count: liveCards.filter((c) => c.isFavorite).length,
    },
    { id: 'recent', label: t('recent'), icon: '◷', count: null },
    {
      id: 'untagged',
      label: t('untagged'),
      icon: '🏷️',
      count: liveCards.filter((c) => !c.tags?.length).length,
    },
  ];

  const isSel = (type, id) => selection.type === type && selection.id === id;

  // Drag & drop: cards dropped on a category move there; on Trash they're deleted.
  const dropProps = (targetId, onDropCard) => ({
    onDragOver: (e) => {
      if (e.dataTransfer.types.includes('text/card-id')) {
        e.preventDefault();
        setDragOverId(targetId);
      }
    },
    onDragLeave: () => setDragOverId((cur) => (cur === targetId ? null : cur)),
    onDrop: (e) => {
      e.preventDefault();
      setDragOverId(null);
      const cardId = e.dataTransfer.getData('text/card-id');
      if (cardId) onDropCard(cardId);
    },
  });

  const addCategory = () => {
    const name = newName.trim();
    if (name) {
      dispatch({
        type: 'ADD_CATEGORY',
        name,
        color: PALETTE[categories.length % PALETTE.length],
      });
    }
    setNewName('');
    setAdding(false);
  };

  const commitRename = (id) => {
    const name = editName.trim();
    if (name) dispatch({ type: 'UPDATE_CATEGORY', id, patch: { name } });
    setEditingId(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-head-row">
          <h1 className="app-title">{t('appName')}</h1>
          <button
            className="icon-btn"
            title={`${t('quickCapture')} (Ctrl+Shift+N)`}
            onClick={onQuickCapture}
          >
            ⚡
          </button>
        </div>
        <span className={`save-indicator save-${saveState}`}>
          {saveState === 'saved'
            ? t('saved')
            : saveState === 'saving'
              ? t('saving')
              : t('saveFailed')}
        </span>
      </div>

      <input
        ref={searchRef}
        className="search-input"
        type="search"
        placeholder={t('search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <nav className="nav-section">
        {smart.map((s) => (
          <button
            key={s.id}
            className={`nav-item ${isSel('smart', s.id) ? 'active' : ''}`}
            onClick={() => onSelect({ type: 'smart', id: s.id })}
          >
            <span className="nav-icon">{s.icon}</span>
            <span className="nav-label">{s.label}</span>
            {s.count != null && <span className="nav-count">{s.count}</span>}
          </button>
        ))}
      </nav>

      <div className="nav-section-title">
        <span>{t('categories')}</span>
        <button
          className="icon-btn"
          title={t('newCategory')}
          onClick={() => setAdding(true)}
        >
          +
        </button>
      </div>

      <nav className="nav-section grow">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className={`nav-item cat-item ${isSel('category', cat.id) ? 'active' : ''} ${dragOverId === cat.id ? 'drag-over' : ''}`}
            onClick={() => onSelect({ type: 'category', id: cat.id })}
            {...dropProps(cat.id, (cardId) =>
              dispatch({
                type: 'UPDATE_CARD',
                id: cardId,
                patch: { categoryId: cat.id },
              })
            )}
          >
            <span className="cat-dot" style={{ background: cat.color }} />
            {editingId === cat.id ? (
              <input
                className="inline-input"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => commitRename(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(cat.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="nav-label">
                {cat.icon ? `${cat.icon} ` : ''}
                {cat.name}
              </span>
            )}
            <span className="nav-count">{countFor(cat.id)}</span>
            <span className="cat-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="icon-btn"
                title="↑"
                disabled={i === 0}
                onClick={() =>
                  dispatch({ type: 'REORDER_CATEGORY', id: cat.id, delta: -1 })
                }
              >
                ↑
              </button>
              <button
                className="icon-btn"
                title="↓"
                disabled={i === categories.length - 1}
                onClick={() =>
                  dispatch({ type: 'REORDER_CATEGORY', id: cat.id, delta: 1 })
                }
              >
                ↓
              </button>
              <button
                className="icon-btn"
                title={t('icon')}
                onClick={() =>
                  setIconPickerId(iconPickerId === cat.id ? null : cat.id)
                }
              >
                {cat.icon || '😀'}
              </button>
              <button
                className="icon-btn"
                title={t('rename')}
                onClick={() => {
                  setEditingId(cat.id);
                  setEditName(cat.name);
                }}
              >
                ✎
              </button>
              {!cat.isDefault && (
                <button
                  className="icon-btn danger"
                  title={t('delete')}
                  onClick={async () => {
                    if (await confirmBox(t('deleteCategoryPrompt'))) {
                      dispatch({ type: 'DELETE_CATEGORY', id: cat.id });
                      if (isSel('category', cat.id))
                        onSelect({ type: 'smart', id: 'all' });
                    }
                  }}
                >
                  🗑
                </button>
              )}
            </span>
            {iconPickerId === cat.id && (
              <div
                className="icon-picker-popover"
                onClick={(e) => e.stopPropagation()}
              >
                <IconPicker
                  value={cat.icon || null}
                  onChange={(icon) =>
                    dispatch({
                      type: 'UPDATE_CATEGORY',
                      id: cat.id,
                      patch: { icon: icon || '' },
                    })
                  }
                  onClose={() => setIconPickerId(null)}
                />
              </div>
            )}
          </div>
        ))}
        {adding && (
          <input
            className="inline-input"
            autoFocus
            placeholder={t('categoryName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={addCategory}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCategory();
              if (e.key === 'Escape') {
                setAdding(false);
                setNewName('');
              }
            }}
          />
        )}
      </nav>

      <nav className="nav-section sidebar-foot">
        <button
          className={`nav-item ${isSel('smart', 'trash') ? 'active' : ''} ${dragOverId === 'trash' ? 'drag-over' : ''}`}
          onClick={() => onSelect({ type: 'smart', id: 'trash' })}
          {...dropProps('trash', (cardId) =>
            dispatch({ type: 'TRASH_CARD', id: cardId })
          )}
        >
          <span className="nav-icon">🗑</span>
          <span className="nav-label">{t('trash')}</span>
          <span className="nav-count">{trashCount}</span>
        </button>
        <button className="nav-item" onClick={onOpenSettings}>
          <span className="nav-icon">⚙</span>
          <span className="nav-label">{t('settings')}</span>
        </button>
      </nav>
    </aside>
  );
}
