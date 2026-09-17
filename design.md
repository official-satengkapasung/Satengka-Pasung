# Dokumen Desain Sistem: Manajemen Peran Pengguna dan Batasan Akses (Bhuppa’ Bhu’ Guru Rato’)

Dokumen ini mendefinisikan arsitektur hak akses (access control), peran pengguna (user roles), dan batasan fungsional untuk platform hibrida **Sistem Peringatan Dini (EWS) dan Evakuasi ODGJ Pasung di Madura**. Sistem ini dirancang untuk mendigitalisasi model komunikasi terapeutik dengan mengintegrasikan struktur budaya lokal Madura: **Bhuppa’ Bhu’** (Keluarga), **Guru** (Tokoh Agama/Kiai), dan **Rato** (Pemerintah/Aparat Desa), serta **Tenaga Kesehatan (Nakes) / Kader Jiwa** sebagai motor penggerak medis [1].

---

## 1. Arsitektur 4 Sisi Pengguna (4-Sided User Architecture)

Sistem ini membagi pengguna ke dalam 4 peran utama berdasarkan peran sosial-kultural dan tanggung jawab medis mereka dalam proses evakuasi dan monitoring pasca-pasung [1, 10].

```
                  ┌────────────────────────────────────────┐
                  │      Tenaga Kesehatan / Puskesmas       │ (Web Dashboard - Kontrol Penuh)
                  └───────────────────┬────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   Kader Jiwa    │          │  Tokoh Agama    │          │ Pemerintah Desa │
│ (Bhuppa' Bhu')  │          │     (Guru)      │          │     (Rato)      │
└─────────────────┘          └─────────────────┘          └─────────────────┘
 (WA Gateway / Web)            (WA Gateway Khusus)          (WA Gateway / Web)
```

### Sisi 1: Tenaga Kesehatan (Nakes) & Admin Puskesmas
*   **Representasi Peran:** Koordinator medis utama di tingkat kecamatan (Puskesmas Kokop/mitra) [13, 27].
*   **Media Akses utama:** Web Dashboard (Desktop/Mobile-responsive).
*   **Tanggung Jawab Utama:**
    *   Memvalidasi laporan kasus pasung baru atau kekambuhan (re-pasung) [1, 13].
    *   Mengelola database medis pasien ODGJ pasung [21].
    *   Mengaktifkan pemicu peringatan dini (EWS Trigger) ke pilar Guru dan Rato [1].
    *   Menentukan rekomendasi protokol evakuasi dan koordinasi medis dengan rumah sakit rujukan [1, 13].
    *   Memantau metrik efisiensi waktu respons evakuasi (target penurunan durasi $\ge 30\%$) [25].

### Sisi 2: Kader Jiwa / Pendamping Keluarga (Representasi Bhuppa’ Bhu’)
*   **Representasi Peran:** Penghubung langsung antara keluarga pasien (Bhuppa' Bhu') dengan layanan kesehatan [10, 11]. Kader Jiwa bertindak sebagai advokat keluarga yang dipercaya secara lokal.
*   **Media Akses utama:** WhatsApp Gateway (Input/Laporan) & Web Dashboard (Akses Terbatas).
*   **Tanggung Jawab Utama:**
    *   Melaporkan indikasi pasung atau tanda-tanda kekambuhan ODGJ di lingkungan RT/RW via WA Gateway [1].
    *   Melakukan pembaruan kondisi harian pasien pasca-evakuasi untuk mencegah pasung ulang (re-pasung) [1].
    *   Mendampingi keluarga (Bhuppa' Bhu') dalam menerapkan komunikasi terapeutik mandiri di rumah [1, 11].

