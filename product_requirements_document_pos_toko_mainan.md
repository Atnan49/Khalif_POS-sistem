# Product Requirements Document (PRD)
## Sistem Point of Sale (POS) & Inventaris Toko Mainan

**Versi Dokumen:** 1.0  
**Status:** Siap Implementasi (Database, Design System & Modul Scanner Terverifikasi)  
**Target Platform:** Web Responsif (Mobile-First untuk HP Kasir & Desktop/Tablet untuk Meja Kasir/Backoffice)  

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Sistem POS Toko Mainan ini dirancang untuk memberikan kecepatan transaksi setara aplikasi kasir modern (seperti Saku POS) namun dengan pengendalian internal dan keamanan data yang jauh lebih ketat sesuai kebutuhan operasional toko ritel mainan.

### 1.1 Masalah Utama yang Diselesaikan
1. **Kendala Scan Barcode via Kamera HP:** Aplikasi web POS umumnya lambat, buram, atau sering salah baca saat memindai barcode batang (1D) menggunakan kamera HP.
2. **Kebocoran Informasi Harga Modal & Laba:** Staf kasir maupun admin gudang tidak boleh mengetahui harga beli (modal) dari pemasok maupun margin keuntungan pemilik toko.
3. **Manipulasi Transaksi & Selisih Stok:** Mencegah kasir memanipulasi harga dari browser, membatalkan transaksi secara sepihak, atau mengubah angka stok tanpa jejak audit.

### 1.2 Sasaran Utama (Key Objectives)
* **Kamera HP sebagai Pemindai Utama:** Memastikan pemindaian barcode batang (1D) dan QR melalui kamera HP berjalan cepat, tajam, dan bebas salah baca, sekaligus tetap mendukung alat *laser scanner* (USB/Bluetooth) secara otomatis di latar belakang.
* **Keamanan Berbasis Peran di Level Database (Row-Level Security):** Memisahkan hak akses secara tegas antara **Pemilik**, **Admin**, dan **Kasir** langsung di dalam PostgreSQL/Supabase.
* **Integritas Stok & Kas 100% di Server:** Seluruh perhitungan total belanja, kembalian, dan pemotongan stok dieksekusi secara atomik di server database.

---

## 2. Peran Pengguna & Matriks Hak Akses (RBAC)

Sistem memiliki 3 peran pengguna (`role`) yang dikontrol melalui tabel `profiles` dan kebijakan *Row-Level Security* (RLS) di Supabase. Pengguna dengan status `is_active = false` otomatis kehilangan seluruh akses baca dan tulis di database.

| Fitur / Kapabilitas | Kasir (`kasir`) | Admin (`admin`) | Pemilik (`pemilik`) |
| :--- | :---: | :---: | :---: |
| Melihat katalog produk aktif & stok tersedia | Ya | Ya | Ya |
| Membuat transaksi penjualan tunai (`create_sale`) | Ya | Ya | Ya |
| Melihat riwayat transaksi penjualan | Hanya miliknya hari ini (WIB) | Semua transaksi | Semua transaksi |
| Membatalkan transaksi (`void_sale`) | Tidak | Ya | Ya |
| Menambah, mengubah, & menonaktifkan produk | Tidak | Ya | Ya |
| Melakukan penyesuaian stok / *restock* (`adjust_stock`) | Tidak | Ya | Ya |
| Melihat riwayat pergerakan stok (`stock_movements`) | Tidak | Ya | Ya |
| Melihat laporan omzet penjualan harian | Tidak | Ya | Ya |
| **Melihat & mengisi Harga Modal produk** | **Tidak** | **Tidak** | **Ya (Eksklusif)** |
| **Melihat Laporan Laba Bersih (`report_profit_daily`)** | **Tidak** | **Tidak** | **Ya (Eksklusif)** |
| Membuat & menonaktifkan akun staf (Admin/Kasir) | Tidak | Tidak | **Ya (Eksklusif)** |

