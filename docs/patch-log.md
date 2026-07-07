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

## Unreleased

Add new entries above this section after each meaningful patch.
