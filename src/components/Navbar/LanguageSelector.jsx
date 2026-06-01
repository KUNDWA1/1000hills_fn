import { useState, useRef, useEffect } from 'react';
import { useLang } from '../../utils/LangContext';
import styles from './LanguageSelector.module.css';

const languages = [
  { code: 'en', label: 'English',    flag: 'GB' },
  { code: 'fr', label: 'Français',   flag: 'FR' },
  { code: 'rw', label: 'Kinyarwanda', flag: 'RW' },
];

export default function LanguageSelector() {
  const { lang, changeLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(o => !o)}>
        <span className={styles.globe}>🌐</span>
        <span className={styles.currentLabel}>{current.label}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {languages.map(l => (
            <button
              key={l.code}
              className={`${styles.option} ${lang === l.code ? styles.active : ''}`}
              onClick={() => { changeLang(l.code); setOpen(false); }}
            >
              <span className={styles.flag}>{l.flag}</span>
              <span className={styles.label}>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
