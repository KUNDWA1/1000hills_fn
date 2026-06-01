import styles from './SearchPage.module.css';
import ProductCard from '../ProductCard/ProductCard';
import { useLang } from '../../utils/LangContext';

export default function SearchPage({ query, allProducts, onAddToCart, onProductClick }) {
  const { t } = useLang();
  const q = query.trim().toLowerCase();

  const results = q
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{t.catalogSearch}</p>
        <h1 className={styles.title}>{t.resultsFor} "{query}"</h1>
        <p className={styles.sub}>{t.browseCatalog}</p>

        <div className={styles.resultsHeader}>
          <p className={styles.resultsLabel}>{t.results}</p>
          <p className={styles.resultsCount}>
            {t.showingMatches} <strong>"{query}"</strong>
          </p>
          <p className={styles.itemCount}>{t.itemsFound(results.length)}</p>
        </div>

        {results.length > 0 ? (
          <div className={styles.grid}>
            {results.map((product, i) => (
              <div
                key={product.id}
                className={styles.cardWrap}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.25">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p>No products found for "<strong>{query}</strong>"</p>
            <p className={styles.emptySub}>{t.tryDifferent}</p>
          </div>
        )}
      </div>
    </div>
  );
}