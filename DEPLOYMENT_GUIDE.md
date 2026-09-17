# PANDUAN DEPLOYMENT KE RUMAHWEB ENTRY / SMALL
### Proyek: SATENGKA PASUNG EWS (Bhuppa' Bhu' Guru Rato')

Arsitektur aplikasi ini telah didesain khusus agar **100% kompatibel dan ringan** pada paket hosting Rumahweb Entry/Small (Resource: 1 Core CPU, 512 MB RAM, Entry Process 10, NPROC 20).

---

## Langkah 1: Setup Database MySQL di cPanel Rumahweb

1. Buka **cPanel** akun Rumahweb Anda.
2. Buka menu **MySQL® Databases**:
   - Buat database baru (misalnya: `u123456_ews`).
   - Buat user database baru (misalnya: `u123456_dbuser`) dan buat password yang kuat.
   - Sambungkan user ke database tersebut dengan mencentang **ALL PRIVILEGES**.
3. Buka menu **phpMyAdmin**:
   - Klik nama database yang baru dibuat di panel kiri.
   - Klik tab **Import**.
   - Pilih file `schema.sql` dari komputer Anda, lalu klik **Go**.
   - Setelah sukses, lakukan Import kembali untuk file `seed.sql` untuk mengisi data master awal.

---

## Langkah 2: Konfigurasi Koneksi Database di File PHP

Buka file [api/config.php](file:///C:/Users/lenovo/Documents/APP/EWS/api/config.php) dan sesuaikan 4 baris berikut:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456_ews');       // Sesuaikan nama database cPanel Anda
define('DB_USER', 'u123456_dbuser');    // Sesuaikan username database cPanel
define('DB_PASS', 'PasswordDatabaseAnda'); // Sesuaikan password database
```

---

## Langkah 3: Unggah (Upload) File ke File Manager cPanel

1. Buka menu **File Manager** di cPanel.
2. Masuk ke folder `public_html/` (atau folder subdomain Anda).
3. Upload seluruh file dan folder berikut:
   - `index.html` (Halaman antarmuka utama)
   - `api/` (Folder berisi `config.php`, `auth.php`, `cases.php`)
   - `uploads/` (Folder penyimpanan foto pelaporan, pastikan permission foldernya `755`)
   - `.htaccess` (Pengaturan rewrite & proteksi direktori)

---

## Langkah 4: Cara Pengujian Alur 4 Peran (Role)

Aplikasi telah dilengkapi **Role Switcher** di pojok kanan atas:

1. **Role KADER JIWA:**
   - Buka form pelaporan minimalis ramah lansia (3 tombol: Foto, GPS, Kirim).
   - Kirim laporan temuan pasung baru.
2. **Role NAKES PUSKESMAS:**
   - Laporan baru muncul di dashboard dengan indikator merah.
   - Nakes mengklik **Aktivasi EWS** dan memilih rekomendasi Kiai (Guru) & Kades (Rato) desa setempat.
   - Tombol Siaga aktif, timer stopwatch berjalan, dan tombol direct **WhatsApp (wa.me)** siap digunakan untuk menghubungi Kiai & Kades tanpa biaya pihak ketiga.
3. **Role GURU (KIAI):**
   - Kiai melihat kartu permintaan doa & bimbingan dengan draf teks terapeutik Islami (*Rembuk Santun*).
   - Kiai mengklik tombol `Insya Allah Saya Bantu`.
4. **Role RATO (KADES):**
   - Kades melihat instruksi pengawalan pengamanan.
   - Kades mengklik tombol `Siap Kawal di Lapangan`.
5. **Kembali ke NAKES:**
   - Setelah pilar Guru & Rato siap, status otomatis berganti menjadi **SIAP EVAKUASI**.
   - Nakes mengklik **Lakukan Evakuasi Sekarang** hingga tahap monitoring pasca-pasung.