### Catatan Aturan Keamanan Database
* **Pemisahan Tabel Harga Modal:** Karena RLS PostgreSQL bekerja per baris (bukan per kolom), harga modal disimpan di tabel terpisah yang hanya memiliki kebijakan `SELECT`/`INSERT`/`UPDATE` untuk peran `pemilik`.
* **Isolasi Riwayat Kasir:** Kebijakan `sales_select` membatasi peran `kasir` agar hanya dapat melihat transaksi yang dibuat oleh `auth.uid()` miliknya sendiri pada tanggal hari ini menurut zona waktu `Asia/Jakarta` (WIB).
* **Penghapusan Lunak (Soft Delete):** Produk tidak pernah dihapus permanen (`DELETE` ditolak), melainkan dinonaktifkan (`is_active = false`) agar histori transaksi masa lalu tetap utuh.

---

## 3. Spesifikasi Fungsional per Modul

### 3.1 Modul Pemindai Barcode Hibrida (`scan-core.ts` & `scanner.tsx`)
Modul ini menjadi komponen inti pada layar kasir dan form produk.

1. **Mode Default & Pergantian Mode (`useScanMode`):**
   * Saat aplikasi dibuka pertama kali, mode pemindai otomatis diatur ke **Kamera HP (`camera`)** dan disimpan di `localStorage`.
   * Kasir dapat beralih ke mode **Scanner Laser (`laser`)** kapan saja untuk menghemat baterai atau ruang layar.
2. **Optimalisasi Kamera HP untuk Barcode Batang (`useCameraScanner`):**
   * **Resolusi Tinggi:** Meminta stream video belakang (`facingMode: 'environment'`) pada resolusi ideal $1920 \times 1080\text{ px}$ (fallback ke $1280 \times 720\text{ px}$) dengan frame rate $30\text{ fps}$.
   * **Pemotongan Area Baca (ROI) Tanpa Downscale:** Hanya memproses area tengah sebesar $92\%$ lebar $\times 46\%$ tinggi (`ROI = { w: 0.92, h: 0.46 }`) langsung dari piksel asli video tanpa diperkecil, menjaga ketajaman garis tipis barcode.
   * **Kontrol Perangkat Keras Kamera:** Mengaktifkan `focusMode: 'continuous'` secara otomatis jika didukung perangkat, serta menyediakan tombol **Senter (`torch`)** dan penggeser **Zoom** (hingga $4\times$) di atas video.
   * **Mesin Dekode Ganda (Dual Engine):** Menggunakan `BarcodeDetector` bawaan browser (Chrome Android) jika mendukung `ean_13`, atau otomatis beralih ke `zxing-wasm` (Safari iOS, Firefox, dll.) yang dimuat dari bundel lokal aplikasi (bukan CDN eksternal) dengan interval pemindaian $80\text{ ms}$ ($\approx 12\text{ fps}$).
3. **Validasi & Pencegahan Salah Baca (`acceptable` & `isValidGtin`):**
   * Format yang didukung: `EAN-13`, `EAN-8`, `UPC-A`, `Code128`, dan `QRCode`.
   * Barcode ritel (`EAN-13`, `EAN-8`, `UPC-A`) wajib lolos perhitungan matematis digit pemeriksaan (*checksum* GTIN).
   * Label SKU internal (`Code128`) yang tidak memiliki checksum GTIN wajib terbaca 2 kali secara identik dalam rentang waktu $< 800\text{ ms}$ sebelum diteruskan ke keranjang.
   * **Deduplikasi & Umpan Balik:** Kode yang sama diabaikan selama $1500\text{ ms}$ setelah berhasil dipindai. Setiap pembacaan sah memicu getaran ($60\text{ ms}$) dan bunyi *beep* singkat ($1400\text{ Hz}$ selama $80\text{ ms}$).
