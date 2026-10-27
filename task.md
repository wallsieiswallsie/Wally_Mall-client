# WALLY MALL — CANONICAL TASK BOARD (LOCAL WORKSPACE EDITION)

> **SINGLE SOURCE OF TRUTH.** Backlog **G01–G30 tidak berubah** dari audit awal; revisi ini hanya mengadaptasi lokasi workspace/struktur Git Windows. Ini bukan hasil pembacaan source lokal. Audit awal: 2026-10-19, referensi GitHub `Wally_Mall-client` dan `Wally_Mall-server`; UI Railway end-to-end belum diverifikasi.
>
> **Workspace yang dituju**: `C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall`. **Jangan menebak** apakah struktur aktual `client/server`, dua subrepo, atau struktur lain. Jalankan `BOOTSTRAP_PROMPT_WALLY_MALL_LOCAL.md` **satu kali** untuk mengisi binding arsitektur lokal di checkpoint sebelum mengerjakan G01.

<!-- CHECKPOINT:START — pada resume baca ini, bukan semua task specs -->
## 0. CHECKPOINT (WAJIB DIPERBARUI)

```yaml
schema: wally-task-board/v2-local
updated_at: '2026-10-25 (Super Admin priority override; G16 local implementation verified; Asia/Jakarta)'
workspace_root: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall'
workspace_binding: VERIFIED
repository_layout: two-repos
client_root: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\client'
server_root: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\server'
client_git_root: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\client'
server_git_root: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\server'
canonical_tracker: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\client\task.md'
tracker_git_root: 'C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\client'
branch_policy: main-when-safe
original_task_range: G01-G30
original_task_count: 30
current_task: G17   # user priority override 2026-10-25: Super Admin first (G16→G22); G01 BLOCKED + ON_HOLD_BY_PRODUCT_PRIORITY
priority_override: 'SUPER_ADMIN_FIRST (G16,G17,G18,G19,G20,G21,G22); payment gateway G01 ON_HOLD_BY_PRODUCT_PRIORITY until explicit user instruction'
last_contiguous_done: NONE
completed_count: 0
total_tasks: 30
last_finished_task: NONE   # G16 worked 2026-10-25 but NEEDS_RECHECK (not DONE)
last_working_branch_client: main
last_working_branch_server: main
last_client_commit: 00dd2f5   # verified local HEAD; matches historical audit baseline
last_server_commit: 005e3f6   # verified local HEAD; matches historical audit baseline
last_verification: 'G16 (2026-10-25): server unit 21 PASS/2 skip; disposable PostgreSQL integration 24/26 PASS incl. 3 new G16 subtests, 1 pre-existing G01 failure (migration filename) + its parent; client unit 26 PASS; structure PASS; builds PASS; prototype render smoke PASS; manual in-app browser QA PASS (admin/super, 1280px+375px, empty/error/denied); test:portals NOT RUN (playwright not installed).'
blocking_issue: 'G01 AC4 (ON HOLD): Xendit Test Mode credentials/webhook absent. G16: depends on G04 (TODO); automated portal smoke and Railway verification NOT RUN.'
next_action: 'Continue Super Admin priority: G17 moderation & support cases (support case model missing server-side). Re-run test:portals when playwright is available. Do not resume G01 without explicit user instruction.'
```

**Makna status:** `TODO` belum dikerjakan; `IN_PROGRESS` sedang dikerjakan; `BLOCKED` menunggu keputusan/akses eksternal; `DONE` seluruh Acceptance Criteria lulus disertai bukti; `NEEDS_RECHECK` butuh verifikasi ulang. Task tidak boleh `DONE` hanya karena sebagian kode telah ditulis.

**Aturan progress:** `last_contiguous_done` = Gxx tertinggi yang **semua** predecessor G01..Gxx `DONE`; `completed_count` = jumlah semua task `DONE`; `last_finished_task` = task paling baru yang sungguh diverifikasi, bukan sekadar dibaca. Jika G01 BLOCKED lalu G02 DONE, progress **0/30 secara berurutan** dan **1/30 total DONE**. Jangan menaikkan pointer melompati blocker tanpa catatan.

**Titik kebenaran:** `task.md` adalah patokan backlog/progress; **kode dan tes lokal adalah kebenaran teknis**. Nama path `client/...` dan `server/...` pada masing-masing task adalah **alias logis** ke `client_root` dan `server_root` yang dibuktikan saat bootstrap, BUKAN folder yang otomatis harus ada tepat di workspace root.

**Tracker tunggal:** Setelah bootstrap, field `canonical_tracker` harus menunjuk **satu file nyata dan writable**, lebih baik berada di Git repository yang benar-benar digunakan. Jika workspace root tidak terlacak Git sementara client merupakan Git repository sendiri, **pindahkan** tracker ke root Git client secara aman (jangan menduplikasi). Perbarui path canonical di prompt; hindari dua tracker writable. Jika ada tracker yang sudah berisi progres, pertahankan seluruh status dan evidence; jangan overwrite dengan versi template ini.

**Status awal template:** G01–G30 `TODO`, bukan hasil pemeriksaan kondisi lokal terbaru. Agent hanya boleh mengubah status dengan bukti inspeksi/task test terarah.
<!-- CHECKPOINT:END -->

## 0A. BINDING WORKSPACE LOKAL — DIBACA SEKALI SAAT BOOTSTRAP

1. Periksa *metadata folder* pada path workspace dan maksimal 2 tingkat anak. Temukan entrypoint frontend melalui `apps/buyer/src/live/Pages.jsx` + `packages/api-client/client.js` dan backend melalui `src/app.js` + `database/migrations/` (atau catat path yang dipindahkan). Jangan dump source atau rekursif tanpa batas.
2. Jalankan `git rev-parse --show-toplevel`, `git status --short --branch`, `git remote -v`, dan `git log -1 --oneline` per Git root yang benar-benar ditemukan. Tentukan apakah satu Git monorepo, dua Git repository, atau workspace non-Git.
3. Isi `workspace_binding: VERIFIED`, `repository_layout`, `client_root`, `server_root`, `client_git_root`, `server_git_root`, `canonical_tracker`, `tracker_git_root`, branch dan SHA aktual. Bila root/modul tidak bisa dibuktikan, `workspace_binding: BLOCKED` dan jangan mengarang.
4. **Jangan** membuat backlog baru, menghapus/merangkum acceptance criteria, mengubah dependensi ID, me-reset migration/DB, atau menyentuh deployment saat binding.
5. Normalisasi master prompt agar menunjuk `canonical_tracker` final dan *alias* yang telah dibuktikan. Bila kedua modul berada dalam **satu repo**, commit gabungan satu repo; bila berada di **dua repo**, commit tiap repo terpisah dan tracker hanya di satu repo yang dipilih.

## 1. TASK INDEX (baca ini saja bersama CHECKPOINT)

