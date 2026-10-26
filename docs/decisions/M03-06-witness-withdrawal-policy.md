# M03-06 — Private Witness, Minors, Copyright & Withdrawal Policy

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: [ADR-0003](file:///z:/project/moonradio/docs/decisions/ADR-0003-source-rights-and-consent.md), [BLUEPRINT.md §6](file:///z:/project/moonradio/BLUEPRINT.md)

---

## 1. Kebijakan Privasi Kesaksian Pribadi (*Private Witness*)

1. **Persetujuan Eksplisit (*Informed Consent*)**:
   - Seluruh data kesaksian di domain `D06 Witness` wajib memiliki persetujuan tervalidasi yang mencatat ruang lingkup publikasi (internal arsip, publik anonim, atau publik dengan atribusi).
2. **Larangan Impor Otomatis ke Git Publik**:
   - DILARANG menyalin berkas rekaman suara pribadi, foto identitas saksi, atau dokumen pengadilan mentah ke dalam repositori Git publik. Repositori hanya mencatat metadata indeks dan status izin.

---

## 2. Perlindungan Khusus Anak di Bawah Umur (*Protection of Minors*)

- Kesaksian atau rekaman yang melibatkan anak di bawah umur **TIDAK BOLEH** dipublikasikan dalam bentuk data terbuka yang dapat mengidentifikasi individu.
- Seluruh data yang berkaitan dengan subjek rentan wajib disamarkan secara otomatis atau disensor sebelum masuk ke status telaah editorial (`IN_REVIEW`).

---

## 3. Hak Penarikan & Kebijakan Hak Cipta (*Takedown & Withdrawal*)

1. **Hak Penarikan Seketika**:
   - Setiap narasumber atau saksi memiliki hak untuk mencabut kesaksiannya kapan saja.
   - Perubahan status menjadi `WITHDRAWN` secara otomatis memutus tampilan publik di API dan antarmuka Dock/HQ dalam hitungan detik.
2. **Kepatuhan Hak Cipta Pihak Ketiga**:
   - Jika terdapat komplain hak cipta terhadap edisi naskah, lirik lagu, atau materi audio tertentu, domain `D08 Governance` memiliki wewenang untuk menangguhkan (*quarantine*) materi terkait tanpa merusak integritas database yang mendasarinya.
