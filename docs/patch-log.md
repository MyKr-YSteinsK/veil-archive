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

## Unreleased

Add new entries above this section after each meaningful patch.