| ID | Phase | Priority | Task | Status | Evidence (commit/test) |
|---|---|---|---|---|---|
| G01 | S1 | P0 | Payment gateway nyata & rekonsiliasi | BLOCKED | 2026-10-20: Xendit local implementation; unit 13+26, DB 23, build/browser PASS; external sandbox E2E NOT RUN. 2026-10-25: ON_HOLD_BY_PRODUCT_PRIORITY |
| G02 | S1 | P0 | Courier role & Wally Lokal | TODO | — |
| G03 | S1 | P0 | Sesi login lintas portal | TODO | — |
| G04 | S1 | P0 | Readiness deployment & workers | TODO | — |
| G05 | S2 | P1 | Search/filter katalog parity | TODO | — |
| G06 | S2 | P1 | Product detail parity | TODO | — |
| G07 | S2 | P1 | Storefront parity | TODO | — |
| G08 | S2 | P1 | Hierarki kategori & subkategori | TODO | — |
| G09 | S2 | P1 | State favorit konsisten | TODO | — |
| G10 | S2 | P1 | Cart & order UX parity | TODO | — |
| G11 | S2 | P1 | Wizard onboarding seller 5 langkah | TODO | — |
| G12 | S2 | P1 | Dashboard seller berbasis KPI nyata | TODO | — |
| G13 | S2 | P1 | Form add-product lengkap + preview | TODO | — |
| G14 | S2 | P1 | Manajemen katalog seller | TODO | — |
| G15 | S2 | P1 | Seller fulfillment workspace | TODO | — |
| G16 | S3 | P1 | Admin operational dashboard parity | NEEDS_RECHECK | 2026-10-25: live sidebar shell + `/admin|/super-admin/overview?days=`; DB 3 G16 subtests PASS; manual browser PASS; test:portals NOT RUN; depends G04 TODO; uncommitted |
| G17 | S3 | P1 | Moderation & support cases | TODO | — |
| G18 | S3 | P1 | Seller verification detail & keputusan | TODO | — |
| G19 | S3 | P1 | Super Admin transaction monitoring | TODO | — |
| G20 | S3 | P1 | Analytics & KPI finansial nyata | TODO | — |
| G21 | S3 | P1 | Persisted platform settings | TODO | — |
| G22 | S3 | P1 | Admin invite & account recovery | TODO | — |
| G23 | S4 | P2 | Buyer reviews terverifikasi | TODO | — |
| G24 | S4 | P2 | Promotion/discount lifecycle | TODO | — |
| G25 | S4 | P2 | Seller settlement/payout | TODO | — |
| G26 | S4 | P2 | Notification delivery & preferences | TODO | — |
| G27 | S4 | P2 | Import media dari Google Drive | TODO | — |
| G28 | S4 | P2 | Shared UI primitives & design parity | TODO | — |
| G29 | S4 | P2 | Docs & kontrak mutakhir | TODO | — |
| G30 | S4 | P2 | E2E regression + go-live readiness | TODO | — |

**Urutan standar**: lanjutkan task ID terkecil berstatus `TODO` yang dependensinya `DONE`. Task `BLOCKED` boleh dilewati **hanya** bila task berikutnya mandiri dan alasan bypass tertulis pada log; jangan ubah `BLOCKED` ke `DONE`. Bila butuh keputusan arsitektural, laporkan satu pertanyaan konkret tanpa menebak jawabannya. Task yang di-skip wajib dituntaskan di akhir.

## 2. PROTOKOL HEMAT TOKEN & KESELAMATAN (BINDING)

1. **Start/resume:** jika `workspace_binding != VERIFIED`, jalankan **bootstrap lokal satu kali**. Setelah VERIFIED, baca hanya `## 0 CHECKPOINT`, `## 1 TASK INDEX`, bagian ini, dan **satu** blok `<!-- TASK:Gxx:START -->` sampai `<!-- TASK:Gxx:END -->`. Dilarang mencetak seluruh `task.md` (±30 specs) berulang; ambil baris dengan `rg -n 'TASK:Gxx:(START|END)' <canonical_tracker>` lalu baca rentang saja. Pada PowerShell gunakan `Select-String -LiteralPath ... -Pattern ...` dan `Get-Content -LiteralPath ... | Select-Object -Skip ... -First ...`.
2. **Resolver path wajib:** `client/<path>` berarti `Join-Path <client_root> <path>`; `server/<path>` berarti `Join-Path <server_root> <path>`. `client_root` dan `server_root` tidak boleh diperkirakan dari nama folder; gunakan hanya absolute path yang sudah dipetakan di CHECKPOINT. Semua path Windows berspasi wajib di-quote dan memakai `-LiteralPath` bila ada.
3. **File scope:** baca maksimal **5 file sumber awal** dari task terpilih; bila daftar task berisi lebih dari lima, pilih lima paling relevan dulu. Cari dengan `rg -n 'symbol' <specific path>`, bukan seluruh project. File keenam/beyond hanya bila tracing, build atau test membutuhkannya dan sebutkan alasannya. Hindari `Get-ChildItem -Recurse`, tree masif, `cat` seluruh repo, dan dump lockfile.
4. **Git safety & user work:** cek `git status --short --branch` dan commit terakhir hanya pada Git root yang akan disentuh. Jangan reset/clean/rebase paksa, tidak cherry-pick/merge diam-diam, dan jangan overwite perubahan user. Target integrasi adalah `main` **hanya bila aman**. Jika nested Git repositories, jangan stage root workspace secara serampangan. Review `git diff --cached` + secret check sebelum setiap commit.
5. **Batas bisnis:** prototype = referensi UI/flow; server production = sumber kebenaran role, API, harga, inventory dan transaksi. Jangan mengganti live dengan mock, memalsukan pembayaran/payout/kurir, menjalankan migrasi destruktif, memakai prod DATABASE_URL untuk tes, atau menaruh credentials dalam docs/commit. Migrasi baru harus aditif dan diuji pada database disposable.
6. **Verifikasi & DONE:** jalankan tes paling relevan dari repo yang berubah, build/check yang tersedia dan tes API/DB lokal disposable bila kontrak berubah. Browser mock fixture ≠ bukti E2E Railway. Status `DONE` hanya jika **semua checkbox AC** benar-benar terpenuhi, tidak ada regresi yang diketahui, dan evidence (perintah+hasil, SHA, batas pengujian) ada. `NOT RUN` bukan `PASS`; ketergantungan eksternal tanpa izin/akses adalah `BLOCKED`.
7. **Writeback wajib:** setiap sesi perbarui baris indeks, status + checklist + evidence pada blok task, CHECKPOINT dan EXECUTION LOG dalam **satu tracker canonical**. Validasi jumlah `DONE` dan `last_contiguous_done`. Jika tracker tidak writable, jangan membuat copy baru atau mengklaim progress tersimpan.
8. **Git multi-repo:** jika client+server sama Git root, buat satu commit scoped (jika diizinkan); jika berbeda Git roots, buat commit per repo dan commit docs tracker di lokasi Git canonical. Commit/push **non-force** ke `main` hanya bila user sudah memberi izin, staged files relevan, branch/remote aman, dan integrasi fast-forward tanpa risiko. Jika tidak aman/izin tidak ada, jangan paksa; laporkan `LOCAL_ONLY/NOT_PUSHED` dengan SHA dan saran commit. Jangan gunakan Git di folder alias yang ternyata bukan Git root.
9. **Satu task/sesi:** pilih `current_task` yang eligible atau ID TODO terkecil dengan dependensi DONE. BLOCKED boleh dilewati untuk tugas mandiri hanya bila alasan bypass dicatat. Kerjakan tepat SATU task lalu berhenti setelah DONE/BLOCKED/NEEDS_RECHECK. Jangan mengaudit ulang semua modul atau menambah backlog untuk menunda G01–G30.
10. **Laporan akhir:** sebut task, status, perubahan, file yang disentuh, tests PASS/FAIL/NOT RUN, branch/commit/push, `last_contiguous_done`, `completed_count/30`, `last_finished_task`, `current_task`, dan next eligible. Sebut **tuntas berurutan sampai task berapa**; tidak boleh klaim mencapai Gxx bila task sebelumnya bukan DONE.

## 3. MATRIKS ROLE YANG HARUS DIPERTAHANKAN

- **Guest**: public catalog/store/detail, search, login/register; tidak dapat mengelola order/seller/admin.
- **Buyer**: favorit milik sendiri, alamat, cart, checkout, pembayaran milik sendiri, laporan, order history.
- **Seller**: toko aktif sesuai `store_members` (owner/manager/staff dengan kewenangan berbeda), produk miliknya, order tokonya; tidak menyentuh toko lain.
- **Admin**: operasional seller verification, moderation, order handling, categories/reports, data buyer/finance diminimalkan.
- **Super Admin**: kewenangan Admin + finance, buyer access, admin provisioning, fee, refund, audit read-only.
- **Courier**: masih kosong di live; tidak boleh membuka akses seller/admin. Hanya implementasikan jika task G02 menyetujui bisnis dan keamanan.

