# Khalif Mainan - POS & Sistem Inventaris Toko

Aplikasi Kasir (Point of Sale) dan Manajemen Inventaris Modern untuk Toko Grosir & Eceran Mainan Anak Edukatif **Khalif Mainan**.

Didesain dengan antarmuka bertema *signature luxury* (Warm Cream Frame `#C9BBA7` dengan kartu hitam `#000000`, tipografi krem, dan tombol pill solid tanpa border beveled), performa responsif, serta alur kerja kasir yang cepat dan efisien.

---

## Fitur Utama

1. **Kasir / POS (Point of Sale)**
   - Pemindai barcode hibrida: Mendukung kamera HP / webcam (dengan area baca tajam ROI 92% × 46% & animasi laser scan) dan scanner laser USB.
   - Umpan balik audio *beep* 1400 Hz (WebAudio) & getar haptik fisik saat scan berhasil.
   - Keranjang kasir interaktif, tombol nominal tunai cepat (Uang Pas, 50k, 100k, 200k), kalkulasi kembalian otomatis.
   - Cetak struk belanja thermal (format 58mm / 80mm).

2. **Katalog & Stok Barang**
   - Katalog produk lengkap dengan visualisasi status stok (tersedia, menipis, habis).
   - **Fitur Scan Barcode Tambah Produk Baru**: Pemindaian barcode kamera langsung di modal tambah produk serta generator barcode otomatis standar EAN-13 Indonesia (`899...`).
   - Riwayat mutasi dan penyesuaian stok per unit.

3. **Return & Pengembalian Barang**
   - Verifikasi nomor faktur pembelian asli sebelum klaim retur.
   - Pencatatan alasan retur (rusak pabrik, salah beli, tukar varian) dengan otomatisasi restock.

4. **Hutang & Piutang Pelanggan**
   - Pencatatan bon hutang tempo dengan batas tanggal jatuh tempo.
   - Pembayaran cicilan bertahap dan pelunasan bon.

5. **Buku Kas & Saldo Laci Kasir**
   - Rekap arus uang tunai fisik di laci kasir (modal awal, pengeluaran operasional, setoran kasir).

6. **Laporan Penjualan & Audit**
   - Analisis omzet, rekap transaksi per shift / harian.
   - Fitur pembatalan transaksi (*Void*) dengan pengembalian stok otomatis.
   - Ekspor data laporan ke format CSV.

7. **Manajemen Staf & Keamanan Akses**
   - Pembagian hak akses berjenjang (Pemilik Toko, Admin, Kasir).
   - Pengaturan toko (printer bluetooth/thermal, ukuran kertas struk, preferensi scanner).

---

## Teknologi

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS kustom (Design tokens, glassmorphism, responsive pill layout)
- **Audio Feedback**: WebAudio API (Sintesis gelombang sinus 1400 Hz)

---

## Menjalankan Proyek Secara Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/Atnan49/Khalif_POS-sistem.git
   cd Khalif_POS-sistem
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```
