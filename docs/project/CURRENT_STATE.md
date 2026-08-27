# CURRENT_STATE — The Veil Archive｜帷幕档案

Mutable repository snapshot, reconciled from the real repository on 2026-08-27 (Asia/Shanghai). Current repository evidence owns the facts in this file; durable intent is in [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) and [`DECISIONS.md`](DECISIONS.md).

## Repository identity

* Repository: `D:\CS\veil-archive`, npm package `veil-archive`.
* Lifecycle: **Production** — Plan10 checkpoint passed through bounded-residual-risk promotion; production artifacts and source update boundaries are verified, while an old-installed-client transition, browser offline reload, and real-device standalone behavior were not directly reproduced.
* Branch: `main`; upstream: `origin/main`.
* Migration snapshot baseline: `7dd4dae93ed97c665e37398aac68f775cc7d8cc2` — `refactor: share vow and giving page logic`.
* Migration adoption is committed as `d48be70` — `docs: adopt development framework`.
* `Veill-Plan01` is complete and pushed in `7c00cb9` — `test: establish core regression baseline`; its 4-file/13-test pure-logic baseline is now a stable repository capability.
* Plan02 reconciliation started from clean HEAD `7c00cb95a15a1b476c4c0a3433822278cd1f1db4`, synchronized with `origin/main`; its final delivery commit is reported in the corresponding `TASK_RESULT`.
* Plan02 completed dependency audit/remediation, repository delivery-rule documentation, and current-state/patch-log updates; its final pushed tip is `479e9be`.
* Plan03 started from clean HEAD `479e9bef67cd5e0a50d35ba116357af9271c1c2b`, synchronized with `origin/main`; the user confirmed all six backup/restore contract decisions, and the implementation is delivered without a Dexie schema migration or PWA change.
* Plan04 starts from clean HEAD `3882f47d394a3c8555c281eebecd01611a4c8fd2`, synchronized with `origin/main`, and is limited to one-time/history semantics investigation. No product source, service, schema, data, UI, PWA, or release behavior is changed by this investigation.
* Plan05 implements the accepted D-012 one-time identity and historical-correction rules from clean Plan04 tip; its delivery commit and verification are reported in the corresponding `TASK_RESULT`.
* Plan06 implements accepted D-013 narrow `dayStartTime` semantics: it remains the daily-statistics window owner; Log natural-calendar grouping and one-time archive behavior remain independent.
* Plan07 completed the version/release identity investigation from clean Plan06 tip `32bf6fd11464d3288e96fa326d9115c774fdebc6`; Plan08 subsequently accepted and implemented its contract as D-014 without a product release side effect.
* Plan08 accepted and implemented D-014: product/package/tag/deployment identities now have separate durable roles, and a report/strict release coherence checker is available.
* Plan09 delivers the first formal `v1.4.0` release state: product and package mirrors are aligned, the canonical annotated tag is `v1.4.0`, and Pages/production evidence is verified externally; exact release SHA, workflow run, URL, and tag-object evidence remain in Git metadata and the delivery result rather than a self-invalidating latest-deployment field.
* Plan10 checkpoint passed: production identity, manifest, Workbox app shell, source update chain, and data-safety boundaries show no known PWA blocker; lifecycle is promoted from Stabilization to Production with bounded residual risk for unreproduced installed-client/offline/real-device transitions.
* Ignored local/generated material observed: `node_modules/`, `dist/`, `.idea/`, TypeScript build-info files, and `docs/dev-plan.md`. These are not source authority. `docs/dev-plan.md` exists locally but is not tracked by Git; it is deliberately preserved and must not be treated as an active plan.

## Implemented capabilities evidenced in the repository

* `App.tsx` owns four internal tab surfaces — 誓约, 异赐, 帷录, 源典 — without URL routing or a global store. Theme settings are loaded at app start.
* 誓约 supports repeatable and one-time templates, create/edit, pinning, handle-based reorder, soft deletion, and fulfillment. Fulfillment creates a positive ledger record with title/icon/type snapshots.
* 异赐 supports repeatable and one-time templates, create/edit, pinning, handle-based reorder, soft deletion, and receipt when the page-level balance check passes. Receipt creates a negative ledger record with snapshots.
* 帷录 supports all/task/reward filtering, local calendar month/day grouping, backfill from active templates, record detail and balance flow, snapshot/title/point/time edits, and confirmed record deletion.
* 源典 supports `system`/`light`/`dark` theme selection, configurable `dayStartTime`, one-time archive views, versioned JSON full-archive backup and replace-all restore with two-step confirmation, CSV export, code-owned displayed version/changelog, repository link, and two-step full local-data clearing.
* The UI uses shared template-page hooks/primitives, Lucide-based daily-life semantic icons with legacy emoji normalization, compact mobile cards, motion with reduced-motion handling, and a PWA update prompt bridge.

