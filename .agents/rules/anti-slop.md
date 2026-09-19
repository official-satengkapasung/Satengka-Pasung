# ANTI-SLOP & CODE HYGIENE RULES: SATENGKA-PASUNG EWS

Prinsip utama: **Kualitas Produksi Nyata, Tanpa Kode Sampah (Zero AI Slop), Tanpa Dummy Pura-pura, dan Strict Security**.

---

## 1. Zero Hallucinated / Dead Code (Tanpa Kode Sia-sia)
- **Dilarang keras menyisipkan placeholder komentar malas** seperti:
  - `// TODO: implement later`
  - `// Add your code here`
  - `// ...rest of the code unchanged`
- Setiap fungsi yang dibuat harus memiliki implementasi utuh dan fungsional.
- Dilarang membuat variabel, import, utility helper, atau mock API yang tidak pernah dipanggil/digunakan di dalam runtime aplikasi.

## 2. No Mock Data in Production Paths (Anti-Data Palsu Terselubung)
- Arsitektur storage menggunakan `js/malekkas-engine.js` dan Firebase adapter `js/firebase-adapter.js`.
- Jangan memasukkan data dummy hardcoded yang menimpa atau memanipulasi data riil pengguna tanpa transparansi.
- Fallback offline harus menangani kegagalan jaringan secara elegan (graceful degradation), bukan menyajikan ilusi data sukses padahal gagal tersimpan.

## 3. Strict DevSecOps & Credential Hygiene
- **Never Commit Secrets**: Dilarang memasukkan Firebase Service Account keys, JWT secrets, private certificates, atau production API keys ke git.
- **Audit Rules**: `firestore.rules` tidak boleh memiliki wildcard `allow read, write: if true;`. Setiap entitas data wajib diverifikasi dengan RBAC (Role-Based Access Control).
- **Input Sanitization**: Semua input teks dari kader, nakes, atau form publik wajib disanitasi terhadap XSS sebelum dirender ke DOM. Hindari penggunaan `innerHTML` dengan raw user input tanpa sanitasi.

## 4. PWA & Offline Architecture Integrity
- Perubahan pada asset (HTML, CSS, JS, icon) wajib memperbarui versi cache pada Service Worker `sw.js` agar pengguna tidak mengalami stale-cache mismatch.
- Pertahankan kompatibilitas dual-mode: aplikasi harus tetap dapat dibuka secara standalone (local filesystem / zero-cost static hosting) dan live cloud sync.

## 5. Clean, Maintainable & Idiomatic JavaScript
- Gunakan nama variabel dan fungsi yang deskriptif dan mencerminkan domain bisnis kesehatan/kearifan lokal Kokop (misal: `reportCase`, `verifyKader`, `syncMultiVisitLog`).
- Hindari nesting callback yang dalam; gunakan modern `async/await` dengan blok `try/catch` komprehensif.
- Error handling wajib informatif untuk pengguna (UI feedback jelas) dan terstruktur di console/telemetry (bukan diam-diam `catch (e) {}`).

## 6. Verifiable Code (Test Integrity)
- Setiap fitur krusial wajib dapat diverifikasi oleh test script yang ada (`run-e2e-audit.js` dan `test-register-pwa.js`).
- Jangan mengubah test assertion semata-mata agar test "hijau/pass" jika akar masalahnya ada pada bug kode aplikasi.
