import { useState, useEffect } from 'react';
import styles from './WelcomePage.module.css';
import { api } from '../../utils/api';
import { useLang } from '../../utils/LangContext';

const STATUS_COLOR = {
  PENDING: '#f59e0b', ASSIGNED: '#3b82f6', PROCESSING: '#a855f7',
  OUT_FOR_DELIVERY: '#06b6d4', DELIVERED: '#22c55e',
};

export default function WelcomePage({ user, onGoHome, onLogout }) {
  const [view, setView] = useState('home');
  const [myOrders, setMyOrders] = useState([]);
  const { t } = useLang();

  useEffect(() => {
    api.get('/orders/mine').then(setMyOrders).catch(() => {});
  }, []);

  if (view === 'orders') {
    return (
      <main className={styles.wrapper} style={{ alignItems: 'flex-start', paddingTop: 40 }}>
        <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <button onClick={() => setView('home')} style={{ background: '#f0ede8', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#8a8680' }}>{t.back}</button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1916' }}>{t.myOrders}</h2>
          </div>
          {myOrders.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: '48px 24px', textAlign: 'center', border: '1px solid #dedad3' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p style={{ color: '#8a8680', fontSize: 14 }}>{t.noOrdersYet}</p>
              <button onClick={onGoHome} style={{ marginTop: 16, background: '#c8860a', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13.5 }}>{t.startShopping}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myOrders.map(o => (
                <div key={o.id} style={{ background: '#fff', border: '1px solid #dedad3', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', color: '#c8860a', fontWeight: 700, fontSize: 14 }}>{o.id}</span>
                      <span style={{ marginLeft: 12, fontSize: 12, color: '#b8b4ae' }}>{new Date(o.placedAt).toLocaleDateString()}</span>
                    </div>
                    <span style={{ background: (STATUS_COLOR[o.status] || '#f59e0b') + '22', color: STATUS_COLOR[o.status] || '#f59e0b', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {o.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {o.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: '#f7f5f2', borderRadius: 8 }}>
                        <span style={{ fontWeight: 500 }}>{item.productName}</span>
                        <span style={{ color: '#8a8680' }}>x{item.qty} &nbsp;·&nbsp; <strong style={{ color: '#2a7d3f' }}>RWF {(item.unitPrice * item.qty).toLocaleString()}</strong></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f0ede8' }}>
                    <div style={{ fontSize: 13, color: '#8a8680' }}>
                      {o.vendorName && <span>{t.assignedTo}: <strong style={{ color: '#1a1916' }}>{o.vendorName}</strong></span>}
                      {o.deliveryDate && <span style={{ marginLeft: 16 }}>{t.deliveryBy}: <strong style={{ color: '#1a1916' }}>{o.deliveryDate}</strong></span>}
                    </div>
                    <strong style={{ color: '#2a7d3f', fontSize: 15 }}>{t.orderTotal}: RWF {o.total?.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.badge}>1H</div>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.heading}>{t.congratulations}</h1>
        <p className={styles.sub}>Hello <strong>{user?.name || 'there'}</strong>, {t.welcomeBack}</p>
        <p className={styles.desc}>{t.exploreDesc}</p>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onGoHome}>{t.startShopping}</button>
          {myOrders.length > 0 && (
            <button className={styles.primaryBtn} style={{ background: '#c8860a' }} onClick={() => setView('orders')}>
              {t.myOrders} ({myOrders.length})
            </button>
          )}
          <button className={styles.secondaryBtn} onClick={onLogout}>{t.signOut}</button>
        </div>
      </div>
    </main>
  );
}