## Persistence and domain facts

* Dexie database name: `veilArchive`.
* Schema: version 1 only; tables are `taskTemplates`, `rewardTemplates`, `ledgerRecords`, and singleton-key `settings`.
* IndexedDB is the persistence source of truth. Balance is recalculated from all ledger `pointsDelta` values.
* Template edits do not rewrite historical ledger snapshots. Template deletion sets `deletedAt`; ledger deletion is physical and separate. Full clearing uses a Dexie read/write transaction over all four tables.
* Template ordering/pinning is persisted through optional `sortOrder`/`pinned` fields. The CSV generator exports templates (including deleted metadata) and ledger records, but not settings, ordering/pinning state, or an import/restore format.
* `src/data/calculations.ts` owns the canonical `isOneTimeTemplateUsed(records, kind, templateId)` identity predicate. Intent-specific ledger service operations enforce one-time duplicate prevention and live reward affordability inside Dexie read/write transactions; raw restore remains independent.
* A repository scan found no application state store besides the four IndexedDB tables; PWA/browser caches are delivery state, not user archive data. `settings` is a singleton row keyed internally as `settings`.
* The current CSV remains export-only: it carries template and ledger rows but omits settings, sort order, pin state, and backup/schema format metadata. It cannot restore the complete user state.
* Versioned JSON backup v1 now covers all four tables' user state, including soft-deleted templates, ordering/pinning, settings, ledger snapshots, optional references, and raw icon values. Restore is replace-all only, validates before writing, and uses one Dexie transaction over all four tables; the persisted runtime `appVersion` remains code-owned.
* `useTemplatePageData` still groups records by the current page's ledger kind and `templateId`; Vows/Givings use the canonical identity predicate for display/early UX guards, while service transactions re-check the real database state. Template type edits remain allowed and do not rewrite history.
* Log backfill choices hide currently used one-time templates and submit an explicit backfill intent. The service enforces the same identity rule for task/reward backfills and does not apply current-balance or historical-running-balance affordability to reward backfills.
* Ledger edit/delete preserve the ledger-derived balance model but have no final-balance or running-balance guard. The accepted backup restore validates record fields/signs/references but does not enforce one-time uniqueness or non-negative aggregate/running balance, so valid legacy inconsistencies remain representable without automatic rewrite.

## Commands and verification semantics

The current `package.json` scripts are:

* `npm ci`: install from the lockfile.
* `npm run dev`: start Vite development server.
* `npm run build`: `tsc -b && vite build`; this is the available combined TypeScript project build check and production bundling command.
* `npm run preview`: serve existing `dist/` output.
* `npm test`: run `vitest run` through Vitest 4.1.11 in Node environment against the data-module TypeScript tests and `scripts/**/*.test.mjs` release-checker fixtures.
* `npm run release:check`: report current product/package release identity; add `-- --strict --expected X.Y.Z` for the pre-tag strict coherence check.

The Plan01 regression baseline has 4 test files and 13 passing tests covering calculations, validation, template ordering, and CSV export; the current suite has 7 test files and 38 passing tests after backup/restore, service-invariant, day-window, and release-checker coverage. There is no lint script, standalone typecheck script, browser automation, import/migration command, or production-smoke command. Existing pre-baseline `docs/patch-log.md` entries are historical evidence only; they are not a current CI run. Real-device, installed-PWA, and true offline-browser lifecycle checks remain unreproduced; deployed-site evidence is recorded by the Plan09/Plan10 delivery evidence and external GitHub metadata.

Migration verification on 2026-08-26: `npm run build` passed, running the repository's `tsc -b && vite build` command and refreshing ignored `dist/` output. Plan01 verification on 2026-08-26 also passed `npm test` with 4 files and 13 tests. These checks prove the TypeScript project build, Vite production bundling, and current pure-logic baseline only; they do not prove browser UX, offline lifecycle, installed-PWA behavior, production identity, or historical-data compatibility.