### Sisi 3: Tokoh Agama / Kiai (Representasi "Guru")
*   **Representasi Peran:** Otoritas spiritual dan moral yang ditaati oleh masyarakat Madura [1, 27]. Guru memiliki pengaruh krusial dalam mereduksi resistensi kultural keluarga terhadap evakuasi medis [1].
*   **Media Akses utama:** WhatsApp Gateway (Interaktif/Satu Tombol).
*   **Tanggung Jawab Utama:**
    *   Menerima notifikasi peringatan dini (EWS) ketika ada warga di sekitarnya yang membutuhkan evakuasi [1].
    *   Menerima rekomendasi "SOP Komunikasi Terapeutik" (pesan persuasi keagamaan yang sopan) untuk disampaikan kepada keluarga [1].
    *   Memberikan umpan balik (persetujuan/rekomendasi pendekatan) kepada Puskesmas melalui sistem chat WA terintegrasi [1].

### Sisi 4: Aparat Desa / Kepala Desa / Bhabinkamtibmas (Representasi "Rato")
*   **Representasi Peran:** Otoritas formal/pemerintahan lokal yang menjamin aspek legalitas, keamanan, dan dukungan logistik saat evakuasi [1, 10].
*   **Media Akses utama:** Web Dashboard (Viewer Terbatas) & WhatsApp Gateway.
*   **Tanggung Jawab Utama:**
    *   Menerima notifikasi koordinasi evakuasi resmi dari Puskesmas [1].
    *   Menerbitkan izin lingkungan dan memfasilitasi pengamanan proses evakuasi guna mereduksi konflik sosial [1].
    *   Mendukung pengawasan lingkungan agar pasien yang telah dievakuasi tidak mengalami re-pasung oleh keluarga [1].

---

## 2. Matriks Hak Akses & Batasan (Access Control Matrix)

Untuk menjaga kerahasiaan data medis pasien (sesuai UU Pelindungan Data Pribadi) sekaligus memastikan kolaborasi berjalan lancar, berikut matriks batasan akses fitur sistem:

| Fitur / Modul Sistem | Sisi 1: Nakes & Admin (Puskesmas) | Sisi 2: Kader Jiwa (Bhuppa' Bhu' Liaison) | Sisi 3: Tokoh Agama (Guru) | Sisi 4: Pemerintah Desa (Rato) |
| :--- | :---: | :---: | :---: | :---: |
| **Peta Sebaran Kasus (GIS)** | **Full Access** (Detail lokasi & data klinis) | **Terbatas** (Hanya melihat wilayah desanya saja) | **No Access** (Kerahasiaan pasien) | **Terbatas** (Hanya statistik jumlah tanpa nama detail) |
| **Database Rekam Medis ODGJ** | **Full Access** (CRUD data medis & psikologis) | **Read-Only** (Hanya histori obat & jadwal kontrol) | **No Access** | **No Access** |
| **Form Pemetaan Otoritas (BGR)** | **Full Access** (Bisa edit data Kiai & Kades pendukung) | **Write-Only** (Dapat mengusulkan nama tokoh rujukan) | **No Access** | **No Access** |
| **Aktivasi Tombol EWS** | **Full Access** (Memicu pesan serentak ke WA Guru & Rato) | **No Access** (Hanya mengirim laporan awal ke Nakes) | **No Access** | **No Access** |
| **SOP Komunikasi Terapeutik** | **Full Access** (Bisa edit & tambah template pesan) | **Read-Only** (Menerima panduan pendampingan keluarga) | **Read-Only** (Menerima panduan persuasi via WA) | **Read-Only** (Menerima panduan koordinasi formal) |
| **Log Evakuasi & Tracking** | **Full Access** (Melihat grafik performa respons $\ge 30\%$) | **Update Status** (Mengubah status dari lapangan via WA) | **Read-Only** (Hanya status evakuasi desa setempat) | **Read-Only** (Hanya status evakuasi desa setempat) |

*Keterangan:*
*   **Full Access:** Create, Read, Update, Delete (CRUD).
*   **Read-Only:** Hanya dapat melihat data tanpa hak mengubah/menghapus.
*   **Write-Only:** Hanya dapat menginput data awal tanpa bisa melihat data keseluruhan.
*   **No Access:** Fitur disembunyikan sepenuhnya dari antarmuka pengguna demi privasi dan keamanan data.

---

