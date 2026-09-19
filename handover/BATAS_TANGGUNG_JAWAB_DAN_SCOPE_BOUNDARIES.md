# DOKUMEN BATAS RUANG LINGKUP & TANGGUNG JAWAB OPERASIONAL
## (SCOPE OF WORK, OPERATIONAL BOUNDARIES & RACI MATRIX)
### PENGEMBANGAN SISTEM EWS "SATENGKA PASUNG"
**Hubungan Kerja Sama: Developer (Pengembang Perangkat Lunak) & Tim Peneliti (LPPM Universitas Trunojoyo Madura)**

---

## 1. TUJUAN DOKUMEN

Dokumen ini mendefinisikan batas kewenangan, tanggung jawab, dan lingkup kerja teknis antara **Pengembang Perangkat Lunak (*Developer*)** dengan **Tim Peneliti Riset Terapan LPPM Universitas Trunojoyo Madura (UTM)**. 

Dokumen ini menegaskan bahwa segala interaksi dengan mitra eksternal (faskes puskesmas, dinas kesehatan, subjek riset, tokoh masyarakat desa) berada sepenuhnya dalam domain manajerial dan etika penelitian Tim Peneliti, sedangkan Developer bertanggung jawab murni pada aspek rekayasa perangkat lunak (*software engineering*).

---

## 2. MATRIKS RACI TANGGUNG JAWAB

* **R (Responsible)** : Pelaksana tugas langsung.
* **A (Accountable)** : Pemegang wewenang akhir dan penanggung jawab hasil.
* **C (Consulted)** : Pihak yang dimintai masukan atau spesifikasi.
* **I (Informed)** : Pihak yang menerima laporan/pemberitahuan.

| No | Aktivitas / Komponen | Developer (Pihak 1) | Tim Peneliti UTM (Pihak 2) |
| :---: | :--- | :---: | :---: |
| 1 | Perancangan Arsitektur Sistem, UI/UX & PWA | **A / R** | C |
| 2 | Pengembangan Kode Program & Integrasi Database Cloud | **A / R** | I |
| 3 | Perumusan Metodologi, Skrining Klinis MALEKKAS & Teori 4 Pilar | C | **A / R** |
| 4 | Pengujian Mutu Sistem (DevSecOps, Clean Code, Anti-Slop) | **A / R** | I |
| 5 | Pengelolaan Akun Cloud Utama (GitHub, Firebase, Netlify) | C | **A / R** |
| 6 | Uji Coba Lapangan, Sosialisasi Mitra & Pengumpulan Data Riset | I | **A / R** |
| 7 | Perizinan Etik Penelitian (*Ethical Clearance*) & Informed Consent | I | **A / R** |
| 8 | Manajemen Pengguna Harian & Pengisian Master Data Mitra | I | **A / R** |
| 9 | Laporan Akhir Hibah Penelitian, Jurnal Ilmiah & Pendaftaran HKI | C | **A / R** |
| 10 | Garansi Pemeliharaan Bug Fixing (30 Hari Pasca-BAST) | **A / R** | I |

---

## 3. SPESIFIKASI ARSITEKTUR INFRASTRUKTUR CLOUD

Sistem telah dirancang menggunakan **Arsitektur Cloud Serverless Terdistribusi Modern** yang menjamin ketersediaan tinggi (*High Availability*), keamanan data medis, dan efisiensi operasional tanpa membutuhkan pemeliharaan server fisik (*Zero Server Maintenance*):

### A. Google Cloud Platform / Firebase Database & Identity Management
* **Cloud Firestore**:
  * Arsitektur basis data dokumen terdistribusi NoSQL dengan sinkronisasi multi-klien *real-time*.
  * Kapasitas kuota operasional standar telah dikonfigurasi dan dioptimasi secara efisien untuk kebutuhan siklus riset dan operasional lapangan.
  * Dilengkapi aturan otorisasi ketat (*Firestore Security Rules*) berbasis kontrol akses peran (RBAC).
* **Identity & Authentication Engine**:
  * Menggunakan sistem manajemen identitas Google dengan enkripsi *salted hashing* standar industri.
  * Fitur virtualisasi nomor handphone terintegrasi untuk kemudahan login kader dan tenaga kesehatan.
* *Ketentuan Peningkatan (Scaling):* Arsitektur dirancang elastis (*auto-scalable*). Apabila di kemudian hari Tim Peneliti memperluas cakupan implementasi ke skala regional kabupaten/provinsi dengan volume data masif, sistem siap ditingkatkan kapasitasnya (*Enterprise Scale-up*) sesuai kebutuhan penganggaran riset/instansi.

### B. Global Edge Network & CDN Delivery
* **Penyedia Jaringan**: Global Edge Hosting Platform dengan multi-region Point of Presence (PoP).
* **Keamanan & Performa**:
  * Dilengkapi sertifikat enkripsi SSL/TLS kelas A+ otomatis.
  * Caching aset statis otomatis pada server tepi (*edge nodes*) untuk waktu muat (*load time*) sub-detik pada perangkat seluler.
* *Kustomisasi Domain:* Sistem diserahterimakan dengan tautan produksi terenkripsi yang aktif dan stabil. Penggunaan domain khusus institusi (misalnya `.ac.id` atau `.id`) dapat dihubungkan sewaktu-waktu melalui pengaturan DNS oleh pengelola sistem.

---

## 4. KEBIJAKAN PRIVASI DATA RISET & ETIKA PENELITIAN

1. **Keamanan Basis Data**:
   * Developer telah menerapkan *Firestore Security Rules* berbasis otentikasi peran (RBAC) untuk melindungi basis data dari akses tanpa izin.
2. **Kepatuhan Etika Riset**:
   * Tim Peneliti bertanggung jawab memastikan bahwa data kasus yang diinput oleh kader/mitra lapangan selama penelitian telah memperoleh izin/persetujuan dari keluarga subjek riset sesuai protokol etika penelitian kesehatan/sosial.
   * Developer tidak berhak memanfaatkan atau mempublikasikan data responden riset untuk kepentingan di luar pengembangan perangkat lunak ini.

---

## 5. HAK CIPTA & KEPEMILIKAN SISTEM

1. Seluruh kode sumber (*source code*), konfigurasi deployment, dan dokumen sistem diserahkan kepada Tim Peneliti untuk pemenuhan luaran penelitian terapan.
2. Tim Peneliti memiliki hak penuh untuk mendaftarkan Hak Cipta Perangkat Lunak (HKI) atas nama Tim Peneliti / LPPM UTM, dengan tetap mencantumkan Developer sebagai pencipta/pengembang program komputer (*Software Developer*).

---

*Dokumen ini merupakan lampiran teknis yang mengikat dan tidak terpisahkan dari Berita Acara Serah Terima (BAST).*
