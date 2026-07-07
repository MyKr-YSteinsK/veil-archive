# docs/project-map.md

# The Veil Archive｜帷幕档案 Project Map

## 1. Planned directory structure

Current expected structure:

```text
veil-archive/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ docs/
│  ├─ dev-plan.md
│  ├─ project-map.md
│  └─ patch-log.md
├─ public/
│  └─ icons/
│     ├─ apple-touch-icon.png
│     ├─ icon-192.png
│     └─ icon-512.png
├─ src/
│  ├─ components/
│  │  ├─ ui/
│  │  │  ├─ AnimatedNumber.tsx
│  │  │  ├─ PwaUpdatePrompt.tsx
│  │  │  ├─ SegmentedTypeSwitch.tsx
│  │  │  └─ Toast.tsx
│  │  ├─ CodexPage.tsx
│  │  ├─ GivingsPage.tsx
│  │  ├─ LogPage.tsx
│  │  └─ VowsPage.tsx
│  ├─ data/
│  │  ├─ calculations.ts
│  │  ├─ changelog.ts
│  │  ├─ csv.ts
│  │  ├─ database.ts
│  │  ├─ index.ts
│  │  ├─ services.ts
│  │  ├─ types.ts
│  │  └─ validation.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ pwaUpdate.ts
│  └─ styles.css
├─ .gitignore
├─ AGENTS.md
├─ index.html
├─ package-lock.json
├─ package.json
├─ README.md
├─ tsconfig.json
└─ vite.config.ts
```

## 2. Expected key files

### `src/main.tsx`

Application entry.

Responsibilities:

* Import global styles.
* Register PWA service worker.
* Mount React app.

### `src/App.tsx`

Top-level app shell.

Responsibilities:

* Own active tab state.
* Render masthead.
* Render tab navigation.
* Switch between main pages.
* Apply stored theme on app load.
* Handle page transition motion.

### `src/styles.css`

Global visual system.

Responsibilities:

* Theme tokens.
* Dark and light theme variables.
* Mobile layout.
* Card styling.
* Modal sheet styling.
* Bottom tab styling.
* Ledger and codex page styling.
* Motion keyframes and interactive states.

This file is currently centralized. Avoid large visual rewrites unless requested.

## 3. Page/module ownership

### `src/components/VowsPage.tsx`

Owns 誓约 UI.

Responsibilities:

* Load task templates, ledger records, and settings.
* Show current balance and today gained points.
* Create and edit task templates.
* Soft-delete task templates.
* Fulfill task templates.
* Separate repeatable and one-time vows.
* Display today/cumulative counts.

Likely change locations:

* Add task template fields.
* Change vow sorting.
* Change one-time completion behavior.
* Improve vow card UI.
* Add quick completion behavior.

### `src/components/GivingsPage.tsx`

Owns 异赐 UI.

Responsibilities:

* Load reward templates, ledger records, and settings.
* Show current balance and today spent points.
* Create and edit reward templates.
* Soft-delete reward templates.
* Receive reward templates.
* Prevent receiving rewards when balance is insufficient.
* Separate repeatable and one-time rewards.

Likely change locations:

* Add reward template fields.
* Change affordability behavior.
* Change reward sorting.
* Improve reward card UI.
* Add quick receive behavior.

### `src/components/LogPage.tsx`

Owns 帷录 UI.

Responsibilities:

* Load ledger records, task templates, and reward templates.
* Show current balance.
* Filter records by all/task/reward.
* Group records by month/day.
* Backfill ledger records.
* Edit ledger records.
* Delete ledger records.
* Show record details and balance flow.

Likely change locations:

* Search/filter improvements.
* Date grouping behavior.
* Import/recovery behavior.
* Timeline density.
* Record editing constraints.

### `src/components/CodexPage.tsx`

Owns 源典 UI.

Responsibilities:

* Load settings, templates, and records.
* Update day-start setting.
* Update theme mode.
* Export CSV backup.
* Show archived one-time records.
* Clear all local data.
* Show app version and repository link.

Likely change locations:

* Import backup.
* Backup format changes.
* Settings expansion.
* About/version changes.
* Data deletion flow.

### `src/components/ui/AnimatedNumber.tsx`

Shared animated number display.

Responsibilities:

* Animate number changes.
* Respect reduced-motion preference.

### `src/components/ui/Toast.tsx`

Shared toast display.

Responsibilities:

* Show temporary status messages.
* Animate toast in/out.
* Respect reduced-motion preference.

### `src/components/ui/SegmentedTypeSwitch.tsx`

Shared accessible template-type selector.

Responsibilities:

* Switch between `repeatable` and `oneTime` with real buttons.
* Expose `aria-pressed` state.
* Animate the active segment while respecting reduced motion.

### `src/components/ui/PwaUpdatePrompt.tsx`

Shared non-intrusive PWA update banner.

Responsibilities:

