# CURRENT_STATE — The Veil Archive｜帷幕档案

Mutable repository snapshot, reconciled from the real repository on 2026-08-27 (Asia/Shanghai). Current repository evidence owns the facts in this file; durable intent is in [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) and [`DECISIONS.md`](DECISIONS.md).

## Repository identity

* Repository: `D:\CS\veil-archive`, npm package `veil-archive`.
* Branch: `main`; upstream: `origin/main`.
* Migration snapshot baseline: `7dd4dae93ed97c665e37398aac68f775cc7d8cc2` — `refactor: share vow and giving page logic`.
* Migration adoption is committed as `d48be70` — `docs: adopt development framework`.
* `Veill-Plan01` is complete and pushed in `7c00cb9` — `test: establish core regression baseline`; its 4-file/13-test pure-logic baseline is now a stable repository capability.
* Plan02 reconciliation started from clean HEAD `7c00cb95a15a1b476c4c0a3433822278cd1f1db4`, synchronized with `origin/main`; its final delivery commit is reported in the corresponding `TASK_RESULT`.
* Plan02 completed dependency audit/remediation, repository delivery-rule documentation, and current-state/patch-log updates; its final pushed tip is `479e9be`.
* Plan03 reconciliation starts from clean HEAD `479e9bef67cd5e0a50d35ba116357af9271c1c2b`, synchronized with `origin/main`, and is limited to backup/restore contract investigation and state/patch-log documentation. No product source/config/schema/PWA changes are present.
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
* A repository scan found no application state store besides the four IndexedDB tables; PWA/browser caches are delivery state, not user archive data. `settings` is a singleton row keyed internally as `settings`.
* Plan03 confirms that the current CSV is export-only: it carries template and ledger rows but omits settings, sort order, pin state, and any backup/schema format metadata. It cannot restore the complete user state.
* Plan03 confirms that `clearAllData()` demonstrates a four-table Dexie read/write transaction boundary, but no backup JSON, import, restore transaction, schema migration, or rollback test exists. Backup/restore contract status is investigated and pending USER DECISION, not implemented.

## Commands and verification semantics

The current `package.json` scripts are:

* `npm ci`: install from the lockfile.
* `npm run dev`: start Vite development server.
* `npm run build`: `tsc -b && vite build`; this is the available combined TypeScript project build check and production bundling command.
* `npm run preview`: serve existing `dist/` output.
* `npm test`: run `vitest run` through Vitest 4.1.11 in Node environment against `src/data/**/*.test.ts`.

The regression baseline currently has 4 test files and 13 passing tests covering calculations, validation, template ordering, and CSV export. There is no lint script, standalone typecheck script, browser automation, import/migration command, or production-smoke command. Existing pre-baseline `docs/patch-log.md` entries are historical evidence only; they are not a current CI run. Real device, installed-PWA, deployed-site, and offline lifecycle checks are not evidenced in this repository snapshot.

Migration verification on 2026-08-26: `npm run build` passed, running the repository's `tsc -b && vite build` command and refreshing ignored `dist/` output. Plan01 verification on 2026-08-26 also passed `npm test` with 4 files and 13 tests. These checks prove the TypeScript project build, Vite production bundling, and current pure-logic baseline only; they do not prove browser UX, offline lifecycle, installed-PWA behavior, production identity, or historical-data compatibility.

Plan02 dependency verification on 2026-08-27: the pre-fix lockfile produced 5 high npm audit vulnerability entries. A normal, non-force `npm audit fix` updated only the lockfile's compatible dependency resolutions; the root `package.json` declarations remained unchanged. The post-fix lockfile passed `npm ci`, `npm audit` and machine-readable audit with 0 vulnerabilities, `npm test` with 4 files and 13 tests, and `npm run build` with Vite 7.3.6.

Plan03 investigation on 2026-08-27: current persistence fields, CSV omissions, validation ownership, template/ledger reference behavior, code-owned application version behavior, and four-table transaction feasibility were inspected. The resulting versioned-JSON/replace-all/validate-before-transaction/strict-future-version approach is a recommendation only; no durable backup/restore policy was accepted and no user data was read or modified.

## Delivery and PWA facts

