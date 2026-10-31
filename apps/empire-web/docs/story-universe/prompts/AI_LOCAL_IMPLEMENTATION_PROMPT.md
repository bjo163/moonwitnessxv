# AI LOKAL — IMPLEMENTASI 5 MOCKUP A-L-L-A-H.COM / MOONWITNESS XV

## ROLE
Bertindak sebagai lead frontend engineer, visual QA, narrative/canon editor, accessibility tester, dan monorepo release reviewer. **Tuntaskan pekerjaan yang dapat dilakukan secara lokal dengan praktik aman, tanpa minta konfirmasi untuk langkah rutin**. Jangan mengklaim sesuatu sukses tanpa bukti.

## ABSOLUTE INPUTS
1. Baca seluruh `../EMPIRE_STORY_UNIVERSE_VISUAL_BIBLE_v1.0.md` dari awal sampai akhir; file ini adalah **kontrak visual, konten, icon, layout, dan QA**, jangan hanya membaca summary.
2. **Lihat seluruh kelima PNG `../assets/01-homepage.png` hingga `../assets/05-ggs-full-moon-school.png`**, bukan hanya nama file. Gunakan PNG sebagai referensi layout/mood, teks harus ditulis ulang dalam HTML yang dapat dipilih.
3. Baca `../contracts/design_tokens.json` dan `../contracts/content_manifest.json`.
4. Baca source terbaru `https://github.com/bjo163/moonwitnessxv`, branch `dev`, terutama `apps/empire-web`, MoonUI, BLUEPRINT, TODO, ADR-0011, ADR-0012. **Dokumen ini sendiri tidak membuktikan status runtime paling baru.**

## MISSION
Bangun 5 pengalaman visual yang sangat sesuai mockup:
- **PAGE 01** Homepage / Empire of the Light: hero moonlit city with ROCKSOUL rear silhouette; giant white-red tagline, 4 story-world cards, 4 principles.
- **PAGE 02** MoonStories Library: massive hero, 5 category filters, real search/sort/world/status controls, 4 different story cards, truthful statistics.
- **PAGE 03** AngelWithShotgun Reader: true 2-column poster + detailed synopsis/attributes, 4 functional comic page thumbnails with prev/next and accessible transcript.
- **PAGE 04** Character Codex: hero, featured AngelWithShotgun, exactly six trait blocks, related ROCKSOUL and MYLUFT, accessible relationship map (alter-ego correlation).
- **PAGE 05** GGS Full Moon School: monumental moon academy hero, The Forgotten Prayer lesson at fictional 10:12 WIB, Gratitude After Hardship reflection, 3 lessons, fictional session treatment, 4 learning path cards.

## BRANCH / RELEASE POLICY
- Work with current **existing `dev`** per canonical TODO and owner policy; do not create branch unnecessarily. If a branch is mandated by current enforced workflow, record the blocker before altering policy.
- No new backend/auth/DB/CMS, no DNS change, no real event signups, and no publication of private or unreviewed religious/source content. The owner withdrew Vercel authorization and removed `a-l-l-a-h-empire-web` on 2026-10-31; no Vercel deployment is authorized without a new explicit decision. The unrelated `empire-of-the-light` project remains outside this app's scope.
- Keep `apps/empire-web` an isolated static pilot. Coolify is the current hosting path under ADR-0016; Vercel configuration and local project binding have been removed.
- Use actual package manager / versions from current monorepo, don't switch to Vite or TypeScript approach without need.

