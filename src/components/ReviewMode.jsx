import React, { useEffect, useRef, useState } from 'react';
import { detectDir } from '../utils.js';

export default function ReviewMode({ t, cards, categories, onClose }) {
  // Snapshot the deck when review starts so edits elsewhere don't shuffle it.
  const deck = useRef(cards).current;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  const card = deck[index];
  const catName = (id) => categories.find((c) => c.id === id)?.name || '';

  const go = (delta) => {
    const next = index + delta;
    if (next < 0) return;
    if (next >= deck.length) {
      setFinished(true);
      return;
    }
    setFlipped(false);
    setIndex(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const forward =
          document.documentElement.dir === 'rtl'
            ? e.key === 'ArrowLeft'
            : e.key === 'ArrowRight';
        go(forward ? 1 : -1);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!deck.length) return null;

  if (finished) {
    return (
      <div className="review-overlay">
        <div className="celebrate-burst">
          <span>🎊</span>
          <span>✨</span>
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
        </div>
        <div className="celebrate">🎉</div>
        <h2 className="review-done-title">{t('reviewComplete')}</h2>
        <p className="review-done-sub">
          {deck.length} {t('reviewedCards')}
        </p>
        <button className="btn primary" onClick={onClose}>
          {t('finish')}
        </button>
      </div>
    );
  }

  const frontText =
    card.title.trim() ||
    card.body.trim().split('\n')[0]?.slice(0, 120) ||
    t('untitled');
  const items = card.items || [];
  const doneCount = items.filter((i) => i.isDone).length;

  return (
    <div className="review-overlay">
      <header className="review-header">
        <span className="review-counter">
          {index + 1} / {deck.length}
        </span>
        <div className="progress-track review-progress">
          <div
            className="progress-fill"
            style={{ width: `${((index + 1) / deck.length) * 100}%` }}
          />
        </div>
        <button className="icon-btn" title={t('exitReview')} onClick={onClose}>
          ✕
        </button>
      </header>

      <div
        className="flip-scene"
        dir={detectDir(card.title || card.body)}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flip-face flip-front">
            <span className="flip-label">{t('front')}</span>
            <h2 className="flip-title">
              {card.icon ? `${card.icon} ` : ''}
              {frontText}
            </h2>
            <div className="flip-meta">
              <span>{catName(card.categoryId)}</span>
              {card.tags?.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flip-face flip-back">
            <span className="flip-label">{t('back')}</span>
            {card.type === 'checklist' ? (
              items.length ? (
                <div className="flip-checklist">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${items.length ? (doneCount / items.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="checklist-count">
                    {doneCount}/{items.length}
                  </span>
                  <ul className="flip-items">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className={item.isDone ? 'done' : ''}
                      >
                        {item.isDone ? '✅' : '⬜'} {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flip-body dim">{t('noDetails')}</p>
              )
            ) : card.body.trim() ? (
              <p className="flip-body">{card.body}</p>
            ) : (
              <p className="flip-body dim">{t('noDetails')}</p>
            )}
          </div>
        </div>
      </div>

      <p className="flip-hint">{t('flipHint')}</p>

      <div className="review-nav">
        <button className="btn" disabled={index === 0} onClick={() => go(-1)}>
          {t('previous')}
        </button>
        <button className="btn primary" onClick={() => go(1)}>
          {index === deck.length - 1 ? t('finish') : t('next')}
        </button>
      </div>
    </div>
  );
}
