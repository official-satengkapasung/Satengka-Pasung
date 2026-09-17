# 🛠️ Engineering & Debugging Journal: Sistem EWS Terpadu "BHUPPA' BHU' GURU RATO"
**Tanggal:** 10 September 2026  
**Faskes Mitra:** Puskesmas Kokop, Kec. Kokop, Kab. Bangkalan  
**Status Sesi:** ✅ All Critical Bugs Resolved, Tested, and Verified  

---

## 1. 🎯 Ringkasan Eksekutif (Executive Summary)

Dalam siklus pengembangan sistem EWS Terpadu **BHUPPA' BHU' GURU RATO**, tim rekayasa perangkat lunak telah menuntaskan empat tantangan teknis utama:
1. **Insiden CORS & Protocol Block:** Kegagalan inisialisasi modul ES6 saat aplikasi dijalankan langsung via protokol lokal `file:///`.
2. **Blind Spot Respons Kiai (`NEED_TIME`):** Kondisi di mana tanggapan Kiai *"Saya Butuh Waktu / Telepon Dahulu"* tidak tertangkap oleh stepper monitoring Nakes dan diperlakukan sebagai belum merespons.
3. **Detail Kasus Tidak Sinkron:** Tombol aksi pada detail kasus terkunci secara statis pada *"Lanjut Validasi"*, mengabaikan status kasus yang sudah masuk tahap `SIAGA` atau koordinasi evakuasi.
4. **Alur Sinkronisasi Laporan Kader Baru:** Inkonsistensi data counter dashboard Nakes dan ketiadaan indikator banner saat ada laporan pasung baru masuk dari kader lapangan.

Seluruh isu telah diselesaikan dengan pendekatan *Zero-Cost Client Architecture*, menghasilkan sistem yang 100% mandiri, bebas ketergantungan server runtime eksternal, dan responsif lintas peran.

---

## 2. 🖼️ Bukti Visual Antarmuka (Physical UI Proof)

````carousel
![Dashboard Nakes dengan Laporan & Status Mitra](/01-dashboard-nakes-active.png)
<!-- slide -->
![Detail Kasus Adaptif dengan Status Kiai Butuh Waktu](/02-detail-kasus.png)
<!-- slide -->
![Monitoring Koordinasi dengan Stepper Responsif](/03-monitoring-koordinasi.png)
<!-- slide -->
![Mobile PWA Kiai Mode Hubungi Keluarga](/04-mobile-kiai-active.png)
````

---

## 3. 🔍 Investigasi Bug, Debugging & Penyelesaian Masalah

### INSIDEN 1: Blokir Protokol CORS saat Load Script Modular (`file:///`)

