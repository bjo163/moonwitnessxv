# Empire Story Universe — detailed visual-fidelity worklist

**Status: planning draft; not the canonical task register.** This checklist expands the Story Universe design reference into reviewable work. `TODO.md` remains the only authoritative task-status register. No item below is claimed complete merely because a related component, route, or asset already exists.

**Target:** bring the local `apps/empire-web` pilot as close as practical to the five supplied mockups, including composition, artwork direction, typography, responsive behavior, MoonUI usage, and vector iconography. The visual bible itself says to target close visual fidelity rather than claim literal pixel identity where generated mockup glyphs or details are inconsistent. The five source PNGs are layout references; they must not be published as page backgrounds or public artwork without rights/editorial approval.

**Repository constraints:** Empire is an isolated static pilot under ADR-0012; Dock remains canonical LIGHTHOUSE under ADR-0011. Keep bilingual `id`/`en`, existing route ownership and noindex behavior. The project owner explicitly authorized an isolated Vercel production project on 2026-10-29; do not alter the existing Vercel project, add a custom domain/DNS, backend, authentication owner, or database. Keep screenshot references private in docs. The owner approved only the five generated WebP illustrations for publication; source PNGs and editorial/religious/source content remain unapproved. Respect the AI execution contract and canonical `TODO.md` task packets/statuses.

## Existing baseline to review before assigning work

- Five reference pages and their design/content/token/asset contracts are under [`apps/empire-web/docs/story-universe/`](../../apps/empire-web/docs/story-universe/).
- Five page surfaces and original generated preview art already exist locally. Their exact visual match is not established; see the per-page gaps in the [Story Universe checkpoint](../../apps/empire-web/docs/story-universe/README.md).
- Empire currently consumes MoonUI in an app-scoped theme. The existing [MoonUI integration bridge](../../packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md) says the shared package stays unchanged for this integration. Do not change shared MoonUI solely to make the Empire skin; first prove a missing reusable primitive and route the change through MoonUI ownership.
- Existing cross-app accessibility/localization and MoonUI evidence such as M19-34 and M30-05 may be reused only where their scope and exact-SHA evidence actually cover the Empire code. Do not treat another app's evidence as Empire sign-off.

## Proposed work items

IDs below are draft labels for discussion and packet creation. They do not change `TODO.md` or establish eligibility, ownership, or completion.

### EOL-01 — Freeze the visual and content acceptance baseline

**Purpose:** turn the five references into one unambiguous, page-specific review contract before further visual tuning.

**Scope:** read all five PNGs side by side with `VISUAL_BIBLE.md`, `design_tokens.json`, `content_manifest.json`, `asset_manifest.json`, the generated-art manifest, and the current implementation. Record each page's viewport, section order, alignment, relative widths/heights, focal point, colors, typography hierarchy, card count, controls, and footer. Separate observable screenshot facts from inferred design values and illustrative-only copy/data.

**Acceptance:** a reviewed comparison sheet covers REF-01 through REF-05; every visual note points to a reference/page region; no mockup-only live count, link, event, or claim is presented as real; the acceptance matrix names the agreed viewports and tolerances; source PNG checksums still match their manifest.

**Evidence:** comparison sheet, exact source SHA, checksum result, and reviewer notes.

### EOL-02 — Audit current routes and preserve unrelated work

**Purpose:** establish a safe implementation baseline and prevent visual work from breaking existing app contracts.

**Scope:** record branch, HEAD, and dirty/untracked files; map the five bilingual routes and page owners; review export/noindex checks, locale switching, link destinations, current MoonUI imports, and app-scoped CSS. Identify which routes are implemented, which are fixtures, and which links have no real destination.

**Acceptance:** route matrix lists `id` and `en` for all five page types; every visible control has a real local destination or is explicitly disabled/omitted; existing dirty files and private references are preserved; no unrelated TODO or app changes are included.

**Evidence:** baseline SHA, route/control matrix, focused existing validation results if implementation work is authorized.

### EOL-03 — MoonUI inventory and Empire integration decision

**Purpose:** make the Empire UI consistent with the shared design system while respecting package ownership.

**Scope:** inventory actual exports/styles in `packages/moonui` for buttons, links, cards, badges, icons, search, navigation/drawer, tabs, filters, focus, typography, tokens, and reduced motion. Compare these against the Story Universe needs and the integration bridge. Map each Empire element to a shared primitive or a clearly scoped app composition.

**Acceptance:** an element-by-element MoonUI mapping exists; no copied MoonUI primitive or unscoped global override is introduced; Empire-specific colors and typography are scoped to Empire; shared MoonUI changes are proposed only for a demonstrated reusable gap, with MoonUI owner review and a separately eligible task before modifying that package.

**Evidence:** export/style inventory, mapping table, boundary review, and any approved shared-package task reference.

### EOL-04 — Tune the Empire theme and design tokens

**Purpose:** match the dark editorial visual language without drifting from MoonUI or scattering style values.

**Scope:** map screenshot-sampled black/charcoal, warm gold, ivory, red, moonlight, muted text, border, focus, and status roles into the scoped Empire theme. Tune type scale, condensed display treatment, serif editorial treatment, body reading size, tracking, line-height, spacing, page width, grid gaps, border thickness, image ratios, and breakpoints against the actual mockups.

**Acceptance:** all Empire visual values use named scoped tokens or existing MoonUI tokens; no arbitrary hex values are scattered in components; headings and body have documented roles; key contrast/focus states remain readable; changes are compared against all five references and do not alter other apps' MoonUI skin.

**Evidence:** token mapping, before/after viewport captures, contrast/focus review, focused lint/type/build evidence when implementation is authorized.

### EOL-05 — Complete the semantic vector icon system

**Purpose:** bring icon shape, scale, stroke, color, and meaning into a coherent system matching the mockups.