Plan02 dependency verification on 2026-08-27: the pre-fix lockfile produced 5 high npm audit vulnerability entries. A normal, non-force `npm audit fix` updated only the lockfile's compatible dependency resolutions; the root `package.json` declarations remained unchanged. The post-fix lockfile passed `npm ci`, `npm audit` and machine-readable audit with 0 vulnerabilities, `npm test` with 4 files and 13 tests, and `npm run build` with Vite 7.3.6.

Plan03 implementation verification on 2026-08-27: `npm test` passed with 5 files and 17 tests, including fake-IndexedDB full-fidelity, version/reference rejection, replacement, and mid-transaction rollback coverage; `npm run build` passed with the TypeScript project build and Vite production bundle; `npm audit --omit=optional` reported 0 vulnerabilities. No browser IndexedDB/user data was read or modified.

Plan04 investigation verification on 2026-08-27: the one-time page/helper/service/backfill paths, type transitions, soft-delete/history behavior, ledger edit/delete, final and chronological balance calculations, reward backfill affordability, and backup-restore legacy compatibility were re-read; the existing `npm test` baseline passed with 5 files and 17 tests. No product source or user data was modified.

Plan05 implementation verification on 2026-08-27: `npm ci` passed with 0 audit vulnerabilities; `npm test` passed with 6 files and 30 tests, including identity-based one-time live/backfill enforcement, delete-driven re-availability, cross-kind isolation, live reward affordability, concurrent spend serialization, historical negative balance, legacy duplicate readability, and restore regression; `npm run build` passed with the TypeScript project build and Vite production bundle. No schema migration, restore-contract change, or browser IndexedDB/user-data operation was performed.

Plan06 implementation verification on 2026-08-27: `npm ci` passed with 0 audit vulnerabilities; `npm test` passed with 6 files and 31 tests, including before/at-boundary and exact-24-hour custom day-window coverage; `npm run build` passed with the TypeScript project build and Vite production bundle; `npm audit --omit=optional` reported 0 vulnerabilities. `git diff --check` passed. The implementation is intentionally limited to D-013 documentation/copy plus a day-window regression test; no schema, backup/restore, timezone, Log grouping, one-time archive, PWA, or release behavior is changed, and no browser IndexedDB/user data was read or modified.

Plan08 implementation verification on 2026-08-27: `npm ci` passed with 0 audit vulnerabilities; `npm test` passed with 7 files and 38 tests, including report/strict release-checker fixtures; `npm run build` passed with the TypeScript project build and Vite production bundle; `npm audit --omit=optional` passed with 0 vulnerabilities; report mode returned 0 and reported product `1.3.1`, package mirror `1.0.0`, and `strict release coherent: false`; strict `--expected 1.4.0` returned the expected non-zero result with field diagnostics; `git diff --check` passed. The implementation is limited to D-014 governance, the non-interactive checker and fixtures, command/documentation updates; no product version, tag, release, Pages workflow, schema, backup, service, or PWA lifecycle behavior is changed, and no browser IndexedDB/user data was read or modified.

Plan09 release verification on 2026-08-27: the release-owned version/changelog/mirror changes pass the strict `1.4.0` coherence check, and the full release gate (`npm ci`, `npm test`, `npm run build`, `npm audit --omit=optional`, and `git diff --check`) passes. The focused release commit, normal `main` push, annotated `v1.4.0` tag, remote peeled target, Pages workflow result, and production endpoint/version evidence are recorded in the final `TASK_RESULT` and GitHub/Git metadata; no dynamic deployment identifier is duplicated here.

Plan10 lifecycle checkpoint verification on 2026-08-27: fresh Git/tag/release identity reconciliation passed with `main` clean and synchronized, `v1.4.0` annotated and peeled to release commit `36b28bd88c36f00d0f6e44c44bff563079014aa0`, and strict release coherence at `1.4.0`; production root, manifest, app JS/CSS, `sw.js`, Workbox runtime, and required icon assets returned HTTP 200 under cache-busting. The production manifest matches `/veil-archive/` `id`/`start_url`/`scope`, `display: standalone`, and the expected product name; the generated service worker contains the current 11-entry precache set, `clientsClaim`/`skipWaiting`, cleanup, and `NavigationRoute` fallback to `index.html`; production artifacts match the local release build by SHA-256. Source inspection confirmed root-mounted update prompt integration, `onNeedRefresh → ready → updateServiceWorker(true)`, failure recovery to `ready`, schema version 1, and no update-path data clearing or restore side effect. The Pages run and direct production endpoint evidence are external; old-installed-client update, true offline browser reload, and real mobile standalone checks are `NOT REPRODUCED`, so the checkpoint promotes lifecycle to Production with those bounded residual risks retained.

