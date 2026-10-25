import React, { useState, useEffect } from 'react';
import {
  UserRole,
  ViewTab,
  Product,
  Sale,
  ReturnRecord,
  CustomerDebt,
  CashMovement,
  StaffUser,
  StoreSettings,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_RETURNS,
  INITIAL_CUSTOMER_DEBTS,
  INITIAL_CASH_MOVEMENTS,
  INITIAL_STAFF_USERS,
  INITIAL_STORE_SETTINGS,
} from './mockData';
import { CashierView } from './components/CashierView';
import { DashboardView } from './components/DashboardView';
import { ProductManagementView } from './components/ProductManagementView';
import { ReturnBarangView } from './components/ReturnBarangView';
import { CustomerDebtView } from './components/CustomerDebtView';
import { CashBalanceView } from './components/CashBalanceView';
import { SalesReportView } from './components/SalesReportView';
import { StoreSettingsView } from './components/StoreSettingsView';
import { UserManagementView } from './components/UserManagementView';
import {
  IconCart,
  IconGrid,
  IconBox,
  IconChevronRight,
  IconChevronLeft,
  IconUser,
  IconFileText,
  IconHelp,
  IconReturn,
  IconCreditCard,
  IconWallet,
  IconSettings,
  IconShieldCheck,
  IconMenu,
  IconClose,
} from './components/Icons';