* Show when a waiting service worker is ready.
* Let the user activate the update and restart the app.

## 4. Data/storage entry points

### `src/data/types.ts`

Owns TypeScript domain types.

Key types:

* `TaskTemplate`
* `RewardTemplate`
* `LedgerRecord`
* `Settings`
* `TemplateType`
* `LedgerKind`
* create/update input types

Change this file when changing persisted data shape.

### `src/data/database.ts`

Owns Dexie database declaration.

Database name:

```ts
veilArchive
```

Tables:

* `taskTemplates`
* `rewardTemplates`
* `ledgerRecords`
* `settings`

Change this file when adding tables, indexes, or schema versions.

### `src/data/services.ts`

Owns data mutation and query service wrappers.

Services:

* `taskTemplateService`
* `rewardTemplateService`
* `ledgerRecordService`
* `settingsService`
* `clearAllData`

Change this file when adding persistence behavior, validation calls, or transaction boundaries.

### `src/data/calculations.ts`

Owns pure derived logic.

Current responsibilities:

* Balance calculation.
* Day-window calculation.
* Today stats.
* Record filtering.
* One-time template usage check.

This is the best place for unit tests.

### `src/data/validation.ts`

Owns input validation.

Current responsibilities:

* Required names.
* Required icons.
* Positive integers.
* Template type validation.
* Ledger point-delta sign rules.
* ISO date validation.
* Day-start time validation.
* Theme mode validation.

### `src/data/csv.ts`

Owns backup CSV generation.

Current responsibilities:

* Export task templates.
* Export reward templates.
* Export ledger records.
* Escape CSV cells.
* Preserve deleted template metadata in export.

### `src/data/index.ts`

Public barrel export for data modules.

Use this to keep component imports clean.

### `src/data/changelog.ts`

Owns code-level app metadata.

Responsibilities:

* Export the current `APP_VERSION`.
* Store the static in-app version history.

### `src/pwaUpdate.ts`

Bridges `vite-plugin-pwa` registration to React UI.

Responsibilities:

* Track idle, ready, and updating service-worker states.
* Expose a small subscription API for the update prompt.
* Activate the waiting service worker on user action.

## 5. Styling/theme entry points

Primary styling file:

```text
src/styles.css
```

Current theme behavior:

* Theme mode is stored in IndexedDB settings.
* `applyTheme(mode)` writes `document.documentElement.dataset.theme = mode`.
* Light theme is controlled by `[data-theme="light"]`.
* Dark/system mode falls back to root dark tokens.

Important tokens:

* `--veil-black`
* `--veil-raised`
* `--veil-card`
* `--veil-border`
* `--ink`
* `--muted`
* `--echo`
* `--purple`
* `--giving`
* `--danger`

When adding styles, prefer existing tokens.

## 6. PWA/deployment entry points

### `vite.config.ts`

Owns:

* GitHub Pages base path.
* React plugin.
* Tailwind plugin.
* PWA manifest.
* Workbox caching behavior.
* PWA icon references.

Important current base:

```ts
base: '/veil-archive/'
```

Change carefully. Wrong base path will break GitHub Pages asset loading.

### `index.html`

Owns:

* HTML language.
* Viewport and safe-area behavior.
* Theme color.
* Apple mobile web app metadata.
* Favicon and Apple touch icon.
* App title and description.

### `.github/workflows/deploy.yml`

Owns GitHub Pages deployment.

Flow:

1. Checkout.
2. Setup Node 22.
3. `npm ci`.
4. `npm run build`.
5. Configure Pages.
6. Upload `dist`.
7. Deploy Pages.

## 7. Common change locations

### Add a new task/reward field

Likely files:

* `src/data/types.ts`
* `src/data/database.ts`
* `src/data/services.ts`
* `src/data/validation.ts`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/data/csv.ts`

### Change point/balance rules

Likely files:

* `src/data/calculations.ts`
* `src/data/services.ts`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/components/LogPage.tsx`

### Change day-start behavior

Likely files:

* `src/data/calculations.ts`
* `src/data/validation.ts`
* `src/components/CodexPage.tsx`
* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`

### Add import/restore backup

Likely files:

* `src/data/csv.ts` or new `src/data/import.ts`
* `src/data/services.ts`
* `src/data/validation.ts`
* `src/components/CodexPage.tsx`

### Improve first-use onboarding

Likely files:

* `src/components/VowsPage.tsx`
* `src/components/GivingsPage.tsx`
* `src/components/LogPage.tsx`
* `src/components/CodexPage.tsx`
* `src/styles.css`

### Change PWA install/deploy behavior

Likely files:

* `vite.config.ts`
* `index.html`
* `.github/workflows/deploy.yml`
* `README.md`

### Change visual design

Likely files:

* `src/styles.css`
* Page components only if DOM structure must change.

Prefer CSS-only visual changes when possible.

---