## 4. PANDUAN LINTAS PHASE

- **S1 / Foundation (G01–G04)**: transaksi riil, fulfillment, sesi lintas portal, deployment.
- **S2 / Buyer & Seller parity (G05–G15)**: integrasi fitur prototype ke live berbasis API nyata.
- **S3 / Admin & Super Admin parity (G16–G22)**: workspace operasional dan finansial aman.
- **S4 / Expansion & QA (G23–G30)**: reviews/promo/payout/notification/media, design system, docs, E2E.

## 5. TASK SPECS (BACA HANYA TASK TERPILIH)

<!-- TASK:G01:START -->
### G01 — Payment gateway nyata & rekonsiliasi

- **Phase / Priority / Scope:** S1 / P0 / server+client
- **Status:** BLOCKED — `ON_HOLD_BY_PRODUCT_PRIORITY` (2026-10-25, user: Super Admin first; no provider integration, production webhook, fake/mock transactions, settlement/payout/refund-by-provider work until explicit instruction)
- **Depends on:** -
- **Baseline:** Integrasi pembayaran masih mock; kode provider dan webhook tersedia sebagai fondasi.
- **Work (in-scope):** Tentukan provider dan mode sandbox → production dengan kontrak eksplisit. Implementasikan sesi pembayaran riil, notifikasi status, verifikasi signature, idempotensi, refund/reconciliation, serta UX pembayaran yang tidak memalsukan status berhasil. Jangan menaruh secret dalam VITE_*; validasi payment, currency, stock dan timeout.
- **Files (start here; open selectively):** `server/src/payment.js`, `server/database/transactions/payments.js`, `server/src/app.js`, `client/apps/buyer/src/live/Pages.jsx`, `client/packages/api-client/payment.js`
- **Acceptance Criteria (semua wajib):**
  - [x] Provider dipilih dan dikonfigurasi lewat env server; unsupported provider gagal jelas.
  - [x] Buyer dapat memulai dan melanjutkan pembayaran dan menerima status authoritative dari server; tidak ada aksi browser yang menandai paid.
  - [x] Webhook signature, idempotensi/replay, expiry, reconciliation/refund diuji termasuk kasus gagal.
  - [ ] E2E sandbox provider dinyatakan terbukti; live production hanya boleh ditandai siap jika konfigurasi eksternal diverifikasi.
- **External decision/blocker:** Keputusan provider + akun sandbox/webhook + konfirmasi kebijakan refund; jika tidak tersedia → BLOCKED, tanpa mensimulasikan DONE.
- **Evidence:** 2026-10-20: `rtk proxy node --test tests/domain.test.js tests/provider.test.js tests/config.test.js tests/xendit.test.js tests/routes.test.js` in server PASS 13/13; `rtk proxy npm test` in client PASS 26/26; `rtk proxy npm run build:buyer` PASS. `node --test tests/integration.test.js` with ONLY explicit `TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55441/wally_g01_test_2`, no application .env loaded, PASS 23/23 (0 skipped): additive migration/rollback, existing commerce regression, Xendit owner isolation, concurrent session/refund dispatch, webhook token/business/amount validation, replay/out-of-order events, pending/success/failed refund without restock, lost-response reconciliation, expiry/late success and approved late refund. Xendit HTTP transport is a fixture, not an external transaction. `node tests/recovery-browser.mjs` using bundled Playwright + headless Edge PASS: hosted redirect, untrusted success query, reconciliation UI and no overflow at 390/1280px. Browser/DB initially failed sandbox filesystem restrictions; reruns outside sandbox passed. First DB run also exposed the historical 001-011 repair fixture assumption; test setup now removes 013 before reproducing that baseline, with no changes to the repair SQL. Git diff whitespace checks PASS. No live payment, external sandbox E2E, or production deployment run. HEAD client `00dd2f5`, server `005e3f6`; no new commit/push. AC1-3 checks certify local fixture/disposable-DB evidence only; AC4 remains unproven.
- **Notes / next action:** User approved Xendit Payment Sessions hosted checkout in Test Mode, retention of isolated mock, and full-order refund after Super Admin approval with no automatic stock return. Implemented server-only Test Mode config (production key/mode rejected), persisted session/request/refund identities, callback-token authentication following official Xendit docs, durable one-dispatch claims for ambiguous timeouts, GET-based session/refund reconciliation and hosted buyer flow. Per-order allocation remains for future G25; no payout or split transfers implemented. Changed server: `src/{payment,xendit,config,app}.js`, `database/repositories/accounts.js`, `database/transactions/{payments,commerce}.js`, additive `database/migrations/20261020000000_013_xendit_sessions.js`, `tests/{provider.test,integration.test,xendit.test,xendit-scenarios}.js`, `docs/xendit-test-mode.md`. Changed client: `apps/buyer/src/live/Pages.jsx`, `packages/api-client/payment.js`, `tests/payment-recovery.test.js`, `tests/recovery-browser.mjs`, this tracker. Source beyond the five start files was opened only to trace configuration, payment state/expiry, schema, projection, and test setup. Environment and server .env presence-only check found XENDIT_SECRET_KEY, XENDIT_CALLBACK_TOKEN, XENDIT_BUSINESS_ID and PAYMENT_RETURN_ORIGIN absent; no credential values printed. Remaining blocker: securely provision those Test Mode settings and reachable webhook, then perform the external cases in `server/docs/xendit-test-mode.md`; never claim production readiness. Sessions/refunds with ambiguous dispatch wait for callback or Super Admin recovery using a provider ID; do not clear dispatch timestamps or blindly POST again. Stay on G01; no bypass or G02-G30 work. Suggested commits: server `feat(payments): integrate Xendit test sessions and reconciliation`; client `feat(payments): open hosted checkout and track G01 sandbox blocker`.
<!-- TASK:G01:END -->

<!-- TASK:G02:START -->
### G02 — Courier role & Wally Lokal

- **Phase / Priority / Scope:** S1 / P0 / server+client
- **Status:** TODO
- **Depends on:** -
- **Baseline:** Wally Lokal selectable di checkout, tetapi aplikasi courier belum ada.
- **Work (in-scope):** Tentukan alur assignment → accept/reject → pickup → transit → delivered/failed, pemilik aksi, proof-of-delivery, timeline buyer dan seller, serta penanganan gagal antar. Jika bisnis belum siap, sembunyikan/nonaktifkan Wally Lokal dengan penjelasan sampai courier flow lengkap (jangan pura-pura ada kurir).
- **Files (start here; open selectively):** `client/apps/courier/README.md`, `client/apps/buyer/src/live/Pages.jsx`, `client/packages/shared/live/Orders.jsx`, `server/src/app.js`, `server/database/migrations/20260924061028_008_fulfillment.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Keputusan bisnis (aktifkan courier penuh vs menonaktifkan sementara opsi) tercatat.
  - [ ] Jika aktif, courier authentication/role endpoints, assignment ownership, transisi status dan bukti serah terima diuji.
  - [ ] Buyer dan seller menampilkan timeline sesuai status server; tiada fake tracking.
  - [ ] Jika dinonaktifkan sementara, opsi checkout tidak dapat dipilih dan tidak ada order Wally Lokal baru.
- **External decision/blocker:** Perlu definisi operasional kurir dan kebijakan bukti pengiriman; jangan membuat role permission tanpa persetujuan.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G02:END -->

<!-- TASK:G03:START -->
### G03 — Sesi login lintas portal

- **Phase / Priority / Scope:** S1 / P0 / client+server
- **Status:** TODO
- **Depends on:** -
- **Baseline:** Origin Buyer/Seller/Admin dapat dipisah, sedangkan refresh token berada pada sessionStorage origin-per-origin.
- **Work (in-scope):** Audit hanya perpindahan origin dan auth flow, pilih solusi login lintas domain yang aman atau pertahankan kompatibilitas satu origin dengan dokumentasi dan guard. Jangan pernah kirim access/refresh token di URL, query, atau localStorage lintas origin.
- **Files (start here; open selectively):** `client/packages/api-client/config.js`, `client/packages/api-client/session.js`, `client/packages/api-client/client.js`, `client/packages/ui/navigation.jsx`, `client/packages/shared/live/session.jsx`, `server/src/app.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Login, reload, logout dan akses role sesuai model deployment yang dipilih bekerja konsisten.
  - [ ] Navigasi Buyer→Seller/Admin tidak kehilangan sesi secara tak terduga, atau secara eksplisit meminta re-login bila itu keputusan desain.
  - [ ] Server tetap memverifikasi roles, tidak mengandalkan hidden client menu.
  - [ ] Test origin berbeda/same-origin, refresh rotation, unauthorized, dan regressions lulus.