4. **Pendeteksi Laser Scanner / HID (`useWedgeScanner` & `WedgeParser`):**
   * Selalu aktif di latar belakang baik saat mode Kamera maupun mode Laser dipilih.
   * Membedakan tembakan *laser scanner* dari ketikan manusia berdasarkan jeda waktu antar karakter ($\le 50\text{ ms}$), panjang minimal $4$ karakter, dan tombol penutup `Enter` atau `Tab`.
   * Elemen `<input>` biasa tidak akan terganggu saat kasir mengetik, namun kolom pencarian produk yang diberi atribut `data-allow-scan` tetap dapat menerima tembakan *scanner* dan otomatis dikosongkan setelah kode berhasil ditangkap.

---

### 3.2 Modul Layar Kasir / POS Checkout
Dirancang khusus untuk kecepatan transaksi tinggi di HP maupun Desktop.

1. **Pencarian Produk Instan & Aman:**
   * Katalog produk aktif dimuat ke memori lokal saat halaman kasir dibuka agar pencocokan hasil scan `barcode` atau `sku` berjalan instan ($0\text{ ms}$).
   * Jika produk dicari langsung ke database Supabase, query **wajib** menggunakan pemanggilan `.eq('barcode', code)` dan `.eq('sku', code)` secara terpisah (dilarang menggabungkan input mentah ke dalam string `.or()` untuk mencegah manipulasi filter).
2. **Manajemen Keranjang Belanja:**
   * Memindai barcode yang sama akan menambah kuantitas (`qty`) item sebesar $+1$ di keranjang.
   * Tombol tambah/kurang kuantitas dan hapus item dengan ukuran area sentuh minimal $44 \times 44\text{ px}$.
   * Validasi batas stok di antarmuka: kuantitas di keranjang tidak boleh melebihi stok produk yang tersedia.
3. **Pembayaran Tunai & Penyelesaian Transaksi:**
   * Menampilkan total tagihan dengan ukuran tipografi besar dan jelas.
   * Menyediakan tombol nominal cepat: **Uang Pas**, **Rp 50.000**, **Rp 100.000**, serta input angka manual.
   * Saat tombol **Bayar** ditekan, aplikasi memanggil RPC `create_sale(items, cash_received)`.
   * Server memvalidasi ketersediaan stok, menghitung ulang harga dari tabel produk, memotong stok, mencatat mutasi keluar di `stock_movements`, dan mengembalikan rincian transaksi beserta nominal kembalian.
   * Menampilkan dialog Transaksi Berhasil yang memuat rincian kembalian, tombol **Cetak Struk / Bagikan**, dan tombol **Transaksi Baru**.

---

### 3.3 Modul Manajemen Produk, Stok & Harga Modal
Diakses oleh **Admin** dan **Pemilik** (dengan bagian harga modal terkunci khusus **Pemilik**).

1. **Manajemen Katalog Produk:**
   * Form tambah dan ubah produk: Nama Produk, SKU, Barcode (dilengkapi tombol buka kamera untuk langsung memindai kemasan mainan), Harga Jual, dan Status Aktif (`is_active`).
   * Stok awal produk baru selalu dimulai dari $0$ dan tidak dapat diubah langsung melalui perintah `UPDATE` biasa pada tabel produk.
2. **Penyesuaian & Mutasi Stok (`adjust_stock`):**
   * Penambahan stok (*restock* barang datang), koreksi opname, atau pencatatan barang rusak wajib melalui fungsi RPC `adjust_stock`.
   * Setiap perubahan stok wajib menyertakan jenis mutasi dan catatan alasan, yang otomatis terekam di tabel audit `stock_movements` beserta identitas staf dan waktu kejadian.
3. **Pengelolaan Harga Modal (Khusus Pemilik):**
   * Pemilik dapat memasukkan dan memperbarui harga modal per produk.
   * Antarmuka menampilkan lencana peringatan (*badge warning*) pada daftar produk apabila terdapat produk aktif yang belum memiliki data harga modal (agar laporan laba tidak bias).

---

