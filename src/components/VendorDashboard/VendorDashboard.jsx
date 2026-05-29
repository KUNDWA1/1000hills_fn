import { useState, useEffect, useCallback } from "react";
import styles from "./VendorDashboard.module.css";
import { api } from "../../utils/api";

const STATUS_COLORS = {
  Available: "#2a7d3f", "Out of Stock": "#ef4444",
  Processing: "#f59e0b", "Out for Delivery": "#3b82f6",
  Delivered: "#2a7d3f", Busy: "#f59e0b", Offline: "#6b7280",
  PENDING: "#f59e0b", ACCEPTED: "#22c55e", REJECTED: "#ef4444",
};

const EMPTY_FORM = { name: "", category: "", price: "", stock: "" };

const CATEGORIES = [
  "CONSTRUCTION_TOOLS", "BUILDING_SUPPLIES", "SAFETY_EQUIPMENT",
  "PLUMBING_MATERIALS", "ELECTRICAL_SUPPLIES", "SOLAR_AND_ENERGY",
  "GENERATORS_AND_POWER", "SECURITY_AND_IT",
];

const CATEGORY_LABELS = {
  CONSTRUCTION_TOOLS: "Construction Tools", BUILDING_SUPPLIES: "Building Supplies",
  SAFETY_EQUIPMENT: "Safety Equipment", PLUMBING_MATERIALS: "Plumbing Materials",
  ELECTRICAL_SUPPLIES: "Electrical Supplies", SOLAR_AND_ENERGY: "Solar & Energy",
  GENERATORS_AND_POWER: "Generators & Power", SECURITY_AND_IT: "Security & IT",
};