- **External decision/blocker:** Perlu keputusan domain portal. Tidak boleh menganggap ada SSO hanya karena tautan antar-portal tersedia.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G03:END -->

<!-- TASK:G04:START -->
### G04 — Readiness deployment & workers

- **Phase / Priority / Scope:** S1 / P0 / server+client
- **Status:** TODO
- **Depends on:** -
- **Baseline:** Manifest Railway tersedia, tetapi cron activation, GCS IAM/CORS, dan E2E deployment belum diverifikasi.
- **Work (in-scope):** Pastikan konfigurasi build VITE_API_URL origin-only, backend CORS, schema readiness, pre-deploy migrate, expiry worker dan media cleanup. Pisahkan pemeriksaan lokal dari verifikasi konfigurasi layanan eksternal.
- **Files (start here; open selectively):** `server/docs/integration-recovery.md`, `server/railway.http.json`, `server/railway.expiry.json`, `server/railway.cleanup.json`, `server/src/config.js`, `client/docs/live-deployment.md`
- **Acceptance Criteria (semua wajib):**
  - [ ] Runbook deployment memuat urutan aman migrate→readiness→workers, monitoring dan rollback non-destruktif.
  - [ ] Bukti test lokal pada clean disposable DB dan build portal dicatat.
  - [ ] Worker betul-betul aktif di Railway hanya jika runtime logs/history memverifikasi; sebaliknya tulis BLOCKED/UNVERIFIED.
  - [ ] Tidak mengubah production DB atau secret tanpa izin eksplisit.
- **External decision/blocker:** Memerlukan akses Railway, bucket GCS, variabel rahasia dan otorisasi operator untuk pemeriksaan eksternal.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G04:END -->

<!-- TASK:G05:START -->
### G05 — Search/filter katalog parity

- **Phase / Priority / Scope:** S2 / P1 / client
- **Status:** TODO
- **Depends on:** -
- **Baseline:** Live Catalog memiliki q/sort/tab; prototype lebih kaya filter kategori, distrik, harga, rating, dan filter aktif.
- **Work (in-scope):** Tambahkan UI filter operasional, reset, chips, sinkron URL/query, dan hasil terpaginate dari server. Jangan menambahkan filter yang belum didukung tipe toko; gunakan kontrak API.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `client/apps/buyer/src/prototype/Search.jsx`, `client/packages/shared/components/search/SearchParts.jsx`, `server/src/validation.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Filter kategori, area, harga, rating dan sort relevan menghasilkan parameter API yang benar.
  - [ ] Produk vs toko hanya menampilkan filter yang valid; reset filter memulihkan hasil dan offset.
  - [ ] Loading, empty, error dan pagination bekerja di mobile/desktop; query tetap bisa dibagikan.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G05:END -->

<!-- TASK:G06:START -->
### G06 — Product detail parity

- **Phase / Priority / Scope:** S2 / P1 / client
- **Status:** TODO
- **Depends on:** G05
- **Baseline:** Detail live belum punya semua aksi galeri, buy-now, share, favorit, related products yang ada di prototype.
- **Work (in-scope):** Kembalikan komponen experience produk dengan data nyata; bedakan SKU/varian, stok server dan kondisi logged-out.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `client/apps/buyer/src/prototype/ProductDetail.jsx`, `client/packages/shared/components/product/ProductCard.jsx`
- **Acceptance Criteria (semua wajib):**
  - [ ] Galeri multi-foto punya fallback dan kontrol aksesibel.
  - [ ] Buy Now menavigasi checkout secara aman tanpa melewati validasi cart/stock.
  - [ ] Favorit/share dan produk serupa/produk toko menggunakan data backend; tanpa angka dummy.
  - [ ] Responsif dan state empty/error ditest.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G06:END -->

<!-- TASK:G07:START -->
### G07 — Storefront parity

- **Phase / Priority / Scope:** S2 / P1 / client
- **Status:** TODO
- **Depends on:** G05
- **Baseline:** Halaman Store live hanya informasi singkat dan katalog, berbeda dari header/profile toko prototype.
- **Work (in-scope):** Buat storefront lengkap dengan identitas toko, area, daftar produk, informasi usaha, status review yang grounded.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `client/apps/buyer/src/prototype/Store.jsx`, `client/packages/ui/styles/live.css`
- **Acceptance Criteria (semua wajib):**
  - [ ] Halaman memiliki header/identitas/lokasi, informasi toko, produk, empty state dan laporan.
  - [ ] Tidak menampilkan kontak/rating palsu; data kosong diberi label yang tepat.
  - [ ] Mobile dan desktop parity visual/interactive diuji.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G07:END -->

<!-- TASK:G08:START -->
### G08 — Hierarki kategori & subkategori

- **Phase / Priority / Scope:** S2 / P1 / client+server
- **Status:** TODO
- **Depends on:** G05
- **Baseline:** Prototype menjelajah kategori/subkategori, live hanya kategori top-level.
- **Work (in-scope):** Periksa apakah kategori turunan tersedia pada data/API; jika belum, definisikan perubahan taxonomy sebelum UI. Implementasi navigasi parent-child dan filter yang konsisten.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `client/apps/buyer/src/prototype/Categories.jsx`, `server/database/repositories/catalog.js`, `server/database/migrations/20260924060803_003_catalog.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Kategori dan subkategori tampil dan memfilter produk sesuai hierarki nyata.
  - [ ] Kategori nonaktif/terhapus tidak muncul untuk publik; tidak ada slug phantom.
  - [ ] Deep-link, empty state dan integrasi API diuji.
- **External decision/blocker:** Perlu validasi taxonomy aktual sebelum mengubah schema.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G08:END -->

<!-- TASK:G09:START -->
### G09 — State favorit konsisten

