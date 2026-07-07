# AGENTS.md

## Project identity

The Veil Archive｜帷幕档案 is a mobile-first offline PWA for personal vow, reward, and ledger tracking.

The product language is intentionally ritualized:

* Task templates are 誓约.
* Reward templates are 异赐.
* Points are 残响.
* Ledger entries are 帷录.
* Settings and archive controls live in 源典.

This is a personal local-first application. It must remain small, self-contained, offline-capable, and easy to maintain.

## Development rules

1. Keep the project local-first.

    * Do not add accounts, backend services, cloud sync, analytics, payments, social features, or remote databases unless explicitly requested.

2. Preserve the current product identity.

    * Use the existing dark fantasy / archive / codex visual language.
    * Keep terminology consistent with README and existing UI copy.
    * Avoid generic SaaS wording, generic productivity app language, and unrelated gamification bloat.

3. Prefer small patches.

    * Make the smallest change that satisfies the request.
    * Do not refactor unrelated files.
    * Do not rename concepts unless the user explicitly asks.

4. Keep mobile-first behavior.

    * Primary use case is phone PWA usage.
    * Check bottom tab bar spacing, modal sheet behavior, touch targets, safe-area inset, and small-screen density after UI changes.

5. Preserve offline behavior.

    * Data must remain in browser IndexedDB.
    * PWA shell must keep working after first successful load.
    * Do not introduce network-only runtime dependencies.

6. Preserve historical ledger integrity.

    * Template edits must not rewrite old ledger snapshots unless explicitly requested.
    * Deleted templates should be soft-deleted when historical ledger records may still reference them.
    * Ledger balance is derived from records, not stored as independent mutable state.

7. Keep data mutations explicit and reversible where possible.

    * Destructive actions must remain confirmed.
    * Full data deletion must remain clearly marked as irreversible.
    * Backup/export should remain easy to access.

## Build / test commands

Use the following commands from the repository root:

```bash
npm ci
npm run dev
npm run build
npm run preview
```

Current scripts:

```bash
npm run dev      # start Vite dev server
npm run build    # TypeScript build check + Vite production build
npm run preview  # preview production build locally
```

## Phase development rules

For planned feature work:

1. Read this file first.
2. Read `docs/dev-plan.md`.
3. Read `docs/project-map.md`.
4. Implement only the requested phase or patch.
5. Run `npm run build`.
6. Update `docs/patch-log.md`.
7. If file responsibilities changed, update `docs/project-map.md`.

Do not start a later phase unless the user explicitly asks.

## Patch development rules

For small bugfixes or small feature additions:

1. Use the smallest relevant source files.
2. Avoid broad rewrites.
3. Keep current UI language and styling tokens.
4. Run `npm run build`.
5. Add one concise entry to `docs/patch-log.md`.

Patch handoff instruction:

Use frugal-dev-runner. Do not expand scope. Do not auto-commit unless explicitly requested.

## Asset handling rules

Current required assets are PWA icons under `public/icons/`.

Do not generate or invent new assets in code. If a new icon, image, sound, font, or sample file is required, document it first in the relevant plan or handoff and wait for the asset to be supplied.

When adding assets, prefer:

* Small file sizes.
* Stable filenames.
* Paths under `public/` for static PWA assets.
* No large uncompressed media.

## Verification policy

Minimum verification for any code change:

```bash
npm run build
```

For PWA or deployment changes, also verify:

```bash
npm run preview
```

Manual verification should cover:

* Initial app load.
* Bottom tab navigation.
* Create / edit / delete 誓约.
* Create / edit / delete 异赐.
* Fulfill 誓约.
* Receive 异赐.
* Backfill 帷录.
* Edit and delete 帷录.
* CSV export.
* Theme switching.
* Day-start setting.
* PWA install behavior if manifest or service worker config changed.

## Commit policy

Use concise conventional commits when commits are requested:

* `feat: ...`
* `fix: ...`
* `refactor: ...`
* `docs: ...`
* `style: ...`
* `chore: ...`

Do not commit automatically unless the user explicitly requests it.

## Output format

When reporting work back to the user, include:

1. What changed.
2. Files changed.
3. Verification result.
4. Any known limitation or follow-up.
5. Suggested patch-log entry if not already written.