## Delivery and PWA facts

* `vite.config.ts` uses base, manifest `start_url`, and scope `/veil-archive/`; Workbox precaches the application shell/assets and uses `navigateFallback: 'index.html'`.
* PWA registration uses `registerType: 'prompt'`; the current Workbox configuration also has `skipWaiting: true` and `clientsClaim: true`. `src/pwaUpdate.ts` exposes an update-ready prompt and a user-triggered reload action.
* `.github/workflows/deploy.yml` runs on `main` push or manual dispatch. It uses Ubuntu, Node 22, `npm ci`, `npm run build`, Pages artifact upload, and `actions/deploy-pages@v4`. There is no PR gate, test/lint gate, preview check, deployed URL smoke, or offline check.
* Current identity evidence is aligned for the first formal release: `package.json` and the root `package-lock.json` both declare `1.4.0`; `src/data/changelog.ts` owns `APP_VERSION = '1.4.0'` and `CHANGELOG[0].version = '1.4.0'`; `v1.4.0` is the first canonical annotated release tag. The workflow does not inject a commit SHA or product version into the app artifact; GitHub Actions run/deployment metadata and the direct production endpoint are the external source/deployment evidence, with exact dynamic values recorded in the final delivery result rather than this mutable state file. Plan07 investigated, Plan08 formalized, and Plan09 executed the canonical package/runtime/tag/deployment relationship in D-014.
* Plan10 production artifact evidence: cache-busted root/manifest/app assets/service worker/Workbox/icon requests succeeded; the production manifest and generated Workbox output match the release build and base-path contract. This is production/static evidence, not proof that an already-installed old client has completed the asynchronous update lifecycle.

## Version and release identity investigation

* Plan07 baseline: branch `main`, upstream `origin/main`, clean source tip `32bf6fd11464d3288e96fa326d9115c774fdebc6`, and local/remote tag listings empty.

| Identity | Current evidence | Current owner / role |
| --- | --- | --- |
| `package.json.version` | `1.4.0` | Formal-release mirror; not runtime authority |
| Root `package-lock.json` version | `1.4.0` | Lockfile mirror of package metadata |
| `APP_VERSION` | `1.4.0` | `src/data/changelog.ts`; code-owned displayed version |
| `CHANGELOG[0].version` | `1.4.0` | `src/data/changelog.ts`; user-facing changelog top entry |
| Git tag | `v1.4.0` annotated; peels to the release commit | First canonical release-tag identity; historical versions remain untagged |
| Source commit SHA | Plan09 release commit; exact SHA is recorded in the delivery result | Git source identity; not ordinary user-facing version |
| Pages deployment | `main` push or `workflow_dispatch` | `.github/workflows/deploy.yml`; source deployment mechanism, not a version authority |

* Historical changelog evidence maps `1.1.0` to the changelog-introduction commit `4d0cc191c6d8b02578948028d0db31cfd26159e5`, `1.2.0` to `a04a8f1f97f38f96215a4906f8d567749a7aae6`, `1.3.0` to `c02dc8f8a2f42960684393f4224b8a3d50d21651`, and `1.3.1` to `7dd4dae93ed97c665e37398aac68f775cc7d8cc2`. The `1.0.0` entry was recorded when the changelog was introduced, while the initial product work begins at `7fc14e3805cddc7476b75f210d35a07c90d93734`; no dedicated 1.0.0 release marker exists.
* The post-`1.3.1` history includes full JSON backup/replace-all restore, one-time and historical-correction hardening, narrow day-start semantics, and related governance/security/test work. The repository has no reliable tag or Pages deployment mapping for those changes, so no retroactive release identity was created.

## Known risks and verification gaps