## 3. Batasan Teknis & Keamanan Spesifik (Security & Operational Restrictions)

### A. Batasan Keamanan Data Medis (Privacy Boundaries)
1.  **Enkripsi Identitas Pasien (Anonymization):** Nama asli, foto pasung, dan riwayat klinis pasien hanya boleh diakses oleh **Sisi 1 (Nakes)**. Pada WhatsApp Gateway yang diakses oleh **Sisi 3 (Guru)** dan **Sisi 4 (Rato)**, nama pasien disamarkan menggunakan inisial atau kode ID kasus unik untuk melindungi privasi pasien dari kebocoran informasi ke publik.
2.  **Verifikasi Berjenjang:** Laporan kasus dari kader jiwa tidak akan langsung memicu EWS aktif. Laporan harus melewati tahap **Verifikasi Klinis** oleh Nakes terlebih dahulu untuk menghindari kepanikan sosial akibat laporan palsu (*false alarm*).

### B. Batasan Operasional WhatsApp Gateway
1.  **Pembatasan Sesi Chat (Rate Limiting):** Untuk mencegah nomor WA Gateway terblokir (banned) oleh sistem WhatsApp akibat pengiriman pesan massal, sistem membatasi pengiriman notifikasi maksimal 5 pesan per menit dan menggunakan teknik penundaan waktu acak (*randomized delay* 2-5 detik) antar-pesan.
2.  **Sistem Validasi Balasan (Keyword Parsing):** Balasan dari Tokoh Agama (Guru) dan Aparat (Rato) dibatasi menggunakan tombol interaktif (*quick reply buttons*) or kata kunci sederhana (Contoh: ketik **SETUJU** untuk mengonfirmasi bantuan pendampingan evakuasi, ketik **PENDING** jika butuh waktu negosiasi tambahan) untuk memastikan akurasi interpretasi data oleh sistem.

### C. Batasan Geofencing Wilayah Kerja
1.  Akses koordinat GPS pasien dibatasi secara ketat berdasarkan wilayah tugas Puskesmas terkait. Admin Puskesmas Kokop hanya dapat melihat data pasien di wilayah Kecamatan Kokop dan tidak diizinkan melihat data pasien di kecamatan atau kabupaten tetangga, kecuali diberikan hak akses rujukan lintas wilayah oleh Dinas Kesehatan Kabupaten Bangkalan [27].

---

## 4. Alur Kolaborasi Kerja (EWS & Protokol Evakuasi)

Berikut adalah alur koordinasi digital yang menunjukkan bagaimana batasan dan peran di atas bekerja secara harmonis saat penanganan kasus:

```
[Kader Jiwa (Sisi 2)] ──► Melaporkan temuan pasung baru via WA ──► [Sistem Hibrida]
                                                                        │
┌───────────────────────────────────────────────────────────────────────┘
▼
[Nakes Puskesmas (Sisi 1)] ──► Verifikasi & Petakan Otoritas (Bhuppa' Bhu' + Guru + Rato)
                                  │
                                  ├─► Klik "AKTIFKAN EWS"
                                  ▼
[WA Gateway] ──► Kirim notifikasi template terapeutik serentak ke:
                    ├──► [Kiai/Guru (Sisi 3)] ──► "Mohon bantuan persuasi spiritual ke keluarga..."
                    └──► [Kades/Rato (Sisi 4)] ──► "Mohon dukungan izin & pengamanan lokasi..."
                                  │
                                  ▼
[Kader Jiwa (Sisi 2)] ──► Melakukan negosiasi di lapangan bersama Guru & Rato
                                  │
                                  ▼
[Puskesmas (Sisi 1)] ──► Eksekusi evakuasi medis & update log kecepatan respon (target < 24 jam)
```

Dengan desain pembagian peran dan batasan yang terstruktur ini, sistem ini menjamin bahwa teknologi tidak mengabaikan tata krama budaya Madura, melainkan menjadikannya sebagai instrumen utama dalam mempercepat penanganan kasus pasung demi terwujudnya **Zero Pasung** [1].
