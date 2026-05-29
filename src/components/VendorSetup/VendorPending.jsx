import { useEffect, useState } from 'react';
import styles from './VendorPending.module.css';
import { api } from '../../utils/api';

export default function VendorPending({ user, onLogout, onApproved }) {
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const check = async () => {
      try {
        const data = await api.get('/vendor/profile/status');
        const s = data.profileStatus?.toLowerCase();
        if (s === 'approved' || s === 'rejected') setStatus(s);
      } catch { /* backend not reachable, keep polling */ }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'approved') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>⚙ <span>1000Hills</span></div>
          <div className={`${styles.iconWrap} ${styles.iconApproved}`}><span className={styles.icon}>🎉</span></div>
          <h1 className={styles.title}>You're Approved!</h1>
          <p className={styles.message}>
            Congratulations <strong>{user?.name}</strong>! Your vendor account has been approved by the Admin.
            You can now access your dashboard and start selling.
          </p>
          <div className={styles.infoBox}>
            <div className={styles.infoRow}><span className={styles.infoKey}>Account</span><span className={styles.infoVal}>{user?.email}</span></div>
            <div className={styles.infoRow}><span className={styles.infoKey}>Status</span><span className={`${styles.statusBadge} ${styles.statusApproved}`}>✓ Approved</span></div>
          </div>
          <button className={styles.goBtn} onClick={onApproved}>Go to My Dashboard →</button>
          <button className={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>⚙ <span>1000Hills</span></div>
          <div className={`${styles.iconWrap} ${styles.iconRejected}`}><span className={styles.icon}>❌</span></div>
          <h1 className={styles.title}>Application Rejected</h1>
          <p className={styles.message}>
            Unfortunately your vendor application was not approved at this time.
            Please review your documents and contact support for more information.
          </p>
          <div className={styles.infoBox}>
            <div className={styles.infoRow}><span className={styles.infoKey}>Account</span><span className={styles.infoVal}>{user?.email}</span></div>
            <div className={styles.infoRow}><span className={styles.infoKey}>Status</span><span className={`${styles.statusBadge} ${styles.statusRejected}`}>✗ Rejected</span></div>
            <div className={styles.infoRow}><span className={styles.infoKey}>What to do?</span><span className={styles.infoVal}>Contact support at <strong>support@1000hills.rw</strong> for clarification.</span></div>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⚙ <span>1000Hills</span></div>
        <div className={styles.iconWrap}><span className={styles.icon}>⏳</span></div>
        <h1 className={styles.title}>Profile Submitted!</h1>
        <p className={styles.message}>
          Your vendor profile has been successfully sent to the Admin for review.
          This page will update automatically once a decision is made.
        </p>
        <div className={styles.infoBox}>
          <div className={styles.infoRow}><span className={styles.infoKey}>Account</span><span className={styles.infoVal}>{user?.email}</span></div>
          <div className={styles.infoRow}><span className={styles.infoKey}>Status</span><span className={styles.statusBadge}>⏳ Pending Review</span></div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>What's next?</span>
            <span className={styles.infoVal}>Admin will review your documents and approve or reject your application. You'll be notified here.</span>
          </div>
        </div>
        <div className={styles.pulseRow}>
          <span className={styles.pulseDot} />
          <span className={styles.pulseText}>Checking for updates automatically…</span>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}
