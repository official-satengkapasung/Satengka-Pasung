# 📸 Dokumentasi Visual Lengkap: Sistem EWS Terpadu "BHUPPA' BHU' GURU RATO"
**Faskes Mitra:** Puskesmas Kokop, Kec. Kokop, Kab. Bangkalan  
**Tanggal Verifikasi:** 10 September 2026  
**Metode Bukti:** Automated Headless Browser Capture (1440x900 Desktop & 412x860 Mobile Viewport)  
**Status UI:** 100% Sesuai Spesifikasi Mockup Wireframe  

---

## 1. 🖼️ Galeri Visual Antarmuka (Carousel Interaktif)

````carousel
![01 - Dashboard Nakes dengan Alert Laporan Baru & Status Mitra](/01-dashboard-nakes-active.png)
<!-- slide -->
![02 - Detail Rekam Medis Kasus & Respons Kiai Butuh Waktu](/02-detail-kasus.png)
<!-- slide -->
![03 - Form Validasi Medis Nakes (Tingkat Prioritas & Lokasi)](/06-validasi-laporan.png)
<!-- slide -->
![04 - Form Aktivasi EWS Notifikasi WhatsApp Mitra 4 Pilar](/07-aktivasi-ews.png)
<!-- slide -->
![05 - Ruang Monitoring Koordinasi & Stopwatch Waktu Respon](/03-monitoring-koordinasi.png)
<!-- slide -->
![06 - Modal Live Chat Terapeutik BGR 4 Pilar Terpadu](/08-live-chat-terapeutik.png)
<!-- slide -->
![07 - Mobile PWA Kader Jiwa (Form Laporan Lapangan & GPS)](/05-mobile-kader-form.png)
<!-- slide -->
![08 - Mobile PWA Kiai (Status Sedang Menghubungi Keluarga)](/04-mobile-kiai-active.png)
<!-- slide -->
![09 - Mobile PWA Kades/Rato (Konfirmasi Pengawalan Evakuasi)](/10-mobile-rato-active.png)
<!-- slide -->
![10 - Halaman Masuk Akun Cerdas Peran Puskesmas Kokop](/00-login-screen.png)
````

---

## 2. 📋 Penjelasan Detail Setiap Tangkapan Layar

### A. Sisi Web Desktop Nakes (Puskesmas Kokop)

1. **Dashboard Nakes dengan Kasus & Laporan Aktif (`01-dashboard-nakes-active.png`):**
   - **Indikator Statistik:** Menampilkan metrik 2 Kasus Butuh Evakuasi, 1 Sedang Koordinasi, dan Total 3 Kasus.
   - **Banner Alert Laporan Baru:** Banner merah menyala memberitahukan laporan baru masuk dari Kader Jiwa (*Rudi - Desa Durjan*) dengan tombol langsung **"Validasi EWS & Pemetaan"**.
   - **Daftar Kasus Membutuhkan Aksi:** Setiap kartu kasus menyertakan indikator status respons mitra secara langsung: `[🕌 Kiai: Butuh Waktu]` (warna amber) dan `[🛡️ Kades: Siap]` (warna biru).
   - **Peta Titik Sebaran:** Menampilkan titik koordinat wilayah kerja Puskesmas Kokop (*Dupok, Durjan, Banda Soleh*).

2. **Detail Kasus Pasien (`02-detail-kasus.png`):**
   - Memuat profil lengkap pasien (*Ahmad, Laki-laki 32 tahun, Desa Kokop*).
   - Banner status koordinasi menampilkan pill status mitra 4 pilar.
   - Tombol navigasi adaptif: **"Buka di Maps"** untuk rute ambulans dan **"Buka Monitoring EWS"** untuk masuk ke ruang kontrol siaga.

3. **Form Validasi Laporan Medis (`06-validasi-laporan.png`):**
   - Nakes memverifikasi data temuan kader, menentukan kategori pasien (*Pasien terdaftar / Pasien baru*), memilih desa dari 13 desa definitif Kokop, dan menetapkan tingkat prioritas (*Normal, Tinggi, Darurat*).

4. **Layar Aktivasi EWS Notifikasi WhatsApp (`07-aktivasi-ews.png`):**
   - Mengaktifkan rantai komando siaga dengan memilih figur **Guru / Kiai** dan **Rato / Kades** setempat.
   - Menyiapkan template pesan persuasif Madura yang siap dikirimkan ke WhatsApp tokoh masyarakat.

5. **Monitoring Koordinasi & Evakuasi (`03-monitoring-koordinasi.png`):**
   - Menampilkan status **SIAGA** dengan stopwatch penghitung waktu respons medis (`00:00:00`).
   - Stepper timeline vertikal mencatat kronologi respon:
     - Kader: *Laporan diterima (10:03)*
     - Guru / Kiai: *Kiai Butuh Waktu (Sedang Telepon Keluarga) (10:04)*
     - Rato / Kades: *Siap mengawal (Terkonfirmasi) (10:05)*
     - Tim Nakes: *Dalam perjalanan (10:20)*

6. **Live Chat Terapeutik Terpadu 4 Pilar (`08-live-chat-terapeutik.png`):**
   - Ruang komunikasi real-time terenkripsi antara Nakes, Kiai, Kades, dan Kader.
   - Dilengkapi tombol cepat template percakapan Madura santun (*"Salam & Mohon Restu Kiai"*, *"Rembuk Santun Keluarga"*, *"Pengawalan Aparat"*).

---

### B. Sisi Mobile PWA (Kader, Guru/Kiai, Rato/Kades)

7. **Mobile Kader - Form Pelaporan Lapangan (`05-mobile-kader-form.png`):**
   - Desain mobile ramah pengguna lapangan: input nama pasien, dropdown 13 desa Kecamatan Kokop, opsi jenis temuan (*Pasung, Tanda Kekambuhan, Lainnya*), tombol ambil foto kamera, dan deteksi GPS.

8. **Mobile Guru / Kiai - Permintaan Rembuk Santun (`04-mobile-kiai-active.png`):**
   - Tampilan khusus tokoh agama. Saat Kiai menekan opsi *"Saya Butuh Waktu / Telepon Dahulu"*, kartu langsung berubah menjadi border oranye dengan badge status *"Sedang Menghubungi Keluarga"* dan tombol *"⏳ Sedang Menghubungi / Butuh Waktu"*.

9. **Mobile Rato / Kades - Pengawalan Evakuasi (`10-mobile-rato-active.png`):**
   - Tampilan khusus Kepala Desa / Aparat. Saat Kades menekan konfirmasi, tombol berubah menjadi *"✓ Sudah Konfirmasi Siap Kawal"* dengan border indigo.

10. **Halaman Masuk Akun (`00-login-screen.png`):**
    - Desain login tunggal cerdas peran dengan logo tunas hijau BGR dan identitas resmi Puskesmas Kokop Bangkalan.

---

## 3. 📁 Lokasi Berkas Gambar Fisik di Komputer

Semua file tangkapan layar beresolusi tinggi tersimpan secara permanen pada folder:
`C:\Users\lenovo\Documents\APP\EWS\docs\screenshots\`
- `00-login-screen.png`
- `01-dashboard-nakes-active.png`
- `02-detail-kasus.png`
- `03-monitoring-koordinasi.png`
- `04-mobile-kiai-active.png`
- `05-mobile-kader-form.png`
- `06-validasi-laporan.png`
- `07-aktivasi-ews.png`
- `08-live-chat-terapeutik.png`
- `10-mobile-rato-active.png`
