import React, { useState } from 'react';
import { Sale, UserRole } from '../types';
import { formatRupiah } from '../utils/audio';
import {
  IconFileText,
  IconSearch,
  IconPrinter,
  IconDownload,
  IconFilter,
  IconReceipt,
} from './Icons';

interface SalesReportViewProps {
  sales: Sale[];
  userRole: UserRole;
  onVoidSale: (saleId: string, reason: string) => void;
}

export const SalesReportView: React.FC<SalesReportViewProps> = ({
  sales,
  userRole,
  onVoidSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cashierFilter, setCashierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'void'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items.some((it) => it.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCashier =
      cashierFilter === 'all' || s.cashierName.includes(cashierFilter);

    const matchesStatus =
      statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesCashier && matchesStatus;
  });

  const validSales = filteredSales.filter((s) => s.status === 'paid');
  const totalOmzet = validSales.reduce((acc, curr) => acc + curr.total, 0);
  const totalQtySold = validSales.reduce(
    (acc, curr) => acc + curr.items.reduce((sum, it) => sum + it.qty, 0),
    0
  );
  const totalVoidCount = filteredSales.filter((s) => s.status === 'void').length;

  const handleExportCSV = () => {
    const headers = ['No Faktur', 'Tanggal', 'Kasir', 'Total Tagihan', 'Status', 'Rincian Item'];
    const rows = filteredSales.map((s) => [
      s.invoiceNumber,
      s.date,
      s.cashierName,
      s.total,
      s.status,
      s.items.map((it) => `${it.productName} (${it.qty}x)`).join('; '),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_Kasir_Khalif_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-container">
      {/* Header Panel */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Laporan Penjualan & Rekap Transaksi
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Audit lengkap transaksi kasir, analisis omzet penjualan, riwayat struk belanja, dan ekspor data pembukuan
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportCSV}
            >
              <IconDownload size={16} /> Ekspor Data CSV
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => alert(`Rekap laporan harian total ${formatRupiah(totalOmzet)} berhasil dicetak ke printer kasir.`)}
            >
              <IconPrinter size={16} /> Cetak Rekap Harian
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Ringkasan */}
      <div className="kpi-grid" style={{ marginBottom: '12px' }}>
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Omzet Penjualan</span>
            <div className="kpi-icon-pill">
              <IconReceipt size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">
              {formatRupiah(totalOmzet)}
            </div>
            <div className="kpi-delta positive">Berdasarkan Filter Aktif</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Transaksi Sah</span>
            <div className="kpi-icon-pill">
              <IconFileText size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">{validSales.length}</div>
            <div className="kpi-delta">Struk Berhasil</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Item Mainan Terjual</span>
            <div className="kpi-icon-pill">
              <IconFilter size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">{totalQtySold}</div>
            <div className="kpi-delta">Unit Barang</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Transaksi Dibatalkan</span>
            <div className="kpi-icon-pill">
              <IconReceipt size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular" style={{ color: 'var(--danger)' }}>
              {totalVoidCount}
            </div>
            <div className="kpi-delta negative">Status Void</div>
          </div>
        </div>
      </div>

      {/* Filter & Pencarian Bar */}
      <div className="card" style={{ marginBottom: '12px', padding: '12px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <IconSearch size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari nomor faktur, nama staf kasir, atau nama mainan..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="role-select"
              style={{ height: '36px' }}
            >
              <option value="all">Semua Staf Kasir</option>
              <option value="Siti">Kasir: Siti Aminah</option>
              <option value="Budi">Kasir: Budi Santoso</option>
              <option value="H. Khalif">Pemilik: H. Khalif</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="role-select"
              style={{ height: '36px' }}
            >
              <option value="all">Semua Status</option>
              <option value="paid">Transaksi Sah (Paid)</option>
              <option value="void">Dibatalkan (Void)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Laporan Penjualan */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>No. Faktur</th>
                <th>Waktu Transaksi</th>
                <th>Kasir</th>
                <th>Rincian Item Mainan</th>
                <th>Total Bayar</th>
                <th>Uang Diterima</th>
                <th>Kembalian</th>
                <th>Status</th>
                <th>Aksi Struk</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada transaksi penjualan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {sale.invoiceNumber}
                    </td>
                    <td className="tabular" style={{ fontSize: '12px' }}>
                      {new Date(sale.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontSize: '13px' }}>{sale.cashierName}</td>
                    <td style={{ fontSize: '12px', maxWidth: '240px' }}>
                      {sale.items.map((it) => `${it.productName} (${it.qty}x)`).join(', ')}
                    </td>
                    <td className="tabular" style={{ fontWeight: 700 }}>
                      {formatRupiah(sale.total)}
                    </td>
                    <td className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatRupiah(sale.cashReceived)}
                    </td>
                    <td className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatRupiah(sale.change)}
                    </td>
                    <td>
                      <span
                        className={`badge-status ${sale.status === 'paid' ? 'in-stock' : 'out-of-stock'}`}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        {sale.status === 'paid' ? 'LUNAS' : 'VOID'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-table"
                          onClick={() => setSelectedReceipt(sale)}
                        >
                          Lihat Struk
                        </button>
                        {userRole !== 'kasir' && sale.status === 'paid' && (
                          <button
                            type="button"
                            className="btn-table-danger"
                            onClick={() => {
                              const reason = prompt('Masukkan alasan pembatalan / void transaksi ini:');
                              if (reason) onVoidSale(sale.id, reason);
                            }}
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Struk */}
      {selectedReceipt && (
        <div className="modal-backdrop">
          <div className="receipt-modal-card" style={{ maxWidth: '340px' }}>
            <div className="receipt-paper" style={{ padding: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>KASIR KHALIF</h3>
                <p style={{ margin: '2px 0', fontSize: '11px' }}>Toko Mainan Edukasi & Hobi</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#555' }}>Jl. Surya Kencana No. 45 Jakarta</p>
              </div>

              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', fontSize: '11px', margin: '8px 0' }}>
                <div>Faktur: {selectedReceipt.invoiceNumber}</div>
                <div>Kasir: {selectedReceipt.cashierName}</div>
                <div>Waktu: {new Date(selectedReceipt.date).toLocaleString('id-ID')}</div>
              </div>

              <div style={{ fontSize: '12px', margin: '8px 0' }}>
                {selectedReceipt.items.map((it) => (
                  <div key={it.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{it.productName} x{it.qty}</span>
                    <span className="tabular">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>TOTAL:</span>
                  <span className="tabular">{formatRupiah(selectedReceipt.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BAYAR:</span>
                  <span className="tabular">{formatRupiah(selectedReceipt.cashReceived)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>KEMBALI:</span>
                  <span className="tabular">{formatRupiah(selectedReceipt.change)}</span>
                </div>
              </div>

              {selectedReceipt.status === 'void' && (
                <div style={{ marginTop: '10px', textAlign: 'center', color: '#d85854', fontWeight: 800, fontSize: '13px' }}>
                  *** TRANSAKSI DIBATALKAN (VOID) ***
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => alert(`Struk ${selectedReceipt.invoiceNumber} dicetak ulang.`)}
                >
                  Cetak Struk
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
