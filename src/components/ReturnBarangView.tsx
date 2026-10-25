import React, { useState } from 'react';
import { ReturnRecord, Sale } from '../types';
import { formatRupiah } from '../utils/audio';
import {
  IconReturn,
  IconSearch,
  IconPlus,
  IconCheck,
  IconAlert,
} from './Icons';

interface ReturnBarangViewProps {
  returns: ReturnRecord[];
  sales: Sale[];
  onAddReturn: (newRet: ReturnRecord) => void;
  activeCashier: string;
}

export const ReturnBarangView: React.FC<ReturnBarangViewProps> = ({
  returns,
  sales,
  onAddReturn,
  activeCashier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState<ReturnRecord['reason']>('rusak_pabrik');
  const [refundAmount, setRefundAmount] = useState(0);

  const filteredReturns = returns.filter(
    (r) =>
      r.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.originalInvoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchInvoice = () => {
    const found = sales.find(
      (s) => s.invoiceNumber.toLowerCase() === invoiceQuery.trim().toLowerCase()
    );
    if (found) {
      setSelectedSale(found);
      if (found.items.length > 0) {
        setSelectedItemName(found.items[0].productName);
        setRefundAmount(found.items[0].price);
      }
    } else {
      alert(`Faktur ${invoiceQuery} tidak ditemukan dalam sistem.`);
      setSelectedSale(null);
    }
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !selectedItemName) return;

    const newRecord: ReturnRecord = {
      id: `ret-${Date.now()}`,
      returnNumber: `RET/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(
        returns.length + 1
      ).padStart(4, '0')}`,
      originalInvoice: selectedSale.invoiceNumber,
      date: new Date().toISOString(),
      productName: selectedItemName,
      qty: returnQty,
      refundAmount: refundAmount * returnQty,
      reason: returnReason,
      cashierName: activeCashier,
      status: 'selesai',
    };

    onAddReturn(newRecord);
    setShowModal(false);
    setSelectedSale(null);
    setInvoiceQuery('');
    alert(`Retur barang berhasil dicatat: ${newRecord.returnNumber}. Stok telah dikembalikan ke gudang.`);
  };

  const getReasonLabel = (reason: ReturnRecord['reason']) => {
    switch (reason) {
      case 'rusak_pabrik':
        return 'Rusak Pabrik / Cacat Fungsi';
      case 'salah_beli':
        return 'Salah Beli / Ganti Varian';
      case 'cacat_kemasan':
        return 'Cacat Kemasan Saat Pengiriman';
      case 'tukar_barang':
        return 'Tukar dengan Mainan Lain';
      default:
        return reason;
    }
  };

  return (
    <div className="view-container">
      {/* Header Panel */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Manajemen Retur & Pengembalian Barang
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Proses klaim pengembalian produk rusak pabrik atau tukar varian mainan dengan verifikasi faktur asli
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            <IconPlus size={16} /> Buat Retur Baru
          </button>
        </div>
      </div>

      {/* KPI Singkat Retur */}
      <div className="kpi-grid three-cols" style={{ marginBottom: '12px' }}>
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Retur Selesai</span>
            <div className="kpi-icon-pill">
              <IconReturn size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">{returns.length}</div>
            <div className="kpi-delta positive">Tercatat di Audit Log</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Nilai Refund Dana</span>
            <div className="kpi-icon-pill">
              <IconAlert size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">
              {formatRupiah(returns.reduce((acc, curr) => acc + curr.refundAmount, 0))}
            </div>
            <div className="kpi-delta">Pengembalian ke Kasir</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Status Kebijakan Toko</span>
            <div className="kpi-icon-pill">
              <IconCheck size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value">2x24 Jam</div>
            <div className="kpi-delta positive">Wajib Nota Asli</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: '12px', padding: '12px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconSearch size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Cari nomor retur, faktur asal, atau nama mainan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '14px',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Tabel Data Retur */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>No. Retur</th>
                <th>Faktur Asal</th>
                <th>Tanggal</th>
                <th>Nama Produk</th>
                <th>Qty</th>
                <th>Nominal Refund</th>
                <th>Alasan Retur</th>
                <th>Petugas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada catatan retur barang yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{ret.returnNumber}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{ret.originalInvoice}</td>
                    <td className="tabular" style={{ fontSize: '12px' }}>
                      {new Date(ret.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ret.productName}</td>
                    <td className="tabular" style={{ textAlign: 'center' }}>{ret.qty}</td>
                    <td className="tabular" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                      {formatRupiah(ret.refundAmount)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {getReasonLabel(ret.reason)}
                    </td>
                    <td style={{ fontSize: '12px' }}>{ret.cashierName}</td>
                    <td>
                      <span className="badge-status in-stock" style={{ fontSize: '11px', padding: '3px 8px' }}>
                        {ret.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Retur Baru */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Form Input Retur Barang Pelanggan
              </h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedSale(null);
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Nomor Faktur Struk Pembelian
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Contoh: INV/20261025/0001"
                  value={invoiceQuery}
                  onChange={(e) => setInvoiceQuery(e.target.value)}
                  className="search-input"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px',
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleSearchInvoice}
                >
                  Verifikasi
                </button>
              </div>
            </div>

            {selectedSale && (
              <form onSubmit={handleSubmitReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--surface-raised)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Faktur Ditemukan:</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                    {selectedSale.invoiceNumber} - Kasir: {selectedSale.cashierName}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Pilih Item Mainan Yang Dikembalikan
                  </label>
                  <select
                    value={selectedItemName}
                    onChange={(e) => {
                      setSelectedItemName(e.target.value);
                      const item = selectedSale.items.find((it) => it.productName === e.target.value);
                      if (item) setRefundAmount(item.price);
                    }}
                    className="role-select"
                    style={{ width: '100%', height: '40px' }}
                  >
                    {selectedSale.items.map((it) => (
                      <option key={it.productId} value={it.productName}>
                        {it.productName} ({it.qty} unit dibeli - {formatRupiah(it.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Jumlah Retur (Unit)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={returnQty}
                      onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="search-input"
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '8px 14px',
                        width: '100%',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Total Refund Dana
                    </label>
                    <div
                      className="tabular"
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--surface-raised)',
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 700,
                        color: 'var(--danger)',
                      }}
                    >
                      {formatRupiah(refundAmount * returnQty)}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Alasan Pengembalian / Retur
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as ReturnRecord['reason'])}
                    className="role-select"
                    style={{ width: '100%', height: '40px' }}
                  >
                    <option value="rusak_pabrik">Rusak Pabrik / Cacat Fungsi (Kembali ke Suplier)</option>
                    <option value="salah_beli">Salah Beli / Pelanggan Minta Ganti Varian</option>
                    <option value="cacat_kemasan">Kemasan Kardus Rusak Parah</option>
                    <option value="tukar_barang">Tukar dengan Mainan Seharga</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Konfirmasi Retur & Restock
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
