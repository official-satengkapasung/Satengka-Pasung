# 🏛️ NOTULENSI RAPAT ARSITEKTUR & STRATEGI TEKNOLOGI SATENGKA PASUNG EWS
**Agenda**: Evaluasi Kematangan Arsitektur Vanilla JS vs Modern Stack (React/Vite/TypeScript) untuk Skalabilitas Jangka Panjang  
**Fasilitator**: Senior Dev & DevSecOps Engineering Lead Committee  
**Waktu**: 12 September 2026  

---

## 👥 PANDANGAN KOMITE TEKNIS (6-in-1 SDLC COMMITTEE)

### 1. [👨‍💻 Senior Dev]: Analisis Arsitektur Vanilla JS Saat Ini
* **Kelebihan Saat Ini**:
  - **Zero-Build & Zero-Dependency Runtime**: Berjalan instan langsung via `file:///` maupun server HTTP statis (GitHub Pages/Nginx) tanpa perlu Node.js server yang rentan mati. Sangat tangguh untuk puskesmas daerah pedesaan (Kokop) yang minim infrastruktur server.
  - **Kecepatan Booting**: 0ms bundling overhead, ukuran runtime sangat ringan (< 200KB).
* **Batas Kemampuan (Technical Debt & Scalability Limit)**:
  - Saat ini file [`index.html`](file:///C:/Users/lenovo/Documents/APP/EWS/index.html) sudah membengkak menjadi **>3.400 baris kode** (monolitik).
  - State management global (`currentUser`, `currentCases`, `currentReports`) mulai rentan terhadap race condition jika jumlah relawan pilar bertambah ke ratusan pengguna simultan.
  - Tidak adanya static typing (TypeScript) meningkatkan risiko *runtime undefined error* seiring bertambahnya fitur rekam medis kompleks.

---

### 2. [⚙️ DevOps Lead]: Infrastruktur & Biaya Operasional (TCO)
* **Kebutuhan Lapangan Faskes Puskesmas Kokop**:
  - Biaya operasional harus tetap **Zero-Cost / Low-Maintenance**. Jika kita migrasi ke arsitektur full backend server (Node.js/Express + live VPS), Puskesmas harus membayar sewa server bulanan dan biaya maintenance DevOps.
* **Rekomendasi DevOps**:
  - **Stack Terbaik ke Depan**: **React 18/19 + Vite + Tailwind + TypeScript + Cloudflare Pages / Vercel (Free Tier) + Supabase/Firebase**.
  - Pola ini menghasilkan static SPA hasil kompilasi yang tetap gratis di-host, namun kode sumbernya modular (pecah per komponen).

---

### 3. [🛡️ Sec Lead]: Keamanan Data Medis & Audit OWASP
* **Isu pada Vanilla JS Monolith**:
  - Penyimpanan data sensitif pasien pasung di `localStorage` tidak terenkripsi pada level database faskes formal (UU PDP & Permenkes Rekam Medis).
* **Kebutuhan Masa Depan**:
  - Diperlukan layer API terisolasi dengan otentikasi JWT/Row Level Security (RLS) di database PostgreSQL (Supabase) agar kader di Desa Kokop tidak bisa melihat data rahasia desa tetangga tanpa hak akses.

---

### 4. [🎨 UI/UX Lead]: Reusability & Responsiveness
* Komponen Mobile PWA dan Desktop Nakes saat ini hidup berdampingan di satu file DOM yang disembunyikan via `hidden`.
* Dengan **React/Next.js/Vite**, kode UI terpisah bersih:
  - `<NakesLayout />` terisolasi dari `<MobilePwaLayout />`.
  - Pengalaman PWA lebih halus dengan caching offline Service Worker yang otomatis di-handle oleh `vite-plugin-pwa`.

---

### 5. [🧪 QA Lead]: Maintainability & Automated Testing
* Saat ini pengujian bergantung pada end-to-end browser (Playwright) yang memakan waktu cukup besar karena satu file HTML besar di-render utuh.
* Dengan framework modern berbasis modul, kita bisa menerapkan **Unit Test (Vitest/Jest)** untuk logika Early Warning System (skor deteksi pasung) secara instan dalam hitungan milidetik.

---

### 6. [📊 PM Lead]: Keputusan Strategis & Roadmap Migrasi

```mermaid
flowchart TD
    subgraph Fase 1: Tahap Saat Ini (Staging & Demo Klien)
        A1[Vanilla JS Monolith] --> A2[Zero-Cost file:/// dan Demo Cepat]
        A2 --> A3[Status: Sempurna untuk Presentasi & Validasi Stakeholder Dinkes]
    end

    subgraph Fase 2: Roadmap Kedepan (Kecamatan Kokop - 13 Desa)
        B1[Modularisasi Kode: ES Modules / Vite + React Lite] --> B2[Modular Component: Nakes, Kader Jiwa, Guru/Kiai, Rato/Kades]
        B2 --> B3[Database Lokal/Cloud Gratis: Supabase Free Tier / SQLite PWA]
        B3 --> B4[Zero-Cost Static Hosting: Cloudflare Pages / GitHub Pages]
    end

    A3 -. Rekomendasi Roadmap .-> B1
```

---

## 💡 KESIMPULAN & REKOMENDASI SENIOR DEV UNTUK KEDEPANNYA:

1. **Untuk Kebutuhan Saat Ini (Demo, Uji Coba Lapangan Puskesmas Kokop, Pilot Project)**:
   - **Teknologi Vanilla JS saat ini adalah pilihan paling tepat, pragmatis, dan anti-ribet.**
   - Sistem ini tidak memerlukan setup server, tidak ada biaya bulanan, tidak ada build step, dan stakeholder Puskesmas maupun kader desa dapat langsung membukanya di laptop/HP via browser.

2. **Klarifikasi Batasan & Ruang Lingkup (Scope Boundary)**:
   - **Tidak ada rencana integrasi skala nasional (SatuSehat Kemenkes / FHIR enterprise).**
   - Fokus sistem 100% didedikasikan untuk **wilayah kerja Puskesmas Kokop, Kabupaten Bangkalan (mencakup 13 desa)** guna early detection ODGJ, pencegahan pemasungan, dan koordinasi 4 Pilar BGR (Nakes, Kader, Tokoh Agama, Tokoh Masyarakat).

3. **Rekomendasi Stack Jangka Panjang (Puskesmas Kokop 13 Desa - Zero Operational Cost)**:
   - **Opsi A (Tetap Vanilla JS Modern - Modular ES Modules)**:
     - Memecah file monolitik [`index.html`](file:///C:/Users/lenovo/Documents/APP/EWS/index.html) (>3.400 baris) menjadi modul-modul terpisah (`/js/modules/auth.js`, `/js/modules/kader.js`, `/js/modules/nakes.js`, dll.) menggunakan native ES Modules (`<script type="module">`).
     - **Keuntungan**: Tetap 0 dependency, 0 build step, 0 biaya, namun kode jauh lebih rapi dan mudah dirawat.
   - **Opsi B (Refactor Ringan ke Vite + React SPA - Client Only)**:
     - Jika fitur interaksi 4 pilar semakin kaya (misal: visualisasi GIS/peta interaktif, grafik tren per desa, form dinamis), migrasi ke **Vite + React + Tailwind** tetap sangat menguntungkan dari segi *maintainability* developer.
     - Di-build menjadi file statis murni (`dist/`) dan di-deploy gratis di **Cloudflare Pages / GitHub Pages**, dengan backend tetap lokal (`localStorage` / IndexedDB) atau Supabase Free Tier jika butuh sinkronisasi antar-perangkat 13 desa tanpa biaya server.

