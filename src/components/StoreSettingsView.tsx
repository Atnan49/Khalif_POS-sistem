import React, { useState } from 'react';
import { StoreSettings } from '../types';
import {
  IconSettings,
  IconCheck,
  IconPrinter,
  IconBarcode,
} from './Icons';

interface StoreSettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="view-container">
      {/* Header Panel */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Pengaturan Toko & Konfigurasi POS
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Kelola identitas ritel toko mainan, format cetak struk kasir, preferensi scanner, dan hardware
            </p>
          </div>
          {savedAlert && (
            <div
              style={{
                backgroundColor: 'rgba(80, 160, 124, 0.15)',
                color: 'var(--accent)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <IconCheck size={14} /> Pengaturan Berhasil Disimpan
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-grid-form">
        {/* Kolom Kiri: Profil & Identitas Toko */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-raised)', paddingBottom: '10px' }}>
            <IconSettings size={18} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Identitas Toko & Struk Kasir
            </h3>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Nama Toko Mainan
            </label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="search-input"
              style={{
                backgroundColor: 'var(--surface-raised)',
                borderRadius: 'var(--radius-pill)',
                padding: '10px 14px',
                width: '100%',
                fontWeight: 600,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Slogan / Tagline Toko
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="search-input"
              style={{
                backgroundColor: 'var(--surface-raised)',
                borderRadius: 'var(--radius-pill)',
                padding: '10px 14px',
                width: '100%',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Alamat Lengkap Toko
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="search-input"
              style={{
                backgroundColor: 'var(--surface-raised)',
                borderRadius: '12px',
                padding: '10px 14px',
                width: '100%',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Nomor Telepon Toko
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="search-input"
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 14px',
                  width: '100%',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                WhatsApp Layanan Pelanggan
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="search-input"
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 14px',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Pesan Footer Struk Belanja
            </label>
            <textarea
              rows={3}
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="search-input"
              style={{
                backgroundColor: 'var(--surface-raised)',
                borderRadius: '12px',
                padding: '10px 14px',
                width: '100%',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Kolom Kanan: Hardware, Printer & Scanner Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-raised)', paddingBottom: '10px' }}>
              <IconPrinter size={18} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Konfigurasi Printer Kasir Thermal
              </h3>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Ukuran Lebar Kertas Struk
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`filter-pill ${formData.printerPaper === '58mm' ? 'active' : ''}`}
                  style={{ textAlign: 'center', padding: '10px' }}
                  onClick={() => setFormData({ ...formData, printerPaper: '58mm' })}
                >
                  Thermal 58mm (Kecil)
                </button>
                <button
                  type="button"
                  className={`filter-pill ${formData.printerPaper === '80mm' ? 'active' : ''}`}
                  style={{ textAlign: 'center', padding: '10px' }}
                  onClick={() => setFormData({ ...formData, printerPaper: '80mm' })}
                >
                  Thermal 80mm (Standar)
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => alert('Mengirim perintah test print ke printer bluetooth/USB...')}
            >
              Test Koneksi Printer Struk
            </button>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-raised)', paddingBottom: '10px' }}>
              <IconBarcode size={18} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Preferensi Scanner Barcode
              </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Bunyi Beep Saat Barcode Terbaca
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Sintesis WebAudio 1400 Hz selama 80 ms
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoBeep}
                onChange={(e) => setFormData({ ...formData, autoBeep: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Getaran Haptic Kamera HP
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Umpan balik fisik getar 60 ms saat scan berhasil
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoVibrate}
                onChange={(e) => setFormData({ ...formData, autoVibrate: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              fontSize: '14px',
            }}
          >
            Simpan Seluruh Pengaturan Toko
          </button>
        </div>
      </form>
    </div>
  );
};