export default function VendorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [availability, setAvailability] = useState("Available");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [vendorOrders, setVendorOrders] = useState([]);
  const [actionToast, setActionToast] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadOrders = useCallback(() => {
    api.get('/vendor/orders').then(setVendorOrders).catch(() => {});
  }, []);

  const loadProducts = useCallback(() => {
    api.get('/vendor/products').then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
    api.get('/vendor/profile').then(setProfile).catch(() => {});
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders, loadProducts]);

  const incomingRequests = vendorOrders.filter(o => o.vendorStatus === "PENDING");
  const assignedOrders   = vendorOrders.filter(o => o.vendorStatus === "ACCEPTED");

  const toast = (msg, type) => {
    setActionToast({ msg, type });
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/vendor/orders/${orderId}/accept`);
      loadOrders();
      toast(`Order ${orderId} accepted`, "success");
    } catch (e) { toast(e.message, "error"); }
  };

  const handleReject = async (orderId) => {
    try {
      await api.patch(`/vendor/orders/${orderId}/reject`);
      loadOrders();
      toast(`Order ${orderId} declined`, "error");
    } catch (e) { toast(e.message, "error"); }
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: "📦", change: "in your catalogue" },
    { label: "Incoming Requests", value: incomingRequests.length, icon: "📥", change: incomingRequests.length > 0 ? "Needs your response" : "None pending" },
    { label: "Assigned Orders", value: assignedOrders.length, icon: "📋", change: "Accepted by you" },
    { label: "Pending Deliveries", value: assignedOrders.filter(o => o.status !== "DELIVERED").length, icon: "🚚", change: "In progress" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: "⊞" },
    { id: "incoming", label: "Incoming Requests", icon: "📥", badge: incomingRequests.length },
    { id: "orders", label: "Assigned Orders", icon: "📋" },
    { id: "products", label: "My Products", icon: "📦" },
    { id: "profile", label: "Profile & Docs", icon: "🏢" },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (CATEGORY_LABELS[p.category] || p.category).toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setFormData(EMPTY_FORM); setFormError(""); setModal({ mode: "add" }); };
  const openEdit = (p) => { setFormData({ name: p.name, category: p.category, price: p.price, stock: p.stock }); setFormError(""); setModal({ mode: "edit", id: p.id }); };
  const closeModal = () => setModal(null);
  const handleFormChange = (e) => { setFormError(""); setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || formData.price === "" || formData.stock === "") {
      setFormError("Please fill in all fields."); return;
    }
    const body = { name: formData.name.trim(), category: formData.category, price: Number(formData.price), stock: Number(formData.stock) };
    try {
      if (modal.mode === "add") await api.post('/vendor/products', body);
      else await api.put(`/vendor/products/${modal.id}`, body);
      loadProducts();
      closeModal();
    } catch (e) { setFormError(e.message); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vendor/products/${deleteId}`);
      loadProducts();
      setDeleteId(null);
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚙</span>
            {sidebarOpen && <span className={styles.logoText}>1000Hills</span>}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>
        <div className={styles.vendorInfo}>
          <div className={styles.avatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : "VD"}</div>
          {sidebarOpen && (
            <div className={styles.vendorMeta}>
              <p className={styles.vendorName}>{user?.name || "Vendor"}</p>
              <span className={styles.badge} style={{ background: STATUS_COLORS[availability] + "22", color: STATUS_COLORS[availability], border: `1px solid ${STATUS_COLORS[availability]}40` }}>
                ● {availability}
              </span>
            </div>
          )}
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <button key={item.id} className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`} onClick={() => setActiveTab(item.id)}>
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
              {sidebarOpen && item.badge > 0 && <span className={styles.navBadge}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={onLogout}><span>⬡</span>{sidebarOpen && <span>Logout</span>}</button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{navItems.find(n => n.id === activeTab)?.label}</h1>
            <span className={styles.breadcrumb}>Vendor Portal / {navItems.find(n => n.id === activeTab)?.label}</span>
          </div>
          <div className={styles.topbarRight}>
            <select className={styles.availabilitySelect} value={availability} onChange={e => setAvailability(e.target.value)} style={{ borderColor: STATUS_COLORS[availability] + "60", color: STATUS_COLORS[availability] }}>
              <option>Available</option><option>Busy</option><option>Offline</option>
            </select>
            <div className={styles.notifBtn}>🔔 <span className={styles.notifDot} /></div>
            <div className={styles.topbarAvatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : "VD"}</div>
          </div>
        </header>

        {actionToast && (
          <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: actionToast.type === "success" ? "#2a7d3f" : "#ef4444", color: "#fff", padding: "14px 22px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            {actionToast.type === "success" ? "✓" : "✗"} {actionToast.msg}
          </div>
        )}

        <div className={styles.content}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className={styles.overviewGrid}>
              <div className={styles.statsRow}>
                {stats.map((s, i) => (
                  <div className={styles.statCard} key={i}>
                    <div className={styles.statIcon}>{s.icon}</div>
                    <div className={styles.statInfo}>
                      <p className={styles.statValue}>{s.value}</p>
                      <p className={styles.statLabel}>{s.label}</p>
                      <p className={styles.statChange}>{s.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              {incomingRequests.length > 0 && (
                <div className={styles.incomingBanner}>
                  <span className={styles.incomingBannerIcon}>📥</span>
                  <span><strong>{incomingRequests.length} new order{incomingRequests.length > 1 ? "s" : ""} assigned to you</strong> — Accept or reject to update admin.</span>
                  <button className={styles.incomingBannerBtn} onClick={() => setActiveTab("incoming")}>Review Now →</button>
                </div>
              )}

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Recent Assigned Orders</h2>
                  <button className={styles.viewAllBtn} onClick={() => setActiveTab("orders")}>View All →</button>
                </div>
                {assignedOrders.length === 0 ? (
                  <p style={{ color: "#8a8680", fontSize: 13 }}>No accepted orders yet.</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>Order ID</th><th>Delivery Date</th><th>Total (RWF)</th><th>Status</th></tr></thead>
                      <tbody>
                        {assignedOrders.slice(0, 3).map(o => (
                          <tr key={o.id}>
                            <td className={styles.orderId}>{o.id}</td>
                            <td className={styles.dateCell}>{o.deliveryDate || "—"}</td>
                            <td className={styles.amount}>{o.total?.toLocaleString()}</td>
                            <td><span className={styles.statusPill} style={{ background: "#3b82f622", color: "#3b82f6" }}>Accepted</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>⚠ Stock Alerts</h2></div>
                <div className={styles.alertList}>
                  {products.filter(p => p.stock === 0 || p.stock < 20).map(p => (
                    <div className={styles.alertItem} key={p.id}>
                      <span className={styles.alertName}>{p.name}</span>
                      <span className={styles.alertStock} style={{ color: p.stock === 0 ? "#ef4444" : "#f59e0b" }}>
                        {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} units left`}
                      </span>
                      <button className={styles.updateStockBtn} onClick={() => { setActiveTab("products"); openEdit(p); }}>Update</button>
                    </div>
                  ))}
                  {products.filter(p => p.stock === 0 || p.stock < 20).length === 0 && (
                    <p style={{ color: "#8a8680", fontSize: 13 }}>All products are well stocked ✓</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <div className={styles.tabContent}>
              {incomingRequests.length === 0 ? (
                <div className={styles.emptyState}><span className={styles.emptyIcon}>📭</span><p>No incoming requests right now.</p></div>
              ) : (
                incomingRequests.map(order => (
                  <IncomingRequestCard key={order.id} order={order} onAccept={handleAccept} onReject={handleReject} styles={styles} />
                ))
              )}
            </div>
          )}

          {/* ASSIGNED ORDERS */}
          {activeTab === "orders" && (
            <div className={styles.tabContent}>
              {assignedOrders.length === 0 ? (
                <div className={styles.emptyState}><span className={styles.emptyIcon}>📋</span><p>No accepted orders yet.</p></div>
              ) : (
                <div className={styles.card}>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr><th>Order ID</th><th>Products</th><th>Delivery Date</th><th>Total (RWF)</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {assignedOrders.map(o => (
                          <tr key={o.id}>
                            <td className={styles.orderId}>{o.id}</td>
                            <td style={{ fontSize: 12, color: "#8a8680" }}>
                              {o.items?.map(p => `${p.productName} ×${p.qty}`).join(", ")}
                            </td>
                            <td className={styles.dateCell}>{o.deliveryDate || "—"}</td>
                            <td className={styles.amount}>{o.total?.toLocaleString()}</td>
                            <td><span className={styles.statusPill} style={{ background: "#3b82f622", color: "#3b82f6" }}>Accepted</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {activeTab === "products" && (
            <div className={styles.tabContent}>
              <div className={styles.tabActions}>
                <input className={styles.searchInput} placeholder="🔍  Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                <button className={styles.primaryBtn} onClick={openAdd}>+ Add Product</button>
              </div>
              <div className={styles.card}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>#</th><th>Product Name</th><th>Category</th><th>Price (RWF)</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: "center", color: "#8a8680", padding: "32px" }}>No products found.</td></tr>
                      ) : (
                        filteredProducts.map((p, i) => (
                          <tr key={p.id}>
                            <td className={styles.rowNum}>{i + 1}</td>
                            <td className={styles.productName}>{p.name}</td>
                            <td><span className={styles.categoryTag}>{CATEGORY_LABELS[p.category] || p.category}</span></td>
                            <td className={styles.amount}>{p.price?.toLocaleString()}</td>
                            <td className={styles.stockCell} style={{ color: p.stock === 0 ? "#ef4444" : p.stock < 20 ? "#f59e0b" : "#2a7d3f" }}>{p.stock}</td>
                            <td><span className={styles.statusPill} style={{ background: p.stock === 0 ? "#ef444422" : "#2a7d3f22", color: p.stock === 0 ? "#ef4444" : "#2a7d3f" }}>{p.stock === 0 ? "Out of Stock" : "Available"}</span></td>
                            <td className={styles.actionsCell}>
                              <button className={styles.editBtn} onClick={() => openEdit(p)}>✏ Edit</button>
                              <button className={styles.deleteBtn} onClick={() => setDeleteId(p.id)}>🗑</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className={styles.tabContent}>
              <div className={styles.profileGrid}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Company Information</h2>
                  {profile ? (
                    <div className={styles.formGrid}>
                      {[
                        ["Company Name", profile.companyName],
                        ["Contact Person", profile.contactPerson],
                        ["Email", profile.email],
                        ["Phone", profile.phone],
                        ["Location", profile.location],
                        ["Registration No.", profile.registrationNo],
                      ].map(([label, val]) => (
                        <div className={styles.formGroup} key={label}>
                          <label className={styles.formLabel}>{label}</label>
                          <input className={styles.formInput} defaultValue={val} readOnly />
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: "#8a8680", fontSize: 13 }}>Loading profile...</p>}
                </div>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Verification Documents</h2>
                  <div className={styles.docList}>
                    {profile?.documents?.map(doc => (
                      <div className={styles.docItem} key={doc.id}>
                        <span className={styles.docIcon}>{doc.documentType === 'BUSINESS_LICENSE' ? '📄' : doc.documentType === 'NATIONAL_ID' ? '🪪' : '📜'}</span>
                        <span className={styles.docName}>{doc.documentType?.replace('_', ' ')}</span>
                        <span className={styles.statusPill} style={{ background: "#2a7d3f22", color: "#2a7d3f" }}>Uploaded</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD/EDIT PRODUCT MODAL */}
      {modal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modal.mode === "add" ? "Add New Product" : "Edit Product"}</h2>
              <button className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {formError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 14, background: "#ef444412", padding: "8px 12px", borderRadius: 8 }}>{formError}</p>}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>Product Name</label>
                    <input className={styles.formInput} name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Steel Rebar 12mm" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select className={styles.formInput} name="category" value={formData.category} onChange={handleFormChange}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Price (RWF)</label>
                    <input className={styles.formInput} name="price" type="number" min="0" value={formData.price} onChange={handleFormChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Stock Quantity</label>
                    <input className={styles.formInput} name="stock" type="number" min="0" value={formData.stock} onChange={handleFormChange} />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>{modal.mode === "add" ? "Add Product" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className={styles.modal} style={{ maxWidth: 400 }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete Product</h2>
              <button className={styles.modalClose} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: "#1a1916", fontSize: 14 }}>
                Are you sure you want to delete <strong>{products.find(p => p.id === deleteId)?.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteBtn} style={{ padding: "10px 20px" }} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IncomingRequestCard({ order, onAccept, onReject, styles }) {
  const total = order.total || order.items?.reduce((s, p) => s + (Number(p.qty) || 0) * (Number(p.unitPrice) || 0), 0) || 0;
  return (
    <div className={styles.incomingCard}>
      <div className={styles.incomingCardHeader}>
        <span className={styles.incomingOrderId}>{order.id}</span>
        <span className={styles.incomingDate}>Assigned {order.assignedAt ? new Date(order.assignedAt).toLocaleDateString() : "—"}</span>
      </div>
      {order.items?.length > 0 && (
        <div className={styles.incomingProducts}>
          <table className={styles.incomingTable}>
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price (RWF)</th><th>Subtotal (RWF)</th></tr></thead>
            <tbody>
              {order.items.map((p, i) => (
                <tr key={i}>
                  <td>{p.productName || "—"}</td>
                  <td>{p.qty}</td>
                  <td>{p.unitPrice ? Number(p.unitPrice).toLocaleString() : "—"}</td>
                  <td className={styles.amount}>{((Number(p.qty) || 0) * (Number(p.unitPrice) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.incomingMeta}>
        {order.deliveryDate && <span className={styles.incomingMetaTag}>📅 Deliver by: <strong>{order.deliveryDate}</strong></span>}
        {order.description && <span className={styles.incomingMetaTag}>📝 {order.description}</span>}
        <span className={styles.incomingMetaTag} style={{ color: "#2a7d3f", fontWeight: 700 }}>💰 Total: {total.toLocaleString()} RWF</span>
      </div>
      <div className={styles.incomingActions}>
        <button className={styles.acceptBtn} onClick={() => onAccept(order.id)}>✓ Accept Order</button>
        <button className={styles.rejectOrderBtn} onClick={() => onReject(order.id)}>✗ Reject</button>
      </div>
    </div>
  );
}
