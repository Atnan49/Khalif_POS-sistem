# design.md — POS Toko Mainan

Design system untuk dashboard POS toko mainan (pemilik, admin, kasir), diturunkan dari screenshot referensi dashboard bertema hitam–krem–hijau.

> **Sumber nilai.** Warna diambil dari sampel piksel screenshot referensi (907×665 px). Ukuran spasi, radius, dan skala font adalah **estimasi** dari gambar itu, diskalakan ke layar desktop ±1440 px. Font di referensi tidak bisa diidentifikasi pasti; yang dipakai di sini adalah padanan terdekat yang gratis.

---

## 1. Karakter visual

- **Kontras tinggi dan datar.** Kartu hitam pekat di atas bingkai krem. Tidak ada shadow, tidak ada border; pemisahan murni dari warna.
- **Satu aksen.** Hijau dipakai untuk data, nilai aktif, dan tooltip. Merah hanya untuk nilai negatif.
- **Bentuk kapsul.** Hampir semua elemen kecil (tombol, search, label, dropdown) berbentuk pil atau lingkaran. Kartu besar punya radius besar.
- **Angka adalah bintang.** Angka KPI sangat besar, tipis, dan ditaruh di dasar kartu; label kecil di atasnya.

---

## 2. Token warna

| Token | Hex | Pemakaian |
|---|---|---|
| `--bg-frame` | `#C9BBA7` | Bingkai luar aplikasi, tombol sidebar, pill, cakram tengah ring |
| `--surface` | `#000000` | Semua kartu, sidebar, topbar, search |
| `--surface-raised` | `#201D19` | Elemen di atas kartu: hover, track chart, skeleton |
| `--text-primary` | `#E6DCCB` | Judul, angka KPI, label utama di atas hitam |
| `--text-muted` | `#7B7A78` | Placeholder, label sumbu, keterangan delta |
| `--text-on-cream` | `#000000` | Teks/ikon di atas krem |
| `--accent` | `#50A07C` | Garis dan batang chart, arc ring, delta positif |
| `--accent-strong` | `#65A082` | Tooltip, titik penanda aktif |
| `--accent-deep` | `#356B4C` | Latar badge, gradien bawah garis |
| `--danger` | `#D85854` | Delta negatif, transaksi void |
| `--track` | `#C9BBA7` pada opasitas 35% | Lintasan ring (bagian yang belum terisi) |

```css
:root {
  --bg-frame: #C9BBA7;
  --surface: #000000;
  --surface-raised: #201D19;
  --text-primary: #E6DCCB;
  --text-muted: #7B7A78;
  --text-on-cream: #000000;
  --accent: #50A07C;
  --accent-strong: #65A082;
  --accent-deep: #356B4C;
  --danger: #D85854;

  --radius-card: 28px;
  --radius-pill: 999px;
  --gap: 12px;
  --frame-pad: 12px;
}
```

**Aturan penting**

