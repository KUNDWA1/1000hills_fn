import { useState } from 'react';
import styles from './Navbar.module.css';
import { constructionToolsProducts } from '../../data/ConstructionTools_products';
import { generatorsProducts } from '../../data/Generators & Power_products';
import { securityProducts } from '../../data/Security & IT_products';
import { solarProducts } from '../../data/Solar & Energy_products';
import AuthModal from '../Auth/AuthModal';
import useTheme from '../../utils/useTheme';
import ThemeSelector from './ThemeSelector';
import LanguageSelector from './LanguageSelector';
import { useLang } from '../../utils/LangContext';

const categoryKeys = [
  { key: 'construction-tools', products: constructionToolsProducts },
  { key: 'generators-power', products: generatorsProducts },
  { key: 'security-it', products: securityProducts },
  { key: 'solar-energy', products: solarProducts },
];

export default function Navbar({ activePage, activeCategory, onCategoryChange, onGoHome, cartCount, onCartOpen, onSearch, onLoginSuccess, authOpen, onAuthClose }) {
  const [inputVal, setInputVal] = useState('');
  const [localAuthOpen, setLocalAuthOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  const categories = categoryKeys.map(c => ({ ...c, label: t.categories[c.key] }));

  const isAuthOpen = authOpen || localAuthOpen;
  const handleAuthClose = () => { setLocalAuthOpen(false); if (onAuthClose) onAuthClose(); };

  function handleSearch() {
    if (inputVal.trim()) onSearch(inputVal.trim());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <header className={styles.header}>

      {/* ── ROW 1 — BLACK ── */}
      <div className={styles.topBar}>
        <div className={styles.topInner}>

          {/* Logo */}
          <button className={styles.logo} onClick={onGoHome}>
            <span className={styles.logoBox}>1H</span>
            <span className={styles.logoName}>1000 Hills Engineering</span>
          </button>

          {/* Icons: search + account + cart */}
          <div className={styles.topRight}>

            {/* Search bar */}
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t.searchPlaceholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.searchBtn} onClick={handleSearch}>{t.search}</button>
            </div>

            {/* Language selector */}
            <LanguageSelector />

            {/* Theme selector */}
            <ThemeSelector theme={theme} setTheme={setTheme} />

            {/* Account button → opens AuthModal */}
            <button
              className={styles.iconBtn}
              title="Account"
              onClick={() => setLocalAuthOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {/* Cart button */}
            <button className={styles.iconBtn} onClick={onCartOpen} title="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

          </div>
        </div>
      </div>

      {/* ── ROW 2 — WHITE ── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <nav className={styles.catNav}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`${styles.catBtn} ${activeCategory === cat.key && activePage === 'category' ? styles.catActive : ''}`}
                onClick={() => onCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </nav>
          <a href="tel:+250788500080" className={styles.supportLink}>
            <span className={styles.supportLabel}>{t.support}</span>
            <span className={styles.supportNum}>+250 788 500 080</span>
          </a>
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
      <AuthModal isOpen={isAuthOpen} onClose={handleAuthClose} onLoginSuccess={onLoginSuccess} />

    </header>
  );
}