**Scope:** audit MoonUI's real icon exports first. Define a single mapping for crescent/brand, search, stories, people, origin, guardian, school, universe, bookmark, previous/next, truth, compassion, action, unity, user, symbolism, traits, conflict, wisdom, links, relation graph, schedule, learning paths, crown/XV, and external links. Use existing MoonUI icon components when available; for genuinely missing marks, use original small SVGs with consistent viewBox, stroke, optical weight, and accessible names. Keep SVG decorative marks hidden from assistive technology and expose adjacent visible labels where meaning matters.

**Acceptance:** no emoji-as-icon, inconsistent stroke weights, or hand-drawn duplicate of an existing MoonUI glyph; all visible controls have accessible names and focus states; decorative icons are `aria-hidden`; the three-person relationship diagram has real SVG connectors and a readable text equivalent; active/category meaning does not depend on hue alone.

**Evidence:** icon mapping sheet, SVG audit, keyboard/screen-reader review notes, screenshots at target sizes.

### EOL-06 — Match shared header, navigation, and footer

**Purpose:** make the global chrome match all five references and behave correctly on desktop and mobile.

**Scope:** tune logo/crescent lockup, brand descriptor, exact navigation order, search control, CTA, active red label/underline, header height/divider, footer columns/copy/divider, and mobile menu drawer. Map the active route correctly for home, stories, reader/GGS, and characters. Search must search approved local content or not appear as an active control. CTA must point to a real local values/mission section or route.

**Acceptance:** all menu entries appear in the specified order on desktop and in the accessible mobile drawer; locale switch preserves corresponding pathname where a translation exists; drawer supports keyboard, Escape, focus return, and touch; no guessed social URLs or dead menu links; header/footer geometry and typography match references at target widths.

**Evidence:** route-by-route chrome captures in both locales, keyboard interaction results, link integrity output.

### EOL-07 — Resolve artwork and rights path per visual region

**Purpose:** achieve reference-like art direction without treating private layout screenshots as cleared production images.

**Scope:** inventory every artwork region in the five PNGs: home city/moon/back-view figure and four world covers; library hero and story covers; reader poster plus four sequential comic panels; Codex guardian and relationship graphic; GGS academy and lesson imagery. For each region record exact available source, rights/consent, whether original licensed source files or layered files exist, and the approved replacement brief. Keep source references in docs and output artwork separate from them.

**Acceptance:** each region has either a source with documented permission or an original artwork brief/asset with review status; no source screenshot is embedded as a full page; all character depictions follow no-face and spiritual-representation rules; no copyrighted lyric or unverified sacred text appears in art; public-release status remains blocked until human review is recorded. The reader has four distinct sequential panels, not four unrelated crops of the five page illustrations.

**Evidence:** asset-by-region ledger, hashes/dimensions, creator/source and rights status, editorial review record, local preview captures.

### EOL-08 — Refine REF-01 Home composition

**Purpose:** match the home mockup's cinematic hero and four-world layout.

**Scope:** tune the left text/right artwork balance, moon and figure focal positions, four-line H1 and white/red split, eyebrow, subtitle, two CTAs, vertical/brush decorative labels, verified stats, four individual covers, foundations row, section transitions, and footer.

**Acceptance:** desktop order and relative proportions follow REF-01; ROCKSOUL is shown from behind/silhouette with no visible face; each of four cards has unique art and approved copy; count is derived from the manifest rather than a hardcoded illustrative number; buttons have real destinations; mobile reflows without burying the key title or clipping the artwork.

**Evidence:** REF-01 side-by-side captures at all matrix viewports, route and link checks.

### EOL-09 — Refine REF-02 MoonStories Library

**Purpose:** match the library hero, filters, search controls, and distinct card grid.

**Scope:** tune title/hero proportions, category controls and their icons, search field, world/status filters, sorting, result count, card art crop, metadata hierarchy, border and hover/focus treatment, empty state, and responsive grid.

**Acceptance:** filter/search/sort visibly affect the local fixture set; filter state is keyboard-accessible; results and empty-state copy are localized; cards link only to implemented routes; desktop shows the intended four-column composition, tablet two columns, and mobile one column without horizontal overflow; every card has distinct image/crop and meaningful alt text.

**Evidence:** REF-02 captures, positive/negative filter cases, keyboard review, localized empty/results state.

### EOL-10 — Refine REF-03 Story detail and comic reader

**Purpose:** reproduce the cover/synopsis/chapter layout and make the reader a complete, accessible interaction.

**Scope:** tune left poster and right synopsis/metadata/chapter alignment; create four separately authored panels matching the mockup's story sequence; add page thumbnails, selected-page state, previous/next, transcript/captions, progress, loading/missing-art fallback, and back navigation. Do not invent licensed lyrics or quotes.

**Acceptance:** all four panels are distinct and sequential, thumbnail selection and previous/next remain synchronized, boundaries disable or wrap according to an explicit rule, transcript matches displayed panel and locale, keyboard controls are discoverable, image alternatives describe relevant content, and layout preserves cover/title at desktop/tablet/mobile.

**Evidence:** REF-03 captures, interaction sequence results for first/interior/last panel, transcript/locale review.

### EOL-11 — Refine REF-04 Character Codex

**Purpose:** match the guardian profile, six attributes, and relationship diagram.

**Scope:** tune hero image placement/crop and name hierarchy, profile/role/symbolism text, six trait cards and their icons, conflict/wisdom sections, relationship graph lines and nodes, related-story links, and responsive ordering.

**Acceptance:** all six traits are represented consistently with the mockup and approved content; connection graph labels remain readable without relying on color; the text equivalent explains ROCKSOUL ⇄ AngelWithShotgun ⇄ MYLUFT; no divine or literal angel claims are introduced; all related links resolve to existing pages.

**Evidence:** REF-04 captures, content/route review, graph accessibility check.

### EOL-12 — Refine REF-05 GGS Full Moon School

**Purpose:** match the academy hero, fictional lesson, reflection, session panel, and learning paths.

**Scope:** tune moonlit academy art and crop, school identity, lesson hierarchy, reflection layout, fictional clock/session treatment, disclosure, three lesson cards, four learning paths, icons, and footer transition.