## REQUIRED BUILD METHOD
1. Audit code/current ADR/intent; report actual baseline and existing overlap with components.
2. Map each area of the five screenshots to code: identify component, content, icon, background asset, responsive rule and editorial/publication status.
3. Create/reuse app-local tokens inheriting MoonUI and implement consistent shared header/footer. Do not globally break MoonUI skins.
4. Implement each page in order, adding tests, with **genuinely distinct** visuals and no copied repetitive backgrounds.
5. Use content manifest; all card labels and menu text should match the Visual Bible (localized where appropriate). Never use meaningless Lorem Ipsum or fabricated stats.
6. For pilot, images that are not rights-approved may remain in private preview/reference fixtures; do not promote them to `/public` without editorial gate. Use lawful existing assets or CSS safe placeholders for live build.
7. Verify at 390×844, 768×1024, 1122×1402, 1440×900 and/or 1920×1080; capture actual screenshots and visually compare with each of the five original PNGs.
8. Run frozen install, app tests, typecheck, Next static build, export checks, browser tests, lint, ui:check and relevant repo CI; investigate failures fully before claiming PASS.
9. Update canonical docs/TODO only for real changes and evidence; don't create duplicate work registers or self-approve ADR changes.

## NONNEGOTIABLE STORY CANON
- ROCKSOUL naturally quiet, rear view, no visible face; unexpected `Manusia Pulpen` storyteller. Story origin good intention Wednesday 28 October 2026, written Thursday 29 October 2026.
- AngelWithShotgun is a *fictional alter-ego* of ROCKSOUL inspired by hope, compassion, protective courage; no literal prophet/angel/fusion claim; no direct anime-franchise art.
- GGS is the *fictional* full moon school in MYLUFT narrative; `10:12 WIB` is **story time**, not a claim of live school schedule.
- Historical prompt materials named QS Yunus 10:12 as a possible source for the Forgotten Prayer. The current public pilot withholds all religious references, quotations, translations, and tafsir until original sources, rights, and editorial review are verified. Keep source text separate from personal reflection.
- Respect copyright, privacy, no fake social URLs, no fictitious live status. Mockup dates/counters are illustrative until verified.

## OUTPUT MUST INCLUDE
- Table: `PAGE / ROUTE / SOURCE MOCKUP / IMPLEMENTATION STATUS / SCREENSHOT / OPEN ISSUES`.
- Exact git SHA, files changed, test commands with result count, screenshot paths, remaining visual mismatches and why.
- List of controls verified functional, source/rights gate status, and exact isolated-production scope. Never imply custom-domain/DNS changes or broader editorial approval.
- Avoid vague “sudah selesai” absent screenshots and test logs.

## FINISH LINE
You are done only when all five visual page contracts have been implemented or transparently flagged as editorial/release gated, behavior tested, and differences from the supplied mockups documented for review. Do not halt after generating a plan; make code changes where the existing authorization and repo policies permit it.
## BOOTSTRAP ASET ORIGINAL — WAJIB SEBELUM VISUAL QA
Dokumen ini sudah tersedia di repo, tetapi kelima PNG original **tidak otomatis ikut GitHub** karena keterbatasan upload binary. File original disediakan dalam paket `A-L-L-A-H-COM_STORY_UNIVERSE_MOCKUPS_AND_SPEC_v1.0.zip` dari percakapan; **jangan mengganti dengan image query atau mengarang poster baru**.

1. Sinkronkan `dev` tanpa force-push; baca `apps/empire-web/docs/story-universe/README.md`.
2. Periksa apakah `apps/empire-web/docs/story-universe/assets/01-homepage.png` hingga `05-ggs-full-moon-school.png` benar-benar ada.
3. Bila belum ada, ambil ZIP asli dari pemilik proyek dan jalankan pada root repository:

   ```sh
   node apps/empire-web/scripts/import-story-universe-assets.mjs --zip "/path/to/A-L-L-A-H-COM_STORY_UNIVERSE_MOCKUPS_AND_SPEC_v1.0.zip"
   ```

4. Skrip memverifikasi SHA-256 kelima PNG. **Jangan klaim full visual parity bila PNG belum tersedia**; lanjutkan pekerjaan kontrak, struktur, tests yang tidak bergantung pada visual bila ZIP belum ada.
5. Sesudah verified, masukkan lima PNG ke `docs/story-universe/assets/` pada `dev` sebagai private design references, jangan ke `public/` hingga review publikasi.
6. Bedakan status: **docs committed** ≠ **five image binary committed** ≠ **MoonUI transformed** ≠ **feature implementation complete**.

