import React, { useState } from 'react';
import { Sale, UserRole } from '../types';
import { formatRupiah } from '../utils/audio';
import { IconAlert } from './Icons';

interface HistoryViewProps {
  sales: Sale[];
  userRole: UserRole;
  onVoidSale: (saleId: string, reason: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sales,
  userRole,
  onVoidSale,
}) => {
  const [selectedSaleForVoid, setSelectedSaleForVoid] = useState<Sale | null>(null);
  const [voidReasonText, setVoidReasonText] = useState<string>('Pelanggan salah pilih item mainan');

  const isCashier = userRole === 'kasir';

  // Kasir RLS simulation: only today's transactions for the active cashier
  const displayedSales = isCashier
    ? sales.filter((s) => s.cashierId === 'usr-active-kasir' || s.cashierName.includes('Kasir'))
    : sales;

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForVoid) return;
    if (!voidReasonText.trim()) {
      alert('Alasan pembatalan (void) wajib diisi.');
      return;
    }

    onVoidSale(selectedSaleForVoid.id, voidReasonText.trim());
    setSelectedSaleForVoid(null);
  };

  return (
    <div className="content-area">
      <div className="card table-card">
        <div className="table-toolbar">
          <div>
            <h2 className="table-title">Riwayat Transaksi Penjualan</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {isCashier
                ? 'Menampilkan transaksi kasir Anda hari ini (WIB) per kebijakan RLS'
                : 'Menampilkan seluruh riwayat transaksi toko dengan kemampuan Void (Admin & Pemilik)'}
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Nomor Invoice</th>
              <th>Waktu Transaksi</th>
              <th>Kasir Bertugas</th>
              <th>Item Belanja</th>
              <th>Total Tagihan</th>
              <th>Status</th>
              {!isCashier && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {displayedSales.length === 0 ? (
              <tr>
                <td colSpan={isCashier ? 6 : 7} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Belum ada riwayat transaksi.</p>
                </td>
              </tr>
            ) : (
              displayedSales.map((sale) => {
                const isVoid = sale.status === 'void';
                return (
                  <tr key={sale.id} style={{ opacity: isVoid ? 0.65 : 1 }}>
                    <td>
                      <strong className="tabular" style={{ color: 'var(--text-primary)' }}>
                        {sale.invoiceNumber}
                      </strong>
                    </td>
                    <td className="tabular" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(sale.date).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>{sale.cashierName}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {sale.items.map((it, idx) => (
                          <div key={idx} style={{ color: 'var(--text-muted)' }}>
                            • {it.productName} ({it.qty}x)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="tabular" style={{ fontWeight: 700, fontSize: 15 }}>
                      {formatRupiah(sale.total)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isVoid
                            ? 'rgba(216, 88, 84, 0.2)'
                            : 'var(--accent-deep)',
                          color: isVoid ? 'var(--danger)' : 'var(--text-primary)',
                        }}
                      >
                        {isVoid ? 'VOID (Dibatalkan)' : 'LUNAS (Tunai)'}
                      </span>
                      {isVoid && sale.voidReason && (
                        <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
                          Alasan: {sale.voidReason}
                        </div>
                      )}
                    </td>
                    {!isCashier && (
                      <td>
                        {!isVoid ? (
                          <button
                            type="button"
                            className="btn-table-danger"
                            onClick={() => setSelectedSaleForVoid(sale)}
                          >
                            <IconAlert size={13} color="var(--danger)" /> Void Transaksi
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Stok Dikembalikan
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Modal Dialog Void Transaksi */}
      {selectedSaleForVoid && (
        <div className="modal-overlay" onClick={() => setSelectedSaleForVoid(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--danger)' }}>
              Konfirmasi Void Transaksi
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Membatalkan invoice <strong>{selectedSaleForVoid.invoiceNumber}</strong> (
              {formatRupiah(selectedSaleForVoid.total)}). Stok barang yang dibatalkan akan
              otomatis dikembalikan ke gudang secara atomik melalui fungsi RPC `void_sale`.
            </p>

            <form onSubmit={handleConfirmVoid}>
              <div className="form-group">
                <label className="form-label">Alasan Pembatalan (Wajib Audit)</label>
                <select
                  value={voidReasonText}
                  onChange={(e) => setVoidReasonText(e.target.value)}
                  className="form-input"
                >
                  <option value="Pelanggan salah pilih item mainan">
                    Pelanggan salah pilih item mainan
                  </option>
                  <option value="Uang tunai pelanggan tidak cukup">
                    Uang tunai pelanggan tidak cukup
                  </option>
                  <option value="Kesalahan input kasir">Kesalahan input kasir</option>
                  <option value="Barang cacat saat dibuka kasir">
                    Barang cacat saat dibuka kasir
                  </option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedSaleForVoid(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    backgroundColor: 'var(--danger)',
                    color: '#ffffff',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  Proses Void & Balikkan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
