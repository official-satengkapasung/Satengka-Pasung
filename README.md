# SATENGKA PASUNG (BHUPPA' BHU' GHURU RATO')
### Sistem Komunikasi Terapeutik, Peringatan Dini, dan Evakuasi Pasung ODGJ Terpadu 4-Pilar

[![CI/CD Pipeline](https://github.com/official-satengkapasung/Satengka-Pasung/actions/workflows/ci.yml/badge.svg)](https://github.com/official-satengkapasung/Satengka-Pasung/actions/workflows/ci.yml)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-2ca3ab.svg)](./manifest.json)
[![Architecture](https://img.shields.io/badge/Architecture-Vanilla%20JS%20%7C%20Zero--Cost-emerald.svg)](./js/malekkas-engine.js)
[![Institution](https://img.shields.io/badge/Research-LPPM%20UTM%20%26%20Puskesmas%20Kokop-blue.svg)](https://www.trunojoyo.ac.id/)

---

## 📖 Ringkasan Proyek
**SATENGKA PASUNG** adalah platform Progressive Web Application (PWA) berbasis pendekatan kearifan lokal Madura **4 Pilar: Bhuppa' Bhu' Ghuru Rato'** (Keluarga, Tokoh Agama/Kiai, Pemerintah Desa/Kepala Desa, dan Tenaga Kesehatan Puskesmas). Proyek ini merupakan luaran Riset Terapan LPPM Universitas Trunojoyo Madura (UTM) bermitra dengan Puskesmas Kokop, Kabupaten Bangkalan, Madura.

Platform ini bertujuan menghapus praktik pasung pada Orang Dengan Gangguan Jiwa (ODGJ) melalui:
1. **Early Warning System (EWS):** Deteksi dini dan pelaporan kasus pasung / tanda kekambuhan dari kader jiwa di lapangan.
2. **Komunikasi Terapeutik:** Pendekatan santun tabayyun keagamaan oleh Kiai/Guru serta pengawalan terpadu bersama Kepala Desa (Rato) & Linmas.
3. **Pencegahan Re-Pasung (Multi-Visit Monitoring):** Pemantauan kepatuhan minum obat secara berkala dan log kunjungan terpadu faskes.

---

## 🏛️ Arsitektur Sistem (100% Zero-Cost & Pure Vanilla JS)
- **Frontend & PWA:** Native HTML5, Modern ECMAScript (Vanilla JS), Tailwind CSS (CDN), FontAwesome 6, dan Leaflet JS (Interactive GIS Map Kokop).
- **Client Storage Engine:** [`js/malekkas-engine.js`](./js/malekkas-engine.js) — Mesin penyimpanan independen (LocalStorage/IndexedDB) yang bebas blokir CORS (dapat dijalankan via protokol `file:///` maupun server web lokal/cloud).
- **Realtime Cloud (Opsional):** [`js/firebase-adapter.js`](./js/firebase-adapter.js) — Integrasi Cloud Firestore 100% Free Tier untuk sinkronisasi live chat terapeutik dan laporan lintas perangkat.
- **Offline Capabilities:** Service Worker [`sw.js`](./sw.js) dan Web App Manifest [`manifest.json`](./manifest.json) yang mendukung instalasi otomatis 1-klik di HP Android, iPhone, maupun PC/Desktop.

---

## 👥 4 Peran Pengguna (Role Architecture)

| Peran | Saluran Antarmuka | Fungsi Utama |
| :--- | :--- | :--- |
| **👨‍⚕️ NAKES / FASKES** | Desktop Web Dashboard | Manajemen kasus, aktivasi EWS, validasi laporan, koordinasi ambulans evakuasi, dan riwayat kontrol obat multi-kunjungan. |
| **🤝 KADER JIWA** | Mobile PWA Frame | Pelaporan cepat temuan pasung lapangan, upload foto kondisi, penandaan koordinat GPS, dan cek status laporan. |
| **🕌 GURU / KIAI** | Mobile PWA Frame | Menerima permintaan dampingan doa keluarga, persetujuan pelepasan pasung secara islami/batin, dan riwayat bimbingan. |
| **🛡️ RATO / KADES** | Mobile PWA Frame | Koordinasi pengawalan aparat desa, linmas, pengamanan rute evakuasi, dan status evakuasi warga. |

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Langsung Tanpa Web Server (Standalone)
Buka file `index.html` atau `login.html` langsung dengan peramban (Google Chrome, Microsoft Edge, Safari, atau Firefox).

### 2. Menggunakan Web Server Lokal (Node.js)
```bash
npx serve .
# atau
python -m http.server 8080
```
Buka `http://localhost:8080` di browser Anda.

---

## 🧪 Pengujian & Penjaminan Mutu (QA)
Proyek ini dilengkapi skrip pengujian otomatis berbasis Playwright Core untuk verifikasi end-to-end (E2E):
- `node test-register-pwa.js` : Menguji alur registrasi mandiri, auto-login, dan respon tombol PWA.
- `node run-e2e-audit.js` : Menguji seluruh alur autentikasi, CRUD kasus, kontrol berkala, dan penanganan error konsol (0 errors).

---

## 🔒 Keamanan & Lisensi
- **DevSecOps:** Dilengkapi filter deteksi kebocoran kredensial di pipeline CI/CD GitHub Actions.
- **Hak Cipta:** Tim Peneliti Riset Terapan LPPM Universitas Trunojoyo Madura (UTM) & Puskesmas Kokop Bangkalan.