- **Phase / Priority / Scope:** S2 / P1 / client
- **Status:** TODO
- **Depends on:** -
- **Baseline:** UI live memakai simpan/hapus berbasis konteks halaman; belum konsisten sebagai heart-state tiap kartu.
- **Work (in-scope):** Sinkron status favorit aktual, state optimistic yang rollback saat gagal, dan akses guest yang jelas.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `client/apps/buyer/src/prototype/Favorites.jsx`, `server/src/app.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Ikon/label favorit benar di Home, search, storefront, detail, dan halaman favorit.
  - [ ] Toggling tidak menambah entri ganda; reload mempertahankan server state.
  - [ ] Guest mendapat login path, error mengembalikan state tanpa misleading success.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G09:END -->

<!-- TASK:G10:START -->
### G10 — Cart & order UX parity

- **Phase / Priority / Scope:** S2 / P1 / client
- **Status:** TODO
- **Depends on:** G06
- **Baseline:** Cart mengubah kuantitas via input angka (0 untuk hapus); order memakai fakta mentah.
- **Work (in-scope):** Bangun quantity stepper, tombol hapus, grouping toko, subtotal, status badge dan timeline user-friendly.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `client/packages/shared/live/Orders.jsx`, `client/apps/buyer/src/prototype/commerce/Cart.jsx`, `client/packages/shared/prototype/commerce/Orders.jsx`
- **Acceptance Criteria (semua wajib):**
  - [ ] Add/remove/update cart jelas dan mempertahankan quote authoritative server.
  - [ ] Multi-seller checkout, alamat, delivery method, payment resume, timeline dan cancel/refund state konsisten.
  - [ ] Tidak membuat ulang checkout saat refresh detail pembayaran.
  - [ ] Responsif dan uji invalid stock/expired payment lulus.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G10:END -->

<!-- TASK:G11:START -->
### G11 — Wizard onboarding seller 5 langkah

- **Phase / Priority / Scope:** S2 / P1 / client+server
- **Status:** TODO
- **Depends on:** -
- **Baseline:** Prototype: identitas→lokasi→kategori→preview→selesai. Live hanya form ringkas 3 field.
- **Work (in-scope):** Kembalikan wizard visual. Sesuaikan fakta: lokasi saat pengajuan vs setelah approval; bila perlu schema/API baru, migrasi aditif dan validasi. Tambahkan status pengajuan & CTA tepat.
- **Files (start here; open selectively):** `client/apps/seller/src/live/Pages.jsx`, `client/apps/seller/src/prototype/SellerOnboarding.jsx`, `server/src/app.js`, `server/database/repositories/management.js`, `server/docs/database-gap-report.md`
- **Acceptance Criteria (semua wajib):**
  - [ ] 5-step progress, back/next, validasi, preview, submit, dan status review berjalan.
  - [ ] Lokasi/address tidak hilang diam-diam; kontrak persistence dipastikan eksplisit.
  - [ ] Pengajuan pending/rejected/approved punya tampilan lanjutan jelas; refresh mempertahankan data yang semestinya persisten.
  - [ ] Tes role buyer/seller dan aplikasi duplikat.
- **External decision/blocker:** Bila perlu perubahan schema, putuskan representasi lokasi pengajuan; jangan memaksa masuk business_description.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G11:END -->

<!-- TASK:G12:START -->
### G12 — Dashboard seller berbasis KPI nyata

- **Phase / Priority / Scope:** S2 / P1 / client+server
- **Status:** TODO
- **Depends on:** G11
- **Baseline:** Live seller dashboard menampilkan Facts/accordion; prototype memakai cards KPI, ringkasan order, produk.
- **Work (in-scope):** Bangun workspace seller dengan KPI asli, order urgent, tombol kelola produk/toko, akses toko sesuai membership.
- **Files (start here; open selectively):** `client/apps/seller/src/live/Pages.jsx`, `client/apps/seller/src/prototype/SellerDashboard.jsx`, `server/database/repositories/management.js`, `client/packages/ui/styles/live.css`
- **Acceptance Criteria (semua wajib):**
  - [ ] Dashboard punya metrik dan antrian pesanan berdasarkan API dan pemilik toko.
  - [ ] Tidak memakai view/favorite/chat count dummy; bila tidak tersedia tampilkan tidak tersedia.
  - [ ] Seller multi-store punya selector atau grouping konsisten tanpa melihat seller lain.
  - [ ] Empty/loading/error responsif.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G12:END -->

<!-- TASK:G13:START -->
### G13 — Form add-product lengkap + preview

- **Phase / Priority / Scope:** S2 / P1 / client+server
- **Status:** TODO
- **Depends on:** G11
- **Baseline:** Live add-product tanpa preview, tag UI, subkategori/lokasi dan multi-variant editor lengkap.
- **Work (in-scope):** Tambahkan form dengan deskripsi multiline, foto GCS, tags, varian multi, validation dan preview tanpa mendorong produk langsung terbit sebelum approval.
- **Files (start here; open selectively):** `client/apps/seller/src/live/Pages.jsx`, `client/apps/seller/src/prototype/AddProduct.jsx`, `client/packages/ui/components/common/MediaUploader.jsx`, `server/src/validation.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Harga string rupiah sesuai API, stok integer, tags maks 10, media maks 10, category valid.
  - [ ] Preview memperlihatkan data form nyata, bukan simpan lokal.
  - [ ] Submit sukses membuat produk pending moderation dan menampilkan statusnya.
  - [ ] Gagal upload/submit tidak meninggalkan state sukses palsu; jalur edit selaras dengan endpoints.
- **External decision/blocker:** Subkategori/lokasi produk butuh konfirmasi kontrak jika berbeda dari model kategori/alamat toko saat ini.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G13:END -->

<!-- TASK:G14:START -->
### G14 — Manajemen katalog seller

- **Phase / Priority / Scope:** S2 / P1 / client+server
- **Status:** TODO
- **Depends on:** G13
- **Baseline:** Produk seller di-live disajikan sebagai card form sederhana; metadata editing tidak lengkap.
- **Work (in-scope):** Buat listing, filter status moderasi, editor produk, varian, media/tags jika server mendukung; gunakan endpoint seller private untuk unpublished/zero-stock.
- **Files (start here; open selectively):** `client/apps/seller/src/live/Pages.jsx`, `server/src/app.js`, `server/database/repositories/management.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] List produk memperlihatkan stok, moderation status, harga dan tindakan jelas.
  - [ ] Edit draft/hidden/pending/zero stock bisa dibuka oleh owner/manager secara benar.
  - [ ] Tidak bisa mengubah produk seller lain; UI teruji saat tidak ada gambar atau variant.
  - [ ] Metadata yang tidak didukung API ditandai/diimplementasi dengan kontrak eksplisit.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G14:END -->

<!-- TASK:G15:START -->
### G15 — Seller fulfillment workspace

- **Phase / Priority / Scope:** S2 / P1 / client
- **Status:** TODO
- **Depends on:** G10,G12
- **Baseline:** Seller orders live adalah panel raw; prototype punya status workflow eksplisit.
- **Work (in-scope):** Bangun tabel/antrian status order, detail fulfillment, tombol transisi valid, serta pesan pasca-update.
- **Files (start here; open selectively):** `client/packages/shared/live/Orders.jsx`, `client/packages/shared/prototype/commerce/Orders.jsx`, `server/src/app.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Tampilan daftar/filter status dan detail order mudah dipahami.
  - [ ] Hanya next-status valid tersedia dan dikuatkan validasi server; seller lain dilarang.
  - [ ] Pickup vs delivery mengikuti lifecycle server; label buyer/seller konsisten.
  - [ ] Uji paid→processing→ready→completed dan error transitions.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G15:END -->

<!-- TASK:G16:START -->
### G16 — Admin operational dashboard parity

- **Phase / Priority / Scope:** S3 / P1 / client
- **Status:** NEEDS_RECHECK
- **Depends on:** G04
- **Baseline:** Live Admin overview berupa Facts dan nav horizontal, prototype punya sidebar, KPI, distributions.
- **Work (in-scope):** Bangun shell operasional dan overview berbasis API tanpa menyalin angka dummy/keuangan privat.
- **Files (start here; open selectively):** `client/apps/admin/src/live/Pages.jsx`, `client/apps/admin/src/prototype/Overview.jsx`, `client/packages/shared/layouts/InternalLayout.jsx`, `server/database/repositories/management.js`
- **Acceptance Criteria (semua wajib):**
  - [x] Sidebar dan navigasi Admin aktif sesuai izin; overview KPI benar dari API. _(local disposable DB + in-app browser; Railway not verified)_
  - [x] Data uang, full personal identity, alamat rinci tidak bocor ke Admin. _(overview endpoint: key scan test; report free text excluded)_
  - [x] Filter waktu/metrics hanya bila endpoint memberi data yang valid. _(days ∈ 7/30/90/180/365 validated server-side; null rates → "Data belum tersedia")_
  - [x] Mobile nav, empty/error states dan unauthorized diuji. _(manual browser only; automated `test:portals` NOT RUN)_
