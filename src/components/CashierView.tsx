import React, { useState, useRef } from 'react';
import { Product, CartItem, Sale, ScanMode } from '../types';
import { triggerScanSuccessFeedback, formatRupiah } from '../utils/audio';
import {
  IconCamera,
  IconFlash,
  IconZoom,
  IconBarcode,
  IconCheck,
  IconSearch,
  IconCart,
  IconPrinter,
} from './Icons';

interface CashierViewProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
  activeCashier: string;
}

export const CashierView: React.FC<CashierViewProps> = ({
  products,
  onCompleteSale,
  activeCashier,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Mainan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [laserInput, setLaserInput] = useState<string>('');
  const [lastScannedMsg, setLastScannedMsg] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<Sale | null>(null);

  const laserInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Semua Mainan', 'Mobil Remote', 'Balok & Lego', 'Boneka', 'Action Figure', 'Edukasi'];

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua Mainan' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && p.isActive;
  });

  // Calculate cart total
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const changeAmount = typeof cashReceived === 'number' ? Math.max(0, cashReceived - cartTotal) : 0;
  const isPayDisabled = cart.length === 0 || typeof cashReceived !== 'number' || cashReceived < cartTotal;

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Stok maksimal ${product.name} tercapai (${product.stock} unit).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });

    triggerScanSuccessFeedback();
    setLastScannedMsg(`+ ${product.name}`);
    setTimeout(() => setLastScannedMsg(null), 2500);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.qty + delta;
            if (nextQty > item.product.stock) {
              alert(`Maksimal stok tersedia hanya ${item.product.stock} unit.`);
              return item;
            }
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // Simulate scanning a random or targeted barcode
  const handleSimulateScan = (forcedBarcode?: string) => {
    const available = products.filter((p) => p.stock > 0);
    if (available.length === 0) return;

    const targetProduct = forcedBarcode
      ? products.find((p) => p.barcode === forcedBarcode || p.sku === forcedBarcode)
      : available[Math.floor(Math.random() * available.length)];

    if (targetProduct) {
      addToCart(targetProduct);
    } else {
      alert(`Barcode "${forcedBarcode}" tidak terdaftar di katalog.`);
    }
  };

  // Laser scanner hardware listener (detects fast keystroke sequence ending in Enter)
  const handleLaserKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!laserInput.trim()) return;

    const code = laserInput.trim();
    const found = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());

    if (found) {
      addToCart(found);
      setLaserInput('');
    } else {
      alert(`Produk dengan barcode/SKU "${code}" tidak ditemukan.`);
      setLaserInput('');
    }
  };

  // Execute payment
  const handleProcessPayment = () => {
    if (isPayDisabled) return;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      cashierName: activeCashier,
      cashierId: 'usr-active-kasir',
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.price,
        costPrice: c.product.costPrice,
        qty: c.qty,
        subtotal: c.product.price * c.qty,
      })),
      total: cartTotal,
      cashReceived: Number(cashReceived),
      change: changeAmount,
      status: 'paid',
    };

    onCompleteSale(newSale);
    setShowReceiptModal(newSale);
    setCart([]);
    setCashReceived('');
  };

  return (
    <div className="cashier-layout">
      {/* Kolom Kiri: Scanner Kamera/Laser & Katalog Produk */}
      <div className="catalog-section">
        {/* Panel Kontrol Scanner Hibrida */}
        <div className="card scanner-card">
          <div className="scanner-header">
            <div className="scanner-title-group">
              <span style={{ display: 'flex', color: 'var(--accent)' }}>
                <IconCamera size={20} />
              </span>
              <div>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                  Pemindai Barcode Hibrida
                </strong>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Mendukung Kamera HP (ROI 92% × 46%) & Laser Scanner USB
                </p>
              </div>
            </div>

            <div className="scanner-mode-tabs">
              <button
                type="button"
                className={`scanner-tab-btn ${scanMode === 'camera' ? 'active' : ''}`}
                onClick={() => setScanMode('camera')}
              >
                Kamera HP
              </button>
              <button
                type="button"
                className={`scanner-tab-btn ${scanMode === 'laser' ? 'active' : ''}`}
                onClick={() => {
                  setScanMode('laser');
                  setTimeout(() => laserInputRef.current?.focus(), 100);
                }}
              >
                Scanner Laser
              </button>
            </div>
          </div>

          {/* Area Kamera HP dengan ROI 92% x 46% sesuai PRD */}
          {scanMode === 'camera' ? (
            <div className="camera-viewport">
              <div className="camera-grid-bg" />
              <div className="camera-roi">
                <div className="roi-laser-line" />
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    fontSize: 10,
                    color: 'var(--accent)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Area Baca Tajam (ROI 92% × 46%)
                </span>
              </div>

              <div className="camera-controls">
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="cam-btn"
                    onClick={() => setTorchOn(!torchOn)}
                  >
                    <IconFlash size={14} /> {torchOn ? 'Senter Aktif' : 'Senter'}
                  </button>
                  <button
                    type="button"
                    className="cam-btn"
                    onClick={() => setZoomLevel((z) => (z >= 3 ? 1 : z + 1))}
                  >
                    <IconZoom size={14} /> Zoom {zoomLevel}x
                  </button>
                </div>

                <button
                  type="button"
                  className="sim-scan-btn"
                  onClick={() => handleSimulateScan()}
                >
                  <IconBarcode size={16} /> Simulasi Scan Barcode
                </button>
              </div>
            </div>
          ) : (
            /* Mode Scanner Laser (Wedge Input) */
            <form onSubmit={handleLaserKeySubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                ref={laserInputRef}
                type="text"
                placeholder="Arahkan laser scanner ke barcode kemasan atau ketik barcode..."
                value={laserInput}
                onChange={(e) => setLaserInput(e.target.value)}
                className="search-input"
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 16px',
                  height: 44,
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ height: 44, padding: '0 20px' }}
              >
                Input
              </button>
            </form>
          )}

          {lastScannedMsg && (
            <div
              style={{
                marginTop: 10,
                padding: '6px 14px',
                backgroundColor: 'var(--accent-deep)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconCheck size={14} /> Berhasil membaca barcode:
              </span>
              <strong>{lastScannedMsg}</strong>
            </div>
          )}
        </div>

        {/* Bilah Pencarian Produk Cepat */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-pill" style={{ maxWidth: 'none', flex: 1 }}>
            <span className="search-icon-circle">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Cari nama mainan, SKU, atau ketik nomor barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Filter Kategori */}
        <div className="category-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Katalog Produk */}
        {filteredProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Tidak ada produk yang cocok
            </div>
            <p style={{ fontSize: '13px' }}>
              Produk dengan kata kunci "{searchQuery}" tidak ditemukan pada kategori {selectedCategory}.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((prod) => {
              const isOutOfStock = prod.stock <= 0;
              return (
                <div
                  key={prod.id}
                  className={`card product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                >
                  <div>
                    <div className="prod-category">{prod.category}</div>
                    <div className="prod-name">{prod.name}</div>
                    <div className="prod-barcode" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconBarcode size={13} /> {prod.barcode}
                    </div>
                  </div>

                  <div className="prod-bottom">
                    <div>
                      <div className="prod-price tabular">{formatRupiah(prod.price)}</div>
                      <span
                        className="prod-stock-badge tabular"
                        style={{
                          color: isOutOfStock ? 'var(--danger)' : 'var(--text-muted)',
                        }}
                      >
                        {isOutOfStock ? 'Stok Habis' : `Sisa ${prod.stock} unit`}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="add-btn"
                      disabled={isOutOfStock}
                      title={isOutOfStock ? 'Stok habis' : 'Tambah ke keranjang'}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Kolom Kanan: Panel Keranjang Krem (`#C9BBA7`) dengan Teks Hitam per design.md Section 9 */}
      <div id="cashier-cart-panel" className="cart-panel">
        <div className="cart-header">
          <h2 className="cart-title">Keranjang Kasir</h2>
          <span className="cart-count-badge tabular">{totalItemsCount} item</span>
        </div>

        {/* Daftar Item Keranjang */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: 4 }}>
                <IconCart size={38} />
              </div>
              <p>Keranjang masih kosong.</p>
              <p style={{ fontSize: 12 }}>Pindai barcode atau klik produk di katalog.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="cart-item-row">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price tabular">
                    {formatRupiah(item.product.price)} × {item.qty} ={' '}
                    <strong>{formatRupiah(item.product.price * item.qty)}</strong>
                  </div>
                </div>

                <div className="cart-item-qty">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => updateQty(item.product.id, -1)}
                  >
                    −
                  </button>
                  <span className="qty-val tabular">{item.qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => updateQty(item.product.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Kalkulasi & Pembayaran Tunai */}
        <div className="cart-checkout">
          <div>
            <div className="cart-total-label">Total Tagihan</div>
            <div className="cart-total-number tabular">{formatRupiah(cartTotal)}</div>
          </div>

          {/* Tombol Nominal Cepat */}
          <div className="quick-cash-row">
            <button
              type="button"
              className="quick-cash-btn"
              onClick={() => setCashReceived(cartTotal)}
            >
              Uang Pas
            </button>
            <button
              type="button"
              className="quick-cash-btn"
              onClick={() => setCashReceived(50000)}
            >
              50.000
            </button>
            <button
              type="button"
              className="quick-cash-btn"
              onClick={() => setCashReceived(100000)}
            >
              100.000
            </button>
            <button
              type="button"
              className="quick-cash-btn"
              onClick={() => setCashReceived(200000)}
            >
              200.000
            </button>
          </div>

          {/* Input Tunai Diterima */}
          <div className="cash-input-group">
            <span className="cash-input-prefix">Bayar: Rp</span>
            <input
              type="number"
              placeholder="0"
              value={cashReceived}
              onChange={(e) =>
                setCashReceived(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="cash-input tabular"
            />
          </div>

          {/* Baris Kembalian */}
          <div className="change-row">
            <span className="change-label">Kembalian:</span>
            <span className="change-val tabular">{formatRupiah(changeAmount)}</span>
          </div>

          {/* Tombol Bayar */}
          <button
            type="button"
            className="pay-btn"
            disabled={isPayDisabled}
            onClick={handleProcessPayment}
          >
            Selesaikan Pembayaran
          </button>
        </div>
      </div>

      {/* Modal Dialog Struk Transaksi */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(null)}>
          <div className="modal-receipt" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="receipt-brand">KHALIF MAINAN</div>
              <div className="receipt-meta">Pusat Grosir & Eceran Mainan Anak Edukatif</div>
              <div className="receipt-meta">
                {showReceiptModal.invoiceNumber} | {new Date(showReceiptModal.date).toLocaleTimeString('id-ID')}
              </div>
              <div className="receipt-meta">Kasir: {showReceiptModal.cashierName}</div>
            </div>

            <div className="receipt-items">
              {showReceiptModal.items.map((it, idx) => (
                <div key={idx} className="receipt-item-line">
                  <span>
                    {it.productName} ({it.qty}x)
                  </span>
                  <span className="tabular">{formatRupiah(it.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-summary">
              <div className="receipt-item-line">
                <span>Subtotal</span>
                <span className="tabular">{formatRupiah(showReceiptModal.total)}</span>
              </div>
              <div className="receipt-item-line">
                <span>Tunai Diterima</span>
                <span className="tabular">{formatRupiah(showReceiptModal.cashReceived)}</span>
              </div>
              <div className="receipt-total-row">
                <span>Kembalian</span>
                <span className="tabular">{formatRupiah(showReceiptModal.change)}</span>
              </div>
            </div>

            <div className="receipt-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
                style={{ flex: 1 }}
              >
                <IconPrinter size={16} /> Cetak Struk
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowReceiptModal(null)}
                style={{ flex: 1 }}
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <button
          type="button"
          className="mobile-cart-float-bar"
          onClick={() => {
            document.getElementById('cashier-cart-panel')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCart size={18} /> {totalItemsCount} item ({formatRupiah(cartTotal)})
          </span>
          <span>Buka Keranjang & Bayar →</span>
        </button>
      )}
    </div>
  );
};
