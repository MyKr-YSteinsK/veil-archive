# docs/patch-log.md

# The Veil Archive｜帷幕档案 Patch Log

This file records meaningful changes after the initial baseline.

Use concise entries. Do not include abandoned ideas, speculative plans, or discussion history.

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

## Unreleased

Add new entries above this section after each meaningful patch.
