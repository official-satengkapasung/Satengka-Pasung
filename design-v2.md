# Dokumen Desain Sistem UI/UX & Manajemen Peran Pengguna (Versi Ramah Lansia & Awam)
## Aplikasi E-BGR (Bhuppa’ Bhu’ Guru Rato’ Digital)

Dokumen ini merupakan panduan desain antarmuka (UI/UX) dan hak akses pengguna untuk prototipe sistem hibrida **Sistem Peringatan Dini (EWS) dan Evakuasi ODGJ Pasung di Madura** [1]. Dokumen ini diperbarui secara khusus untuk menjawab tantangan aksesibilitas bagi **pengguna awam dan lanjut usia (lansia)**, seperti para Kiai sepuh (Guru), Kepala Desa/Apel (Rato), dan keluarga pasien di pedesaan (Bhuppa’ Bhu’) [1, 17].

Sistem ini mentransformasikan model komunikasi terapeutik konvensional ke bentuk digital tanpa menghilangkan nilai kesopanan dan adat Madura [1, 6].

---

## 1. Prinsip Desain Aksesibilitas Lansia & Awam (Senior-Friendly UI/UX)

Untuk memastikan aplikasi mudah digunakan oleh pengguna yang sudah berumur atau tidak terbiasa dengan teknologi, desain antarmuka wajib menerapkan aturan berikut:

1.  **Tipografi Ukuran Besar & Kontras Tinggi:**
    *   Ukuran font teks utama minimal **16px - 18px**, dan judul **24px - 32px** agar mudah dibaca tanpa kacamata.
    *   Menggunakan jenis huruf *sans-serif* yang bersih (seperti Inter atau Roboto) dengan ketebalan (*font-weight*) yang cukup.
    *   Kontras warna teks dan latar belakang minimal **4.5:1** (memenuhi standar WCAG AA). Latar belakang putih bersih dengan teks hitam pekat, menghindari abu-abu tipis.
2.  **Tombol Sentuh Ukuran Ekstra Besar (Touch Targets):**
    *   Semua tombol interaktif memiliki ukuran minimal **56px x 56px** dengan jarak antar-tombol minimal **16px** untuk mencegah salah pencet (tremor atau jari besar).
    *   Tombol menggunakan label teks yang jelas (Contoh: **"YA, SETUJU"**), bukan hanya ikon gambar yang membingungkan orang tua.
3.  **WhatsApp sebagai Pintu Utama (Zero-App Installation untuk Tokoh Sepuh):**
    *   Mengingat warga dan tokoh sepuh di Madura sangat akrab dengan WhatsApp tetapi kesulitan menginstal dan menggunakan aplikasi web/PlayStore baru, interaksi untuk **Guru (Kiai)** dan **Bhuppa' Bhu' (Keluarga)** dialihkan **100% menggunakan WhatsApp Gateway** [1].
    *   Tombol pesan sekali klik (*quick reply template*) digunakan agar komunikasi berjalan interaktif tanpa perlu mengetik panjang lebar [1, 15].
4.  **Bebas Jargon Teknis:**
    *   Istilah teknis seperti "EWS", "Database", "GIS", "Gateway", atau "CRUD" disembunyikan dari tampilan luar. 
    *   Diganti dengan bahasa sehari-hari yang santun (Indonesia/Madura), seperti:
        *   *EWS* ──► **Tombol Siaga / Lapor Cepat**
        *   *Evakuasi* ──► **Penjemputan Sehat**
        *   *Re-pasung* ──► **Cegah Sakit Ulang**
        *   *Therapeutic Communication* ──► **Rembuk Santun**

---

## 2. Arsitektur & Antarmuka 4 Sisi Pengguna (4-Sided System Features)

Berikut adalah pembagian fitur dari 4 sisi pengguna yang telah disederhanakan tampilannya agar fungsional dan ramah lansia:

