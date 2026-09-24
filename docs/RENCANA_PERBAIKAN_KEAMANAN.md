# Rencana perbaikan SATENGKA PASUNG

Sumber: audit baca-saja 24 Sep 2026. Produksi masih terbuka sampai rules ini di-deploy ke Firebase Console. Commit ini hanya lokal.

## Tahap 1 — berhenti bocor (kode, commit ini)

1. `firestore.rules`: tamu tidak bisa baca/tulis. Hanya pengguna `ACTIVE`. Daftar mandiri hanya KADER/GURU/RATO + `PENDING_APPROVAL`. Field `password` ditolak. `chats` ikut dikunci.
2. `storage.rules`: foto profil hanya untuk yang login, bukan publik.
3. `js/firebase-adapter.js`: cabut paksa-ADMIN dari nomor tertentu; jangan tulis sandi ke Firestore; matikan reset sandi yang menimpa dokumen.
4. `src/services/mock-engine.js`: cabut login admin dari nomor yang tidak terdaftar.
5. `register.html`: hapus pilihan NAKES. Sandi tidak masuk objek yang disimpan.
6. `index.html`: hapus tombol "Muat Data Demo" dan "Reset ke 0".
7. `netlify.toml`: CSP, jangan terbitkan `*.rules` / `package.json`. `robots.txt` menolak indeks. `sw.js` v22 tidak meng-cache `index.html`.
8. `storageBucket` diisi `satengkapasung.appspot.com` supaya unggah foto punya tujuan.

## Tahap 2 — wajib di Firebase Console (belum dilakukan)

- Deploy `firestore.rules` dan `storage.rules`. Cek `GET cases?pageSize=1` menjadi 403 tanpa login.
- Hapus field `password` pada dokumen `users` yang sudah ada. Ganti sandi dua akun yang tersimpan sebagai teks, lewat Authentication, bukan Firestore.
- Pastikan akun NAKES/ADMIN yang ada berstatus `ACTIVE`, kalau tidak dashboard mereka terkunci setelah rules baru.

## Tahap 3 — sesudah produksi tertutup

- Uji alur: lapor → validasi → SIAGA → AGREE / NEED_TIME, dengan akun uji.
- Baru jalankan beban di emulator. Jangan mengarahkan k6 ke `cases` produksi.
