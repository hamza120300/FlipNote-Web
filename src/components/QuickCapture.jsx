import React, { useState } from 'react';

export default function QuickCapture({ t, onSave, onClose }) {
  const [text, setText] = useState('');

  const save = () => {
    if (text.trim()) onSave(text);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal capture-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>⚡ {t('quickCapture')}</h2>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </header>
        <textarea
          className="capture-input"
          autoFocus
          dir="auto"
          placeholder={t('quickCapturePlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              save();
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
        />
        <p className="capture-hint">{t('captureHint')}</p>
      </div>
    </div>
  );
}