**Acceptance:** GGS is clearly identified as fictional; no real-time/public event or institution claim is implied; displayed time is labeled illustrative/fictional; session or lesson controls work locally or are not styled as active; paths and lesson content are bilingual and link only to implemented destinations; section order and proportions follow REF-05.

**Evidence:** REF-05 captures, content/fiction disclosure review, route/interaction checks.

### EOL-13 — Complete localization and script-direction parity

**Purpose:** ensure visual fidelity survives Indonesian and English copy and future approved RTL/source-language content.

**Scope:** verify every navigation label, CTA, filter, card, lesson, metadata, empty/error/loading state, alt text, and reader transcript in `id` and `en`; preserve semantic `lang`; keep source-language direction independent from UI locale; use true RTL text containers for any approved Arabic rather than image text or CSS letter spacing.

**Acceptance:** no missing locale keys or mixed-language UI; equivalent `id`/`en` routes work; long translations do not collide, truncate essential content, or change reading order; if Arabic is present it renders selectable Unicode with verified source metadata and correct `dir="rtl"`; existing M19 language evidence is reused only if Empire is in its actual scope.

**Evidence:** complete locale route/content matrix, missing-key result, long-copy captures, script-direction checks.

### EOL-14 — Responsive, accessible, and motion review

**Purpose:** retain the mockup's hierarchy across real device sizes and provide equivalent interaction without a mouse.

**Scope:** check 390×844, 768×1024, 1122×1402, 1440×900, and 1920×1080 as named in the local reference package. Review landmarks/headings, contrast, focus, keyboard, touch targets, image alternatives, form labels, dialog/drawer semantics, reduced motion, zoom/reflow, and screen-reader reading order.

**Acceptance:** no clipped/off-screen content or horizontal page overflow; no hover-only action; focus is always visible; controls meet project accessibility requirements; reduced motion removes nonessential movement; text remains usable at zoom; mobile menu and reader can be completed using keyboard and touch.

**Evidence:** exact viewport screenshot matrix, focused accessibility results, reduced-motion captures, issue list with closure evidence.

### EOL-15 — Tune visual parity using screenshot comparisons

**Purpose:** replace subjective “looks close” with repeatable page-region comparison.

**Scope:** capture the local app and reference at the same viewport, locale, scroll offset, and browser scale. Compare page segmentation, bounding boxes, image focal/crop, color distribution, heading line breaks, grid widths, and whitespace. Keep image content differences separate from layout differences. Iterate page by page in priority order P0 structure, P1 typography/spacing, P2 texture/decor.

**Acceptance:** every page has paired reference/current screenshots for the agreed viewport matrix; each significant difference has a recorded decision or resolved capture; all P0 items are closed; P1 differences fit an agreed tolerance or are explicitly explained by unavailable/uncleared source material; no “pixel-perfect” claim unless a measured acceptance rule is met and reviewed by a human.

**Evidence:** before/after capture set, comparison report, exact app SHA, outstanding-difference register and human sign-off.

### EOL-16 — Verify content, security, export, and performance boundaries

**Purpose:** ensure visual assets and features remain safe in the static pilot.

**Scope:** check noindex/metadata, static export routes, local-only fixture labels, asset hashes and sizes, alt text, no source PNG references in exported HTML, no secrets/private content, no fake live counts, no broken images, and acceptable loading/LCP behavior for large hero art. Keep only local preview files in the pilot until their approval gate is satisfied.

**Acceptance:** the export contains intended pages but not private reference PNGs; noindex remains present; every image loads or has a designed fallback; generated and source artwork status is accurate; no unapproved content or production integration is added; build and focused export/content checks pass at a recorded SHA.

**Evidence:** export-check output, asset report, metadata/link scan, performance capture if available, review notes.

### EOL-17 — Human visual, editorial, and rights acceptance

**Purpose:** decide whether the visual and content package is acceptable to advance beyond local preview.

**Scope:** review all five pages in `id`/`en`, all final artwork, character depiction, quotations, lesson/source statements, rights records, accessibility findings, and the comparison report. Decide per asset whether it remains preview-only, is replaced, or has documented publication approval.

**Acceptance:** named human/integrator decision is recorded for each artwork/content group; unresolved rights or editorial items remain blocked; visual differences and their reason are acknowledged; local preview acceptance is distinct from any release/deployment approval.

**Evidence:** signed review record and exact reviewed SHA. This item does not authorize production deployment.

## Suggested sequencing

1. EOL-01 and EOL-02 establish the evidence and preserve the current tree.
2. EOL-03 audits MoonUI, then EOL-04 and EOL-05 settle the scoped theme and icon contract.
3. EOL-06 and EOL-07 establish shared chrome and approved artwork direction.
4. EOL-08 through EOL-12 tune each page independently; EOL-13 addresses bilingual parity alongside them.
5. EOL-14 and EOL-15 run the viewport/accessibility and screenshot-difference loop.
6. EOL-16 verifies the static pilot boundaries; EOL-17 records human acceptance.

Before coding, an integrator must map eligible work to the canonical `TODO.md`, confirm prerequisites and ownership under `docs/planning/AI_EXECUTION_CONTRACT.md`, and create/approve any needed task packets. The proposed EOL labels above are not task leases and cannot be checked off as official project status.

## Completion definition

The visual-fidelity goal is complete only when all five routes have bilingual, reviewed captures at every agreed viewport; P0 differences are resolved; remaining P1/P2 differences have documented reasons and human acceptance; unique page artwork and semantic vector icons are reviewed; MoonUI reuse/package boundaries are respected; interactions, accessibility, export and content/rights gates have evidence; and the exact reviewed SHA is recorded. A passing build alone is not visual or publication approval.

## Lampiran A — Rincian pelaksanaan per langkah

Bagian ini memperluas workstream di atas menjadi unit kerja yang bisa ditinjau satu demi satu. Kode `A01–H10` mengikuti urutan task lokal di §17 `VISUAL_BIBLE.md`; ini adalah **rincian scope dan bukti penerimaan**, bukan status atau task lease. Sublangkah tambahan diberi akhiran seperti `B11` dan `C08`. Integrator tetap harus memetakan gap yang benar-benar baru ke `TODO.md` sebelum pelaksanaan sesuai kontrak repo.

