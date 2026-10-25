import React, { useState } from 'react';
import { StaffUser, UserRole } from '../types';
import {
  IconUsers,
  IconPlus,
  IconLock,
  IconCheck,
} from './Icons';

interface UserManagementViewProps {
  staffList: StaffUser[];
  onAddStaff: (newStaff: StaffUser) => void;
  onToggleStaffStatus: (userId: string) => void;
  currentUserRole: UserRole;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  staffList,
  onAddStaff,
  onToggleStaffStatus,
  currentUserRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('kasir');
  const [password, setPassword] = useState('');

  const isOwner = currentUserRole === 'pemilik';

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newStaff: StaffUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: 'Belum pernah login',
    };

    onAddStaff(newStaff);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPassword('');
    alert(`Akun staf ${newStaff.name} dengan peran ${newStaff.role.toUpperCase()} berhasil dibuat.`);
  };

  return (
    <div className="view-container">
      {/* Header Panel */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Manajemen Admin & Staf
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Kelola akun staf kasir, admin toko, dan status hak akses sistem
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <IconPlus size={16} /> Tambah Staf Baru
            </button>
          )}
        </div>
      </div>

      {/* KPI Singkat Staf */}
      <div className="kpi-grid three-cols" style={{ marginBottom: '12px' }}>
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Akun Terdaftar</span>
            <div className="kpi-icon-pill">
              <IconUsers size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">{staffList.length}</div>
            <div className="kpi-delta positive">Tersinkronisasi Database</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Staf Kasir Aktif</span>
            <div className="kpi-icon-pill">
              <IconCheck size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">
              {staffList.filter((s) => s.role === 'kasir' && s.isActive).length}
            </div>
            <div className="kpi-delta positive">Siap di Meja Kasir</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Akses Admin Gudang</span>
            <div className="kpi-icon-pill">
              <IconLock size={16} />
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value tabular">
              {staffList.filter((s) => s.role === 'admin' && s.isActive).length}
            </div>
            <div className="kpi-delta">Tanpa Akses Modal</div>
          </div>
        </div>
      </div>

      {/* Tabel Data Staf */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>Nama Petugas</th>
                <th>Email Login</th>
                <th>Hak Akses (Role)</th>
                <th>Status Akun</th>
                <th>Aktivitas Terakhir</th>
                <th>Tanggal Registrasi</th>
                {isOwner && <th>Aksi Pemilik</th>}
              </tr>
            </thead>
            <tbody>
              {staffList.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor:
                          user.role === 'pemilik'
                            ? 'var(--bg-frame)'
                            : user.role === 'admin'
                            ? 'rgba(80, 160, 124, 0.15)'
                            : 'var(--surface-raised)',
                        color:
                          user.role === 'pemilik'
                            ? 'var(--text-on-cream)'
                            : user.role === 'admin'
                            ? 'var(--accent)'
                            : 'var(--text-primary)',
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${user.isActive ? 'in-stock' : 'out-of-stock'}`}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      {user.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{user.lastLogin}</td>
                  <td className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  {isOwner && (
                    <td>
                      {user.role !== 'pemilik' ? (
                        <button
                          type="button"
                          className={user.isActive ? "btn-table-danger" : "btn-table"}
                          onClick={() => onToggleStaffStatus(user.id)}
                        >
                          {user.isActive ? 'Cabut Akses' : 'Aktifkan'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pemilik Utama</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Staf Baru */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Buat Akun Staf Baru (Edge Function)
              </h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Nama Lengkap Staf
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Maya Handayani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  Alamat Email Staf (Untuk Login POS)
                </label>
                <input
                  type="email"
                  required
                  placeholder="maya.kasir@khalifstore.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Hak Akses / Peran Akun
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="role-select"
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="kasir">Kasir (Layar Kasir, Riwayat Kasir Hari Ini, Scan Barcode)</option>
                  <option value="admin">Admin (Katalog, Stok, Void Transaksi, Tanpa Akses Modal)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Password Awal
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter aman"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Buat Akun Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