- **External decision/blocker:** Dependency G04 (deployment readiness) still TODO; Playwright not installed locally so `npm run test:portals` NOT RUN.
- **Evidence:** 2026-10-25, uncommitted on client `main`/server `main` (HEAD client `00dd2f5`, server `005e3f6`). Server: `node --test tests/*.test.js` (no DB) 21 PASS/2 SKIP; `TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55432/wally_test_g16` (fresh initdb cluster in session scratchpad, trust auth, no app .env) `node --test tests/integration.test.js` → 24 PASS / 2 FAIL; new subtests PASS: `G16 overview: role access is enforced by the server` (guest 401, buyer/seller 403, admin 403 on super, invalid `days` 400), `G16 overview: Admin receives no money, buyer identity or report text`, `G16 overview: counts and finance follow server records; mock payments and refunds excluded` (GMV/revenue/transactions/previous-period/trend-sum/rates/ops deltas). Failures are pre-existing G01: subtest `012 upgrade…` references `20261020000000_013_xendit_sessions.js` but the file on disk is `20261027081706_013_xendit_session.js` (+ parent). Client: `npm test` 26 PASS; `npm run test:structure` PASS; `npm run build`, `build:admin`, `build:buyer`, `build:seller` PASS; `npm run test:render` (prototype) PASS. In-app browser against local API + disposable DB: admin & super admin overview at 1280px and 375px (no horizontal overflow), mobile sidebar toggle/close on navigation, `?days=` persisted across reload, admin on `/super-admin` → denied panel, unknown admin route → not-found panel, guest/invalid session → `/login`, API stopped → error + "Coba lagi", empty DB → empty states and "Data belum tersedia". `npm run test:portals` NOT RUN (playwright missing); fixture updated to the new contract.
- **Notes / next action:** Implemented: `client/apps/admin/src/live/Layout.jsx` (role sidebar, breadcrumb, account/logout, mobile toggle + Escape, denied/not-found states), `Overview.jsx` (operational + finance views, range filter in URL), routes moved outside marketplace Shell in `apps/admin/src/LiveRoutes.jsx` and `compat/LiveRoutes.jsx`, new super-admin `operations` route, `Guard` optional `fallback`; server `management.overview(financial, days)` replaces `metrics()`, `v.overviewQuery`, routes `/admin/overview` + `/super-admin/overview` accept `?days=`. Finance definition: GMV = order subtotal for confirmed..completed orders whose checkout has a settled payment from a non-`mock` provider and no successful refund; revenue = platform_fee + service_fee of the same orders; mock-paid orders are counted only as `simulated_paid_orders`. Unavailable (explicit, not estimated): support cases (no server model → G17), conversion funnel (no event tracking → G20), payment success when no non-mock payments (G01 on hold). Super Admin coverage (prototype → live): Overview IMPLEMENTED; Operations IMPLEMENTED; Orders PARTIAL (existing list, no filters/detail parity); Transactions PARTIAL (G19); Buyers PARTIAL (Facts list); Sellers/Seller verification PARTIAL (G18, G11 data); Products PARTIAL; Categories IMPLEMENTED (pre-existing); Reports PARTIAL (G17); Moderation BLOCKED→G17; Support BLOCKED (no server model); Admins PARTIAL (G22, no invite/email channel); Platform fee PARTIAL (no priority/edit/scheduled UI); Audit log PARTIAL (no filter/pagination); Settings BLOCKED→G21 (no persistence). To reach DONE: G04 DONE + run `test:portals` + Railway check. Suggested commits: server `feat(admin): server-computed operational and financial overview`; client `feat(admin): live sidebar shell and API-backed overview`.
<!-- TASK:G16:END -->

<!-- TASK:G17:START -->
### G17 — Moderation & support cases

- **Phase / Priority / Scope:** S3 / P1 / client+server
- **Status:** TODO
- **Depends on:** G16
- **Baseline:** Prototype punya view terpisah; live melebur kasus di reports.
- **Work (in-scope):** Bangun tab/route moderasi dan support berbasis filter nyata, status SLA/kasus bila tersedia, review detail dan audit reason.
- **Files (start here; open selectively):** `client/apps/admin/src/live/routes.jsx`, `client/apps/admin/src/live/Pages.jsx`, `client/apps/admin/src/prototype/Operations.jsx`, `server/database/repositories/management.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Admin melihat listing/report terfilter sesuai tugas dan dapat menyelesaikan berdasarkan izin.
  - [ ] Tidak mengarang evidence/SLA; jika backend belum punya, catat dependensi endpoint.
  - [ ] Keputusan review menghasilkan status server dan audit log; error visible.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G17:END -->

<!-- TASK:G18:START -->
### G18 — Seller verification detail & keputusan

- **Phase / Priority / Scope:** S3 / P1 / client+server
- **Status:** TODO
- **Depends on:** G11,G16
- **Baseline:** Live approvals punya form, tetapi konteks seller, riwayat dan bukti verifikasi masih minim.
- **Work (in-scope):** Tampilkan pengajuan/detail, dokumen yang aman, keputusan approve/reject dengan alasan dan post-approval activation.
- **Files (start here; open selectively):** `client/apps/admin/src/live/Pages.jsx`, `client/apps/admin/src/prototype/People.jsx`, `server/src/app.js`, `server/database/repositories/management.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Admin dapat meninjau data relevan dan mengonfirmasi keputusan; dokumen private tidak terekspos publik.
  - [ ] Approve/reject memperbarui role/store state yang konsisten dan tercatat.
  - [ ] Status terminal, reject reason dan unauthorized case diuji.
- **External decision/blocker:** Akses dokumen identitas butuh kebijakan data privat/storage yang eksplisit.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G18:END -->

<!-- TASK:G19:START -->
### G19 — Super Admin transaction monitoring

- **Phase / Priority / Scope:** S3 / P1 / client
- **Status:** TODO
- **Depends on:** G16
- **Baseline:** Transaksi financial live berupa panel panjang, filter prototype lebih lengkap.
- **Work (in-scope):** Bangun tabel paginated, filter status/store/date/method/amount dan detail transaksi + refund confirmation.
- **Files (start here; open selectively):** `client/apps/admin/src/live/Pages.jsx`, `client/packages/shared/live/Orders.jsx`, `client/apps/admin/src/prototype/Transactions.jsx`, `server/src/validation.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Filters diteruskan ke endpoint super-admin sesuai kontrak dan pagination benar.
  - [ ] Financial snapshot/line item hanya Super Admin; Admin tetap disamarkan.
  - [ ] Refund server-authoritative, butuh alasan, ada pending/success/failure state dan uji replay.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G19:END -->

<!-- TASK:G20:START -->
### G20 — Analytics & KPI finansial nyata

- **Phase / Priority / Scope:** S3 / P1 / client+server
- **Status:** TODO
- **Depends on:** G19
- **Baseline:** KPI funnel/retention/growth prototype banyak yang berasal dari fixtures; live hanya metrik ringkas.
- **Work (in-scope):** Tentukan definisi tiap KPI, query agregasi yang benar, range tanggal, baseline event bila ada; jangan menghasilkan angka semu.
- **Files (start here; open selectively):** `client/apps/admin/src/prototype/Overview.jsx`, `client/apps/admin/src/live/Pages.jsx`, `server/database/repositories/management.js`, `client/docs/12-analytics-and-kpis.md`
- **Acceptance Criteria (semua wajib):**
  - [ ] Hanya KPI bersumber pada data nyata ditampilkan; unavailable ditandai.
  - [ ] GMV/net revenue/refunds memiliki definisi dan snapshot stabil, dengan uji kasus.
  - [ ] Admin dan Super Admin melihat data sesuai izin; agregat tidak mengungkap data restricted.
- **External decision/blocker:** Metrik funnel perlu event instrumentation tambahan jika sumber belum cukup.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G20:END -->

<!-- TASK:G21:START -->
### G21 — Persisted platform settings

- **Phase / Priority / Scope:** S3 / P1 / server+client
- **Status:** TODO
- **Depends on:** G16
- **Baseline:** Prototype punya region/city/supportHours; live/server belum memiliki persistence.
- **Work (in-scope):** Rancang setting yang benar-benar menjadi authoritative record, migration aditif, API khusus Super Admin, form save/version/audit; jangan timpa env keamanan dengan UI setting.
- **Files (start here; open selectively):** `client/apps/admin/src/prototype/Administration.jsx`, `client/apps/admin/src/live/Pages.jsx`, `server/docs/database-gap-report.md`, `server/database/migrations`, `server/src/app.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Setting tersimpan, dibaca ulang dan digunakan sesuai cakupan yang didokumentasi.
  - [ ] Hak update hanya role yang ditentukan (prefer Super Admin), perubahan masuk audit.
  - [ ] Migration aman dan reversible di disposable DB, tanpa mengubah histori production secara sembrono.
