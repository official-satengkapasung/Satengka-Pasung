# Panduan Alur Aplikasi & Interaksi Antar-Sisi (End-to-End User Flow)
### Platform "SATENGKA PASUNG" (Sistem EWS & Evakuasi ODGJ Pasung Madura)

Dokumen ini menjelaskan alur operasional aplikasi **SATENGKA PASUNG (Bhuppa' Bhu' Ghuru Rato')** dari hulu ke hilir. Setiap tindakan yang diambil oleh satu sisi pengguna akan langsung memicu pembaruan atau notifikasi pada sisi pengguna lainnya (*cross-role interactivity*). 

Desain antarmuka dibuat sangat minimalis, menggunakan ikon yang jelas, teks berukuran besar, dan berbasis WhatsApp untuk memudahkan pengguna awam atau lanjut usia (lansia) [1, 6].

---

## Peta Interaksi Global (Bagaimana Tiap Sisi Terhubung)

```
 [SISI 2: KADER JIWA] (WA/Mobile)
          │  1. Lapor Temuan Kasus (Foto + GPS)
          ▼
 [SISI 1: NAKES PUSKESMAS] (Dashboard Web) ◄── [Validasi & Pemetaan BGR]
          │  2. Klik "Tombol Siaga" (Aktivasi EWS)
          ├────────────────────────────────────────┐
          ▼ (WA Notifikasi)                        ▼ (WA Notifikasi)
 [SISI 3: GURU (KIAI)]                    [SISI 4: RATO (KADES)]
   * Rembuk Santun (Kultus/Spiritual)       * Dukungan Legalitas & Keamanan
          │                                        │
          └───────────────────┬────────────────────┘
                              │ 3. Konfirmasi Setuju
                              ▼
                 [PROSES EVAKUASI DIMULAI] ──► Target Respon < 24 Jam (Hemat Waktu ≥ 30%)
                              │
                              ▼
            [PENGOBATAN & CEGAH RE-PASUNG]
                              │
                              ▼
                 [SISI 2 & KELUARGA (WA)] ◄── Notifikasi Kontrol & Minum Obat Otomatis
```

---

## 1. ALUR SISI 2: KADER JIWA (Pemicu Awal di Lapangan)
*Kader Jiwa bertindak sebagai pendamping lapangan yang mendampingi keluarga (**Bhuppa’ Bhu’**) [10, 11].*

*   **Langkah 1: Temuan Kasus**
    *   Kader menemukan kasus pasung baru atau mendapat laporan keluarga bahwa pasien menunjukkan tanda kekambuhan (*relapse*) [1, 13].
*   **Langkah 2: Pelaporan Cepat (WhatsApp Gateway / Mobile Form Minimalis)**
    *   Kader membuka chat WA SATENGKA PASUNG atau Aplikasi Mobile khusus kader.
    *   Tampilan aplikasi dirancang super sederhana dengan **3 Tombol Utama**:
        1.  `[ Ambil Foto Pasung/Pasien ]`
        2.  `[ Bagikan Lokasi / GPS ]`
        3.  `[ Kirim Laporan ]`
    *   Kader cukup menekan tombol tersebut tanpa perlu mengetik teks panjang.
*   **Interaksi Sistem:**
    *   Seketika laporan dikirim, data langsung masuk ke **Dashboard Web Nakes (Sisi 1)** sebagai *Alert* Laporan Baru Berwarna Merah (berkedip).

---

## 2. ALUR SISI 1: NAKES PUSKESMAS (Pusat Kendali & Manajemen)
*Nakes di Puskesmas Kokop memproses data klinis dan mengatur strategi evakuasi [27, 29].*

*   **Langkah 1: Verifikasi Laporan Masuk**
    *   Nakes melihat *Alert* berkedip di dashboard. Nakes memeriksa foto dan koordinat GPS yang dikirim Kader Jiwa (Sisi 2).
*   **Langkah 2: Pemetaan Budaya (Bhuppa’ Bhu’ Guru Rato’)**
    *   Nakes membuka halaman detail pasien, lalu memilih nama desa.
    *   Sistem secara otomatis menampilkan rekomendasi pilar **Bhuppa' Bhu' Guru Rato'** di wilayah itu [1, 17]:
        *   *Bhuppa' Bhu':* Nama penanggung jawab keluarga.
        *   *Guru:* Pilihan Tokoh Agama/Kiai rujukan desa setempat (misal: *Kiai Kholil*).
        *   *Rato:* Kepala Desa/Aparat setempat (misal: *Klebun/Kades Kokop*).
*   **Langkah 3: Aktivasi EWS (Tombol Siaga)**
    *   Nakes menekan tombol merah besar berlabel **`[ AKTIFKAN TOMBOL SIAGA (EWS) ]`**.
*   **Interaksi Sistem:**
    *   Sistem menyalakan waktu *stopwatch* di dashboard untuk merekam kecepatan respons evakuasi (Target: lebih cepat $\ge 30\%$) [25].
    *   Sistem secara otomatis mengirim pesan WhatsApp khusus secara serentak ke **Kiai (Sisi 3)** and **Kades (Sisi 4)**.

---

## 3. ALUR SISI 3: TOKOH AGAMA / KIAI (Pilar "Guru")
*Tokoh Agama didekati secara hormat melalui teks komunikasi terapeutik religius agar membantu melunakkan resistensi keluarga [1, 18].*

*   **Langkah 1: Menerima Pesan WA Khusus (Ramah Lansia)**
    *   Kiai menerima pesan WA otomatis dari sistem SATENGKA PASUNG dengan ukuran tulisan standar besar.
    *   *Isi Pesan:* "Assalamu'alaikum Kiai, mohon bantuan doa dan keridhoannya. Ada warga kita, [Inisial Pasien], di desa [Nama Desa] sedang mengalami gangguan jiwa berat. Puskesmas memohon bantuan Kiai untuk memberikan bimbingan spiritual kepada keluarga agar berkenan dilakukan pengobatan medis."
*   **Langkah 2: Memberikan Tanggapan Sekali Klik (Quick Reply)**
    *   Di bawah pesan WA tersebut, tersedia dua tombol pilihan mudah:
        *   `[ 🟢 Insya Allah Saya Bantu ]`
        *   `[ 🟡 Hubungi Saya Dahulu ]`
    *   Kiai cukup mengetuk salah satu tombol (tanpa mengetik).
*   **Interaksi Sistem:**
    *   Jika Kiai memilih `[ Insya Allah Saya Bantu ]`, status di **Dashboard Nakes (Sisi 1)** langsung berubah menjadi warna hijau: **"Persetujuan Tokoh Agama: OK"**.
    *   Sistem mengirimkan draf naskah pesan terapeutik Islami (*Rembuk Santun*) ke WA Kiai sebagai panduan saat berbicara kepada keluarga pasien.

---

## 4. ALUR SISI 4: APARAT DESA / KADES (Pilar "Rato")
*Pemerintah desa bertindak mengawal keamanan dan meminimalkan potensi konflik sosial di lokasi evakuasi [1, 10].*

*   **Langkah 1: Menerima Notifikasi Siaga**
    *   Kades menerima pesan WA koordinasi resmi.
    *   *Isi Pesan:* "Yth. Bapak Kepala Desa [Nama Desa]. Puskesmas Kokop menginformasikan rencana penjemputan medis untuk warga kita [Inisial Pasien]. Mohon kesediaan Bapak atau perangkat desa untuk mendampingi proses pengamanan di lapangan."
*   **Langkah 2: Konfirmasi Kehadiran**
    *   Kades menekan tombol pilihan di WA:
        *   `[ 🔵 Siap Kawal ]`
        *   `[ 🟡 Kirim Perwakilan ]`
*   **Interaksi Sistem:**
    *   Tanggapan Kades langsung terekam di **Dashboard Nakes (Sisi 1)**. 
    *   Ketika pilar **Guru (Sisi 3)** dan **Rato (Sisi 4)** keduanya telah memberikan lampu hijau (berwarna hijau di dashboard), sistem otomatis mengirim WA ke **Kader Jiwa (Sisi 2)**: *"Rencana koordinasi disetujui. Tim evakuasi dan Kiai siap menuju lokasi keluarga."*

---

## TAHAP AKHIR: EKSEKUSI EVAKUASI & PENCEGAHAN PASUNG ULANG (RE-PASUNG)

### A. Eksekusi Lapangan (Sinergi 4 Sisi)
1.  Kader Jiwa (Sisi 2), Kiai (Sisi 3), dan Perangkat Desa (Sisi 4) mendatangi rumah keluarga (**Bhuppa' Bhu'**).
2.  Dengan pendekatan santun dan restu Kiai, keluarga bersedia melepaskan pasung tanpa ada konflik sosial [1].
3.  Ambulans Puskesmas (Sisi 1) datang menjemput pasien untuk dibawa ke RS rujukan.
4.  Nakes menekan tombol **`[ Selesai Evakuasi ]`** pada Dashboard Web. Sistem merekam waktu total pengerjaan dan menghentikan *stopwatch* kecepatan respons.

### B. Pasca-Evakuasi (Kontrol Minum Obat Mandiri)
1.  Pasien selesai diobati dan kembali ke rumah.
2.  Sistem SATENGKA PASUNG menjadwalkan kalender kontrol secara otomatis.
3.  **Tiap Pagi:** Sistem mengirim pesan WA otomatis ke **Keluarga/Kader (Sisi 2)** yang berisi pengingat minum obat dengan visualisasi gambar obat yang sangat kontras (Misalnya: *"Waktunya minum obat pil kuning bulat"*).
4.  Kader/Keluarga cukup menekan tombol di WA: **`[ 👍 Sudah Minum Obat ]`** untuk menjamin pasien tidak kambuh (*relaps prevention*) dan mewujudkan gerakan **Zero Pasung** di Madura [1, 25].
