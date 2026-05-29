import { useState, useRef, useEffect } from 'react';
import styles from './ThemeSelector.module.css';

const options = [
  { value: 'system', label: 'System', icon: '💻' },
  { value: 'light',  label: 'Light',  icon: '☀️' },
  { value: 'dark',   label: 'Dark',   icon: '🌙' },
];

export default function ThemeSelector({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find(o => o.value === theme) || options[0];

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(o => !o)} title="Theme">
        <span>{current.icon}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.heading}>Theme</p>
          {options.map(o => (
            <button
              key={o.value}
              className={`${styles.option} ${theme === o.value ? styles.active : ''}`}
              onClick={() => { setTheme(o.value); setOpen(false); }}
            >
              <span className={styles.optionIcon}>{o.icon}</span>
              <span className={styles.optionLabel}>{o.label}</span>
              {theme === o.value && <span className={styles.dot}>●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
