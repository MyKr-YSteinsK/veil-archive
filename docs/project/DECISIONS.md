# DECISIONS — The Veil Archive｜帷幕档案

This file records accepted durable product and architecture decisions. It is not a changelog. Current implementation facts and unresolved questions belong in [`CURRENT_STATE.md`](CURRENT_STATE.md).

## D-001 — Ledger-derived balance

**Decision:** Balance is derived by summing ledger `pointsDelta`; it is not stored as an independently mutable authoritative total.

**Rationale:** The ledger remains the source of truth, so editing, deleting, or backfilling a record deterministically recalculates the balance.

**Consequence:** Any historical record mutation can change the current balance. Reconsider only as part of an intentional ledger architecture redesign.

**Current owner:** `src/data/calculations.ts`, with ledger persistence in `src/data/services.ts`.

## D-002 — Preserve historical snapshots

**Decision:** Ledger entries retain their historical title, icon, and point information independently of later template edits.

**Rationale:** Changing a template must not rewrite what was recorded in the past.

**Consequence:** Template edits affect future actions only; old ledger snapshots must remain stable.

**Current owner:** `LedgerRecord` in `src/data/types.ts` and ledger writes in `src/data/services.ts`.

## D-003 — Soft-delete templates

**Decision:** Deleting a task or reward template is soft deletion and is distinct from deleting ledger history.

**Rationale:** Historical records may still reference a removed template and must retain their meaning.

**Consequence:** Active lists hide deleted templates while historical/export views can retain their metadata.

**Current owner:** template services in `src/data/services.ts`.

## D-004 — Local-first architecture

**Decision:** Keep persistent user data on the current browser/device and keep the app usable offline after successful initial loading.

**Rationale:** This is a personal, privacy-friendly, low-maintenance tool that should not require account or backend operations.

**Consequence:** Browser/site-data clearing is a material data-loss risk, so export/recovery quality matters. Multi-device sync or cloud recovery requires an explicit future decision.

**Current owner:** `src/data/database.ts` and the PWA configuration in `vite.config.ts`.

## D-005 — Code-owned displayed application version

**Decision:** The displayed 密典版本 is controlled by application code, not by a stale value persisted in IndexedDB settings.

**Rationale:** Existing settings must not keep showing an obsolete version after an app update.

**Consequence:** `APP_VERSION` and the runtime changelog drive the display; settings are refreshed to that code-owned value. This does not resolve the separate package/tag/build identity question.

**Current owner:** `src/data/changelog.ts` and `settingsService` in `src/data/services.ts`.

## D-006 — Separate user changelog from developer history

**Decision:** Keep the in-app changelog/version history separate from `docs/patch-log.md`.

**Rationale:** Users need a concise account of application changes, while developers need repository maintenance history and verification notes.

**Consequence:** Meaningful user-visible releases may update both artifacts for their different audiences; neither replaces the other.

**Current owners:** `src/data/changelog.ts` for the user-facing log and `docs/patch-log.md` for developer history.

## D-007 — Daily-life monochrome semantic icon IDs

**Decision:** New activity icon values use stable practical semantic IDs rendered as monochrome line icons rather than colored emoji or fantasy-primary symbols.

**Rationale:** Emoji are device-dependent and visually inconsistent; practical semantics describe real task/reward behavior while fitting the archive shell.

**Consequence:** Persistence stores semantic IDs, rendering maps them to icon components, and legacy emoji values remain readable through compatibility mapping.

**Current owner:** `src/components/ui/iconRegistry.tsx` and the template/ledger renderers.

## D-008 — Shared structure without erasing domain rules

**Decision:** Share genuinely common vow/giving page structure, loading, forms, cards, and feedback, while keeping domain rules explicit in thin page adapters.

**Rationale:** The surfaces share presentation but differ in positive vs negative deltas, affordability, and completion/receipt semantics. A universal opaque component would hide those rules.

**Consequence:** Shared primitives may evolve independently of explicit `VowsPage` and `GivingsPage` domain handlers.

**Current owner:** `src/hooks/`, `src/components/templates/`, `src/components/VowsPage.tsx`, and `src/components/GivingsPage.tsx`.

## D-009 — Manual ordering and pinning are durable user data

**Decision:** Users may manually order and pin templates; repeatable/one-time and pinned/unpinned groups retain separate ordering boundaries.

**Rationale:** Frequently used actions need user-controlled placement instead of relying only on automatic sorting.

**Consequence:** `sortOrder` and `pinned` survive reloads and are part of future backup/recovery considerations. The current implementation uses a dedicated drag handle; whether that interaction is a permanent product policy remains a pending USER CHECK.

**Current owner:** `src/data/templateOrdering.ts`, template services, and `TemplateReorderGroup.tsx`.

## D-010 — Preserve the small four-surface product

**Decision:** The product remains a personal, compact tool with stable 誓约 / 异赐 / 帷录 / 源典 concepts and a restrained mobile archive presentation.

**Rationale:** Missing enterprise or social systems are intentional product boundaries, not automatically unfinished work.

**Consequence:** New scope must be justified against data safety, ledger correctness, mobile quality, and maintenance cost before feature breadth.