### Tahap A — Inventaris, kontrak, dan batas proyek

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| A01 | Baca `BLUEPRINT.md`, `TODO.md`, ADR-0011/0012, panduan Empire, kontrak eksekusi, serta bukti CI terbaru. Catat mana keputusan yang diterima, mana spesifikasi usulan, dan mana klaim yang belum diverifikasi. | Tabel sumber otoritatif → keputusan yang berlaku; SHA basis; daftar gerbang yang belum terpenuhi. |
| A02 | Buka kelima PNG bersamaan pada ukuran aslinya; pastikan dimensi 1122×1402 dan SHA-256 cocok dengan manifest. Untuk setiap gambar, tandai batas header, hero, kartu, panel bawah, footer, focal point, dan crop. | Hasil hash/dimensi; lembar anotasi REF-01 sampai REF-05 yang menyebut area dan rasio yang terlihat. |
| A03 | Audit ekspor nyata MoonUI: komponen, token, skin, icons, button/link/card/badge, navigasi, tabs, forms, focus, motion. Buktikan nama export dari kode; jangan menebak dari nama ikon umum. | Inventaris `nama komponen/export → lokasi → sudah dipakai Empire? → bisa dipakai? → gap?`; daftar ikon yang benar-benar tersedia. |
| A04 | Audit semua route lokal dan kedua locale; cek metadata/noindex, static params, export, internal links, error/404, dan cara aplikasi dijalankan. Bedakan route nyata, fixture, dan URL yang hanya direncanakan. | Matriks route ID/EN × page × noindex × status lokal × validasi yang benar-benar dijalankan. |
| A05 | Untuk setiap referensi, pasangkan area mockup ke route, data, komponen, state, art asset, dan locale. Tandai komponen shared chrome vs komponen khas halaman. | Lima peta `REF → section → component → data → interaction → asset`; semua area screenshot terpetakan. |
| A06 | Periksa ejaan canon, nama karakter, hubungan ROCKSOUL/AngelWithShotgun/MYLUFT, status fiksi GGS, jumlah halaman/chapter yang memang disetujui. Jangan membuat bab atau klaim narasi baru untuk mengisi layout. | Daftar nama/relasi/copy approved vs draft vs ilustratif; setiap konten yang belum pasti diberi status dan pemilik review. |
| A07 | Lacak sumber teks suci, transliterasi, terjemahan, komentar, kutipan, dan lirik yang mungkin muncul di mockup atau panel. Validasi edisi, konteks, izin, dan batas kutip. | Source ledger per kutipan; item tanpa sumber/izin ditandai blokir dan tidak masuk konten render publik. |
| A08 | Buat daftar aset berdasarkan wilayah gambar: referensi privat, AI preview, calon artwork baru, logo/vector, thumbnail, dan fallback. Catat siapa membuat, asal, dimensi, lisensi/izin, hash, penggunaan dan persetujuan. | Ledger aset per halaman; aturan no-face; pemeriksaan tidak menggambarkan Allah/Nabi atau mengklaim malaikat literal; status persetujuan per aset. |
| A09 | Pastikan perubahan tetap pada pilot `apps/empire-web`, tidak memindahkan kepemilikan LIGHTHOUSE dari Dock, tidak menambah backend/auth/DB/domain, dan tidak mengubah aset/copy aplikasi lain. | Catatan boundary dan review diff yang menunjukkan hanya pemilik file yang sesuai tersentuh. |
| A10 | Bandingkan gap terhadap milestone/task canonical yang sudah ada; gunakan kembali task yang scope-nya benar. Ajukan task resmi hanya untuk gap baru dengan owner, prasyarat, packet, DoD dan bukti; integrator yang berwenang mengatur status. | Crosswalk `gap → TODO ID existing/new proposal → dependency → packet`; tidak ada status resmi yang diubah oleh draf ini. |