```
                                  [ SISTEM UTAMA ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼ (Aplikasi Web Dashboard)                                        ▼ (WhatsApp Gateway)
 ┌──────────────────────────────┐                         ┌────────────────────────────────┐
 │     SISI 1: PETUGAS KESEHATAN│                         │ SISI 3: GURU (TOKOH AGAMA/KIAI)│
 │   • Dashboard Pantauan Kasus │                         │  • Notifikasi Doa & Persetujuan│
 │   • Tombol EWS Merah-Kuning  │                         │  • Panduan Rembuk Santun (WA)  │
 └──────────────┬───────────────┘                         └────────────────────────────────┘
                │                                                         ▲
                ▼ (Web Dashboard Ringkas/Mobile)                          │
 ┌──────────────────────────────┐                         ┌──────────────┴─────────────────┐
 │     SISI 2: KADER JIWA       │                         │ SISI 4: RATO (APARAT DESA/KADES)│
 │   • Lapor Pasung (3 Isian)   │                         │  • Izin Lingkungan Sekali Klik │
 │   • Jadwal Kontrol Obat Pasen│                         │  • Pengawasan Pasca-Jemput     │
 └──────────────────────────────┘                         └────────────────────────────────┘
```

### SISI 1: Tenaga Kesehatan (Nakes) & Admin Puskesmas (Puskesmas Kokop)
Nakes bertindak sebagai operator utama yang mengelola data klinis. Karena mereka berusia produktif dan terlatih, antarmuka web dashboard dirancang profesional namun tetap bersih [27, 28].

*   **Tingkat Fitur Sesuai Penelitian:**
    *   **Peta Pantauan Kasus:** Menggunakan peta sederhana dengan warna pin penanda yang tegas (Merah: Butuh Evakuasi, Kuning: Sedang Negosiasi, Hijau: Selesai Evakuasi/Rawat Jalan) [1, 13].
    *   **Verifikasi Berjenjang:** Nakes menerima laporan kader, mengecek validitasnya, lalu menekan **"Tombol Siaga (EWS)"** untuk mengoordinasikan evakuasi [1].
    *   **Log Performa Waktu (Target $\ge 30\%$ Lebih Cepat):** Stopwatch otomatis yang menghitung durasi sejak laporan masuk hingga evakuasi selesai, membantu Puskesmas memantau target efisiensi [21, 25].
*   **Desain UI Ramah Lansia (Sisi Nakes):**
    *   Walaupun diakses oleh Nakes muda, antarmuka dirancang bersih tanpa grafik statistik yang bertumpuk-tumpuk, sehingga memudahkan ketika nakes harus menunjukkan layar laptop kepada Kiai sepuh atau Kepala Desa saat berkoordinasi langsung di lapangan.

---

### SISI 2: Kader Jiwa / Pendamping Keluarga (Representasi Bhuppa’ Bhu’)
Kader Jiwa biasanya merupakan warga desa setempat yang mendampingi keluarga pasien secara langsung [10, 11]. Antarmuka diakses melalui handphone dengan tampilan super sederhana.

*   **Tingkat Fitur Sesuai Penelitian:**
    *   **Pelaporan Pasung Instan:** Form input kasus pasung baru yang sangat disingkat.
    *   **Pemantauan Pasca-Pasung (Cegah Re-pasung):** Menu pengingat kunjungan rumah dan kepatuhan minum obat pasien [1, 7].
*   **Desain UI Ramah Lansia & Awam (Layar Handphone):**
    *   **Formulir 3 Isian:** Kader hanya perlu mengisi 3 kolom besar: Nama Pasien, Lokasi (bisa otomatis menggunakan tombol "Kirim Lokasi GPS" warna biru besar), dan Foto Pasung (cukup ketuk tombol kamera besar).
    *   **Tanpa Ketik Teks Rumit:** Banyak menggunakan pilihan bergambar atau tombol ya/tidak.
    *   **Pengingat Suara (Audio Reminder):** Sistem dapat mengirimkan rekaman pesan suara pengingat jadwal kontrol obat via WhatsApp agar kader tidak perlu membaca teks instruksi yang panjang.

---

### SISI 3: Tokoh Agama / Kiai (Representasi "Guru")
Kiai memiliki pengaruh kultural terbesar di Madura untuk meyakinkan keluarga agar mau melepaskan pasung [1, 18]. Interaksi dirancang **tanpa login aplikasi**, sepenuhnya lewat WhatsApp yang interaktif [1, 15].