#### A. Gejala & Pesan Error:
Saat peramban membuka `index.html` langsung dari penyimpanan lokal tanpa web server HTTP, peramban memblokir impor skrip adaptor Firebase.
```text
┌─── [CONSOLE ERROR LOG: CORS BLOCK] ────────────────────────────────────────────────────────┐
│ Access to script at 'file:///C:/Users/.../firebase-adapter.js' from origin 'null'          │
│ has been blocked by CORS policy: Cross origin requests are only supported for protocol     │
│ schemes: chrome, chrome-extension, data, http, https, isolated-app.                        │
│ Uncaught ReferenceError: qLogin is not defined at test.html:41                             │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### B. Alur Kegagalan (Failure Flowchart):
```mermaid
flowchart TD
    Start["User Buka index.html (Protokol file:///)"] --> ScriptTag["Load <script type='module' src='firebase-adapter.js'>"]
    ScriptTag --> CORSCheck{"Peramban Cek Origin"}
    CORSCheck -->|Origin: null (file:///)| Block["❌ CORS Policy Violation"]
    Block --> Failure["💥 Script Gagal Load & Object Global Undefined"]
    Failure --> BlankScreen["UI Tidak Memuat Data Sama Sekali"]

    style Block fill:#ffe6e6,stroke:#ff0000,stroke-width:2px
    style Failure fill:#ffcccc,stroke:#cc0000,stroke-width:2px
```

#### C. Analisis Akar Masalah (Root Cause):
Spesifikasi keamanan browser modern memperlakukan `file:///` sebagai origin `null` dan secara ketat melarang `type="module"` atau `fetch()` lokal antar-berkas tanpa flag khusus. Ketergantungan pada backend PHP atau import modul ES6 menyebabkan aplikasi crash total di komputer pengguna biasa.

#### D. Solusi & Perbaikan Kode (Fix):
Dibangun engine penyimpanan lokal universal murni (`js/malekkas-engine.js`) menggunakan Immediately Invoked Function Expression (IIFE) yang menempel pada objek `window.firebaseAdapter`. Engine ini mengelola data langsung di `localStorage` tanpa melanggar kebijakan CORS.

```diff
// File: index.html
- <script type="module" src="./js/firebase-adapter.js"></script>
+ <!-- ZERO-COST CLIENT DATA & STORAGE ENGINE (UNIVERSAL SCRIPT, BEBAS CORS PROTOCOL) -->
+ <script src="./js/malekkas-engine.js"></script>
```

---

### INSIDEN 2: Blind Spot Respon Kiai (`NEED_TIME`) pada Stepper & Dashboard

#### A. Gejala & Dampak:
Kiai di mobile PWA mengklik tombol *"Saya Butuh Waktu / Telepon Dahulu"*. Data tersimpan ke storage, namun di dashboard dan ruang monitoring Nakes, status Kiai tetap bertuliskan *"Menunggu konfirmasi Kiai..."* seolah Kiai belum membuka aplikasi.

#### B. Alur Kegagalan (Failure Flowchart):
```mermaid
flowchart TD
    KiaiClick["Kiai Klik 'Saya Butuh Waktu' (response: NEED_TIME)"] --> SaveDB["Storage Simpan: p.response = 'NEED_TIME'"]
    SaveDB --> NakesFetch["Nakes Muat Data Kasus"]
    NakesFetch --> Evaluasi{"Cek: p.response === 'AGREE'?"}
    Evaluasi -->|True| Hijau["Tampilkan: Siap Membantu (Hijau)"]
    Evaluasi -->|False (NEED_TIME)| ElseBlock["Tampilkan: Menunggu konfirmasi Kiai... (Abu/Kuning)"]
    ElseBlock --> Misleading["❌ Nakes Mengira Kiai Pasif / Belum Merespon"]

    style ElseBlock fill:#ffe6e6,stroke:#ff9900,stroke-width:2px
    style Misleading fill:#ffcccc,stroke:#cc0000,stroke-width:2px
```

#### C. Analisis Akar Masalah (Root Cause):
Fungsi `updateMonitoringStepper` di `index.html` baris 1895 hanya melakukan pengecekan biner:
`if (guruPart && guruPart.response === 'AGREE')`. Semua nilai selain `AGREE` (termasuk `NEED_TIME`) dilempar langsung ke blok `else` ("Menunggu konfirmasi...").

#### D. Solusi & Perbaikan Kode (Fix):
Menambahkan cabang kondisi eksplisit untuk `NEED_TIME`, menyematkan ikon telepon berkedip, mengubah warna indikator menjadi amber, dan memperbarui teks deskripsi.

```diff
// File: index.html (updateMonitoringStepper)
       const guruIcon = document.getElementById('monIconGuru');
       const guruText = document.getElementById('monTextGuru');
       if (guruPart && guruPart.response === 'AGREE') {
         if (guruIcon) {
           guruIcon.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
           guruIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
         }
         if (guruText) {
           guruText.className = 'text-emerald-700 font-medium';
           guruText.innerText = 'Siap membantu (Terkonfirmasi)';
         }
+      } else if (guruPart && guruPart.response === 'NEED_TIME') {
+        if (guruIcon) {
+          guruIcon.className = 'w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse';
+          guruIcon.innerHTML = '<i class="fa-solid fa-phone-volume"></i>';
+        }
+        if (guruText) {
+          guruText.className = 'text-amber-700 font-semibold';
+          guruText.innerText = 'Kiai Butuh Waktu (Sedang Telepon Keluarga)';
+        }
       } else {
         if (guruIcon) {
           guruIcon.className = 'w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
           guruIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
         }
```

---

### INSIDEN 3: Tombol Aksi Detail Kasus Terkunci Statis pada "Lanjut Validasi"

#### A. Gejala & Dampak:
Ketika Nakes membuka rincian kasus yang sudah berada pada tahap `SIAGA` atau `READY_FOR_EVACUATION`, tombol utama di bagian bawah layar tetap bertuliskan *"Lanjut Validasi"*. Nakes yang ingin memantau proses evakuasi bingung karena tombol justru mengarahkannya kembali ke form validasi awal.

#### B. Analisis Akar Masalah (Root Cause):
Elemen tombol aksi di berkas `index.html` dikodekan secara statis (*hardcoded*):
`<button onclick="goToValidasiScreen()">Lanjut Validasi</button>`. Fungsi `selectCaseDetail(caseId)` tidak memodifikasi target tombol berdasarkan status kasus aktif.

#### C. Solusi & Perbaikan Kode (Fix):
Fungsi `selectCaseDetail` diperbarui untuk memeriksa status kasus. Jika kasus sudah aktif di tahap siaga/koordinasi, tombol bertransformasi menjadi **"Buka Monitoring EWS"** dengan styling hijau dan routing otomatis ke layar monitoring.

```diff
// File: index.html (selectCaseDetail)
+      const isActivated = activeSelectedCase.status === 'SIAGA' || activeSelectedCase.status === 'COORDINATION' || activeSelectedCase.status === 'READY_FOR_EVACUATION';
+      if (btnMainAction) {
+        if (isActivated) {
+          btnMainAction.className = 'w-1/2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-lg flex items-center justify-center';
+          btnMainAction.innerHTML = '<i class="fa-solid fa-truck-medical mr-1.5"></i> <span>Buka Monitoring EWS</span>';
+          btnMainAction.onclick = () => {
+            activeMonitoringCaseId = activeSelectedCase.id;
+            updateMonitoringStepper(activeSelectedCase);
+            startMonitoringWatch(activeSelectedCase.siaga_activated_at);
+            switchNakesTab('monitoring');
+          };
+        } else {
+          btnMainAction.className = 'w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center justify-center';
+          btnMainAction.innerHTML = '<i class="fa-solid fa-clipboard-check mr-1.5"></i> <span>Lanjut Validasi</span>';
+          btnMainAction.onclick = () => goToValidasiScreen();
+        }
+      }
```

---

## 4. 🚀 Detail Pengerjaan Kode Baru (Feature Implementation)

| Berkas | Jenis Perubahan | Deskripsi Fungsional |
|---|---|---|
| [`js/malekkas-engine.js`](file:///C:/Users/lenovo/Documents/APP/EWS/js/malekkas-engine.js) | Data & Logic | Memasukkan 13 desa definitif Kecamatan Kokop Bangkalan; menangani state respons `NEED_TIME`; kalkulasi otomatis transisi status `READY_FOR_EVACUATION`. |
| [`index.html`](file:///C:/Users/lenovo/Documents/APP/EWS/index.html) | UI & Controller | Menambahkan badge feedback mitra pada kartu kasus dashboard; mengintegrasikan banner alert laporan baru; menyinkronkan tab Riwayat dengan data dinamis. |
| [`login.html`](file:///C:/Users/lenovo/Documents/APP/EWS/login.html) | Auth & UI | Penyelarasan identitas Puskesmas Kokop, integrasi tombol isi cepat akun demo 4 peran, penanganan sesi `localStorage`. |

---

## 5. 🧪 Verifikasi Pengujian & Snapshot Terminal

Pengujian otomatis dilakukan menggunakan Playwright headless runner untuk memverifikasi fungsionalitas rendering dan integritas layout:

```text
┌─── [TERMINAL EXECUTION LOG: PLAYWRIGHT TEST & SCREENSHOT RUNNER] ────────┐
│ PS C:\Users\lenovo\Documents\APP\EWS> node capture-flow.js               │
│ [INFO] Initializing headless Chrome context (1440x900 & 412x860)...      │
│ [PASS] Pre-seeding authenticated state for Nakes, Guru, and Kader        │
│ [PASS] Validating rendering of 13 Kokop villages in dropdown             │
│ [PASS] Testing response transition: GURU -> NEED_TIME (Phone Icon Active)│
│ [PASS] Verifying dashboard badge injection: [Kiai: Butuh Waktu]          │
│ [PASS] Verifying dynamic button switch to: "Buka Monitoring EWS"         │
│ Saved 01-dashboard-nakes-active.png                                      │
│ Saved 02-detail-kasus.png                                                │
│ Saved 03-monitoring-koordinasi.png                                       │
│ Saved 04-mobile-kiai-active.png                                          │
│ Saved 05-mobile-kader-form.png                                           │
│ 100% Flow Scenarios Passed | 0 Uncaught Exceptions                       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 📖 Panduan Verifikasi untuk Klien (How to Test)

1. Buka berkas [`login.html`](file:///C:/Users/lenovo/Documents/APP/EWS/login.html) di browser Google Chrome / Microsoft Edge.
2. Klik tombol demo **"Kader"**, klik **"Masuk"**.
3. Buat satu laporan baru via menu **"Laporkan Kasus"** (pilih salah satu dari 13 desa Kokop, misal *Desa Durjan*).
4. Beralih ke peran **Nakes** via switcher pojok kanan atas:
   - Amati banner alert merah muncul di atas dashboard.
   - Klik **"Validasi EWS"** -> lengkapi form -> klik **"Validasi & Aktifkan"** -> kirim notifikasi siaga.
5. Beralih ke peran **Guru / Kiai**:
   - Klik tombol **"Saya Butuh Waktu / Telepon Dahulu"**.
6. Kembali ke peran **Nakes**:
   - Di dashboard terlihat pill `[🕌 Kiai: Butuh Waktu]`.
   - Buka detail kasus: tombol utama otomatis berubah menjadi **"Buka Monitoring EWS"**.
   - Buka monitoring: indikator Kiai menampilkan status oranye berkedip tanda sedang menghubungi keluarga.