### Tahap B — MoonUI, identitas visual, chrome, dan ikon

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| B01 | Buat pemetaan token Empire `--eol-*` ke peran canvas, surface, elevated, ink, muted, border, gold, red, moonlight, shadow, success, warning, info, focus dan disabled. Nilai mockup dianggap titik awal; ukur dan tune dari PNG. | Token table dengan nilai, pemakaian, kontras, sumber perkiraan, dan halaman yang menggunakannya; tidak ada warna Empire liar di komponen. |
| B02 | Bentuk logo responsif: crescent orisinal/MoonUI yang tersedia, wordmark `A-L-L-A-H.COM`, descriptor `EMPIRE OF THE LIGHT`; cek ukuran desktop/mobile, alignment dan tracking. | Screenshot logo di 360/390px serta desktop; SVG valid dengan `viewBox`, tidak pecah saat diperbesar, accessible name tunggal, tidak menyalin logo yang haknya tidak jelas. |
| B03 | Bangun header semantik: skip link, logo, nav urutan HOME/STORIES/CHARACTERS/KNOWLEDGE/TIMELINE/ECOSYSTEM/ABOUT, tombol search, CTA. Pasang active label merah + underline berdasarkan route dan `aria-current`. | Matriks route → nav aktif; screenshot kelima route; hasil keyboard dan locale navigation; semua href terbukti ada atau tidak dirender sebagai tautan. |
| B04 | Bangun mobile drawer pada lebar 360–767px: trigger, expanded state, backdrop, tutup dengan tombol dan Escape, fokus masuk/keluar, scroll lock, tap target, urutan semua menu. | Rekaman langkah keyboard/touch; fokus kembali ke pemicu; tidak menutup konten/menyisakan tab stop tersembunyi; tangkapan saat terbuka dan tertutup. |
| B05 | Pilih perilaku pencarian yang nyata: dialog/form lokal yang mencari manifest approved, hasil bernama dan tautannya valid, pesan kosong dan clear; bila belum ada implementasi, hilangkan tombol aktif sesuai desain. | Kasus cocok/tidak cocok/kosong/clear, keyboard submit/close, lokalisasi, serta bukti tidak mencari konten yang statusnya dilarang. |
| B06 | Bentuk footer dengan logo, nav yang tersedia, motto, divider emas, label universe dan sosial hanya bila URL resminya diverifikasi. Hilangkan atau ganti tanggal `EST. 2025` ilustratif. | Kelima halaman menutup dengan grid footer konsisten; semua tautan diuji; tidak ada sosial palsu atau tanggal sejarah karangan. |
| B07 | Cocokkan typography role: serif wordmark, condensed heavy hero dengan white/red split, serif editorial, sans body, condensed uppercase nav/eyebrow, angka tabular. Audit lisensi dan local loading/fallback font sebelum memilih kandidat. | Tabel role/font/weight/fallback; screenshot line-break tiap H1; font tidak menyebabkan layout shift besar; teks isi terbaca pada zoom dan mobile. |
| B08 | Buat pola hero dan panel yang bisa dipakai ulang tanpa membuat lima halaman jadi template sama: overlay bertingkat, gradient untuk teks, border tipis, grain sangat ringan, localized moon glow, editorial section transition. | Lima hero berbeda yang memakai token bersama; tidak ada dekorasi menutupi teks/focal art; prefers-reduced-motion dan performa diperiksa. |
| B09 | Tentukan slot artwork: `cover`, `hero`, `panel`, `thumbnail`, `fallback`; object-fit/position per asset; rasio poster 3:4–4:5; crop rule desktop/mobile; loading dan missing-art state. | Peta asset-to-slot; tidak ada crop yang memotong wajah/objek penting/judul; gambar punya dimensi dan alternative text; fallback bisa dilihat. |
| B10 | Terapkan focus ring gelap/emas yang tampak pada semua komponen, state hover/pressed/disabled/error, kontras, dan pengurangan motion. | Peta state komponen + screenshot fokus; pemeriksaan keyboard; bukti reduced-motion; pemeriksaan tidak mengandalkan warna saja. |
| B11 | Audit semua glyph yang dipakai halaman. Pemetaan minimum: crescent, search, menu/close, users, compass, shield, graduation cap, orbit, bookmark, arrow, book, chevron, crosshair, lotus, mountain, interlocking circles, user, moon, sparkles, eye, link, calendar, atom, crown/XV, external link. Pakai MoonUI jika export ada; selain itu SVG original terkontrol. | Icon inventory `konsep → export/komponen → ukuran → stroke → warna → label`; seluruh penggunaan emoji pengganti ikon dihapus. |
| B12 | Tentukan aturan produksi SVG: ukuran optik 16/20/24/32, satuan stroke 1.5–2, linecap/linejoin konsisten, `viewBox` rapat, tanpa inline teks dalam path, warna via `currentColor`, dekoratif `aria-hidden`, semantik bernama. | Audit seluruh SVG: valid, tidak terpotong, konsisten, dapat diwarna token, label tombol terpisah dari glyph; graph punya teks ekuivalen. |
| B13 | Putuskan kapan ikon/komponen baru masuk MoonUI bersama. Theme Empire tetap di `apps/empire-web`; komponen hanya dipromosikan bila perilaku/semantik dapat dipakai ulang dan MoonUI owner menyetujui. | Catatan keputusan per gap; perubahan bersama memiliki task eligible, consumer kedua yang relevan, tes semua skin; tanpa kebutuhan terbukti, package MoonUI tidak berubah. |

### Tahap C — REF-01 Home

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| C01 | Pertahankan route dan locale sekarang; petakan isi home ke manifest yang disetujui. Pastikan link home, card, values, about dan locale switch tidak mengarah ke placeholder. | Daftar semua elemen dan tujuan; verifikasi `/id` dan `/en`, metadata dan jalur balik. |
| C02 | Set hero dua kolom: teks kiri sekitar 45%, art kanan sekitar 55% pada lebar referensi; bulan besar, kota neo-gotik, ROCKSOUL membelakangi kamera, banner XV. Atur focal point tiap breakpoint. | Capture yang menunjukkan komposisi dan crop; karakter tidak berwajah; fokus bulan/karakter tidak tertutup copy. |
| C03 | Render H1 empat baris sesuai visual: `WHEN THE / MOON RISES, / WE SHARE / MESSAGES.`; dua baris awal ivory, dua akhir scarlet; eyebrow, subtitle, tracking dan line-height sesuai kontrak. | Perbandingan line-wrap 1122/1440px dan reflow mobile; tidak ada teks sebagai bagian bitmap. |
| C04 | Jadikan CTA `EXPLORE STORIES` dan `READ THE VISION` tautan nyata; gaya primer merah dan sekunder outline/charcoal; state fokus/hover/pressed. | Kedua alur navigasi diuji; tidak ada `#` kosong atau aksi tanpa hasil. |
| C05 | Bentuk empat kartu unik: Manusia Pulpen, AngelWithShotgun, GGS, Empire of the Light; nomor, jenis dunia, judul dua baris, tagline, cover dan status sesuai content manifest. | Empat crop berbeda; salinan approved; route hanya aktif jika tersedia; grid 4/2/1 kolom pada desktop/tablet/mobile. |
| C06 | Susun empat fondasi: Truth-seeking/crosshair, Compassion/lotus, Meaningful Action/mountain, United Humanity/interlocking circles. Jaga label, ikon emas, deskripsi, gutter dan baseline sama. | Screenshot 4 kolom dengan tiap ikon benar; label/teks tersedia tanpa mengandalkan glyph. |
| C07 | Bandingkan keseluruhan home pada viewport matriks; catat urutan hero/story worlds/principles/footer, tinggi section, whitespace, focal point, crop dan typography. | REF-01 full-page dan first viewport paired; semua gap P0/P1 ditandai dan ditindaklanjuti. |
| C08 | Validasi stats di home; `4+`, `∞`, `1` diperlakukan sesuai jenis datanya. Jangan mengubah ilustrasi menjadi bukti jumlah/live counter. | Setiap angka bersumber dari manifest atau diberi label simbolis/editorial; tidak ada angka dinamis palsu. |