*   **Tingkat Fitur Sesuai Penelitian:**
    *   **Notifikasi Peringatan Dini (EWS Kiai):** Menerima pesan darurat otomatis saat ada warganya yang dipasung [1].
    *   **SOP Komunikasi Terapeutik Santun (Rembuk Santun):** Sistem mengirimkan teks panduan/naskah persuasif keagamaan yang dapat dipakai Kiai untuk mereduksi ketakutan keluarga pasien [1, 21].
*   **Desain UI Ramah Lansia (WhatsApp Gateway):**
    *   Pesan WA dikirim menggunakan bahasa Madura yang halus (*Krama/Alos*) atau bahasa Indonesia yang sopan.
    *   **Tombol Respon Sekali Ketuk (Quick Reply):** Di bawah pesan WA, terdapat tombol interaktif:
        *   `[ SAYA BANTU REMBUK ]` ──► Menandakan Kiai bersedia mendampingi Nakes membujuk keluarga.
        *   `[ MINTA JADWAL LAIN ]` ──► Membuka pilihan waktu longgar Kiai.
    *   Mendukung pengiriman rekaman suara (Voice Note) oleh Kiai ke sistem sebagai pengganti pengetikan pesan jika jempol mereka kesulitan mengetik di layar HP.

---

### SISI 4: Pemerintah Desa / Kepala Desa / Apel (Representasi "Rato")
Pemerintah desa memberikan dukungan pengamanan, logistik evakuasi, dan legalitas formal [1, 10]. Interaksi bersifat hibrida (WA Gateway & Web Viewer Sederhana).

*   **Tingkat Fitur Sesuai Penelitian:**
    *   **Koordinasi Evakuasi Sektoral:** Menerima detail jadwal penjemputan medis [1, 13].
    *   **Dukungan Administrasi:** Memberikan lampu hijau atau konfirmasi kesiapan aparat desa mendampingi proses pembukaan pasung kayu tradisional [1, 7].
*   **Desain UI Ramah Lansia & Awam:**
    *   **Notifikasi Siaga WA:** Pesan WhatsApp berisi informasi: *"Ada warga Desa [Nama Desa] atas nama [Inisial Pasien] membutuhkan penanganan medis kesehatan jiwa. Mohon dukungan pengamanan dan izin evakuasi."*
    *   Di bawah pesan, disediakan tombol interaktif:
        *   `[ IZIN & DUKUNGAN SIAP ]`
        *   `[ HUBUNGI PUSKESMAS ]`

---

## 3. Matriks Pembatasan Akses yang Disederhanakan (Simple Access Matrix)

Demi kenyamanan orang tua/awam, tampilan menu yang tidak relevan dengan peran mereka disembunyikan sepenuhnya. Ini juga berfungsi melindungi data rahasia medis pasien sesuai regulasi [1].

| Nama Fitur dalam Aplikasi | Sisi 1: Petugas Puskesmas | Sisi 2: Kader Desa (Lansia/Awam) | Sisi 3: Kiai / Guru (Lansia/Awam) | Sisi 4: Pak Kades / Rato (Lansia/Awam) |
| :--- | :---: | :---: | :---: | :---: |
| **Peta Lokasi Pasien (Warna Merah/Hijau)** | Lihat Semua | Hanya Wilayah Desa Sendiri | **Sembunyi** (Privasi) | **Sembunyi** (Hanya statistik total) |
| **Formulir Isian Laporan Kasus** | Bisa Edit & Hapus | Hanya Mengisi Form Sederhana | **Sembunyi** | **Sembunyi** |
| **Tombol Siaga / Kirim Pesan Darurat (EWS)** | Tombol Aktif | **Sembunyi** | **Sembunyi** | **Sembunyi** |
| **Teks Panduan Bicara Sopan (SOP)** | Bisa Ubah Teks | Lihat Panduan | Terima via WA | Terima via WA |
| **Buku Catatan Kontrol (Cegah Sakit Ulang)** | Lihat Semua | Lihat Jadwal Pasiennya | **Sembunyi** | **Sembunyi** |