- **External decision/blocker:** Butuh pemilahan setting bisnis vs environment rahasia/infra sebelum merancang schema.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G21:END -->

<!-- TASK:G22:START -->
### G22 — Admin invite & account recovery

- **Phase / Priority / Scope:** S3 / P1 / server+client
- **Status:** TODO
- **Depends on:** G03,G16
- **Baseline:** Membuat admin memakai password langsung; tindakan reset saat ini revocation, bukan email invite/recovery end-to-end.
- **Work (in-scope):** Tambahkan flow undangan/recovery yang aman jika channel telah dipilih, token single-use expiry, audit, dan UX pemberitahuan realistis.
- **Files (start here; open selectively):** `client/apps/admin/src/live/Pages.jsx`, `client/apps/admin/src/prototype/Administration.jsx`, `server/src/app.js`, `server/database/repositories/management.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Undangan/recovery hanya diterbitkan dengan izin Super Admin dan masa berlaku yang terbatas.
  - [ ] Reset memutus sesi sesuai kebijakan dan memungkinkan pemulihan autentikasi yang valid.
  - [ ] Tidak memalsukan "email terkirim" bila service delivery belum terintegrasi; test token reuse/expiry.
- **External decision/blocker:** Perlu pemilihan layanan pengiriman email dan aturan reset; jika belum ada, BLOCKED.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G22:END -->

<!-- TASK:G23:START -->
### G23 — Buyer reviews terverifikasi

- **Phase / Priority / Scope:** S4 / P2 / server+client
- **Status:** TODO
- **Depends on:** G10
- **Baseline:** Rating tampil dari data, namun submission review belum tersedia.
- **Work (in-scope):** Review hanya untuk order yang eligible; moderasi/report abuse, update rating aggregates dan UI ulasan.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `server/database/migrations/20260924061051_009_trust_moderation.js`, `server/src/app.js`, `server/database/repositories/catalog.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Buyer order eligible dapat mengulas sekali sesuai policy; nonbuyer/order lain dilarang.
  - [ ] Rating di storefront/detail dihitung dari record yang valid; tidak manipulatif.
  - [ ] Empty/rejected/reporting dan moderasi diuji.
- **External decision/blocker:** Perlu kebijakan eligibility dan edit/hapus review.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G23:END -->

<!-- TASK:G24:START -->
### G24 — Promotion/discount lifecycle

- **Phase / Priority / Scope:** S4 / P2 / server+client
- **Status:** TODO
- **Depends on:** G01,G10
- **Baseline:** Diskon belum aktif sebagai perhitungan checkout nyata.
- **Work (in-scope):** Tentukan promo rules, eligibility, budget, stacking, expiry dan settlement snapshot; validasi hanya di server.
- **Files (start here; open selectively):** `client/apps/buyer/src/live/Pages.jsx`, `server/database/transactions/commerce.js`, `server/database/migrations/20260924061051_009_trust_moderation.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Quote dan checkout menggunakan rule konsisten dan menyimpan snapshot diskon.
  - [ ] Promo tidak dapat disalahgunakan/replay; concurrent limits diuji.
  - [ ] Buyer melihat alasan promo diterima/ditolak; tidak ada promo palsu.
- **External decision/blocker:** Perlu kebijakan promo dan pendanaan diskon.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G24:END -->

<!-- TASK:G25:START -->
### G25 — Seller settlement/payout

- **Phase / Priority / Scope:** S4 / P2 / server+client
- **Status:** TODO
- **Depends on:** G01,G19
- **Baseline:** Platform menghitung net seller, tetapi belum mengirim settlement/payout.
- **Work (in-scope):** Definisikan ledger dan settlement lifecycle sesuai provider/payout partner; pisahkan saldo tersedia/pending/refund, rekonsiliasi bank.
- **Files (start here; open selectively):** `server/database/migrations/20260924061119_010_finance.js`, `server/database/transactions/payments.js`, `server/database/repositories/management.js`, `client/apps/seller/src/live/Pages.jsx`
- **Acceptance Criteria (semua wajib):**
  - [ ] Saldo/riwayat seller dihitung dari transaksi authoritative, tanpa pembayaran fiktif.
  - [ ] Payout idempotent, audit dan gagal/partial retry memiliki jalur rekonsiliasi.
  - [ ] Data finansial sensitif hanya role berizin dan diverifikasi terhadap provider sandbox.
- **External decision/blocker:** Perlu desain operasional dan vendor payout/bank; jangan mengklaim settlement live.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G25:END -->

<!-- TASK:G26:START -->
### G26 — Notification delivery & preferences

- **Phase / Priority / Scope:** S4 / P2 / server+client
- **Status:** TODO
- **Depends on:** G10,G15
- **Baseline:** Notifikasi masih terutama in-app tanpa delivery channel/pengaturan preferensi.
- **Work (in-scope):** Bangun preference serta delivery adapter sesuai persetujuan, queue/retry, dan fallback in-app.
- **Files (start here; open selectively):** `client/packages/shared/live/session.jsx`, `server/src/app.js`, `server/database/repositories/accounts.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] In-app and optional external notifications sesuai event order/seller dan consent.
  - [ ] Retry idempotent, preference dihormati, error tidak menandai delivered palsu.
  - [ ] Channel belum dipilih → documented disabled state.
- **External decision/blocker:** Butuh channel (email/WA/push) dan persetujuan pengguna.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G26:END -->

<!-- TASK:G27:START -->
### G27 — Import media dari Google Drive

- **Phase / Priority / Scope:** S4 / P2 / client+server
- **Status:** TODO
- **Depends on:** G13
- **Baseline:** MediaUploader mengambil file dari perangkat; backend metadata mengenal source google_drive.
- **Work (in-scope):** Putuskan import Google Drive yang sah, pemilihan file, permission, upload ulang ke GCS, validasi jenis/size/ownership.
- **Files (start here; open selectively):** `client/packages/ui/components/common/MediaUploader.jsx`, `client/packages/api-client/media.js`, `server/src/media.js`, `server/src/gcs.js`
- **Acceptance Criteria (semua wajib):**
  - [ ] Device upload tetap berjalan; Drive import (jika diaktifkan) membuat salinan GCS yang owned.
  - [ ] Tidak menyimpan URL Drive sementara sebagai foto permanen.
  - [ ] Permission denied, retry, size dan cleanup ditest.
- **External decision/blocker:** Memerlukan Google OAuth/Picker policy dan kredensial eksternal.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G27:END -->

<!-- TASK:G28:START -->
### G28 — Shared UI primitives & design parity

- **Phase / Priority / Scope:** S4 / P2 / client
- **Status:** TODO
- **Depends on:** G06,G12,G16
- **Baseline:** Komponen live banyak berupa Facts/Form mentah alih-alih antarmuka commerce/workspace.
- **Work (in-scope):** Bangun reusable Badge, DataTable, cards, confirmation modal, empty/loading/error, responsive UX; hindari duplikasi style dan pemecahan flow.
- **Files (start here; open selectively):** `client/packages/shared/live/Forms.jsx`, `client/packages/ui/components/common/UI.jsx`, `client/packages/ui/styles/live.css`, `client/packages/shared/layouts/InternalLayout.jsx`
- **Acceptance Criteria (semua wajib):**
  - [ ] Komponen reusable bisa dikonsumsi Buyer/Seller/Admin tanpa membawa fixture prototype.
  - [ ] Semua tindakan sensitif punya dialog/alasan dan feedback server.
  - [ ] Accessibility label/keyboard, mobile width, content overflow, dan regression smoke diuji.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G28:END -->

