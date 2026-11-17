import React, { useRef, useState } from 'react';
import { useStore } from '../store.jsx';

export default function SettingsModal({ t, onClose }) {
  const { db, dispatch } = useStore();
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');

  const set = (patch) => dispatch({ type: 'SET_SETTINGS', patch });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-board-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.categories) || !Array.isArray(data.cards)) {
        throw new Error('invalid');
      }
      dispatch({ type: 'IMPORT', db: data });
      setMessage(t('importDone'));
    } catch {
      setMessage(t('importFailed'));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{t('settings')}</h2>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <label className="field">
          <span>{t('language')}</span>
          <select
            className="select"
            value={db.settings.language || 'en'}
            onChange={(e) => set({ language: e.target.value })}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>

        <label className="field">
          <span>{t('theme')}</span>
          <select
            className="select"
            value={db.settings.theme || 'system'}
            onChange={(e) => set({ theme: e.target.value })}
          >
            <option value="light">{t('themeLight')}</option>
            <option value="dark">{t('themeDark')}</option>
            <option value="system">{t('themeSystem')}</option>
          </select>
        </label>

        <div className="field row">
          <button className="btn" onClick={exportJson}>
            {t('exportJson')}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            {t('importJson')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) importJson(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </div>
        {message && <p className="modal-message">{message}</p>}
      </div>
    </div>
  );
}
