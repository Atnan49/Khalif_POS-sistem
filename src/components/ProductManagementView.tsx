import React, { useState } from 'react';
import { Product, UserRole } from '../types';
import { formatRupiah, triggerScanSuccessFeedback } from '../utils/audio';
import { IconLock, IconBox, IconSearch, IconCamera, IconBarcode, IconCheck } from './Icons';

interface ProductManagementViewProps {
  products: Product[];
  userRole: UserRole;
  onAddProduct: (prod: Product) => void;
  onAdjustStock: (productId: string, delta: number, reason: string) => void;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  products,
  userRole,
  onAddProduct,
  onAdjustStock,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAdjustModal, setShowAdjustModal] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New product form
  const [newBarcode, setNewBarcode] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Mobil Remote');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newCostPrice, setNewCostPrice] = useState<number>(0);

  // Scanner state inside Add Product Modal
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string>('');

  // Generate random Indonesian EAN-13 (prefix 899) with valid check digit
  const handleAutoGenerateBarcode = () => {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    const prefix12 = `899${randomDigits}`;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(prefix12[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const generated = `${prefix12}${checkDigit}`;
    setNewBarcode(generated);
    if (!newSku) {
      setNewSku(`MAIN-${generated.slice(-4)}`);
    }
    triggerScanSuccessFeedback();
    setScanSuccessMsg(`Barcode dibuat: ${generated}`);
    setTimeout(() => setScanSuccessMsg(''), 4000);
  };

  // Simulate scanning toy barcode with camera
  const handleSimulateScanNewProduct = () => {
    const sampleBarcodes = [
      '8991234567890',
      '8992345678901',
      '8993456789012',
      '8994567890123',
      '8995678901234',
      '8996789012345',
      '8997890123456',
    ];
    // pick one not yet in product list or generate unique
    const existing = new Set(products.map((p) => p.barcode));
    const candidate = sampleBarcodes.find((b) => !existing.has(b)) || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setNewBarcode(candidate);
    if (!newSku) {
      setNewSku(`MAIN-${candidate.slice(-4)}`);
    }
    triggerScanSuccessFeedback();
    setScanSuccessMsg(`Barcode berhasil dipindai: ${candidate}`);
    setIsScanning(false);
    setTimeout(() => setScanSuccessMsg(''), 4000);
  };

  // Adjust stock form
  const [adjustDelta, setAdjustDelta] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Restock kiriman dari distributor');

  const isOwner = userRole === 'pemilik';

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBarcode.trim()) {
      alert('Nama produk dan barcode wajib diisi.');
      return;
    }

    const createdProduct: Product = {
      id: `prod-${Date.now()}`,
      barcode: newBarcode.trim(),
      sku: newSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice),
      costPrice: isOwner ? Number(newCostPrice) : 0,
      stock: 0, // Sesuai PRD 3.3.1: Stok awal produk baru selalu dimulai dari 0
      isActive: true,
    };

    onAddProduct(createdProduct);
    setShowAddModal(false);
    setNewBarcode('');
    setNewSku('');
    setNewName('');
    setNewPrice(0);
    setNewCostPrice(0);
  };

  const handleExecuteStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal) return;
    if (!adjustReason.trim()) {
      alert('Alasan penyesuaian stok wajib diisi untuk catatan audit.');
      return;
    }

    onAdjustStock(showAdjustModal.id, Number(adjustDelta), adjustReason);
    setShowAdjustModal(null);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="content-area">
      <div className="card table-card">
        <div className="table-toolbar">
          <div>
            <h2 className="table-title">Katalog & Inventaris Produk</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Kelola stok mainan, barcode, dan harga jual toko
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Tambah Produk Baru
          </button>
        </div>

        {/* Bilah Pencarian Produk */}
        <div style={{ marginBottom: '16px' }}>
          <div className="search-pill" style={{ maxWidth: 'none', width: '100%' }}>
            <span className="search-icon-circle">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama mainan, barcode, SKU, atau kategori..."
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
                  fontSize: '13px',
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Lencana Peringatan jika terdapat produk tanpa harga modal per PRD 3.3 */}
        {isOwner && products.some((p) => p.isActive && (!p.costPrice || p.costPrice <= 0)) && (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(216, 88, 84, 0.15)',
              border: '1px solid rgba(216, 88, 84, 0.35)',
              borderRadius: 'var(--radius-pill)',
              marginBottom: 16,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--danger)',
              fontWeight: 600,
            }}
          >
            <span>Peringatan: Terdapat produk aktif yang belum memiliki harga modal (HPP). Lengkapi data agar margin laba bersih akurat.</span>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Barcode & SKU</th>
              <th>Nama Produk Mainan</th>
              <th>Kategori</th>
              <th>Harga Jual</th>
              {/* Kolom Harga Modal hanya ditampilkan bila peran adalah Pemilik */}
              <th>Harga Modal (HPP)</th>
              <th>Stok Tersedia</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Tidak ada produk yang cocok dengan pencarian "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
              const isLowStock = p.stock <= 5;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.barcode}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sku}</div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        backgroundColor: 'var(--surface-raised)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="tabular" style={{ fontWeight: 700, fontSize: 15 }}>
                    {formatRupiah(p.price)}
                  </td>
                  {/* Keamanan Harga Modal */}
                  <td>
                    {isOwner ? (
                      <span className="tabular" style={{ color: 'var(--accent)' }}>
                        {formatRupiah(p.costPrice)}
                      </span>
                    ) : (
                      <span className="badge-cost-locked" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <IconLock size={12} /> Akses Terbatas RLS
                      </span>
                    )}
                  </td>
                  <td className="tabular">
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: isLowStock
                          ? 'rgba(216, 88, 84, 0.2)'
                          : 'var(--surface-raised)',
                        color: isLowStock ? 'var(--danger)' : 'var(--text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {p.stock} unit {isLowStock && p.stock > 0 && '(Menipis)'}
                      {p.stock === 0 && '(Habis)'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-table"
                      onClick={() => {
                        setShowAdjustModal(p);
                        setAdjustDelta(10);
                      }}
                    >
                      <IconBox size={14} /> Atur Stok
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>Tambah Produk Mainan</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Nama Produk Mainan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Robot Transformers Optimus 20cm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>Barcode (EAN-13)</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        className="btn-table"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                        title="Buka scanner kamera HP / webcam"
                        onClick={() => setIsScanning(!isScanning)}
                      >
                        <IconCamera size={12} /> {isScanning ? 'Tutup' : 'Scan Barcode'}
                      </button>
                      <button
                        type="button"
                        className="btn-table"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                        title="Buat barcode 899... otomatis"
                        onClick={handleAutoGenerateBarcode}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="899..."
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    className="form-input tabular"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU Produk</label>
                  <input
                    type="text"
                    placeholder="MAIN-XXX"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="form-input tabular"
                  />
                </div>
              </div>

              {/* Viewport Scanner Kamera di dalam Modal */}
              {isScanning && (
                <div
                  style={{
                    backgroundColor: '#111111',
                    borderRadius: 16,
                    padding: 10,
                    marginBottom: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  <div
                    style={{
                      height: 130,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'radial-gradient(circle at center, #1e1e1e 10%, #0a0a0a 90%)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <div className="camera-roi" style={{ width: '88%', height: '52%' }}>
                      <div className="roi-laser-line" />
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          fontSize: 9,
                          color: 'var(--accent)',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Arahkan Kamera ke Barcode Mainan
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 10,
                        right: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 10,
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Kamera Aktif
                      </span>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ height: 32, padding: '4px 14px', fontSize: 11 }}
                        onClick={handleSimulateScanNewProduct}
                      >
                        <IconBarcode size={13} /> Pindai Barcode Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {scanSuccessMsg && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: '6px 12px',
                    backgroundColor: 'rgba(80, 160, 124, 0.18)',
                    color: 'var(--accent)',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IconCheck size={14} /> {scanSuccessMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Kategori Mainan</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="Mobil Remote">Mobil Remote</option>
                  <option value="Balok & Lego">Balok & Lego</option>
                  <option value="Boneka">Boneka</option>
                  <option value="Action Figure">Action Figure</option>
                  <option value="Edukasi">Edukasi</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={newPrice || ''}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="form-input tabular"
                  />
                </div>

                {isOwner && (
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--accent)' }}>
                      Harga Modal / Beli (Khusus Pemilik)
                    </label>
                    <input
                      type="number"
                      placeholder="60000"
                      value={newCostPrice || ''}
                      onChange={(e) => setNewCostPrice(Number(e.target.value))}
                      className="form-input tabular"
                    />
                  </div>
                )}
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                * Catatan: Sesuai aturan PRD 3.3, stok awal produk baru adalah 0 dan diisi
                melalui mutasi & penyesuaian stok.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penyesuaian Stok (adjust_stock) */}
      {showAdjustModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Penyesuaian Stok Produk</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {showAdjustModal.name} (Stok Saat Ini: {showAdjustModal.stock} unit)
            </p>

            <form onSubmit={handleExecuteStockAdjust}>
              <div className="form-group">
                <label className="form-label">Jumlah Penyesuaian (Delta)</label>
                <input
                  type="number"
                  required
                  placeholder="+10 atau -2"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="form-input tabular"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Gunakan angka positif untuk barang masuk, atau negatif untuk barang rusak/retur.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Alasan Mutasi (Wajib Catatan Audit)</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="form-input"
                >
                  <option value="Restock kiriman dari distributor">
                    Restock kiriman dari distributor
                  </option>
                  <option value="Koreksi stok opname fisik">
                    Koreksi stok opname fisik
                  </option>
                  <option value="Barang rusak / cacat kemasan">
                    Barang rusak / cacat kemasan
                  </option>
                  <option value="Retur dari pelanggan">Retur dari pelanggan</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAdjustModal(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Konfirmasi Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
