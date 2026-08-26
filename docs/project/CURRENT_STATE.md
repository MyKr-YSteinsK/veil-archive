# CURRENT_STATE — The Veil Archive｜帷幕档案

Mutable repository snapshot, reconciled from the real repository on 2026-08-26 (Asia/Shanghai). Current repository evidence owns the facts in this file; durable intent is in [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) and [`DECISIONS.md`](DECISIONS.md).

## Repository identity

* Repository: `D:\CS\veil-archive`, npm package `veil-archive`.
* Branch: `main`; upstream: `origin/main`.
* HEAD: `7dd4dae93ed97c665e37398aac68f775cc7d8cc2` — `refactor: share vow and giving page logic`.
* Starting baseline worktree: clean for tracked files; ahead/behind was `0/0` against the upstream.
* Current handoff worktree: contains only the uncommitted governance/documentation changes listed in the migration result; no product source/config/schema/PWA changes are present. Branch/upstream remains `main`/`origin/main` at `0/0` for committed history.
* The migration snapshot in `PLAN-MIGRATION-000` is the same HEAD. The current repo did not move beyond that snapshot.
* Ignored local/generated material observed: `node_modules/`, `dist/`, `.idea/`, TypeScript build-info files, and `docs/dev-plan.md`. These are not source authority. `docs/dev-plan.md` exists locally but is not tracked by Git; it is deliberately preserved and must not be treated as an active plan.

## Implemented capabilities evidenced in the repository

* `App.tsx` owns four internal tab surfaces — 誓约, 异赐, 帷录, 源典 — without URL routing or a global store. Theme settings are loaded at app start.
* 誓约 supports repeatable and one-time templates, create/edit, pinning, handle-based reorder, soft deletion, and fulfillment. Fulfillment creates a positive ledger record with title/icon/type snapshots.
* 异赐 supports repeatable and one-time templates, create/edit, pinning, handle-based reorder, soft deletion, and receipt when the page-level balance check passes. Receipt creates a negative ledger record with snapshots.
* 帷录 supports all/task/reward filtering, local calendar month/day grouping, backfill from active templates, record detail and balance flow, snapshot/title/point/time edits, and confirmed record deletion.
* 源典 supports `system`/`light`/`dark` theme selection, configurable `dayStartTime`, one-time archive views, CSV export, code-owned displayed version/changelog, repository link, and two-step full local-data clearing.
* The UI uses shared template-page hooks/primitives, Lucide-based daily-life semantic icons with legacy emoji normalization, compact mobile cards, motion with reduced-motion handling, and a PWA update prompt bridge.

## Persistence and domain facts

* Dexie database name: `veilArchive`.
* Schema: version 1 only; tables are `taskTemplates`, `rewardTemplates`, `ledgerRecords`, and singleton-key `settings`.
* IndexedDB is the persistence source of truth. Balance is recalculated from all ledger `pointsDelta` values.
* Template edits do not rewrite historical ledger snapshots. Template deletion sets `deletedAt`; ledger deletion is physical and separate. Full clearing uses a Dexie read/write transaction over all four tables.
* Template ordering/pinning is persisted through optional `sortOrder`/`pinned` fields. The CSV generator exports templates (including deleted metadata) and ledger records, but not settings, ordering/pinning state, or an import/restore format.
* `src/data/calculations.ts` exports `isOneTimeTemplateUsed`, but current page/service code does not use it as a centralized invariant. One-time completion/receipt checks and reward affordability remain primarily in page handlers; the log backfill path does not have a unified one-time-use guard.

## Commands and verification semantics

The current `package.json` scripts are:

* `npm ci`: install from the lockfile.
* `npm run dev`: start Vite development server.
* `npm run build`: `tsc -b && vite build`; this is the available combined TypeScript project build check and production bundling command.
* `npm run preview`: serve existing `dist/` output.

There is no test script, test runner/file, lint script, standalone typecheck script, browser automation, import/migration command, or production-smoke command. Existing `docs/patch-log.md` entries are historical evidence only; they are not a current CI run. Real device, installed-PWA, deployed-site, and offline lifecycle checks are not evidenced in this repository snapshot.

Migration verification on 2026-08-26: `npm run build` passed, running the repository's `tsc -b && vite build` command and refreshing ignored `dist/` output. This proves the TypeScript project build check and Vite production bundling for the current source; it does not prove unit behavior, browser UX, offline lifecycle, installed-PWA behavior, production identity, or historical-data compatibility.

## Delivery and PWA facts

* `vite.config.ts` uses base, manifest `start_url`, and scope `/veil-archive/`; Workbox precaches the application shell/assets and uses `navigateFallback: 'index.html'`.
* PWA registration uses `registerType: 'prompt'`; the current Workbox configuration also has `skipWaiting: true` and `clientsClaim: true`. `src/pwaUpdate.ts` exposes an update-ready prompt and a user-triggered reload action.
* `.github/workflows/deploy.yml` runs on `main` push or manual dispatch. It uses Ubuntu, Node 22, `npm ci`, `npm run build`, Pages artifact upload, and `actions/deploy-pages@v4`. There is no PR gate, test/lint gate, preview check, deployed URL smoke, or offline check.
* Package/lock version is `1.0.0`; code-owned runtime `APP_VERSION` is `1.3.1`; Git has no tags. The canonical package/runtime/tag/build identity is unresolved. Production URL availability, recent CI state, Pages configuration, deployed SHA, and installed-PWA behavior are unavailable from the repository.

## Known risks and verification gaps

* Domain invariants for one-time use, template references, and affordability are not fully enforced in the data service or one transaction boundary; historical editing can also produce a negative derived balance. These are recorded issues, not migration scope.
* The schema has no migration layer. CSV is export-only and is not a complete restore contract.
* `dayStartTime` drives today statistics, while log month/day grouping uses local calendar dates. The current 源典 copy says it affects one-time archive behavior, but archive lists are filtered by `templateType === 'oneTime'` and do not read `dayStartTime`.
* No automated tests cover calculations, validation, ordering, icon compatibility, CSV escaping, or cross-entity ledger rules. Modal focus behavior, deletion confirmation submission, real touch/safe-area behavior, and the full service-worker update lifecycle lack current automated or device evidence.
* `src/data/services.ts` imports icon normalization from the UI icon registry, creating a data-to-UI coupling hotspot.

## Pending USER CHECK / unresolved policy

No decision is required to start or complete this documentation adoption while product behavior remains unchanged. The following remain later decision or verification items and are not silently accepted scope:

* the single package/runtime/tag/build version owner and release identity;
* whether CSV remains inspection/export-only or becomes a versioned, recoverable backup/import contract, including settings/order/pin data and transactional replacement;
* one-time type-change and backfill semantics, and whether cross-entity rules should move into data services/transactions;
* negative-balance policy after historical edits;
* the exact semantic scope of `dayStartTime`;
* whether the dedicated drag-handle interaction is a permanent product policy;
* future PR/tag/production/release gates;
* deployed and installed-PWA/real-device verification.

## Adoption status and active boundary

`PLAN-MIGRATION-000` is the active boundary for this adoption. The repository changes are limited to governance/documentation ownership; no normal feature or stabilization work is authorized by this migration. After the final `TASK_RESULT`, the next step is the Development Architect Migration Checkpoint.

The supplied migration package included the plan, audit, asset manifest, and old context exports. The separately named `00-START_HERE` through `10-MIGRATION_ADOPTION_BRIEF` files were not present in the supplied directory; the available materials were preserved outside the repository and no uncertain historical file was deleted or moved.
