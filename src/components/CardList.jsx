import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { formatDate, detectDir, todayStr, confirmBox } from '../utils.js';

export default function CardList({
  t,
  lang,
  cards,
  categories,
  selection,
  selectedCardId,
  onSelectCard,
  onNewCard,
  onNewCategory,
  onStartReview,
  viewMode,
  setViewMode,
  query,
}) {
  const { dispatch } = useStore();
  const isTrash = selection.type === 'smart' && selection.id === 'trash';
  const isArchive = selection.type === 'smart' && selection.id === 'archive';
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef(null);

  useEffect(() => {
    if (!newMenuOpen) return;
    const close = (e) => {
      if (!newMenuRef.current?.contains(e.target)) setNewMenuOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [newMenuOpen]);

  const title =
    selection.type === 'category'
      ? categories.find((c) => c.id === selection.id)?.name || ''
      : {
          all: t('allNotes'),
          today: t('today'),
          favorites: t('favorites'),
          recent: t('recent'),
          untagged: t('untagged'),
          trash: t('trash'),
          archive: t('archive'),
        }[selection.id];

  const catName = (id) => categories.find((c) => c.id === id)?.name || '';
  const catColor = (id) => categories.find((c) => c.id === id)?.color;

  return (
    <section className="card-list-pane">
      <header className="pane-header">
        <h2>{title}</h2>
        <div className="pane-actions">
          <button
            className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title={t('gridView')}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button
            className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
            title={t('listView')}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
          {isTrash ? (
            <button
              className="btn danger"
              onClick={async () => {
                if (await confirmBox(t('emptyTrashConfirm')))
                  dispatch({ type: 'EMPTY_TRASH' });
              }}
            >
              {t('emptyTrash')}
            </button>
          ) : isArchive ? null : (
            <>
              <button
                className="btn"
                disabled={cards.length === 0}
                onClick={onStartReview}
              >
                🃏 {t('review')}
              </button>
              <span className="new-card-menu-wrap" ref={newMenuRef}>
                <button
                  className="btn primary"
                  onClick={() => setNewMenuOpen((o) => !o)}
                >
                  + {t('newCard')}
                </button>
                {newMenuOpen && (
                  <div className="new-card-menu">
                    <button
                      className="menu-item"
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNewCard('text');
                      }}
                    >
                      📝 {t('textNote')}
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNewCard('checklist');
                      }}
                    >
                      ☑ {t('checklist')}
                    </button>
                    <div className="menu-divider" />
                    <button
                      className="menu-item"
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNewCategory();
                      }}
                    >
                      📁 {t('newCategory')}…
                    </button>
                  </div>
                )}
              </span>
            </>
          )}
        </div>
      </header>

      {cards.length === 0 ? (
        <div className="empty-state">
          {query.trim() ? t('noResults') : t('noCards')}
        </div>
      ) : (
        <div className={`cards ${viewMode}`}>
          {cards.map((card) => {
            const displayTitle =
              card.title.trim() ||
              card.body.trim().split('\n')[0]?.slice(0, 80) ||
              t('untitled');
            const isChecklist = card.type === 'checklist';
            const items = card.items || [];
            const doneCount = items.filter((i) => i.isDone).length;
            const toggleItem = (itemId) =>
              dispatch({
                type: 'UPDATE_CARD',
                id: card.id,
                patch: {
                  items: items.map((i) =>
                    i.id === itemId ? { ...i, isDone: !i.isDone } : i
                  ),
                },
              });
            return (
              <article
                key={card.id}
                dir={detectDir(card.title || card.body)}
                draggable={!isTrash}
                onDragStart={(e) =>
                  e.dataTransfer.setData('text/card-id', card.id)
                }
                className={`card ${selectedCardId === card.id ? 'selected' : ''}`}
                style={
                  card.color ? { borderInlineStartColor: card.color } : undefined
                }
                onClick={() => !card.deletedAt && onSelectCard(card.id)}
              >
                <div className="card-top">
                  {card.icon && <span className="badge">{card.icon}</span>}
                  {card.isPinned && <span className="badge">📌</span>}
                  {card.isFavorite && <span className="badge">★</span>}
                  {isChecklist && <span className="badge">☑</span>}
                  <h3 className="card-title">{displayTitle}</h3>
                </div>
                {isChecklist ? (
                  items.length > 0 && (
                    <div className="card-checklist">
                      <div className="checklist-progress">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(doneCount / items.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="checklist-count">
                          {doneCount}/{items.length}
                        </span>
                      </div>
                      <ul className="card-items">
                        {items.slice(0, 4).map((item) => (
                          <li key={item.id} className={item.isDone ? 'done' : ''}>
                            <input
                              type="checkbox"
                              checked={item.isDone}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleItem(item.id)}
                            />
                            <span>{item.text}</span>
                            {item.dueDate && (
                              <span
                                className={`due-chip ${!item.isDone && item.dueDate <= todayStr() ? 'overdue' : ''}`}
                              >
                                📅 {item.dueDate.slice(5)}
                              </span>
                            )}
                          </li>
                        ))}
                        {items.length > 4 && (
                          <li className="more">+{items.length - 4}…</li>
                        )}
                      </ul>
                    </div>
                  )
                ) : (
                  card.body.trim() && (
                    <p className="card-preview">
                      {card.body.trim().split('\n').slice(0, 3).join('\n')}
                    </p>
                  )
                )}
                {card.tags?.length > 0 && (
                  <div className="card-tags">
                    {card.tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <footer className="card-foot">
                  <span
                    className="card-cat"
                    style={{ color: catColor(card.categoryId) }}
                  >
                    {catName(card.categoryId)}
                  </span>
                  <span className="card-date">
                    {formatDate(card.updatedAt, lang)}
                  </span>
                </footer>
                {isTrash && (
                  <div className="trash-actions">
                    <button
                      className="btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'RESTORE_CARD', id: card.id });
                      }}
                    >
                      {t('restore')}
                    </button>
                    <button
                      className="btn danger"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (await confirmBox(t('deleteForeverConfirm')))
                          dispatch({ type: 'PURGE_CARD', id: card.id });
                      }}
                    >
                      {t('deleteForever')}
                    </button>
                  </div>
                )}
                {isArchive && (
                  <div className="trash-actions">
                    <button
                      className="btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({
                          type: 'UPDATE_CARD',
                          id: card.id,
                          patch: { isArchived: false },
                        });
                      }}
                    >
                      {t('unarchive')}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