- Hijau **tidak boleh jadi warna teks di atas krem** (kontras hanya ±1,7:1). Di atas krem, teks selalu hitam.
- Teks di atas hijau selalu hitam.
- Warna abu `#5B5B59` yang muncul di screenshot untuk keterangan delta **terlalu redup** (±3,1:1, gagal WCAG AA). Pakai `--text-muted` (#7B7A78, ±4,9:1) sebagai batas terendah.

Rasio kontras (dihitung): teks utama di atas hitam ±15:1, hitam di atas krem ±11:1, hijau di atas hitam ±6,7:1, merah di atas hitam ±5,4:1.

---

## 3. Tipografi

Font: sans geometris/grotesk netral. Gunakan **Inter** (atau Manrope sebagai alternatif). Self-host lewat `@fontsource/inter` supaya tidak bergantung pada Google Fonts.

| Peran | Ukuran | Berat | Catatan |
|---|---|---|---|
| Angka KPI | 64 px / 1 | 400 | `letter-spacing: -0.02em`, `font-variant-numeric: tabular-nums` |
| Judul kartu | 24 px / 1.2 | 400 | Krem terang |
| Label KPI | 18 px / 1.2 | 400 | Di atas angka |
| Angka di ring | 44 px | 400 | Tanda `%` lebih kecil (±50%) |
| Isi / tombol | 14 px | 500 | |
| Keterangan / sumbu | 12 px | 400 | `--text-muted` |

**Format uang.** Selalu `Intl.NumberFormat('id-ID')`, contoh `Rp 972.000`. Kalau lebih dari 7 digit pada kartu KPI, pakai format ringkas (`Rp 12,5 jt`) agar tidak meluap. Semua angka memakai `tabular-nums`.

---

## 4. Bentuk, spasi, elevasi

- **Radius kartu** 28 px; pill dan tombol bulat penuh (999 px).
- **Jarak antar kartu** 12 px; **padding bingkai** 12 px; **padding dalam kartu** 20–24 px.
- **Tanpa shadow dan tanpa border.** Hierarki dibuat dari hitam (kartu) vs krem (bingkai) vs `--surface-raised` (elemen di dalam kartu).
- **Target sentuh** minimal 44×44 px untuk semua tombol ikon (di referensi tombolnya lingkaran ±32 px; di POS dibesarkan karena dipakai di layar sentuh).

---

## 5. Layout

```
┌──────────────────────────────────────────────────────────────┐ bingkai krem
│ [logo]  [  search pill  ]               [ikon pill] [avatar] │ topbar
│ ┌──┐ ┌────────┬────────┬────────┬────────┐                   │
│ │  │ │ KPI 1  │ KPI 2  │ KPI 3  │ KPI 4  │  4 kartu sama lebar│
│ │S │ ├────────┴───┬────┴────────┴────────┤                   │
│ │i │ │ Grafik     │ Ring gauge (3 ring)  │  2 kolom 50/50     │
│ │d │ │ lollipop   │                      │                   │
│ │e │ ├────────────┼──────────────────────┤                   │
│ │b │ │ Area chart │ Bar rentang          │  2 kolom 50/50     │
│ │a │ │            │                      │                   │
│ │r │ └────────────┴──────────────────────┘                   │
│ └──┘                                                           │
└──────────────────────────────────────────────────────────────┘
```

- **Sidebar:** kapsul vertikal hitam, lebar ±56 px, ikon dalam lingkaran krem. Ikon utama di atas; pengaturan, bantuan, keluar menempel di bawah.
- **Topbar:** logo bulat hitam di kiri, search pill hitam memanjang, lalu kapsul hitam berisi 4 tombol ikon bulat, dan pill avatar + nama di paling kanan.
- **Grid konten:** CSS Grid 4 kolom. Baris 1: 4 kartu KPI. Baris 2 dan 3: 2 kartu masing-masing (`span 2`).
- **Responsif:** di bawah 1024 px sidebar jadi bar bawah, kartu KPI jadi 2 kolom, grafik 1 kolom. Di bawah 640 px semua 1 kolom.

---

## 6. Komponen

### Kartu KPI
Hitam, radius 28 px. Ikon krem kecil di kiri atas, label (18 px) di bawahnya, angka 64 px menempel di dasar kartu. Di sebelah angka ada **badge delta**: lingkaran kecil dengan panah (hijau naik, merah turun) + teks `4% (30 hari)` berukuran 12 px, warna `--text-muted`.

### Tombol sidebar / ikon
Lingkaran krem, ikon hitam. State aktif: krem penuh; state tidak aktif bisa memakai `--surface-raised` dengan ikon krem. Fokus keyboard: ring 2 px `--accent-strong` dengan offset 2 px.

### Search pill
Hitam, bulat penuh, lingkaran krem berisi ikon kaca pembesar di kiri, placeholder `--text-muted`.

### Tooltip pill
Hijau (`--accent-strong`), teks hitam, bentuk pil dengan **ekor runcing** di kiri bawah. Muncul di titik data yang aktif, memuat nilai (contoh `Rp 1,5 jt`).

### Label bulan / kategori pada sumbu
Pil krem kecil bertuliskan hitam, diletakkan di dasar batang. Yang aktif berubah menjadi hijau.

### Dropdown pill
Teks krem + chevron, tanpa latar (`2024 ⌄`, `Mingguan ⌄`), membuka menu hitam bersudut besar.

### Radio toggle
Dua opsi (`Tampilkan nilai` / `Grafik`), lingkaran kecil; yang terpilih terisi hijau.

### Tombol utama
Pil krem dengan teks hitam dan ikon (contoh `Simpan Laporan`). Hover: `#D6C9B6`. Disabled: opasitas 40%.

### Badge status
Pil kecil. `Lunas` hijau-dalam (`--accent-deep` + teks krem), `Void` merah (`--danger` + teks hitam).

### Skeleton / loading
Blok `--surface-raised` dengan animasi denyut lambat (1,5 dtk). Hormati `prefers-reduced-motion`.

---

## 7. Grafik

| Jenis | Bentuk | Detail |
|---|---|---|
| **Lollipop** (pendapatan) | Batang vertikal tipis hijau (2 px), bulatan di ujung atas | Label bulan berupa pil krem di batang; titik aktif lebih besar + tooltip |
| **Ring gauge** | Lingkaran dengan arc hijau 8–10 px, lintasan `--track` | Penanda bulat di ujung arc; cakram krem di tengah dengan angka hitam |
| **Area** (transaksi per jam) | Garis hijau halus (kurva monoton) | Isi gradien hijau-dalam ke transparan; garis vertikal putus-putus di titik aktif |
| **Batang rentang** | Batang bulat penuh melayang (min–maks) | Garis acuan horizontal putus-putus; sumbu Y abu 12 px; titik aktif bercincin krem |

Aturan umum:

- Tidak ada grid line penuh; hanya satu garis acuan putus-putus bila perlu.
- Warna data selalu hijau; jangan tambah warna lain. Kalau butuh membedakan seri, pakai hijau vs krem.
- Selalu ada tooltip saat hover/tap, dan nilai bisa dibaca tanpa hover lewat `Tampilkan nilai`.
- Lollipop dan ring digambar dengan SVG sendiri; area dan batang bisa dengan Recharts (bentuk kustom).

---

## 8. Pemetaan ke POS toko mainan

| Widget referensi | Jadi di POS | Sumber data (skema SQL) | Siapa yang melihat |
|---|---|---|---|
| Total Order | Transaksi hari ini | `report_sales_daily` → `trx_count` | Pemilik, admin |
| Total Delivered | Item terjual hari ini | jumlah `sale_items.qty` status `paid` | Pemilik, admin |
| Total Cancelled | Transaksi void | `sales` status `void` | Pemilik, admin |
| Total Revenue | Pendapatan (Rp) | `report_sales_daily` → `revenue` | Pemilik, admin |
| Grafik lollipop | Pendapatan per hari / bulan | `report_sales_daily` | Pemilik, admin |
| Ring gauge | Target harian, stok aman, porsi QRIS | `sales`, `products` vs `min_stock` | Pemilik, admin |
| Area chart | Transaksi per jam | `sales.created_at` | Pemilik, admin |
| Batang rentang | Penjualan per produk / kategori | `sale_items` | Pemilik, admin |
| Tombol "Save Report" | Ekspor laporan (CSV) | hasil query yang tampil | Pemilik, admin |
| Kartu **Laba** (tambahan) | Pendapatan − modal | `report_profit_daily` | **Hanya pemilik** |
| Daftar stok menipis (tambahan) | Produk di bawah stok minimum | view `low_stock` | Pemilik, admin |

Catatan per role:

- **Pemilik:** dashboard penuh + kartu Laba. Tampilkan peringatan kalau `lines_without_cost > 0` (modal belum terisi, laba terlalu tinggi).
- **Admin:** dashboard yang sama tanpa Laba dan tanpa angka modal.
- **Kasir:** **tidak memakai dashboard ini.** Kasir mendapat layar kasir (lihat bagian 9), plus riwayat transaksinya sendiri hari ini.

---

## 9. Layar kasir (turunan gaya yang sama)

Dashboard di referensi dirancang untuk dibaca, bukan untuk dipakai berulang-ulang dengan cepat. Layar kasir memakai token yang sama tapi dengan prioritas berbeda:

- **Dua panel:** kiri grid produk (kartu hitam, nama + harga krem, stok kecil abu), kanan keranjang (kartu krem dengan teks hitam supaya kontras dengan sisi produk).
- **Tombol besar:** tinggi minimal 48 px, tombol bayar hijau dengan teks hitam, jarak antar tombol cukup agar tidak salah tekan.
- **Total** memakai ukuran angka KPI (64 px); kembalian ditampilkan sama besar setelah input uang diterima.
- **Pencarian produk dan scan barcode** selalu terlihat di atas grid, fokus otomatis.
- **Stok habis:** kartu produk diredupkan (`--surface-raised`) dan tidak bisa ditambahkan.
- **Pesan error dari server** (stok kurang, uang kurang) tampil sebagai pill merah di atas keranjang, bukan alert browser.

---

## 10. Gerak

- Durasi 150–250 ms, easing `ease-out`.
- Tooltip muncul dengan fade + naik 4 px.
- Arc ring dan garis area menggambar dari awal saat pertama dimuat (600 ms); setelah itu hanya transisi nilai.
- Hormati `prefers-reduced-motion: reduce` (matikan animasi gambar-ulang).

---

## 11. Aksesibilitas

- Semua kombinasi teks/latar di bagian 2 memenuhi WCAG AA, kecuali yang sudah ditandai tidak boleh dipakai.
- Jangan membedakan naik/turun hanya dengan warna: selalu sertakan panah atau tanda `+` / `−`.
- Setiap grafik punya alternatif teks (tabel ringkas yang bisa dibuka) dan `aria-label` yang menyebut nilai utama.
- Fokus keyboard selalu terlihat.
- Angka uang dibaca utuh oleh pembaca layar (`aria-label="972 ribu rupiah"` bila ditampilkan ringkas).

---

## 12. Boleh dan jangan

| Boleh | Jangan |
|---|---|
| Hitam + krem + satu aksen hijau | Menambah warna aksen lain (biru, ungu, oranye) |
| Pil dan lingkaran untuk elemen kecil | Sudut tajam atau radius kecil pada kartu |
| Angka besar dan tipis | Angka tebal dan rapat |
| Pemisahan dengan warna | Shadow, gradient besar, atau border |
| Teks hitam di atas krem dan hijau | Teks hijau di atas krem |
| Label bahasa Indonesia | Campuran istilah Inggris di UI (kecuali nama merek) |
