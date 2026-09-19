# EWS PROJECT EXECUTION RULES (ALWAYS-ON)

## ⚡ BRIEF INTENT CONFIRMATION (KONFIRMASI RINGKAS SEBELUM EKSEKUSI)
1. **WAJIB ADA INTENT SEBELUM TOOL (NO SILENT EXECUTION):**
   - Sebelum menjalankan perintah terminal atau mengedit file, agen **WAJIB menulis 1-2 kalimat ringkas**:
     - Poin apa yang ditangkap dari instruksi/gambar yang dikirim user.
     - Komponen/file apa yang akan diubah.
   - Dilarang diam-diam langsung memicu tool tanpa ada komunikasi sama sekali.

## ⚡ FAST-PATH EXECUTION (ANTI READ-LOOP)
2. **GREP FIRST UNTUK FILE BESAR:**
   - File `index.html` (4.600+ baris) DILARANG dibaca bertahap 20-30 baris.
   - Wajib gunakan pencarian grep langsung ke ID elemen, nama class, atau selector target.
3. **LANGSUNG EKSEKUSI TARGET:**
   - Setelah baris target ditemukan, agen langsung memodifikasi file via `replace_file_content` tanpa overthinking.
