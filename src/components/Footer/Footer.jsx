import styles from './Footer.module.css';
import { useLang } from '../../utils/LangContext';

const categoryKeys = [
  { key: 'construction-tools' },
  { key: 'generators-power' },
  { key: 'security-it' },
  { key: 'solar-energy' },
];

export default function Footer({ onCategoryChange }) {
  const { t } = useLang();
  const categories = categoryKeys.map(c => ({ ...c, label: t.categories[c.key] }));
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>1H</span>
            <span className={styles.logoName}>
              1000 HILLS ENGINEERING
            </span>
          </div>

          <p className={styles.tagline}>
            {t.footerTagline}
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>{t.departments}</h4>

            <ul>
              {categories.map((cat) => (
                <li key={cat.key}>
                  <button
                    className={styles.linkBtn}
                    onClick={() => onCategoryChange(cat.key)}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>{t.contact}</h4>

            <ul>
              <li>
                <a
                  href="tel:+250788500080"
                  className={styles.linkBtn}
                >
                  +250 788 500 080
                </a>
              </li>

              <li>
                <a
                  href="mailto:info@1000hillseng.rw"
                  className={styles.linkBtn}
                >
                  info@1000hillseng.rw
                </a>
              </li>

              <li>
                <span className={styles.linkBtn}>
                  Kigali, Rwanda
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <nav className={styles.bottomNav}>
          <button className={styles.bottomLink}>{t.footerInventory}</button>
          <button className={styles.bottomLink}>{t.footerDepartments}</button>
          <button className={styles.bottomLink}>{t.footerSupport}</button>
        </nav>

        <span className={styles.copy}>
          {t.footerCopy}
        </span>
      </div>
    </footer>
  );
}