### Tahap D — REF-02 MoonStories Library

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| D01 | Bentuk typed story manifest untuk empat dunia: id stabil, slug, judul, kategori, tagline ID/EN, copy, art key, status publikasi/review, tanggal hanya bila sah, route tersedia. | Schema/manifest valid; tidak ada nilai default palsu; fixture jelas lokal; data sensitif/ilegal tidak disertakan. |
| D02 | Susun hero khusus Library: title dua baris MOONSTORIES/LIBRARY, eyebrow, intro, panoramic city art, active Stories dan crop terarah. | Capture REF-02; bukan hero home yang sekadar disalin; header/hero alignment terbukti. |
| D03 | Implementasikan lima kategori berurutan All, Origin, Guardian, Learning, Universe dengan icon semantic, label, sublabel, selected state, jumlah terhitung. | Urutan dan ikon sesuai contract; klik/keyboard memilih kategori; nama dan status tampil pada ID/EN. |
| D04 | Search di judul, world, character dan theme pada data approved; dukung hapus teks, tombol clear, kondisi kosong, fokus dan pencarian lokal. | Tes kata yang ada/tidak ada, case/spacing sesuai kebutuhan; hasil kosong menawarkan reset; tidak ada hasil rekaan. |
| D05 | Implementasikan sort terbaru hanya bila tanggal tersedia; filter world dan status; aturan kombinasi filter/search; reset semua. | Uji kombinasi 2+ filter, urutan stabil, no-date behavior, result count berasal dari hasil aktual. |
| D06 | Bangun empat varian kartu semantik dengan poster berbeda, crop individual, meta label, judul, ringkasan dan tautan. Bookmark hanya jika simpan state benar-benar bekerja. | Masing-masing card berkonten unik; alt sesuai gambar; hover/focus sama; card tidak mengaku publish jika status draft/proposed. |
| D07 | Hapus/cegah angka ilustratif seperti `50+`; turunkan jumlah dari manifest; bedakan simbol metaforis dari statistik. | Audit teks dan manifest menunjukkan count yang sama; tidak ada angka hardcode yang bisa dianggap metrik. |
| D08 | Lengkapi copy/alt ID dan EN serta interaksi keyboard tabs/filter/select/search; pastikan fokus tidak hilang setelah hasil diperbarui. | Matriks locale dan kontrol; keyboard-only pass; label kontrol diumumkan screen reader. |
| D09 | Bandingkan REF-02 pada semua viewport; cek hero, tile kategori, toolbar, empat kartu, stat row, footer. | Paired captures dan daftar selisih; tidak ada overflow/clip; fokus visual utama sama. |
| D10 | Definisikan state awal, searching, filter aktif, hasil kosong, error fixture, dan gambar gagal; jangan menampilkan panel skeleton seolah konten live. | Screenshot/state matrix; setiap pesan ID/EN; semua state menyatakan kondisi dengan jujur. |

### Tahap E — REF-03 Detail cerita dan comic reader

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| E01 | Tentukan route/slug serta chapter statis yang sungguh ada. Jangan membuat route chapter-02 atau karakter baru sekadar mengisi navigation. | Route table dan static params hanya berisi slug valid; 404 untuk yang belum ada; locale pasangan dicek. |
| E02 | Cocokkan komposisi cover potret tinggi di kiri dan detail/synopsis di kanan, breadcrumb, overlay/crop, title `ANGELWITH / SHOTGUN`, red emphasis. | Capture REF-03 di viewport lebar dan sempit; title/cover terbaca dan tidak tertimpa. |
| E03 | Susun metadata tiga blok (core theme, story world, tone), reflection/wisdom box dan synopsis; bedakan narasi dengan kutipan/sumber eksternal. | Susunan, label, source caveat dan format sama; teks unverified tidak tampil sebagai ayat/klaim verified. |
| E04 | Buat manifest chapter/pages empat nomor dengan label, alt, transcript, locale, assetKey, status editorial dan urutan eksplisit. | Empat record valid; halaman ke-1/2/3/4 tidak duplikat; status draft mencegah klaim rilis. |
| E05 | Siapkan empat ilustrasi panel sequential dengan gaya, karakter, pencahayaan, dan komposisi yang kontinu; thumbnail portrait, border crimson saat selected. | Empat art asset berbeda dan berurutan; proof board membandingkan kontinuitas; approval/rights status per panel. |
| E06 | Navigasi sebelumnya/berikutnya dan pemilihan thumbnail mengubah gambar, nomor, judul panel, alt, transcript dan progress bersama-sama; aturan batas jelas. | Tes halaman pertama, interior, terakhir, klik thumbnail; semua elemen state selalu sejalan; tidak ada halaman/chapter palsu. |
| E07 | Tambahkan transcript/deskripsi di bawah visual, pertahankan semantik `<article>` dan heading; hindari teks penting tertanam dalam gambar. | Panel bisa dipahami tanpa melihat gambar; transcript lokal; screen reader mengumumkan nomor dan judul panel. |
| E08 | Rancang rail thumbnail untuk desktop dan susunan/swipe/touch di ponsel tanpa bergantung gesture; tombol memiliki label. Keyboard arrows tidak mengambil alih saat fokus di input. | Capture rail dan mobile; sequence keyboard/touch; fokus jelas; ukuran tombol memadai. |
| E09 | Lakukan review canon, keselamatan, hak musik/quote, gambar senjata/konflik dan sumber keagamaan; nada menekankan perlindungan manusia, bukan glorifikasi serangan. | Approval notes; teks/sumber tak tersetujui tidak dimasukkan; no-face/no-literal-angel rule pass. |
| E10 | Screenshot compare REF-03 pada matriks ukuran, state page 1/interior/4, locale id/en. | Paired captures page layout dan reader state; laporan crop, ratio, whitespace, nav, controls. |
| E11 | Pastikan loading, missing asset, transcript unavailable, invalid slug dan akhir chapter punya tampilan nyata dan tidak menjanjikan fungsi tak tersedia. | Negative-case captures, link/404 checks, localized messages; tidak ada dead button. |

