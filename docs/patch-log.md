# docs/patch-log.md

# The Veil Archive｜帷幕档案 Patch Log

This file records meaningful changes after the initial baseline.

Use concise entries. Do not include abandoned ideas, speculative plans, or discussion history.

This is a historical developer record. Current repository state and verification gaps live in [`docs/project/CURRENT_STATE.md`](project/CURRENT_STATE.md); older build or manual-check entries are not present-tense CI or production proof.

## Format

```md
## YYYY-MM-DD — short change title

Type: feat | fix | refactor | docs | style | chore

Summary:
- What changed.

Files:
- `path/to/file`

Verification:
- `npm run build`: pass/fail
- Manual checks, if any.

Notes:
- Optional known limitation or follow-up.
```

## Baseline

## 2026-07-07 — Initial completed PWA baseline

Type: feat

Summary:

* Established The Veil Archive｜帷幕档案 as a mobile-first offline PWA.
* Implemented 誓约, 异赐, 帷录, and 源典 tabs.
* Added local IndexedDB persistence through Dexie.
* Added task/reward templates, ledger records, settings, CSV export, theme switching, day-start setting, and GitHub Pages deployment.
* Added PWA manifest and service worker configuration.

Files:

* `src/App.tsx`
* `src/main.tsx`
* `src/styles.css`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/components/LogPage.tsx`
* `src/components/CodexPage.tsx`
* `src/components/ui/AnimatedNumber.tsx`
* `src/components/ui/Toast.tsx`
* `src/data/types.ts`
* `src/data/database.ts`
* `src/data/services.ts`
* `src/data/calculations.ts`
* `src/data/validation.ts`
* `src/data/csv.ts`
* `src/data/index.ts`
* `vite.config.ts`
* `.github/workflows/deploy.yml`
* `README.md`

Verification:

* `npm run build`: expected to pass.
* GitHub Pages deployment: configured.

Notes:

* Data is local to the current browser/device.
* Backup currently uses CSV export only.
* No import/restore flow exists yet.

## 2026-07-07 — Version 1.1.0 UI and update hardening

Type: feat

Summary:

* Added a lightweight PWA update-ready prompt with an explicit restart action.
* Made the displayed app version code-owned and advanced it to 1.1.0.
* Added a local in-app changelog to 源典.
* Redesigned residual-echo summaries and tightened vow/giving card density.
* Replaced native template-type selects with accessible animated segmented controls.
* Corrected parchment-theme surfaces, borders, dividers, filters, and bottom navigation contrast.

Files:

* `src/pwaUpdate.ts`
* `src/data/changelog.ts`
* `src/data/services.ts`
* `src/components/ui/PwaUpdatePrompt.tsx`
* `src/components/ui/SegmentedTypeSwitch.tsx`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/components/CodexPage.tsx`
* `src/styles.css`
* `vite.config.ts`

Verification:

* `npm run build`: pass.
* Mobile dark/light theme, segmented create/edit flows, version display, and changelog: pass.

Notes:

* The update-ready banner requires a deployed waiting service-worker revision for a full end-to-end trigger.

## 2026-07-07 — Version 1.2.0 daily icon system

Type: feat

Summary:

* Replaced colored emoji template and ledger icons with a unified monochrome Lucide icon system.
* Added stable icon IDs for daily activities and compatibility mapping for legacy emoji data.
* Updated vow, giving, ledger, archive, picker, and changelog surfaces to use the new system.

Files:

* `src/components/ui/iconRegistry.tsx`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/components/LogPage.tsx`
* `src/components/CodexPage.tsx`
* `src/data/services.ts`
* `src/data/changelog.ts`
* `src/styles.css`
* `docs/project-map.md`
* `docs/patch-log.md`

Verification:

* `npm run build`: pass.
* Legacy template and ledger icons, icon picker accessibility/touch size, version 1.2.0 changelog, and dark/light themes: pass.

Notes:

* Legacy emoji values remain readable and are normalized to stable icon IDs on future writes.

## 2026-07-07 — 1.3.0 template ordering and pinning

Type: feat

Summary:

* Added independent manual ordering for repeatable and one-time vow and giving templates.
* Added persisted template pinning with pinned-first display.
* Added handle-based drag reordering with smooth movement and local IndexedDB persistence.
* Updated 密典版本 and the in-app changelog to 1.3.0.

Files:

* `src/data/types.ts`
* `src/data/templateOrdering.ts`
* `src/data/services.ts`
* `src/data/index.ts`
* `src/components/ui/TemplateReorderGroup.tsx`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/data/changelog.ts`
* `src/styles.css`
* `docs/project-map.md`
* `docs/patch-log.md`

Verification:

* `npm run build`: pass.
* Mobile vow/giving reorder persistence, pin/unpin persistence, theme coherence, and fulfill/receive ledger snapshots: pass.

Notes:

* Dragging starts from the dedicated handle; pinned and unpinned groups reorder independently.

## 2026-07-10 — 1.3.1 shared template page structure

Type: refactor

Summary:

* Extracted stable shared form, list, feedback, summary, and template-card primitives used by vow and giving pages.
* Reduced duplicated page lifecycle and presentation logic while keeping domain rules explicit.
* Preserved existing persistence, icon, sorting, pinning, drag, ledger, and theme behavior.
* Updated 密典版本 and the in-app changelog to 1.3.1.

Files:

* `src/hooks/useAutoClearingToast.ts`
* `src/hooks/useTemplatePageData.ts`
* `src/components/templates/TemplateFormModal.tsx`
* `src/components/templates/TemplatePagePrimitives.tsx`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/data/changelog.ts`
* `docs/project-map.md`
* `docs/patch-log.md`

Verification:

* `npm run build`: pass.
* Mobile create/edit/type/icon flows, fulfillment/receipt and one-time guards, insufficient balance, pin/unpin, vow/giving reorder persistence, ledger snapshots/balance, themes, version, changelog, and console: pass.

Notes:

* Destructive delete confirmation was not submitted during browser verification; the unchanged soft-delete and historical ledger service paths were inspected instead.

## 2026-08-26 — Canonical development framework adoption

Type: docs

Summary:

* Replaced the mixed repository instructions with a concise repo-specific `AGENTS.md`.
* Added canonical durable product, decision, and current-state documents under `docs/project/`.
* Clarified supporting-document ownership and current one-time/CSV implementation boundaries.

Files:

* `AGENTS.md`
* `README.md`
* `docs/project/PROJECT_BRIEF.md`
* `docs/project/DECISIONS.md`
* `docs/project/CURRENT_STATE.md`
* `docs/project-map.md`
* `docs/patch-log.md`

Verification:

* `npm run build`: pass (`tsc -b && vite build`).

Notes:

* Product source, schema, UI/business behavior, PWA runtime, and release behavior were not changed. The migration checkpoint remains pending.

## 2026-08-26 — Core pure-logic regression baseline

Type: test

Summary:

* Added Vitest 4.1.11 as a development-only test runner and a non-interactive `npm test` command.
* Added regression coverage for ledger calculations, day windows/today statistics, validation, template ordering/pinning derivation, and CSV export escaping.

Files:

* `package.json`
* `package-lock.json`
* `vitest.config.ts`
* `src/data/calculations.test.ts`
* `src/data/validation.test.ts`
* `src/data/templateOrdering.test.ts`
* `src/data/csv.test.ts`
* `docs/project/CURRENT_STATE.md`
* `docs/project-map.md`
* `docs/patch-log.md`

Verification:

* `npm test`: pass — 4 files, 13 tests.
* `npm run build`: pass — `tsc -b && vite build`.

Notes:

* Tests do not decide unresolved one-time, backfill, negative-balance, day-start, release identity, or release-gate policy. The deploy workflow remains unchanged.
* npm installation reported 5 high-severity advisories; dependency remediation was not included.

## 2026-08-27 — Dependency security audit and formal Plan delivery rule

Type: maintenance

Summary:

* Replaced the old explicit-user-request-only commit/push note in `AGENTS.md` with a formal Plan/Task default: after Acceptance, required verification, and Project State/docs updates pass, commit in-scope changes and push `main` to `origin/main`, with explicit safety stop conditions and post-push synchronization checks.
* Audited the pre-fix lockfile's 5 high npm advisory entries. All were build/dev-toolchain findings, not application runtime dependencies: direct dev-only `vite@7.2.2`, and transitive `postcss@8.5.16`, `nanoid@3.3.15`, `fast-uri@3.1.3`, `brace-expansion@5.0.7`, and nested `filelist` `brace-expansion@2.1.1`. `npm explain` traced them through Vite or `vite-plugin-pwa` → Workbox; application source does not import the vulnerable package implementations, and those implementations are not included in the final browser bundle.
* Applied the normal non-force npm remediation as a lockfile-only change: Vite 7.2.2 → 7.3.6, PostCSS 8.5.16 → 8.5.26, nanoid 3.3.15 → 3.3.18, fast-uri 3.1.3 → 3.1.6, brace-expansion 5.0.7/2.1.1 → 5.0.9/2.1.4, and the compatible Vite/esbuild toolchain 0.25.12 → 0.28.2. Root `package.json` declarations were unchanged.

Audit detail:

* `brace-expansion` — high; transitive nodes `5.0.7` through `vite-plugin-pwa@1.3.0` → `workbox-build@7.4.1` → `glob@11.1.0` → `minimatch@10.2.5`, and nested `2.1.1` through Workbox's off-main-thread/ejs/jake/filelist/minimatch chain. Affected aggregate ranges were `2.0.0–2.1.3` and `4.0.0–5.0.8`; fixed to `2.1.4` and `5.0.9`. Build-time glob expansion/DoS conditions require hostile tool input; no app runtime path was found.
* `fast-uri` — high; transitive `3.1.3` through `vite-plugin-pwa@1.3.0` → `workbox-build@7.4.1` → `ajv@8.20.0`. Affected range was `3.0.0–3.1.4`; fixed to `3.1.6`. The host-confusion condition is in Workbox build-time URI parsing, not the browser app.
* `nanoid` — high; transitive `3.3.15` through `vite@7.2.2` → `postcss@8.5.16`. Affected range was `<=3.3.17`; fixed to `3.3.18`. The loop condition requires an invalid size passed by build tooling; no application call site was found.
* `postcss` — high aggregate (including the reported moderate and high source-map advisories); transitive `8.5.16` through `vite@7.2.2`, affected `<=8.5.22`, fixed to `8.5.26`. The path/source-map disclosure condition is build-input/dev-tooling scoped and is not exposed by the static Pages runtime.
* `vite` — high aggregate (including reported moderate and high dev-server advisories); direct devDependency `7.2.2` from the root's `^7.2.2` range, affected `7.0.0–7.3.3`, fixed to `7.3.6`. The path traversal/arbitrary-read issues require a Vite dev server or build-time context; GitHub Pages serves generated static files and does not expose that server.

Verification:

* Pre-fix `npm audit` / `npm audit --json`: 5 high, 0 critical.
* Post-fix `npm audit` / `npm audit --json`: 0 vulnerabilities.
* `npm ci`: pass after the updated lockfile.
* `npm test`: pass — 4 files, 13 tests.
* `npm run build`: pass — `tsc -b && vite build` with Vite 7.3.6.
* No `npm audit fix --force` was used; product source, schema, PWA configuration, runtime app version, and deploy workflow were unchanged.

Notes:

* The audit findings were confined to local build/dev tooling under the inspected dependency graph; vulnerable behavior would require the relevant hostile build input or an exposed Vite dev server. GitHub Pages serves the generated static PWA and does not expose that server. No npm audit advisories remain in this lockfile, subject to future dependency/audit review.

## Unreleased

Add new entries above this section after each meaningful patch.