### 3.4 Modul Dashboard Analitik, Riwayat Transaksi & Void
1. **Dashboard Eksekutif (Pemilik & Admin):**
   * **Kartu Metrik Utama:** Total Omzet Hari Ini, Jumlah Transaksi, dan Barang Terjual.
   * **Kartu Laba Bersih (Khusus Pemilik):** Menampilkan Pendapatan, HPP (Modal), Laba Kotor/Bersih dari fungsi `report_profit_daily`, serta indikator `lines_without_cost` jika ada barang terjual yang harga modalnya belum diisi.
   * **Grafik Tren Penjualan:** Visualisasi perbandingan performa penjualan harian/mingguan.
2. **Riwayat Transaksi & Pembatalan (`void_sale`):**
   * Kasir hanya melihat daftar transaksinya sendiri pada hari ini (WIB) untuk keperluan cek ulang struk.
   * Admin dan Pemilik dapat memfilter riwayat transaksi berdasarkan rentang tanggal dan kasir.
   * Admin dan Pemilik dapat membatalkan transaksi yang salah melalui tombol **Void** (memanggil RPC `void_sale` dengan alasan pembatalan). Transaksi yang di-void otomatis mengembalikan stok barang ke gudang, mencatat mutasi pengembalian di `stock_movements`, dan tidak dapat di-void untuk kedua kalinya.

---

### 3.5 Modul Manajemen Akun Staf (Khusus Pemilik)
1. **Pembuatan Akun Terpusat:**
   * Pendaftaran publik (*public sign-up*) pada Supabase Auth **wajib dimatikan**.
   * Pemilik membuat akun staf baru (nama, email, password awal, dan peran `admin` atau `kasir`) melalui halaman Manajemen Staf yang memanggil **Supabase Edge Function** (menggunakan `service_role` di sisi server).
2. **Penonaktifan Staf:**
   * Pemilik dapat mengubah status `is_active` staf menjadi `false` kapan saja untuk mencabut akses kasir/admin secara instan tanpa merusak riwayat transaksi yang pernah dibuat oleh staf tersebut.

---

## 4. Sistem Desain & Antarmuka Pengguna (`design.md`)

Seluruh komponen antarmuka wajib mematuhi token desain yang telah distandarisasi dan lolos uji kontras aksesibilitas WCAG AA.

### 4.1 Token Warna & Aturan Kontras
| Token CSS | Nilai Hex | Penggunaan Utama |
| :--- | :--- | :--- |
| `--bg-canvas` | `#000000` | Latar belakang utama aplikasi (Hitam pekat) |
| `--surface-cream` | `#C9BBA7` | Kartu aksen utama, panel keranjang kasir, kartu ringkasan |
| `--text-primary` | `#E6DCCB` | Teks utama di atas permukaan gelap |
| `--text-secondary` | `#7B7A78` | Teks sekunder / keterangan delta (rasio kontras $\approx 4.9:1$ di atas hitam, lulus WCAG AA) |
| `--accent-green` | `#50A07C` / `#65A082` | Indikator positif, bingkai fokus ROI scanner, tombol aksi utama |
| `--accent-red` | `#D85854` | Indikator negatif, peringatan stok habis, tombol Void |

**Aturan Visual Wajib:**
* **Dilarang** menempatkan teks hijau (`#50A07C`) langsung di atas latar krem (`#C9BBA7`) karena rasio kontrasnya hanya $\approx 1.7:1$. Gunakan teks hitam atau bungkus dalam *pill badge* gelap.
* Tipografi utama menggunakan keluarga font **Inter** (`sans-serif`) dengan `font-variant-numeric: tabular-nums` pada seluruh angka harga, stok, dan laporan agar sejajar vertikal.
* Radius sudut kartu utama (`--radius-card`) adalah $28\text{ px}$, dan seluruh tombol interaktif wajib memiliki tinggi/lebar sentuh minimal $44\text{ px}$.