---

## 4. Contoh Rancangan Tampilan Layar Ramah Lansia (Wireframe Konseptual)

### A. Tampilan Form Lapor Kasus di Handphone Kader Jiwa (Sisi 2)
Tampilan dibuat vertikal ke bawah, tanpa menu geser kanan-kiri yang membingungkan.

```
┌──────────────────────────────────────────┐
│         Sip_Peka Madura (Kader)          │
├──────────────────────────────────────────┤
│                                          │
│  [1] NAMA WARGA YANG SAKIT:              │
│      ┌──────────────────────────────┐    │
│      │ Tulis nama di sini...        │    │ [Kotak Isian Tinggi 50px]
│      └──────────────────────────────┘    │
│                                          │
│  [2] LOKASI RUMAH PASIEN:                │
│      ┌──────────────────────────────┐    │
│      │ 📍 KLIK DI SINI UNTUK LOKASI │    │ [Tombol Biru Besar, Tebal]
│      └──────────────────────────────┘    │
│                                          │
│  [3] FOTO KONDISI PASIEN (JIKA ADA):     │
│      ┌──────────────────────────────┐    │
│      │ 📷 KETUK UNTUK AMBIL FOTO    │    │ [Tombol Hijau Besar, Tebal]
│      └──────────────────────────────┘    │
│                                          │
│  ──────────────────────────────────────  │
│  ┌──────────────────────────────────────┐│
│  │       KIRIM LAPORAN KE PUSKESMAS     ││ [Tombol Merah Lebar,
│  └──────────────────────────────────────┘│  Sangat Jelas]
└──────────────────────────────────────────┘
```

### B. Tampilan Alur Pesan WhatsApp Gateway untuk Kiai Sepuh / Guru (Sisi 3)
Interaksi murni berbasis pesan obrolan yang santun dan akrab dengan kebiasaan sehari-hari orang tua di Madura.

```
┌────────────────────────────────────────────────────────┐
│  WA: E-BGR Puskesmas Kokop                             │
├────────────────────────────────────────────────────────┤
│  Assalamu'alaikum Kiai Ahmad.                          │
│                                                        │
│  Mohon bantuan kepemimpinan Kiai di Desa Kokop.        │
│  Ada tetangga kita, Sdr. [Inisial M], yang saat ini    │
│  mengalami kekambuhan dan dipasung oleh keluarganya [1]│
│                                                        │
│  Puskesmas mohon izin dan doa Kiai untuk melakukan     │
│  "Penjemputan Sehat" (evakuasi medis) besok pagi [13]. │
│                                                        │
│  Mohon ketuk tombol di bawah untuk respon Kiai:        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              [ YA, SAYA BANTU REMBUK ]           │  │ [Tombol Interaktif WA]
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              [ MOHON TUNDA / DISKUSI ]           │  │ [Tombol Interaktif WA]
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### C. Mekanisme "Satu Klik" untuk Mencegah Pasung Ulang (Re-pasung)
Untuk Kader Jiwa dan Keluarga lansia yang merawat pasien pasca-evakuasi, agar pasien tidak lupa minum obat dan mengalami *relapsasi* [13]:
1.  Sistem mengirimkan notifikasi WA otomatis setiap tanggal kontrol.
2.  Notifikasi berupa gambar obat yang harus diminum hari itu (berwarna kontras).
3.  Di bawah gambar obat terdapat tombol: `[ SUDAH DIMINUM ]`.
4.  Keluarga cukup mengetuk tombol tersebut. Jika tidak diketuk hingga jam 10 pagi, sistem WA otomatis menelepon (robocall) atau mengirim pesan siaga ke **Kader Jiwa (Sisi 2)** untuk segera meninjau rumah pasien tersebut guna mencegah risiko dipasung kembali [1, 7].

---

Dengan pembatasan fitur yang sangat terfokus dan tata letak antarmuka yang ramah lansia ini, platform digital penelitian Anda dapat menjembatani kesenjangan adopsi teknologi oleh tokoh adat dan keluarga lansia di Madura, serta memastikan kesiapan implementasi sistem hingga mencapai **TKT 6** [18, 23].