<!-- TASK:G29:START -->
### G29 — Docs & kontrak mutakhir

- **Phase / Priority / Scope:** S4 / P2 / client+server
- **Status:** TODO
- **Depends on:** G01-G28 (sesuai yang sudah DONE)
- **Baseline:** Dokumen lama masih mereferensikan discovery-only prototype dan path sejarah yang tidak selalu cocok.
- **Work (in-scope):** Perbarui dokumen terkait implementasi aktual, pemisahan fake/live, role matrix, API schema dan status fitur.
- **Files (start here; open selectively):** `client/README.md`, `client/docs/04-user-flows.md`, `client/docs/17-transaction-prototype.md`, `server/docs/client-api-mapping.md`, `server/docs/integration-recovery.md`
- **Acceptance Criteria (semua wajib):**
  - [ ] Dokumen menyebut capability dan limit sesuai kode saat itu, dengan tautan path aktif.
  - [ ] Tidak menyatakan fitur eksternal aktif tanpa bukti.
  - [ ] Catatan migration/deploy/test dan role matrix mutakhir.
- **External decision/blocker:** -
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G29:END -->

<!-- TASK:G30:START -->
### G30 — E2E regression + go-live readiness

- **Phase / Priority / Scope:** S4 / P2 / client+server
- **Status:** TODO
- **Depends on:** G01-G29 (yang relevan)
- **Baseline:** Unit/contract fixture pass bukan bukti buyer→payment→fulfillment→refund di production deployment.
- **Work (in-scope):** Buat test matrix RBAC + transaksi + responsive, browser/API/PostgreSQL, test env disposable dan checklist go-live. Validasi setiap lingkungan secara eksplisit.
- **Files (start here; open selectively):** `client/tests/browser-regression.mjs`, `client/tests/portal-smoke.mjs`, `client/tests/recovery-browser.mjs`, `server/tests/integration.test.js`, `server/docs/integration-recovery.md`
- **Acceptance Criteria (semua wajib):**
  - [ ] Automated suites mencakup Buyer/Seller/Admin/Super Admin/Courier (jika aktif), ownership dan denial.
  - [ ] E2E sandbox checkout→webhook→order→fulfillment→refund/expiry reproducible.
  - [ ] Readiness production membutuhkan bukti migrasi, worker, bucket CORS/IAM, TLS/origin, dan logs; item tak terverifikasi dilabel jelas.
  - [ ] Semua tasks memiliki evidence lengkap dan laporan akhir menunjukkan remaining limitations.
- **External decision/blocker:** Perlu akses deployment untuk mengklaim production E2E.
- **Evidence:** _belum ada; isi dengan `client/server commit`, nama test + hasil, dan screenshot/link bila ada._
- **Notes / next action:** _belum dimulai._
<!-- TASK:G30:END -->

## 6. EXECUTION LOG (HANYA ENTRY RINGKAS TERBARU)

> Append satu baris per invocation yang mengubah state. Maksimal 10 entri terbaru di sini; pindahkan lama ke archive bila diperlukan (jangan hapus bukti penting). Format: `YYYY-MM-DD | Gxx | OLD→NEW | scope | tests | commit(s) | blocker/next`.

- 2026-10-19 | INITIAL | all TODO | remote/source audit only | NOT RUN against local workspace | client 00dd2f5, server 005e3f6 are historical audit refs | next G01 after local binding.
- 2026-10-20 | TEMPLATE-LOCAL | same 30 tasks retained | configured requested Windows root, repo mapping UNVERIFIED | no local tests | no commit | run one-time bootstrap (not G01 implementation).

- 2026-10-20 | LOCAL_BINDING | paths verified: workspace=C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall; client=C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\client; server=C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\server; canonical_tracker=C:\Users\nawal\Documents\VSC\My_Project\Wally_Mall\client\task.md | tasks unchanged G01-G30, all TODO; completed_count=0; last_contiguous_done=NONE | file/marker/status checks PASS; tests NOT RUN | no commit | local HEAD client 00dd2f5, server 005e3f6 match audit baseline; REQUIRES_TASK_VERIFICATION; origin/main cached refs 0 ahead/0 behind (no fetch) | tracker moved from workspace root to client Git root; initially untracked, NOT_PUSHED; master remains workspace root | next eligible G01.

- 2026-10-20 | G01 | TODO→BLOCKED | inspected only G01 start files; tracker-only writeback, all original AC retained unchecked | source inspection PASS: mock-only; runtime/disposable DB/browser/provider E2E NOT RUN; tracker integrity PASS | no commit; HEAD client 00dd2f5/server 005e3f6, both main; LOCAL_ONLY/NOT_PUSHED | provider + authorized sandbox/webhook + refund decision pending; next G01; no bypass; contiguous NONE, total DONE 0/30.

- 2026-10-20 | G01 | BLOCKED→BLOCKED (business decision resolved; local implementation verified; external AC4 remains) | Xendit Test Mode hosted sessions, authenticated webhook, durable dispatch, reconciliation/refund, buyer flow, additive migration and tests | server unit 13/13, client unit 26/26, disposable PostgreSQL integration 23/23, buyer build and browser 390/1280px PASS; sandbox E2E NOT RUN | no commit/push, client main 00dd2f5/server main 005e3f6 | Test Mode credentials + registered reachable callback/return configuration required; next G01; no bypass; contiguous NONE, total DONE 0/30.

- 2026-10-25 | G01 | BLOCKED→BLOCKED (+ON_HOLD_BY_PRODUCT_PRIORITY) | user override: Super Admin first; no G01 code touched | — | no commit | resume only on explicit user instruction.

- 2026-10-25 | G16 | TODO→NEEDS_RECHECK | bypass note: G01 on hold by product priority; G04 dependency still TODO (partial work permitted by user override, not DONE) | live admin sidebar shell, server-computed overview (`?days=`), admin/super-admin data separation, operations route | server unit 21 PASS/2 SKIP; disposable DB integration 24 PASS/2 FAIL (pre-existing G01 migration-name subtest + parent; 3 new G16 subtests PASS); client unit 26, structure, builds, render smoke PASS; manual browser PASS; test:portals NOT RUN | no commit/push; client main 00dd2f5, server main 005e3f6 (dirty, includes uncommitted G01 work) | next G17 (support case model missing); contiguous NONE, total DONE 0/30.

## 7. FORMAT LAPORAN AKHIR SETIAP INVOCATION

Gunakan tepat heading berikut, tanpa klaim melebihi bukti:

```text
TASK: Gxx — <nama>
STATUS: DONE / BLOCKED / IN_PROGRESS / NEEDS_RECHECK
HASIL: <3–6 kalimat mengenai perubahan, perilaku, hal belum selesai>
FILE DIUBAH: <path singkat per repository + task.md>
VERIFIKASI: <perintah dan PASS/FAIL/NOT RUN; bukti browser/deployment>
GIT: <branch, commit aktual jika dibuat; usulan conventional commit untuk masing-masing repo; push status>
CHECKPOINT: last_contiguous_done=... | completed_count=X/30 | last_finished_task=... | current_task=...
NEXT: Gyy — <judul>; dependent/blocker bila ada
```

**Selesai hingga task berapa?** Hanya sebut “tuntas berurutan sampai Gxx” bila `last_contiguous_done=Gxx`. Bila ada gap BLOCKED, sebut task DONE secara individual + gap yang tertinggal. **Tidak perlu scan ulang project** pada invocation berikutnya: baca CHECKPOINT, indeks, 1 blok task, dan source path terkait saja.