### Tahap F — REF-04 Character Codex

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| F01 | Bentuk typed character manifest hanya untuk ROCKSOUL, AngelWithShotgun, MYLUFT dan atribut yang disetujui; pisahkan nama, title, pronoun bila sah, symbolism, trait, related story. | Schema + content review; tak ada identitas/riwayat/atribut yang dikarang; hubungan punya jenis eksplisit. |
| F02 | Bangun hero CHARACTER/CODEX dengan `PEOPLES. PATHS. PURPOSES.`, visual guardian back-view dan active Characters. | Capture REF-04; focal crop sesuai; tak menampilkan wajah jelas. |
| F03 | Susun featured profile AngelWithShotgun: overline, heading, subtitle, bio singkat, tombol Read Full Bio/Story Appearances yang mengarah ke tujuan nyata. | Dua CTA valid; profil jelas fiksi/naratif; title, body, image hierarchy cocok. |
| F04 | Render enam kartu berurutan: Role, Symbolism, Traits, Internal Conflict, Wisdom, Story Links; satu icon tiap makna. | Tepat enam kartu; label/sub-label/ikon selaras; responsif, tidak ada duplikasi semantik. |
| F05 | Bentuk dua related-character card untuk ROCKSOUL dan MYLUFT dengan gambar/siluet yang aman, nama dan konteks hubungan. | Dua karakter beda; wajah tidak tampak; MYLUFT tidak divisualkan sebagai sosok ilahi. |
| F06 | Gambar relationship map sebagai SVG terukur dengan node/connector/arah; sertakan daftar hubungan linear teks. | Layout tak tumpang-tindih 390 sampai desktop; koneksi dimengerti tanpa warna dan SVG punya accessible label. |
| F07 | Encode relasi: ROCKSOUL ↔ AngelWithShotgun adalah alter ego; MYLUFT adalah inspirasi cerita/naratif sebagaimana kontrak, bukan hubungan yang dikarang. | Label relasi konsisten pada graph, copy, manifest dan filter; review canon mencatat sumber. |
| F08 | Tampilkan link story terkait hanya untuk halaman benar-benar tersedia dan statusnya boleh dilihat. | Semua tautan dicek, locale terjaga, draft tidak tampil sebagai publish. |
| F09 | Bandingkan REF-04: rasio hero, profil lebar, enam trait, dua karakter terkait, graph dan footer. | Paired captures per viewport; selisih koordinat/tinggi panel dan line wrapping dicatat. |
| F10 | Uji pembesaran teks, graph pada mobile, pembaca layar, dan fallback bila SVG tidak termuat. | Text list menjadi fallback memadai; semua fakta hubungan terbaca tanpa diagram. |

### Tahap G — REF-05 GGS Full Moon School

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| G01 | Buat lesson/path manifest dengan locale, slug, art, status draft/published, fiction flag, source state dan destinations. | Validasi schema; semua lesson/session jelas fiksi; hanya konten approved dapat tampil sebagai terbit. |
| G02 | Bangun hero akademi purnama yang khas, langit/bulan dominan, pelajar membelakangi kamera, judul tiga baris, subtitle/intro dan CTA. | Capture REF-05; tidak menyerupai hero generic; art dan crop unik; tidak tampak seperti sekolah nyata. |
| G03 | Susun `The Forgotten Prayer`: judul, tagline, deskripsi, waktu cerita 10:12 WIB, format, audience, setting. Label waktu eksplisit sebagai waktu dalam cerita. | Tidak ada kesan live/real-time; seluruh field bilingual dan urutan visual sesuai. |
| G04 | Ganti `LIVE NOW`, `JOIN TODAY`, RSVP, trailer atau tanggal lama dengan copy statis yang jujur; bila tidak ada tujuan, render non-interaktif. | Audit teks/DOM tidak menemukan klaim live, registrasi, atau jadwal nyata palsu. |
| G05 | Buat panel `Gratitude After Hardship` dengan judul, refleksi dan pemisahan jelas antara narasi fiksi, keyakinan pribadi, dan sumber. | Hierarki/ukuran panel mirip referensi; konten telah direview; tidak menyatakan tafsir sebagai otoritas. |
| G06 | Buat tiga kartu lessons dengan ikon, deskripsi, status dan destination; hanya detail page yang sudah ada dapat diaktifkan. | Tiga kartu berurutan dan unik; tidak ada `href` palsu; hover/focus/disabled sesuai state. |
| G07 | Buat kartu Full Moon Sessions sebagai fitur dunia cerita; tanpa reservasi, countdown, event date atau participant count yang sungguhan. | Label fiction terlihat; tanggal placeholder dihilangkan; tidak ada form/event API/release claim. |
| G08 | Susun empat Learning Paths Faith & Self, Character & Action, Society & Humanity, Science & Creation beserta icon/copy. | Empat jalur dan empat icon tepat; jalur tanpa halaman target tidak tampak aktif. |
| G09 | Pisahkan Yunus 10:12 dari refleksi buatan; periksa teks Arab, transliterasi/terjemahan, edisi, konteks, hak dan `dir="rtl"`. Jika belum terverifikasi, jangan tampilkan kutipan sebagai benar. | Source citation lengkap dan persetujuan; Arabic Unicode dapat dipilih/dibaca RTL, bukan text-in-image; status unresolved menutup publikasi kutipan. |
| G10 | Bandingkan REF-05 pada matriks viewport; cek hero, lesson kiri, reflection kanan, tiga modul bawah, learning paths, footer. | Paired captures dan daftar gap; desktop dua area atas/3 modul bawah mengikuti proporsi referensi; mobile order masuk akal. |
| G11 | Uji state lesson/path/session, locale, no target, keyboard focus dan narasi fiksi pada zoom serta screen reader. | State matrix; semua kontrol aktif punya hasil; label fiction diumumkan; tak ada RSVP/live state. |

### Tahap H — Validasi, dokumentasi, handover

