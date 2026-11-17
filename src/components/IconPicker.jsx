import React from 'react';
import { EMOJIS } from '../utils.js';

export default function IconPicker({ value, onChange, onClose }) {
  const pick = (icon) => {
    onChange(icon);
    onClose?.();
  };
  return (
    <div className="icon-picker">
      <button
        className={`icon-choice ${!value ? 'active' : ''}`}
        title="—"
        onClick={() => pick(null)}
      >
        ∅
      </button>
      {EMOJIS.map((e) => (
        <button
          key={e}
          className={`icon-choice ${value === e ? 'active' : ''}`}
          onClick={() => pick(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
