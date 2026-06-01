import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import styles from './CustomerDashboard.module.css';

const STATUS_COLOR = {
  PENDING: '#f59e0b', ASSIGNED: '#3b82f6', PROCESSING: '#a855f7',
  OUT_FOR_DELIVERY: '#06b6d4', DELIVERED: '#22c55e',
};
const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_LABEL = {
  PENDING: 'Pending', ASSIGNED: 'Assigned', PROCESSING: 'Processing',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
};

export default function CustomerDashboard({ user, onGoHome, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: '', address: '' });
  const [toast, setToast] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    api.get('/orders/mine').then(setOrders).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleReorder = async (order) => {
    try {
      await api.post('/orders', {
        items: order.items?.map(i => ({
          productName: i.productName || i.name,
          brand: i.brand || '',
          qty: i.qty,
          unitPrice: i.unitPrice || i.price,
        })),
        total: order.total,
      });
      await api.get('/orders/mine').then(setOrders);
      showToast('Order placed successfully! Admin will assign a vendor.', 'success');
    } catch (e) {
      showToast('Failed to reorder: ' + e.message, 'error');
    }
  };

  const totalSpent = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  const filteredOrders = orders.filter(o => {
    const matchSearch = !orderSearch || o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.items?.some(i => (i.productName || i.name || '').toLowerCase().includes(orderSearch.toLowerCase()));
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'orders', label: 'My Orders', icon: '📦', badge: activeOrders.length || null },
    { id: 'track', label: 'Track Order', icon: '🚚' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚙</span>
            {sidebarOpen && <span className={styles.logoText}>1000Hills</span>}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'CU'}</div>
          {sidebarOpen && (
            <div className={styles.userMeta}>
              <p className={styles.userName}>{user?.name || 'Customer'}</p>
              <span className={styles.userRole}>Customer</span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.shopBtn} onClick={onGoHome}>
            <span>🛍</span>
            {sidebarOpen && <span>Shop Now</span>}
          </button>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <span>⎋</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className={styles.pageSub}>
              {activeTab === 'overview' && `Welcome back, ${user?.name || 'there'}`}
              {activeTab === 'orders' && `${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
              {activeTab === 'track' && 'Real-time order tracking'}
              {activeTab === 'profile' && 'Manage your account details'}
            </p>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <div className={styles.statsRow}>
              {[
                { label: 'Total Orders', value: orders.length, icon: '📦', color: '#3b82f6' },
                { label: 'Active Orders', value: activeOrders.length, icon: '🚚', color: '#f59e0b' },
                { label: 'Delivered', value: deliveredOrders.length, icon: '✅', color: '#22c55e' },
                { label: 'Total Spent', value: `RWF ${totalSpent.toLocaleString()}`, icon: '💰', color: '#a855f7' },
              ].map((s, i) => (
                <div className={styles.statCard} key={i} style={{ '--accent': s.color }}>
                  <div className={styles.statIcon} style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                  <div>
                    <p className={styles.statValue}>{s.value}</p>
                    <p className={styles.statLabel}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent Orders</h2>
                <button className={styles.viewAllBtn} onClick={() => setActiveTab('orders')}>View All →</button>
              </div>
              {orders.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📦</span>
                  <p>No orders yet. Start shopping!</p>
                  <button className={styles.primaryBtn} onClick={onGoHome}>Browse Products</button>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders.slice(0, 4).map(o => (
                    <div key={o.id} className={styles.orderRow} onClick={() => { setSelectedOrder(o); setActiveTab('track'); }}>
                      <div className={styles.orderIdCell}>
                        <span className={styles.orderId}>{o.id}</span>
                        <span className={styles.orderDate}>{o.placedAt ? new Date(o.placedAt).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className={styles.orderItems}>
                        {o.items?.slice(0, 2).map((i, idx) => (
                          <span key={idx} className={styles.itemTag}>{i.productName || i.name}</span>
                        ))}
                        {o.items?.length > 2 && <span className={styles.itemTag}>+{o.items.length - 2} more</span>}
                      </div>
                      <span className={styles.orderTotal}>RWF {o.total?.toLocaleString()}</span>
                      <span className={styles.statusPill} style={{
                        background: (STATUS_COLOR[o.status] || '#f59e0b') + '22',
                        color: STATUS_COLOR[o.status] || '#f59e0b',
                      }}>{STATUS_LABEL[o.status] || o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
              <div className={styles.quickActions}>
                <button className={styles.qaBtn} onClick={onGoHome}>
                  <span className={styles.qaIcon}>🛍</span>
                  <span>Browse Catalogue</span>
                </button>
                <button className={styles.qaBtn} onClick={() => setActiveTab('track')}>
                  <span className={styles.qaIcon}>🚚</span>
                  <span>Track Orders</span>
                </button>
                <button className={styles.qaBtn} onClick={() => setActiveTab('profile')}>
                  <span className={styles.qaIcon}>👤</span>
                  <span>Edit Profile</span>
                </button>
                {deliveredOrders.length > 0 && (
                  <button className={styles.qaBtn} onClick={() => {
                    setSelectedOrder(deliveredOrders[0]);
                    setActiveTab('orders');
                  }}>
                    <span className={styles.qaIcon}>🔁</span>
                    <span>Reorder Last</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MY ORDERS ── */}
        {activeTab === 'orders' && (
          <div className={styles.tabContent}>
            <div className={styles.tabActions}>
              <input
                className={styles.searchInput}
                placeholder="🔍  Search orders or products..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
              />
              <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                {STATUS_STEPS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className={styles.card}>
              {filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📦</span>
                  <p>{orders.length === 0 ? 'No orders yet.' : 'No orders match your search.'}</p>
                  {orders.length === 0 && <button className={styles.primaryBtn} onClick={onGoHome}>Start Shopping</button>}
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Items</th>
                        <th>Total (RWF)</th>
                        <th>Vendor</th>
                        <th>Delivery By</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o.id}>
                          <td className={styles.orderIdCell2}>{o.id}</td>
                          <td style={{ fontSize: 12, color: '#8a8680', maxWidth: 200 }}>
                            {o.items?.map(i => `${i.productName || i.name} x${i.qty}`).join(', ')}
                          </td>
                          <td className={styles.amount}>{o.total?.toLocaleString()}</td>
                          <td>{o.vendorName || <span style={{ color: '#b8b4ae', fontSize: 12 }}>Not assigned</span>}</td>
                          <td style={{ fontSize: 12, color: '#8a8680' }}>{o.deliveryDate || '—'}</td>
                          <td>
                            <span className={styles.statusPill} style={{
                              background: (STATUS_COLOR[o.status] || '#f59e0b') + '22',
                              color: STATUS_COLOR[o.status] || '#f59e0b',
                            }}>{STATUS_LABEL[o.status] || o.status}</span>
                          </td>
                          <td style={{ fontSize: 12, color: '#b8b4ae' }}>
                            {o.placedAt ? new Date(o.placedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className={styles.actionsCell}>
                            <button className={styles.viewBtn} onClick={() => { setSelectedOrder(o); setActiveTab('track'); }}>
                              👁 Track
                            </button>
                            {o.status === 'DELIVERED' && (
                              <button className={styles.reorderBtn} onClick={() => handleReorder(o)}>
                                🔁 Reorder
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRACK ORDER ── */}
        {activeTab === 'track' && (
          <div className={styles.tabContent}>
            {!selectedOrder ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle} style={{ marginBottom: 16 }}>Select an order to track</h2>
                {orders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🚚</span>
                    <p>No orders to track yet.</p>
                    <button className={styles.primaryBtn} onClick={onGoHome}>Start Shopping</button>
                  </div>
                ) : (
                  <div className={styles.orderList}>
                    {orders.map(o => (
                      <div key={o.id} className={styles.orderRow} onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer' }}>
                        <div className={styles.orderIdCell}>
                          <span className={styles.orderId}>{o.id}</span>
                          <span className={styles.orderDate}>{o.placedAt ? new Date(o.placedAt).toLocaleDateString() : '—'}</span>
                        </div>
                        <div className={styles.orderItems}>
                          {o.items?.slice(0, 2).map((i, idx) => (
                            <span key={idx} className={styles.itemTag}>{i.productName || i.name}</span>
                          ))}
                        </div>
                        <span className={styles.orderTotal}>RWF {o.total?.toLocaleString()}</span>
                        <span className={styles.statusPill} style={{
                          background: (STATUS_COLOR[o.status] || '#f59e0b') + '22',
                          color: STATUS_COLOR[o.status] || '#f59e0b',
                        }}>{STATUS_LABEL[o.status] || o.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.trackCard}>
                <div className={styles.trackHeader}>
                  <button className={styles.backBtn} onClick={() => setSelectedOrder(null)}>← Back</button>
                  <div>
                    <h2 className={styles.trackOrderId}>{selectedOrder.id}</h2>
                    <p className={styles.trackDate}>Placed: {selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className={styles.statusPill} style={{
                    background: (STATUS_COLOR[selectedOrder.status] || '#f59e0b') + '22',
                    color: STATUS_COLOR[selectedOrder.status] || '#f59e0b',
                    fontSize: 13,
                  }}>{STATUS_LABEL[selectedOrder.status] || selectedOrder.status}</span>
                </div>

                {/* Stepper */}
                <div className={styles.stepper}>
                  {STATUS_STEPS.map((step, i) => {
                    const stepIdx = STATUS_STEPS.indexOf(selectedOrder.status);
                    const done = i <= stepIdx;
                    const active = i === stepIdx;
                    return (
                      <div key={step} className={styles.stepItem}>
                        <div className={styles.stepDotWrap}>
                          {i > 0 && <div className={styles.stepLine} style={{ background: i <= stepIdx ? '#c8860a' : '#dedad3' }} />}
                          <div className={styles.stepDot} style={{
                            background: done ? '#c8860a' : '#f0ede8',
                            color: done ? '#fff' : '#b8b4ae',
                            border: active ? '2.5px solid #a06e08' : '2px solid transparent',
                            fontWeight: 700,
                          }}>
                            {i < stepIdx ? '✓' : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && <div className={styles.stepLineRight} style={{ background: i < stepIdx ? '#c8860a' : '#dedad3' }} />}
                        </div>
                        <span className={styles.stepLabel} style={{ color: done ? '#c8860a' : '#b8b4ae', fontWeight: active ? 700 : 400 }}>
                          {STATUS_LABEL[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Info grid */}
                <div className={styles.trackInfoGrid}>
                  {selectedOrder.vendorName && (
                    <div className={styles.infoBlock}>
                      <p className={styles.infoLabel}>Assigned Vendor</p>
                      <p className={styles.infoValue}>{selectedOrder.vendorName}</p>
                    </div>
                  )}
                  {selectedOrder.deliveryDate && (
                    <div className={styles.infoBlock}>
                      <p className={styles.infoLabel}>Expected Delivery</p>
                      <p className={styles.infoValue}>{selectedOrder.deliveryDate}</p>
                    </div>
                  )}
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Order Total</p>
                    <p className={styles.infoValue} style={{ color: '#22c55e' }}>RWF {selectedOrder.total?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Items */}
                <div className={styles.trackItems}>
                  <p className={styles.trackItemsTitle}>Items</p>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className={styles.trackItem}>
                      <span className={styles.trackItemName}>{item.productName || item.name}</span>
                      <span className={styles.trackItemQty}>x{item.qty}</span>
                      <span className={styles.trackItemPrice}>RWF {((item.unitPrice || item.price || 0) * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {selectedOrder.status === 'DELIVERED' && (
                  <button className={styles.reorderLargeBtn} onClick={() => handleReorder(selectedOrder)}>
                    🔁 Reorder This
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            <div className={styles.card} style={{ maxWidth: 560 }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Account Details</h2>
                {!profileEdit && (
                  <button className={styles.editBtn2} onClick={() => setProfileEdit(true)}>✎ Edit</button>
                )}
              </div>

              <div className={styles.profileAvatar}>
                <div className={styles.avatarLg}>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'CU'}</div>
                <div>
                  <p className={styles.profileName}>{user?.name || 'Customer'}</p>
                  <p className={styles.profileEmail}>{user?.email}</p>
                  <span className={styles.profileBadge}>Customer Account</span>
                </div>
              </div>

              {profileEdit ? (
                <div className={styles.profileForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name</label>
                    <input className={styles.formInput} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input className={styles.formInput} placeholder="+250 7XX XXX XXX" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Address</label>
                    <input className={styles.formInput} placeholder="e.g. Kigali, Gasabo, KG 5 Ave" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className={styles.formActions}>
                    <button className={styles.cancelBtn} onClick={() => setProfileEdit(false)}>Cancel</button>
                    <button className={styles.primaryBtn} onClick={() => {
                      setProfileEdit(false);
                      showToast('Profile updated!');
                    }}>Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className={styles.profileDetails}>
                  {[
                    ['Email', user?.email],
                    ['Phone', profileForm.phone || 'Not set'],
                    ['Address', profileForm.address || 'Not set'],
                    ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'],
                  ].map(([label, val]) => (
                    <div key={label} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{label}</span>
                      <span className={styles.detailValue}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className={styles.card} style={{ maxWidth: 560, marginTop: 16 }}>
              <h2 className={styles.cardTitle}>Order Summary</h2>
              <div className={styles.profileStats}>
                <div className={styles.profileStat}>
                  <p className={styles.profileStatValue}>{orders.length}</p>
                  <p className={styles.profileStatLabel}>Total Orders</p>
                </div>
                <div className={styles.profileStat}>
                  <p className={styles.profileStatValue}>{deliveredOrders.length}</p>
                  <p className={styles.profileStatLabel}>Delivered</p>
                </div>
                <div className={styles.profileStat}>
                  <p className={styles.profileStatValue}>RWF {(totalSpent / 1000).toFixed(0)}K</p>
                  <p className={styles.profileStatLabel}>Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={styles.toast} style={{ background: toast.type === 'error' ? '#ef4444' : '#22c55e' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
