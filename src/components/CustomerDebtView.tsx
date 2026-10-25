import React, { useState } from 'react';
import { CustomerDebt } from '../types';
import { formatRupiah } from '../utils/audio';
import {
  IconCreditCard,
  IconSearch,
  IconPlus,
  IconCheck,
  IconUser,
} from './Icons';

interface CustomerDebtViewProps {
  debts: CustomerDebt[];
  onAddDebt: (newDebt: CustomerDebt) => void;
  onPayDebt: (debtId: string, amountPaid: number) => void;
}

export const CustomerDebtView: React.FC<CustomerDebtViewProps> = ({
  debts,
  onAddDebt,
  onPayDebt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'belum_lunas' | 'lunas'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<CustomerDebt | null>(null);
  const [paymentInput, setPaymentInput] = useState<number>(0);

  // Form new debt
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredDebts = debts.filter((d) => {
    const matchesSearch =
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ? true : d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = debts
    .filter((d) => d.status === 'belum_lunas')
    .reduce((acc, curr) => acc + curr.remainingDebt, 0);

  const totalCustomersWithDebt = debts.filter((d) => d.status === 'belum_lunas').length;

  const handleOpenPayModal = (debt: CustomerDebt) => {
    setSelectedDebt(debt);
    setPaymentInput(debt.remainingDebt);
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || paymentInput <= 0) return;
    onPayDebt(selectedDebt.id, paymentInput);
    setShowPayModal(false);
    setSelectedDebt(null);
  };

  const handleCreateNewDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formAmount <= 0) return;

    const newDebt: CustomerDebt = {
      id: `debt-${Date.now()}`,
      customerName: formName,
      phone: formPhone || '-',
      totalDebt: formAmount,
      paidAmount: 0,
      remainingDebt: formAmount,
      lastTransactionDate: new Date().toISOString(),
      dueDate: formDueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: 'belum_lunas',
      notes: formNotes || 'Bon pembelian mainan kasir',
    };

    onAddDebt(newDebt);
    setShowAddModal(false);
    setFormName('');
    setFormPhone('');
    setFormAmount(0);
    setFormNotes('');
    alert(`Hutang pelanggan ${newDebt.customerName} berhasil dicatat.`);
  };

  return (
    <div className="view-container">
      {/* Header Panel */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Manajemen Hutang & Piutang Pelanggan
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Catatan bon kasir pelanggan, jatuh tempo pembayaran, dan rekonsiliasi cicilan pelunasan
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <IconPlus size={16} /> Catat Hutang Baru
          </button>
        </div>
      </div>

      {/* KPI Singkat Piutang */}
      <div className="kpi-grid three-cols" style={{ marginBottom: '12px' }}>
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Sisa Piutang</span>
            <div className="kpi-icon-pill">
              <IconCreditCard size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular" style={{ color: 'var(--danger)' }}>
              {formatRupiah(totalOutstanding)}
            </div>
            <div className="kpi-delta negative">Wajib Ditagih</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Pelanggan Belum Lunas</span>
            <div className="kpi-icon-pill">
              <IconUser size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">{totalCustomersWithDebt}</div>
            <div className="kpi-delta">Orang / Lembaga</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Tingkat Pengembalian</span>
            <div className="kpi-icon-pill">
              <IconCheck size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">
              {debts.length > 0
                ? Math.round(
                    (debts.filter((d) => d.status === 'lunas').length / debts.length) * 100
                  )
                : 100}
              %
            </div>
            <div className="kpi-delta positive">Disiplin Bayar</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '12px', padding: '12px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <IconSearch size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari nama pelanggan, nomor telepon, atau catatan bon..."
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

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Semua ({debts.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'belum_lunas' ? 'active' : ''}`}
              onClick={() => setFilterStatus('belum_lunas')}
            >
              Belum Lunas ({totalCustomersWithDebt})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'lunas' ? 'active' : ''}`}
              onClick={() => setFilterStatus('lunas')}
            >
              Lunas ({debts.filter((d) => d.status === 'lunas').length})
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data Hutang */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Kontak / HP</th>
                <th>Total Hutang</th>
                <th>Sudah Dibayar</th>
                <th>Sisa Tagihan</th>
                <th>Jatuh Tempo</th>
                <th>Keterangan / Bon</th>
                <th>Status</th>
                <th>Aksi Kasir</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada catatan hutang pelanggan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredDebts.map((debt) => (
                  <tr key={debt.id}>
                    <td style={{ fontWeight: 600 }}>{debt.customerName}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{debt.phone}</td>
                    <td className="tabular">{formatRupiah(debt.totalDebt)}</td>
                    <td className="tabular" style={{ color: 'var(--accent)' }}>
                      {formatRupiah(debt.paidAmount)}
                    </td>
                    <td className="tabular" style={{ fontWeight: 700, color: debt.remainingDebt > 0 ? 'var(--danger)' : 'var(--accent)' }}>
                      {formatRupiah(debt.remainingDebt)}
                    </td>
                    <td className="tabular" style={{ fontSize: '12px' }}>
                      {debt.dueDate}
                    </td>
                    <td style={{ fontSize: '12px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {debt.notes}
                    </td>
                    <td>
                      <span
                        className={`badge-status ${debt.status === 'lunas' ? 'in-stock' : 'out-of-stock'}`}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        {debt.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </td>
                    <td>
                      {debt.status === 'belum_lunas' ? (
                        <button
                          type="button"
                          className="btn-table"
                          onClick={() => handleOpenPayModal(debt)}
                        >
                          Bayar Cicilan
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pembayaran Cicilan / Pelunasan */}
      {showPayModal && selectedDebt && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Pelunasan / Bayar Cicilan Bon
              </h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowPayModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-raised)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pelanggan:</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedDebt.customerName}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Sisa Hutang: <strong style={{ color: 'var(--danger)' }}>{formatRupiah(selectedDebt.remainingDebt)}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Jumlah Pembayaran yang Diterima Kasir (Rp)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={selectedDebt.remainingDebt}
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(parseInt(e.target.value) || 0)}
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

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="filter-pill"
                  style={{ flex: 1 }}
                  onClick={() => setPaymentInput(selectedDebt.remainingDebt)}
                >
                  Bayar Lunas ({formatRupiah(selectedDebt.remainingDebt)})
                </button>
                {selectedDebt.remainingDebt > 100000 && (
                  <button
                    type="button"
                    className="filter-pill"
                    style={{ flex: 1 }}
                    onClick={() => setPaymentInput(100000)}
                  >
                    Rp 100.000
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPayModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Hutang Baru */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Catat Hutang / Bon Pelanggan Baru
              </h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewDebt} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Nama Pelanggan / Lembaga
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak RT 05 / Bu Nita"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="search-input"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px',
                    width: '100%',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
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
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="search-input"
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '8px 14px',
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Total Nominal Bon / Hutang (Rp)
                </label>
                <input
                  type="number"
                  min={1000}
                  required
                  placeholder="Contoh: 250000"
                  value={formAmount || ''}
                  onChange={(e) => setFormAmount(parseInt(e.target.value) || 0)}
                  className="search-input"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px',
                    width: '100%',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Catatan Transaksi / Barang yang Dibon
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Pembelian 2 unit mobil remote control kado lomba..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="search-input"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    width: '100%',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
                >
                  Simpan Bon Hutang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