export const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('pemilik');
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    return `${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Core Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [returns, setReturns] = useState<ReturnRecord[]>(INITIAL_RETURNS);
  const [customerDebts, setCustomerDebts] = useState<CustomerDebt[]>(INITIAL_CUSTOMER_DEBTS);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(INITIAL_CASH_MOVEMENTS);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);

  // When switching to 'kasir', restrict tab to allowed views per PRD
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'kasir' && (activeTab === 'dashboard' || activeTab === 'user_management')) {
      setActiveTab('pos');
    }
  };

  // Complete a sale
  const handleCompleteSale = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);

    // Atomic stock reduction
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = newSale.items.find((it) => it.productId === p.id);
        if (soldItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - soldItem.qty),
          };
        }
        return p;
      })
    );

    // Record cash in movement
    const cashIn: CashMovement = {
      id: `cash-${Date.now()}`,
      type: 'masuk',
      category: 'penjualan',
      amount: newSale.total,
      description: `Transaksi Penjualan ${newSale.invoiceNumber}`,
      cashierName: newSale.cashierName,
      timestamp: new Date().toISOString(),
    };
    setCashMovements((prev) => [cashIn, ...prev]);
  };

  // Adjust stock
  const handleAdjustStock = (productId: string, delta: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );
    alert(`Mutasi stok berhasil dicatat: ${reason}`);
  };

  // Void sale
  const handleVoidSale = (saleId: string, reason: string) => {
    const saleToVoid = sales.find((s) => s.id === saleId);
    if (!saleToVoid || saleToVoid.status === 'void') return;

    // Revert stock
    setProducts((prev) =>
      prev.map((p) => {
        const itemToRevert = saleToVoid.items.find((it) => it.productId === p.id);
        if (itemToRevert) {
          return {
            ...p,
            stock: p.stock + itemToRevert.qty,
          };
        }
        return p;
      })
    );

    // Update sale status
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              status: 'void',
              voidReason: reason,
              voidAt: new Date().toISOString(),
            }
          : s
      )
    );

    alert(`Transaksi ${saleToVoid.invoiceNumber} berhasil di-void dan stok telah dikembalikan.`);
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  // Return handler
  const handleAddReturn = (newRet: ReturnRecord) => {
    setReturns((prev) => [newRet, ...prev]);
    setProducts((prev) =>
      prev.map((p) =>
        p.name === newRet.productName ? { ...p, stock: p.stock + newRet.qty } : p
      )
    );
    // Record cash out for refund
    const refundCash: CashMovement = {
      id: `cash-${Date.now()}`,
      type: 'keluar',
      category: 'operasional',
      amount: newRet.refundAmount,
      description: `Refund retur barang ${newRet.returnNumber} (${newRet.productName})`,
      cashierName: newRet.cashierName,
      timestamp: new Date().toISOString(),
    };
    setCashMovements((prev) => [refundCash, ...prev]);
  };

  // Customer Debt handlers
  const handleAddDebt = (newDebt: CustomerDebt) => {
    setCustomerDebts((prev) => [newDebt, ...prev]);
  };

  const handlePayDebt = (debtId: string, amountPaid: number) => {
    setCustomerDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const nextPaid = d.paidAmount + amountPaid;
          const nextRemaining = Math.max(0, d.totalDebt - nextPaid);
          return {
            ...d,
            paidAmount: nextPaid,
            remainingDebt: nextRemaining,
            status: nextRemaining === 0 ? 'lunas' : 'belum_lunas',
          };
        }
        return d;
      })
    );
    // Record cash in for debt repayment
    const debtCashIn: CashMovement = {
      id: `cash-${Date.now()}`,
      type: 'masuk',
      category: 'penjualan',
      amount: amountPaid,
      description: `Pelunasan piutang pelanggan`,
      cashierName: activeCashierName,
      timestamp: new Date().toISOString(),
    };
    setCashMovements((prev) => [debtCashIn, ...prev]);
    alert(`Pembayaran piutang Rp ${amountPaid.toLocaleString('id-ID')} berhasil dicatat.`);
  };

  // Cash movement handler
  const handleAddCashMovement = (newMove: CashMovement) => {
    setCashMovements((prev) => [newMove, ...prev]);
  };

  // Staff User handlers
  const handleAddStaff = (newStaff: StaffUser) => {
    setStaffUsers((prev) => [...prev, newStaff]);
  };

  const handleToggleStaffStatus = (userId: string) => {
    setStaffUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  // Store Settings handler
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
  };

  const activeCashierName =
    userRole === 'pemilik'
      ? 'H. Khalif (Pemilik Toko)'
      : userRole === 'admin'
      ? 'Rian (Admin Toko)'
      : 'Siti (Kasir Shift 1)';

  // 9 Menu Wajib sesuai instruksi dan referensi gambar Kasir Khalif
  const navItems = [
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      icon: <IconGrid size={18} />,
      show: userRole !== 'kasir',
      isActive: activeTab === 'dashboard',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      id: 'pos' as ViewTab,
      label: 'Kasir / POS',
      icon: <IconCart size={18} />,
      show: true,
      isActive: activeTab === 'pos',
      onClick: () => setActiveTab('pos'),
    },
    {
      id: 'products' as ViewTab,
      label: 'Stok Barang',
      icon: <IconBox size={18} />,
      show: true,
      isActive: activeTab === 'products',
      onClick: () => setActiveTab('products'),
    },
    {
      id: 'returns' as ViewTab,
      label: 'Return Barang',
      icon: <IconReturn size={18} />,
      show: true,
      isActive: activeTab === 'returns',
      onClick: () => setActiveTab('returns'),
    },
    {
      id: 'customer_debt' as ViewTab,
      label: 'Hutang Customer',
      icon: <IconCreditCard size={18} />,
      show: true,
      isActive: activeTab === 'customer_debt',
      onClick: () => setActiveTab('customer_debt'),
    },
    {
      id: 'cash_balance' as ViewTab,
      label: 'Kas / Saldo',
      icon: <IconWallet size={18} />,
      show: true,
      isActive: activeTab === 'cash_balance',
      onClick: () => setActiveTab('cash_balance'),
    },
    {
      id: 'reports' as ViewTab,
      label: 'Laporan Penjualan',
      icon: <IconFileText size={18} />,
      show: userRole !== 'kasir',
      isActive: activeTab === 'reports',
      onClick: () => setActiveTab('reports'),
    },
    {
      id: 'store_settings' as ViewTab,
      label: 'Pengaturan Toko',
      icon: <IconSettings size={18} />,
      show: userRole !== 'kasir',
      isActive: activeTab === 'store_settings',
      onClick: () => setActiveTab('store_settings'),
    },
    {
      id: 'user_management' as ViewTab,
      label: 'Manajemen Admin',
      icon: <IconShieldCheck size={18} />,
      show: userRole === 'pemilik',
      isActive: activeTab === 'user_management',
      onClick: () => setActiveTab('user_management'),
    },
  ];

  // Mobile Bottom Bar Navigation Items (Thumb Zone friendly per PRD & antislop)
  const isKasirRole = userRole === 'kasir';
  const mobileNavItems = isKasirRole
    ? [
        {
          id: 'pos',
          label: 'Kasir',
          icon: <IconCart size={20} />,
          isActive: activeTab === 'pos',
          onClick: () => setActiveTab('pos'),
        },
        {
          id: 'products',
          label: 'Stok',
          icon: <IconBox size={20} />,
          isActive: activeTab === 'products',
          onClick: () => setActiveTab('products'),
        },
        {
          id: 'returns',
          label: 'Return',
          icon: <IconReturn size={20} />,
          isActive: activeTab === 'returns',
          onClick: () => setActiveTab('returns'),
        },
        {
          id: 'customer_debt',
          label: 'Hutang',
          icon: <IconCreditCard size={20} />,
          isActive: activeTab === 'customer_debt',
          onClick: () => setActiveTab('customer_debt'),
        },
        {
          id: 'more',
          label: 'Menu',
          icon: <IconMenu size={20} />,
          isActive: isMobileMenuOpen || activeTab === 'cash_balance' || activeTab === 'store_settings',
          onClick: () => setIsMobileMenuOpen(true),
        },
      ]
    : [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <IconGrid size={20} />,
          isActive: activeTab === 'dashboard',
          onClick: () => setActiveTab('dashboard'),
        },
        {
          id: 'pos',
          label: 'Kasir',
          icon: <IconCart size={20} />,
          isActive: activeTab === 'pos',
          onClick: () => setActiveTab('pos'),
        },
        {
          id: 'products',
          label: 'Stok',
          icon: <IconBox size={20} />,
          isActive: activeTab === 'products',
          onClick: () => setActiveTab('products'),
        },
        {
          id: 'reports',
          label: 'Laporan',
          icon: <IconFileText size={20} />,
          isActive: activeTab === 'reports',
          onClick: () => setActiveTab('reports'),
        },
        {
          id: 'more',
          label: 'Menu',
          icon: <IconMenu size={20} />,
          isActive:
            isMobileMenuOpen ||
            ['returns', 'customer_debt', 'cash_balance', 'store_settings', 'user_management'].includes(
              activeTab
            ),
          onClick: () => setIsMobileMenuOpen(true),
        },
      ];

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Navigasi Kasir Khalif (9 Menu Wajib) */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <img src="/Logo.jpeg" alt="Logo Kasir Khalif" className="logo-img-sidebar" />
              {!isSidebarCollapsed && (
                <div className="brand-text">
                  <span className="brand-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                    Kasir Khalif
                  </span>
                  <span className="brand-subtitle">{storeSettings.tagline}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="sidebar-collapse-btn"
              title={isSidebarCollapsed ? 'Buka Navigasi' : 'Sembunyikan Navigasi'}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
            </button>
          </div>

          <nav className="sidebar-nav-list">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`sidebar-nav-item ${item.isActive ? 'active' : ''}`}
                  title={item.label}
                  onClick={item.onClick}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="nav-item-label">{item.label}</span>
                  )}
                </button>
              ))}
          </nav>
        </div>

        {/* Profil Kasir & Switcher Akses Peran di Bawah Sidebar */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar">
              <IconUser size={16} />
            </div>
            {!isSidebarCollapsed && (
              <div className="user-info">
                <span className="user-name">{activeCashierName.split(' (')[0]}</span>
                <span className="user-role-text">{userRole.toUpperCase()}</span>
              </div>
            )}
          </div>

          {!isSidebarCollapsed ? (
            <div className="role-switcher-box">
              <label className="role-switcher-label">Akses Peran Pengguna:</label>
              <select
                value={userRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="role-switcher-select"
              >
                <option value="pemilik">Pemilik (Full Akses)</option>
                <option value="admin">Admin Toko</option>
                <option value="kasir">Kasir Meja</option>
              </select>
            </div>
          ) : (
            <button
              type="button"
              className="role-mini-toggle"
              title={`Peran saat ini: ${userRole}. Klik untuk ganti.`}
              onClick={() => {
                const next =
                  userRole === 'pemilik' ? 'admin' : userRole === 'admin' ? 'kasir' : 'pemilik';
                handleRoleChange(next);
              }}
            >
              {userRole.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation for Tablet & Phone Screens */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="sidebar-brand">
                <img src="/Logo.jpeg" alt="Logo Kasir Khalif" className="logo-img-sidebar" />
                <div className="brand-text">
                  <span className="brand-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                    Kasir Khalif
                  </span>
                  <span className="brand-subtitle">{storeSettings.tagline}</span>
                </div>
              </div>
              <button
                type="button"
                className="sidebar-collapse-btn"
                title="Tutup Menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconClose size={16} />
              </button>
            </div>

            <nav className="sidebar-nav-list" style={{ marginTop: '8px' }}>
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`sidebar-nav-item ${item.isActive ? 'active' : ''}`}
                    onClick={() => {
                      item.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                    <span className="nav-item-chevron">
                      <IconChevronRight size={14} />
                    </span>
                  </button>
                ))}
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
              <div className="role-switcher-box">
                <label className="role-switcher-label">Akses Peran Pengguna:</label>
                <select
                  value={userRole}
                  onChange={(e) => {
                    handleRoleChange(e.target.value as UserRole);
                    setIsMobileMenuOpen(false);
                  }}
                  className="role-switcher-select"
                >
                  <option value="pemilik">Pemilik (Full Akses)</option>
                  <option value="admin">Admin Toko</option>
                  <option value="kasir">Kasir Meja</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Utama & Topbar Status */}
      <div className="content-area">
        <header className="topbar">
          <div className="topbar-title-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="mobile-nav-toggle"
                title="Buka Navigasi Menu"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <IconMenu size={20} />
              </button>
              <h1 className="view-page-title">
                {activeTab === 'dashboard' && 'Dashboard Analitik & Penjualan'}
                {activeTab === 'pos' && 'Layar Kasir & Pemindai Barcode'}
                {activeTab === 'products' && 'Manajemen Stok & Katalog Barang'}
                {activeTab === 'returns' && 'Return & Pengembalian Barang'}
                {activeTab === 'customer_debt' && 'Buku Hutang & Piutang Pelanggan'}
                {activeTab === 'cash_balance' && 'Kas & Saldo Laci Kasir'}
                {activeTab === 'reports' && 'Laporan Penjualan & Rekap Transaksi'}
                {activeTab === 'store_settings' && 'Pengaturan Toko & Hardware'}
                {activeTab === 'user_management' && 'Manajemen Admin & Staf'}
              </h1>
            </div>
            <span className="view-page-desc">
              {activeTab === 'dashboard' && 'Ringkasan performa finansial, omzet harian, dan laba bersih toko'}
              {activeTab === 'pos' && 'Pemindaian barcode hibrida kamera HP dan laser scanner untuk checkout cepat'}
              {activeTab === 'products' && 'Kelola inventaris mainan, penyesuaian stok opname, dan harga modal'}
              {activeTab === 'returns' && 'Pencatatan barang retur, refund dana, dan pengembalian unit ke stok'}
              {activeTab === 'customer_debt' && 'Catatan bon pelanggan, jatuh tempo, dan riwayat pembayaran cicilan'}
              {activeTab === 'cash_balance' && 'Arus kas masuk/keluar, modal awal kasir, dan rekonsiliasi laci kasir'}
              {activeTab === 'reports' && 'Audit lengkap transaksi, filter kasir, ekspor CSV, dan cetak rekap harian'}
              {activeTab === 'store_settings' && 'Profil toko, konfigurasi kertas printer kasir, dan preferensi scanner'}
              {activeTab === 'user_management' && 'Kelola akun kasir, penugasan admin toko, dan pengaturan hak akses pengguna'}
            </span>
          </div>

          <div className="topbar-status-section">
            <div className="system-clock-badge">
              <span className="clock-time tabular">{currentTime}</span>
            </div>
            <button
              type="button"
              className="sidebar-collapse-btn"
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              title="Bantuan Operasional Kasir Khalif"
              onClick={() =>
                alert(
                  'Panduan Operasional Kasir Khalif:\n• 9 Modul lengkap terintegrasi: Dashboard, Kasir/POS, Stok, Return, Hutang, Kas/Saldo, Laporan, Pengaturan, dan Manajemen Admin.\n• Seluruh data tersimpan secara atomik dan terproteksi hak akses berjenjang.'
                )
              }
            >
              <IconHelp size={18} />
            </button>
          </div>
        </header>

        {/* View Utama Sesuai Tab Aktif */}
        <main style={{ minWidth: 0 }}>
          {activeTab === 'dashboard' && userRole !== 'kasir' && (
            <DashboardView userRole={userRole} />
          )}

          {activeTab === 'pos' && (
            <CashierView
              products={products}
              onCompleteSale={handleCompleteSale}
              activeCashier={activeCashierName}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagementView
              products={products}
              userRole={userRole}
              onAddProduct={handleAddProduct}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnBarangView
              returns={returns}
              sales={sales}
              onAddReturn={handleAddReturn}
              activeCashier={activeCashierName}
            />
          )}

          {activeTab === 'customer_debt' && (
            <CustomerDebtView
              debts={customerDebts}
              onAddDebt={handleAddDebt}
              onPayDebt={handlePayDebt}
            />
          )}

          {activeTab === 'cash_balance' && (
            <CashBalanceView
              cashMovements={cashMovements}
              onAddCashMovement={handleAddCashMovement}
              activeCashier={activeCashierName}
            />
          )}

          {activeTab === 'reports' && userRole !== 'kasir' && (
            <SalesReportView
              sales={sales}
              userRole={userRole}
              onVoidSale={handleVoidSale}
            />
          )}

          {activeTab === 'store_settings' && userRole !== 'kasir' && (
            <StoreSettingsView
              settings={storeSettings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'user_management' && userRole === 'pemilik' && (
            <UserManagementView
              staffList={staffUsers}
              onAddStaff={handleAddStaff}
              onToggleStaffStatus={handleToggleStaffStatus}
              currentUserRole={userRole}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi Menu Mobile">
        {mobileNavItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`bottom-nav-item ${item.isActive ? 'active' : ''}`}
            onClick={item.onClick}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