### 4.2 Pemisahan Tata Letak berdasarkan Peran
1. **Tata Letak Dashboard (Pemilik & Admin):** Menampilkan navigasi analitik, kartu KPI krem/gelap, grafik tren, manajemen katalog, dan laporan.
2. **Tata Letak Kasir (Fokus Kecepatan):**
   * **Tampilan Layar Lebar (Tablet/Desktop):** 2 kolom — Kolom kiri memuat `ScannerPanel` dan grid produk; Kolom kanan memuat panel keranjang krem (`#C9BBA7`) yang selalu terlihat.
   * **Tampilan Layar HP (Vertikal):** 1 kolom — `ScannerPanel` berada di bagian atas (dapat dilipat/sembunyikan), diikuti bilah pencarian dan daftar produk. Keranjang belanja melayang di bagian bawah layar (*sticky bottom bar*) yang saat diketuk akan membuka panel penuh (*bottom sheet*) untuk pembayaran.

---

## 5. Arsitektur Teknis & Keamanan

* **Frontend:** React 18+, Vite, TypeScript.
* **Pemindai Barcode:** Native Web `BarcodeDetector` API + `zxing-wasm` (WASM disajikan dari aset statis lokal).
* **Backend & Database:** Supabase (PostgreSQL 16, Supabase Auth, Row-Level Security, PostgreSQL RPC Functions, Supabase Edge Functions).
* **Hosting & Deployment:** Cloudflare Pages (Wajib menggunakan **HTTPS** agar API `navigator.mediaDevices.getUserMedia` untuk kamera HP diizinkan oleh browser).

---

## 6. Tahapan Implementasi & Kriteria Penerimaan (Roadmap)

### Tahap 1: Pondasi Proyek & Layar Kasir (Prioritas Utama)
* **Ruang Lingkup:** Setup proyek React + Vite + TypeScript, konfigurasi klien Supabase, halaman Login, integrasi `ScannerPanel` (`scanner.tsx`), katalog produk kasir, keranjang belanja responsif (HP & Desktop), dan eksekusi pembayaran via RPC `create_sale`.
* **Kriteria Penerimaan:**
  * Kasir dapat login, memindai barcode mainan dengan kamera HP (default) maupun laser scanner, melihat barang masuk ke keranjang, memasukkan nominal tunai, dan menyelesaikan transaksi hingga stok berkurang otomatis.

### Tahap 2: Manajemen Produk, Stok & Harga Modal
* **Ruang Lingkup:** Halaman daftar produk, form tambah/edit produk dengan bantuan kamera pemindai barcode, dialog penyesuaian stok (`adjust_stock`), log riwayat `stock_movements`, serta form input harga modal khusus Pemilik.
* **Kriteria Penerimaan:**
  * Admin dapat menambah produk baru dan melakukan *restock*.
  * Admin dan Kasir sama sekali tidak dapat melihat kolom/form harga modal, sedangkan Pemilik dapat melihat dan mengubah harga modal.

### Tahap 3: Dashboard Analitik, Riwayat Penjualan & Void
* **Ruang Lingkup:** Implementasi visual sesuai `design.md` untuk kartu KPI penjualan, grafik tren, laporan laba harian (`report_profit_daily` khusus Pemilik), daftar riwayat transaksi, dan fitur pembatalan transaksi (`void_sale`).
* **Kriteria Penerimaan:**
  * Kasir hanya melihat transaksinya hari ini (WIB) dan tidak melihat tombol Void.
  * Admin & Pemilik dapat melakukan Void transaksi, dan stok barang terbukti kembali bertambah sejumlah item yang dibatalkan.

### Tahap 4: Manajemen Akun Staf & Finalisasi Produksi
* **Ruang Lingkup:** Pembuatan Supabase Edge Function untuk pembuatan akun staf oleh Pemilik, halaman pengelolaan staf (tambah akun & toggle aktif/nonaktif), serta pengujian menyeluruh sebelum rilis ke Cloudflare Pages.
* **Kriteria Penerimaan:**
  * Pemilik dapat membuat akun Kasir/Admin baru langsung dari aplikasi, dan akun yang dinonaktifkan langsung tertolak saat mencoba mengambil data atau membuat transaksi.