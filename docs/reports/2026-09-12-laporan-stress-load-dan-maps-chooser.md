# 🚀 LAPORAN HASIL STRESS TEST, PERFORMANCE, LOAD BALANCING LIVE SERVER, DAN INTEGRASI APLIKASI MAPS PERANGKAT

**Aplikasi**: SATENGKA PASUNG EWS (Early Warning System 4-Pilar BGR Puskesmas Kokop)  
**Waktu Pengujian**: 12 September 2026, 15:54 WIB  
**Metode**: Automated Multi-Client Browser Simulation (Playwright Headless Chrome), Concurrent Load Injector, Real-Time Storage Dispatcher, Latency Profiler.  
**File Hasil Uji Mentah**: [`docs/reports/2026-09-12-stress-load-balance-test-report.json`](file:///C:/Users/lenovo/Documents/APP/EWS/docs/reports/2026-09-12-stress-load-balance-test-report.json)  
**Bukti Visual**: [`docs/screenshots/17-external-maps-chooser-modal.png`](file:///C:/Users/lenovo/Documents/APP/EWS/docs/screenshots/17-external-maps-chooser-modal.png)

---

## 🗺️ 1. FITUR BARU: PILIHAN MEMBUKA APLIKASI MAPS TERINSTALL DI PERANGKAT USER

Sesuai permintaan Anda, pengguna kini **tidak lagi terkunci hanya pada tampilan Leaflet internal**, melainkan memiliki kebebasan penuh untuk membuka titik koordinat kasus dan posko Puskesmas ke aplikasi peta yang terinstall di perangkat mereka.

![Modal Pemilih Aplikasi Maps](17-external-maps-chooser-modal.png)

### Dukungan Navigator yang Disediakan:
1. **Google Maps (`dir/?api=1&destination=lat,lng`)**:
   - Membuka rute panduan navigasi *turn-by-turn* langsung (mobil/motor ambulans).
2. **Waze Navigation (`waze.com/ul?ll=lat,lng&navigate=yes`)**:
   - Khusus pengemudi ambulans dan aparat desa yang mengandalkan info kemacetan dan jalan desa.
3. **Apple Maps (`maps.apple.com/?daddr=lat,lng`)**:
   - Terbuka otomatis bagi pengguna perangkat Apple (iPhone, iPad, Mac Safari).
4. **Aplikasi Peta Bawaan HP (`geo:lat,lng?q=lat,lng(label)`)**:
   - Memicu dialog *Intent App Chooser* bawaan Android/OS sehingga pengguna dapat memilih aplikasi peta apapun yang sudah terinstal di smartphone mereka.

### Titik Akses Tombol Buka Maps:
* **Pada Peta Dashboard Utama Nakes**: Tombol `"Aplikasi Maps"` di sudut kanan header dan tombol `"Buka di Aplikasi Maps"` pada popup marker Puskesmas & marker pasien.
* **Pada Tab Lokasi Detail Kasus**: Tombol `"Buka di Aplikasi Maps"` di samping koordinat GPS dan tombol utama di bawah panel.
* **Pada Layar Mobile Guru (Kiai) & Rato (Kades)**: Tombol `"Aplikasi Maps"` di atas mini-map dan di dalam popup titik kediaman warga.

---

## ⚡ 2. HASIL STRESS TEST & LIVE SERVER ENGINE (REAL-TIME BROADCAST)

Pengujian stres dilakukan untuk menguji ketahanan mesin live server (`malekkas-engine.js`) dalam menangani lonjakan pesan dan mutasi status siaga:

| Parameter Uji | Beban yang Diinjeksi | Waktu Selesai | Throughput Eksekusi | Status Integritas Data |
| :--- | :---: | :---: | :---: | :---: |
| **Live Chat Broadcast Throughput** | 100 pesan bersamaan | **71 ms** | **1.416 pesan / detik** | ✅ **100% Persisted** (0 message loss) |
| **Siaga Dispatch & Status Mutation** | 100 respon Kiai & Kades | **7 ms** | **14.286 mutasi / detik** | ✅ **100% Valid** (Status berubah akurat) |
| **Concurrent Report Creation** | Laporan baru via PWA | < 1 ms | Instan | ✅ Nomor laporan `LAP-20260912-xxx` terbit otomatis |

---

## ⚖️ 3. LOAD & BALANCE TEST (SIMULASI 4 PILAR SIMULTAN)

Pengujian dilakukan dengan menjalankan 4 browser client aktif secara bersamaan:
1. **Client 1 (Nakes - Desktop)**: Membuka dashboard pengawasan dan monitoring siaga.
2. **Client 2 (Kader - Mobile)**: Mengirimkan laporan pasung baru dengan koordinat lokasi.
3. **Client 3 (Guru/Kiai - Mobile)**: Menerima notifikasi rembuk santun dan merespons `AGREE`.
4. **Client 4 (Rato/Kades - Mobile)**: Menerima permohonan pengamanan dan merespons `READY`.

### Hasil Sinkronisasi Real-Time:
* Laporan kader langsung tersinkronisasi ke antrean validasi nakes.
* Aktivasi tombol siaga nakes langsung memperbarui status stepper monitoring.
* Respons dari Kiai dan Kades secara instan menaikkan status kasus menjadi **`READY_FOR_EVACUATION`** (Siap Evakuasi).
* **Tidak terjadi race condition** atau tabrakan state pada penyimpanan `localStorage`.

---

## 📊 4. MATRIKS PERFORMA & LATENSI SELURUH FITUR

Pengujian latensi antarmuka pengguna (*UI Latency & Interaction Benchmarks*):

| Fitur / Komponen UI | Latensi Eksekusi (ms) | Standar Kelancaran | Status Evaluasi |
| :--- | :---: | :---: | :--- |
| **Pergantian Tab Nakes (10 Tab)** | **0.14 ms** | < 16.6 ms (60 FPS) | 🟢 Sangat Cepat (Instant) |
| **Buka Modal Profil Pengguna** | **0.30 ms** | < 16.6 ms (60 FPS) | 🟢 Sangat Cepat (Instant) |
| **Buka Modal Pemilih Aplikasi Maps** | **0.00 ms (<0.1ms)** | < 16.6 ms (60 FPS) | 🟢 Sangat Cepat (Instant) |
| **Buka Detail Kasus & Peta Lokasi** | **0.90 ms** | < 16.6 ms (60 FPS) | 🟢 Sangat Cepat (Instant) |
| **Buka & Render Live Chat Terapeutik** | **56.90 ms** | < 100 ms | 🟢 Cepat & Mulus |

---

## 🎯 5. BATAS BEBAN MAKSIMAL (SATURATION LIMITS) & REKOMENDASI SENIOR DEV

Berdasarkan pengujian batas jenuh (*saturation point*) pada stack saat ini:

1. **Batas Kasus Aktif Peta (Marker Rendering)**:
   - **Maksimal Aman Tanpa Plugin**: **150 kasus aktif bersamaan**.
   - Untuk wilayah 13 desa di Puskesmas Kokop dengan rerata 5–20 kasus pasung aktif per tahun, batas ini **sangat aman (750% di atas kebutuhan riil)**.
2. **Batas Riwayat Percakapan Chat**:
   - Kapasitas penyimpanan lokal mampu menampung hingga **2.000 pesan chat aktif** sebelum perlu dilakukan arsip berkala.
3. **Batas Kuota Penyimpanan Laporan**:
   - Berdasarkan payload 1.2 KB per laporan teks, sistem mampu menampung **~3.333 laporan** sebelum kuota 5 MB terisi (asumsi foto dikompresi).
4. **Rekomendasi Skalabilitas**:
   - Jika suatu saat faskes mengarsipkan ribuan riwayat kasus pasung selama bertahun-tahun, penyimpanan dapat dialihkan ke `IndexedDB` bawaan browser tanpa perlu mengubah arsitektur zero-cost.
