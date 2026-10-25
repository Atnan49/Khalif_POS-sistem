import React, { useState } from 'react';
import { CashMovement } from '../types';
import { formatRupiah } from '../utils/audio';
import {
  IconWallet,
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconPrinter,
} from './Icons';

interface CashBalanceViewProps {
  cashMovements: CashMovement[];
  onAddCashMovement: (movement: CashMovement) => void;
  activeCashier: string;
}

export const CashBalanceView: React.FC<CashBalanceViewProps> = ({
  cashMovements,
  onAddCashMovement,
  activeCashier,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [movementType, setMovementType] = useState<'masuk' | 'keluar'>('keluar');
  const [category, setCategory] = useState<CashMovement['category']>('operasional');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const totalMasuk = cashMovements
    .filter((m) => m.type === 'masuk')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalKeluar = cashMovements
    .filter((m) => m.type === 'keluar')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoLaci = totalMasuk - totalKeluar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) return;

    const newMovement: CashMovement = {
      id: `cash-${Date.now()}`,
      type: movementType,
      category,
      amount,
      description,
      cashierName: activeCashier,
      timestamp: new Date().toISOString(),
    };

    onAddCashMovement(newMovement);
    setShowModal(false);
    setAmount(0);
    setDescription('');
    alert(`Mutasi kas ${movementType === 'masuk' ? 'masuk' : 'keluar'} berhasil dicatat.`);
  };

  const getCategoryLabel = (cat: CashMovement['category']) => {
    switch (cat) {
      case 'modal_awal':
        return 'Modal Awal Kasir';
      case 'penjualan':
        return 'Penjualan Tunai Kasir';
      case 'operasional':
        return 'Biaya Operasional Toko';
      case 'setor_pemilik':
        return 'Setoran Kas ke Pemilik';
      default:
        return 'Lain-lain';
    }
  };

  return (
    <div className="view-container">
      {/* Header Panel */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Buku Kas & Saldo Laci Kasir
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Pantau arus uang tunai fisik di laci kasir, modal awal kasir, pengeluaran operasional, dan setoran ke pemilik
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setMovementType('keluar');
                setShowModal(true);
              }}
            >
              <IconPlus size={16} /> Catat Arus Kas
            </button>
          </div>
        </div>
      </div>

      {/* Tiga Kartu Ringkasan Saldo */}
      <div className="kpi-grid three-cols" style={{ marginBottom: '12px' }}>
        <div className="card kpi-card" style={{ border: '1px solid rgba(80, 160, 124, 0.3)' }}>
          <div className="kpi-top">
            <span className="kpi-label">Saldo Tunai di Laci Kasir</span>
            <div className="kpi-icon-pill" style={{ backgroundColor: 'var(--accent)', color: '#000000' }}>
              <IconWallet size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular" style={{ color: 'var(--accent)' }}>
              {formatRupiah(saldoLaci)}
            </div>
            <div className="kpi-delta positive">Wajib Sesuai Fisik Laci</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Kas Masuk (Shift Ini)</span>
            <div className="kpi-icon-pill">
              <IconTrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">
              {formatRupiah(totalMasuk)}
            </div>
            <div className="kpi-delta">Modal Awal + Penjualan</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Kas Keluar</span>
            <div className="kpi-icon-pill">
              <IconTrendingDown size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular" style={{ color: 'var(--danger)' }}>
              {formatRupiah(totalKeluar)}
            </div>
            <div className="kpi-delta negative">Operasional & Setoran</div>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Arus Kas */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Jurnal Arus Kas Masuk & Keluar Hari Ini
          </h3>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => alert(`Rekap saldo kasir saat ini: ${formatRupiah(saldoLaci)} telah dicetak.`)}
          >
            <IconPrinter size={14} /> Cetak Rekap Kas
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>Waktu Transaksi</th>
                <th>Jenis Arus</th>
                <th>Kategori Kas</th>
                <th>Keterangan / Keperluan</th>
                <th>Nominal (Rp)</th>
                <th>Kasir Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody>
              {cashMovements.map((move) => (
                <tr key={move.id}>
                  <td className="tabular" style={{ fontSize: '12px' }}>
                    {new Date(move.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </td>
                  <td>
                    <span
                      className={`badge-status ${move.type === 'masuk' ? 'in-stock' : 'out-of-stock'}`}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      {move.type === 'masuk' ? 'KAS MASUK (+)' : 'KAS KELUAR (-)'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{getCategoryLabel(move.category)}</td>
                  <td style={{ fontSize: '13px' }}>{move.description}</td>
                  <td
                    className="tabular"
                    style={{
                      fontWeight: 700,
                      color: move.type === 'masuk' ? 'var(--accent)' : 'var(--danger)',
                    }}
                  >
                    {move.type === 'masuk' ? '+' : '-'} {formatRupiah(move.amount)}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{move.cashierName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Kas Masuk / Keluar */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Catat Arus Kas Laci Kasir
              </h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Arah Arus Kas
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className={`filter-pill ${movementType === 'keluar' ? 'active' : ''}`}
                    style={{ textAlign: 'center', padding: '8px' }}
                    onClick={() => {
                      setMovementType('keluar');
                      setCategory('operasional');
                    }}
                  >
                    Kas Keluar (Pengeluaran)
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${movementType === 'masuk' ? 'active' : ''}`}
                    style={{ textAlign: 'center', padding: '8px' }}
                    onClick={() => {
                      setMovementType('masuk');
                      setCategory('modal_awal');
                    }}
                  >
                    Kas Masuk (Penambahan)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Kategori Transaksi Kas
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CashMovement['category'])}
                  className="role-select"
                  style={{ width: '100%', height: '40px' }}
                >
                  {movementType === 'keluar' ? (
                    <>
                      <option value="operasional">Biaya Operasional Toko (Kresek, Lakban, Bensin)</option>
                      <option value="setor_pemilik">Setoran Uang ke Pemilik Toko</option>
                      <option value="lainnya">Pengeluaran Lain-lain</option>
                    </>
                  ) : (
                    <>
                      <option value="modal_awal">Modal Awal Kasir Shift</option>
                      <option value="penjualan">Penerimaan Tunai Tambahan</option>
                      <option value="lainnya">Pemasukan Lain-lain</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Nominal Uang (Rp)
                </label>
                <input
                  type="number"
                  min={1000}
                  required
                  placeholder="Contoh: 50000"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="search-input"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px 14px',
                    width: '100%',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Keterangan / Rincian Keperluan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli air galon kasir & plastik mainan besar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="search-input"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px',
                    width: '100%',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