* New live and backfill ledger writes now enforce one-time usage by same-kind template identity in service transactions; live reward affordability is also transaction-owned. Legacy duplicate/mixed-snapshot history remains intentionally readable and is not rewritten.
* Historical edit/delete and reward/task backfill can produce a negative derived balance by accepted D-012 policy. The current chronological balance display remains descriptive and does not reject negative running values.
* The schema has no migration layer. CSV is export-only and is not a complete restore contract.
* Backup/restore v1 policy is accepted and implemented as versioned JSON, replace-all, validate-before-transaction, strict future-version rejection, and code-owned runtime version handling. Merge/partial restore and schema migration remain deferred; Plan04 does not alter that contract.
* Plan05 implements D-012 without a schema migration or legacy-data rewrite. Its six specified domain/UI smoke checks were confirmed by the user; broad UI, modal focus, accessibility, real touch/safe-area, and full service-worker lifecycle evidence remain unavailable.
* `dayStartTime` drives only today statistics. Log month/day grouping uses local calendar dates, and one-time archive filters do not read `dayStartTime`; the 源典 setting copy now states this narrow scope.
* The current tests cover fake-IndexedDB service transactions, cross-entity ledger rules, one-time live/backfill policy, live reward affordability, concurrent spend serialization, negative historical balance, legacy duplicate readability, and restore regression. Icon compatibility and UI behavior remain outside the current automated suite; modal focus behavior, deletion confirmation submission, real touch/safe-area behavior, and the full service-worker update lifecycle lack current automated or device evidence.
* Plan07 confirmed that package/runtime/tag/deployment identity was split; Plan08 formalized D-014 and added a report/strict checker without turning the current Pages workflow into a release gate; Plan09 completed the first strict-coherent `v1.4.0` release without retroactive historical tags; Plan10 found no PWA blocker and promoted lifecycle to Production under bounded residual risk. Installed-PWA update transition, true offline reload, and real-device behavior remain separate verification gaps.
* `src/data/services.ts` imports icon normalization from the UI icon registry, creating a data-to-UI coupling hotspot.
* The pre-fix 2026-08-27 audit findings were all build/dev-toolchain findings: direct dev-only `vite@7.2.2` and transitive `postcss@8.5.16`, `nanoid@3.3.15`, `fast-uri@3.1.3`, plus `brace-expansion@5.0.7` and `filelist`'s nested `brace-expansion@2.1.1`. The chains run through Vite or `vite-plugin-pwa`/Workbox during local build/dev work; application source does not import the vulnerable package implementations, and those implementations are not included in the final browser bundle. The fixed lockfile resolves Vite 7.3.6, PostCSS 8.5.26, nanoid 3.3.18, fast-uri 3.1.6, brace-expansion 5.0.9/2.1.4, and the compatible esbuild 0.28.2 toolchain. The after-state audit has no residual advisories; this does not replace future audit review or real-device/production verification.

## Pending USER CHECK / unresolved policy

Plan03's six backup/restore decisions, Plan05's D-012 one-time/historical-correction decision, Plan06's D-013 narrow day-start decision, and Plan08's D-014 release-identity decision are accepted and recorded in `DECISIONS.md`; the first `v1.4.0` release and Plan10 Production checkpoint now follow those contracts. The following remain later decision or verification items and are not silently accepted scope:

* real-device/manual smoke verification of JSON export, file selection, the two-step replacement dialog, safe-area spacing, and touch behavior;
* whether the dedicated drag-handle interaction is a permanent product policy;
* future PR/production/release gates beyond the release-only coherence check;
* old-installed-client update transition, true offline-browser reload, and real-device standalone verification; these were `NOT REPRODUCED` in Plan10 and remain bounded residual risk rather than a claimed pass.

## Adoption status and active boundary

Migration adoption is committed as `d48be70` (`docs: adopt development framework`). `Veill-Plan01` is complete and its regression baseline is stable. Plan02 completed the dependency audit/remediation and established the active formal-Plan delivery rule in `AGENTS.md`. Plan03's contract is accepted and implemented as a docs-plus-runtime delivery with no Dexie schema change or data migration. Plan04 completed its investigation; Plan05 accepted and implemented D-012 as the identity-based one-time and truthful historical-correction boundary; Plan06 accepted and implemented D-013 as the narrow day-start statistics boundary; Plan07 completed the release identity investigation; Plan08 accepted and implemented D-014; Plan09 completed the first canonical `v1.4.0` release; and Plan10 passed the Production lifecycle checkpoint, all without schema migration or legacy rewrite. Future releases follow D-014; the next independent boundary is installed-PWA update lifecycle verification if a pre-1.4.0 client becomes available.

The supplied migration package included the plan, audit, asset manifest, and old context exports. The separately named `00-START_HERE` through `10-MIGRATION_ADOPTION_BRIEF` files were not present in the supplied directory; the available materials were preserved outside the repository and no uncertain historical file was deleted or moved.