| ID | Yang dikerjakan dengan rinci | Bukti selesai yang harus diserahkan |
|---|---|---|
| H01 | Jalankan hanya perintah validasi yang diotorisasi task resmi; catat runtime versi repo, exact command, exit result dan SHA. Pisahkan typecheck, lint, tests, build dan export. | Log singkat tiap command yang benar-benar dijalankan; kegagalan dan skipped checks tetap dicatat. |
| H02 | Uji browser seluruh alur utama desktop/mobile: header, locales, library, search/filter, reader 1→2→4, Codex graph, GGS. Tambahkan keyboard dan reduced motion. | Daftar skenario pass/fail dengan browser/viewport, hasil, dan catatan bug; tak ada klaim dari command yang tak dijalankan. |
| H03 | Bandingkan PNG original dan render lokal pada skala/viewport sama: 390×844, 768×1024, 1122×1402, 1440×900, 1920×1080. Simpan first viewport dan full page bila relevan. | Screenshot paired bernama jelas; ukuran browser/zoom/locale/scroll tertulis; perbedaan visual per region dan prioritas. |
| H04 | Cari semua tombol/tautan sosial, bookmark, trailer, live, RSVP, lesson/chapter, locale switch dan breadcrumb. Jalankan tiap yang aktif dan uji tujuan invalid. | Kontrol → aksi → hasil matrix; semua ghost UI dihilangkan atau dijadikan label nonaktif; tidak ada tautan luar tebakan. |
| H05 | Periksa route export dan file output terhadap screenshot privat, data pribadi, credentials, quote/asset yang belum clear, backend/auth baru, dan app boundary. | Hasil scan/output review; referensi tetap berada di docs; noindex masih dipertahankan. |
| H06 | Validasi metadata/canonical/hreflang yang memang tersedia, `<html lang>`, perpindahan locale, accessibility, Arabic script/direction, route fallback/404. | Locale/metadata matrix, accessibility notes, negative cases dan exact SHA; jangan klaim supported bila belum diuji. |
| H07 | Audit satu per satu sumber art dan copy; cocokkan manifest, checksum, size, publication flag, alt, approval dan penggunaan aktual pada page. | Asset provenance matrix lengkap; aset belum disetujui tetap preview-only/blocked. |
| H08 | Integrator memperbarui status resmi hanya untuk leaf task canonical yang eligible setelah evidence diperiksa; kaitkan packet/audit dan tidak mencentang umbrella. | Referensi TODO ID dan packet, exact-SHA evidence, reviewer/integrator; draf ini tetap bukan sumber status. |
| H09 | Buat laporan traceability REF area → token/icon/component/art → route → test/capture → selisih tersisa. Handover menyebut keterbatasan serta next eligible task. | Laporan 5 halaman, screenshot index, SHA basis/hasil, rollback plan, unresolved issues dan reviewer. |
| H10 | Commit/push/promotion hanya mengikuti workflow owner pada task resmi; perubahan ini sendiri tidak mengizinkan deploy produksi, DNS, publikasi, atau mengubah `main`. | Bukti workflow yang benar-benar diotorisasi; tidak menyatakan deployed/published tanpa URL/log dan persetujuan yang dibutuhkan. |

### Gerbang khusus MoonUI — harus ditutup sebelum/bersamaan dengan penyesuaian halaman

| Gerbang | Pemeriksaan wajib | Kriteria keputusan |
|---|---|---|
| Paket dan export | Baca package manifest, `src` barrel/export, icons barrel, token source, `moon.css`, dan tes komponen langsung. | Komponen hanya dipakai jika export dan API terbukti; jangan mengimpor file internal yang tidak diekspor. |
| Token | Petakan token standar ke `--eol-*` pada wrapper/root Empire saja. | Skin Empire tidak merusak Dock atau konsumen MoonUI lain; nilai warna tidak bocor ke `:root` global tanpa keputusan. |
| Komponen | Cocokkan button/link/card/badge/tabs/filter/dialog/drawer dengan kebutuhan aktual. | Reuse primitive untuk behavior/accessibility; komposisi editorial tetap di Empire; tidak membuat copy komponen shared. |
| Icon | Gunakan glyph MoonUI yang tersedia; buat mark khusus hanya bila belum ada dan memang identitas lokal. | Tidak memasang library icon lain tanpa review; semua SVG patuh viewBox/stroke/currentColor/aria. |
| Skin baru | Evaluasi manfaat bagi lebih dari satu konsumen dan biaya regression tiap skin. | Perubahan `packages/moonui` memerlukan task resmi dan bukti suite consumer/skin; tanpa itu, theme tinggal scoped di Empire. |
| Pengujian regresi | Verifikasi MoonUI package dan consumer yang terpengaruh bila package shared berubah. | Build Empire saja tidak cukup untuk membuktikan perubahan global MoonUI aman. |

### Berkas bukti yang direncanakan untuk setiap iterasi

| Nama bukti | Isi minimum |
|---|---|
| `story-universe-reference-matrix.md` | Lima page map, source facts vs inference, wilayah komposisi, CTA, nav aktif, konten illustratif. |
| `story-universe-moonui-inventory.md` | Export nyata, pemetaan komponen/token/icon, batas scoped skin dan hasil keputusan gap. |
| `story-universe-art-ledger.json` | Asset key, page region, source/creator, dimensions, hash, alt, review/publication state. |
| `story-universe-route-control-matrix.md` | Route ID/EN, href setiap kontrol, implemented/fixture/not available, locale behavior. |
| `story-universe-visual-diff.md` | Paired screenshot references, viewport/browser metadata, per-region priority, resolved/unresolved difference. |
| `story-universe-final-review.md` | Exact SHA, checks yang benar-benar berjalan, reviewer, accessibility/editorial/rights decision, sisa risiko. |

Nama-nama di atas usulan artefak dokumentasi, bukan bukti bahwa berkas sudah ada. Buat hanya di bawah task resmi yang sesuai; jangan mencentang atau mengisi hasil sebelum pemeriksaan betul-betul dilakukan.