* `vite.config.ts` uses base, manifest `start_url`, and scope `/veil-archive/`; Workbox precaches the application shell/assets and uses `navigateFallback: 'index.html'`.
* PWA registration uses `registerType: 'prompt'`; the current Workbox configuration also has `skipWaiting: true` and `clientsClaim: true`. `src/pwaUpdate.ts` exposes an update-ready prompt and a user-triggered reload action.
* `.github/workflows/deploy.yml` runs on `main` push or manual dispatch. It uses Ubuntu, Node 22, `npm ci`, `npm run build`, Pages artifact upload, and `actions/deploy-pages@v4`. There is no PR gate, test/lint gate, preview check, deployed URL smoke, or offline check.
* Package/lock version is `1.0.0`; code-owned runtime `APP_VERSION` is `1.3.1`; Git has no tags. The canonical package/runtime/tag/build identity is unresolved. Production URL availability, recent CI state, Pages configuration, deployed SHA, and installed-PWA behavior are unavailable from the repository.

## Known risks and verification gaps

* Domain invariants for one-time use, template references, and affordability are not fully enforced in the data service or one transaction boundary; historical editing can also produce a negative derived balance. These are recorded issues, not migration scope.
* The schema has no migration layer. CSV is export-only and is not a complete restore contract.
* Backup/restore remains a decision gate: full-fidelity coverage, restore mode, atomic replacement/rollback, future-version handling, and treatment of persisted `appVersion` require user confirmation before implementation.
* `dayStartTime` drives today statistics, while log month/day grouping uses local calendar dates. The current 源典 copy says it affects one-time archive behavior, but archive lists are filtered by `templateType === 'oneTime'` and do not read `dayStartTime`.
* The current tests do not cover service transactions, cross-entity ledger rules, one-time/backfill policy, icon compatibility, or UI behavior. Modal focus behavior, deletion confirmation submission, real touch/safe-area behavior, and the full service-worker update lifecycle lack current automated or device evidence.
* `src/data/services.ts` imports icon normalization from the UI icon registry, creating a data-to-UI coupling hotspot.
* The pre-fix 2026-08-27 audit findings were all build/dev-toolchain findings: direct dev-only `vite@7.2.2` and transitive `postcss@8.5.16`, `nanoid@3.3.15`, `fast-uri@3.1.3`, plus `brace-expansion@5.0.7` and `filelist`'s nested `brace-expansion@2.1.1`. The chains run through Vite or `vite-plugin-pwa`/Workbox during local build/dev work; application source does not import the vulnerable package implementations, and those implementations are not included in the final browser bundle. The fixed lockfile resolves Vite 7.3.6, PostCSS 8.5.26, nanoid 3.3.18, fast-uri 3.1.6, brace-expansion 5.0.9/2.1.4, and the compatible esbuild 0.28.2 toolchain. The after-state audit has no residual advisories; this does not replace future audit review or real-device/production verification.

## Pending USER CHECK / unresolved policy

No user decision was required for Plan02: the remediation stayed lockfile-only, within existing dependency compatibility ranges, and did not alter product behavior. Plan03 is intentionally ending at a USER CHECK; its recommendations are not accepted durable decisions. The following remain later decision or verification items and are not silently accepted scope:

* the single package/runtime/tag/build version owner and release identity;
* whether to adopt an independent versioned JSON full-fidelity backup while retaining CSV as inspection/export-only;
* whether restore v1 is replace-all only, with merge and partial restore deferred;
* whether restore must fully validate first, then replace all four tables in one transaction with rollback on any failure;
* whether unsupported future backup format/schema versions must be strictly rejected;
* whether full backup must include settings, order, pin, soft-deleted templates, legacy icon values, and complete ledger snapshots;
* whether an old backup `appVersion` is provenance only and must never override the current code-owned runtime version;
* one-time type-change and backfill semantics, and whether cross-entity rules should move into data services/transactions;
* negative-balance policy after historical edits;
* the exact semantic scope of `dayStartTime`;
* whether the dedicated drag-handle interaction is a permanent product policy;
* future PR/tag/production/release gates;
* deployed and installed-PWA/real-device verification.

## Adoption status and active boundary

Migration adoption is committed as `d48be70` (`docs: adopt development framework`). `Veill-Plan01` is complete and its regression baseline is stable. Plan02 completes the dependency audit/remediation and establishes the active formal-Plan default commit/push rule in `AGENTS.md`. Plan03 has investigated the backup/restore contract and is pending USER DECISION; no backup/restore implementation, schema change, or data migration is present. After the final `TASK_RESULT`, the next step is user confirmation of the contract, not implementation by assumption.

The supplied migration package included the plan, audit, asset manifest, and old context exports. The separately named `00-START_HERE` through `10-MIGRATION_ADOPTION_BRIEF` files were not present in the supplied directory; the available materials were preserved outside the repository and no uncertain historical file was deleted or moved.
