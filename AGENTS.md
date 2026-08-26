# AGENTS.md

## Repository identity

The Veil Archive｜帷幕档案 is a small, personal, mobile-first offline PWA for tracking:

* 誓约 — vow/task templates and completions;
* 异赐 — reward templates and receipts;
* 残响 — points derived from the ledger;
* 帷录 — historical ledger records;
* 源典 — settings, archive views, export, and destructive controls.

The product is local-first. Persistent application data belongs in browser/device IndexedDB; there is no account, backend, cloud sync, analytics, payment, social, or remote application database.

## Canonical ownership

* This file is the canonical repository-specific execution boundary.
* [`docs/project/PROJECT_BRIEF.md`](docs/project/PROJECT_BRIEF.md) owns durable product identity, boundaries, and priorities.
* [`docs/project/DECISIONS.md`](docs/project/DECISIONS.md) owns accepted durable decisions and rationale.
* [`docs/project/CURRENT_STATE.md`](docs/project/CURRENT_STATE.md) owns mutable, evidence-dated repository state, risks, verification gaps, and pending decisions.
* [`docs/project-map.md`](docs/project-map.md) owns the detailed repository and module map.
* [`README.md`](README.md) owns product/developer entry and setup guidance.
* `src/`, `package.json`, `package-lock.json`, build configuration, and workflow files are the current implementation/configuration sources of truth for their respective facts.
* [`docs/dev-plan.md`](docs/dev-plan.md), when present locally, is historical planning material and is not current execution authority. [`docs/patch-log.md`](docs/patch-log.md) is historical developer evidence, not present-tense CI or production proof.

Current repository evidence owns current implementation facts. Do not silently reopen an accepted durable decision merely because the implementation has drifted; record implementation drift and request a product decision when policy must change.

## Product and data invariants

* Keep the four-surface navigation model and the terminology `誓约 / 异赐 / 残响 / 帷录 / 源典`.
* Balance is calculated from ledger `pointsDelta`; do not introduce an independently authoritative mutable balance.
* Task completion writes a positive ledger delta. Reward receipt writes a negative delta and preserves the current affordability behavior.
* Ledger records retain title/icon/point history independently of later template edits. Template deletion is soft deletion; deleting a ledger record is a separate operation.
* Manual ordering and pinning are durable template data. Keep repeatable and one-time groups distinct.
* New activity icons use stable daily-life semantic IDs rendered as monochrome line icons; retain compatibility with legacy stored emoji values.
* Preserve the existing restrained archive/codex visual language and mobile-first behavior, including reachable bottom navigation, safe-area spacing, touch targets, and modal-sheet behavior.
* Keep PWA/offline behavior and the GitHub Pages `/veil-archive/` base path intact unless explicitly authorized to change them.

## Safety boundaries

* Do not modify browser IndexedDB/user data, delete historical material, or remove ignored/local/generated files merely for cleanup.
* Destructive in-app actions must remain explicitly confirmed, and full archive deletion must remain clearly irreversible.
* Stop for direction before changing persisted schema/data semantics, backup/restore policy, version/release policy, or unresolved product-policy behavior (including one-time rules, negative-balance semantics, or day-start meaning).
* Do not expand this personal tool into accounts, services, sync, telemetry, AI, payments, social features, or unrelated platform infrastructure.

## Repository commands

Run these from the repository root (`D:\CS\veil-archive`):

* `npm ci` installs the lockfile-resolved dependencies.
* `npm run dev` starts the Vite development server.
* `npm run build` runs `tsc -b` followed by the Vite production build and generates ignored `dist/` output.
* `npm run preview` serves the existing `dist/` production output.
* `npm test` runs the non-interactive Vitest 4.1.11 unit suite for `src/data/**/*.test.ts`.

Node.js 22 is the documented/CI runtime. There is currently no lint, standalone typecheck, browser automation, import/restore, or production-smoke script. For meaningful repository changes, keep [`docs/patch-log.md`](docs/patch-log.md) factually updated; its older verification entries remain historical.

Do not commit or push unless the user explicitly requests it.
