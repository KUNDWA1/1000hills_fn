import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AuthModal.module.css';
import { useLang } from '../../utils/LangContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [view, setView] = useState('signin');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { t } = useLang();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t.invalidCredentials);
        return;
      }
      onClose();
      if (onLoginSuccess) onLoginSuccess({
        ...data,
        role: data.role?.toLowerCase(),
        profileStatus: data.profileStatus?.toLowerCase(),
      });
    } catch {
      setError(t.serverError);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t.invalidCredentials);
        return;
      }
      setView('success');
    } catch {
      setError(t.serverError);
    } finally {
      setLoading(false);
    }
  };

  const switchTo = (v) => {
    setFormData({ name: '', email: '', password: '', role: 'customer' });
    setError('');
    setAgreedToTerms(false);
    setView(v);
  };

  const roles = [
    { value: 'customer', label: t.customer, icon: '🛒', desc: t.customerDesc },
    { value: 'vendor',   label: t.vendor,   icon: '🏭', desc: t.vendorDesc },
    { value: 'admin',    label: t.admin,    icon: '⚙️', desc: t.adminDesc },
  ];

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.badge}>1H</div>

        {/* ── SUCCESS VIEW ── */}
        {view === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>{t.accountCreated}</h2>
            <p className={styles.subtitle}>{t.accountCreatedMsg}</p>
            <p className={styles.successMsg}>{t.welcomeMsg}</p>
            <button className={styles.primaryBtn} onClick={() => switchTo('signin')}>
              {t.goToSignIn}
            </button>
          </>
        )}

        {/* ── SIGN IN VIEW ── */}
        {view === 'signin' && (
          <>
            <h2 className={styles.title}>{t.accessPortal}</h2>
            <p className={styles.subtitle}>{t.signInCredentials}</p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSignIn}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.emailAddress}</label>
                <input className={styles.input} type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="your@email.com" required />
              </div>
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>{t.password}</label>
                  <button type="button" className={styles.forgotLink}>{t.forgotPassword}</button>
                </div>
                <input className={styles.input} type="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••••" required />
              </div>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? t.signingIn : t.signIn}
              </button>
            </form>

            <div className={styles.divider}><span>{t.noAccount}</span></div>
            <button className={styles.secondaryBtn} onClick={() => switchTo('signup')}>
              {t.createAccount}
            </button>
          </>
        )}

        {/* ── SIGN UP VIEW ── */}
        {view === 'signup' && (
          <>
            <h2 className={styles.title}>{t.createAccount}</h2>
            <p className={styles.subtitle}>{t.registerAccount}</p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSignUp}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.fullName}</label>
                <input className={styles.input} type="text" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="Your Full Name" required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.emailAddress}</label>
                <input className={styles.input} type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="your@email.com" required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.password}</label>
                <input className={styles.input} type="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••••" minLength={6} required />
              </div>

              {/* ── ROLE SELECTOR ── */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.iAma}</label>
                <div className={styles.roleGrid}>
                  {roles.map((r) => (
                    <label
                      key={r.value}
                      className={`${styles.roleCard} ${formData.role === r.value ? styles.roleCardActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={formData.role === r.value}
                        onChange={handleChange}
                        className={styles.roleRadio}
                      />
                      <span className={styles.roleIcon}>{r.icon}</span>
                      <span className={styles.roleLabel}>{r.label}</span>
                      <span className={styles.roleDesc}>{r.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={loading || !agreedToTerms}
                style={{ opacity: (!agreedToTerms) ? 0.5 : 1 }}>
                {loading ? t.creatingAccount : t.createAccount}
              </button>

              {/* Terms checkbox */}
              <div className={styles.termsRow}>
                <input type="checkbox" id="terms" checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)} className={styles.termsCheck} />
                <label htmlFor="terms" className={styles.termsLabel}>
                  {t.agreeTerms}{' '}
                  <button type="button" className={styles.termsLink} onClick={() => setShowTerms(true)}>
                    {t.termsAndConditions}
                  </button>
                </label>
              </div>
            </form>

            <div className={styles.divider}><span>{t.alreadyAccount}</span></div>
            <button className={styles.secondaryBtn} onClick={() => switchTo('signin')}>
              {t.signInInstead}
            </button>
          </>
        )}
      </div>
      {/* ── TERMS MODAL ── */}
      {showTerms && (
        <div className={styles.termsOverlay} onClick={() => setShowTerms(false)}>
          <div className={styles.termsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.termsHeader}>
              <h2 className={styles.termsTitle}>{t.termsTitle}</h2>
              <button className={styles.closeBtn} onClick={() => setShowTerms(false)}>✕</button>
            </div>
            <div className={styles.termsBody}>
              <p className={styles.termsDate}>Effective Date: January 1, 2026 | Version 1.0</p>

              <h3>1. Acceptance of Terms</h3>
              <p>By registering or using the 1000 Hills Engineering platform, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use immediately.</p>

              <h3>2. Platform Overview</h3>
              <p>1000 Hills Engineering is a premier online engineering supply store based in Kigali, Rwanda. We specialize in providing high-quality products across:</p>
              <ul>
                <li>Construction Tools — professional machinery, hand tools, and site equipment</li>
                <li>Generators & Power — reliable power backup solutions</li>
                <li>Security & IT — surveillance systems, networking, and smart monitoring</li>
                <li>Solar & Energy — solar panels, inverters, batteries, and clean energy solutions</li>
              </ul>

              <h3>3. User Accounts</h3>
              <ul>
                <li>You must provide accurate and truthful information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your credentials</li>
                <li>One person may not hold multiple accounts</li>
                <li>Fraudulent accounts will be suspended immediately</li>
              </ul>

              <h3>4. Product & Stock Policy</h3>
              <ul>
                <li>All products are subject to availability</li>
                <li>1000 Hills Engineering reserves the right to update pricing at any time</li>
                <li>Bulk or special orders may require additional processing time</li>
              </ul>

              <h3>5. Order & Payment Policy</h3>
              <ul>
                <li>All orders placed are binding</li>
                <li>You must be registered and logged in to place an order</li>
                <li>Prices are listed in Rwandan Francs (RWF)</li>
                <li>Orders may be cancelled in cases of pricing errors or stock unavailability</li>
              </ul>

              <h3>6. Delivery Policy</h3>
              <ul>
                <li>Delivery timelines will be communicated upon order confirmation</li>
                <li>Customers will be notified of order status updates in real time</li>
                <li>Delays caused by force majeure are not our liability</li>
              </ul>

              <h3>7. Cancellation & Returns</h3>
              <ul>
                <li>Orders may only be cancelled before they are confirmed and processed</li>
                <li>Returns accepted within 7 days of delivery in original condition</li>
                <li>Disputes must be raised within 7 days of delivery</li>
              </ul>

              <h3>8. Anti-Fraud Policy</h3>
              <ul>
                <li>Any attempt to manipulate orders or pricing is strictly prohibited</li>
                <li>Fraudulent activity results in permanent account termination</li>
              </ul>

              <h3>9. Privacy & Data Protection</h3>
              <ul>
                <li>Your data is collected solely for order processing</li>
                <li>We do not sell your data to third parties</li>
                <li>Data is stored securely per Rwanda's data protection regulations</li>
              </ul>

              <h3>10. Account Suspension</h3>
              <ul>
                <li>Accounts may be suspended for violation of these Terms</li>
                <li>Suspended users may appeal by contacting support</li>
              </ul>

              <h3>11. Limitation of Liability</h3>
              <p>1000 Hills Engineering is not liable for indirect damages, delivery delays beyond our control, or product misuse.</p>

              <h3>12. Governing Law</h3>
              <p>These Terms are governed by the laws of the Republic of Rwanda.</p>

              <p className={styles.termsContact}>
                <strong>Contact:</strong> 1000 Hills Engineering Ltd., Kigali, Rwanda<br />
                support@1000hillseng.rw | +250 788 500 080
              </p>
            </div>
            <div className={styles.termsFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowTerms(false)}>{t.decline}</button>
              <button className={styles.primaryBtn} style={{ flex: 1 }} onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}>
                {t.acceptContinue}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
