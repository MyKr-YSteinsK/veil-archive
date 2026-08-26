# PROJECT_BRIEF — The Veil Archive｜帷幕档案

This is the canonical durable product brief. Mutable implementation facts belong in [`CURRENT_STATE.md`](CURRENT_STATE.md); detailed module ownership belongs in [`../project-map.md`](../project-map.md).

## Identity and purpose

The Veil Archive is a small personal tool for a low-friction self-incentive loop on a phone. The user defines 誓约, fulfills them to gain 残响, defines 异赐, spends 残响 to receive them, and keeps the resulting history in 帷录. 源典 contains settings, archive-oriented views, export, version information, and destructive controls.

The archive/codex terminology and restrained dark-fantasy visual shell are product identity, not a request for arbitrary fantasy symbolism. Activity semantics should remain practical and recognizable.

## Durable boundaries

* Personal, local-first, offline-capable after a successful initial load; persistent data stays in browser/device IndexedDB.
* Mobile browser and installed phone PWA are primary; desktop browser is secondary.
* The four product surfaces are 誓约, 异赐, 帷录, and 源典.
* Ledger history and its derived balance are the behavioral core. Historical meaning must survive template lifecycle changes.
* Keep the system small and low-maintenance. Accounts, backend services, cloud sync, analytics/telemetry, AI, payments, social features, and enterprise-style expansion are non-goals unless explicitly reopened.

## Core priorities

1. Data safety and historical ledger correctness.
2. Fast, usable mobile interaction.
3. Maintainability and predictable local behavior.
4. Restrained visual polish within the existing archive/codex language.
5. Additional features only after the above are secure.

## Owner map

* Durable decisions and rationale: [`DECISIONS.md`](DECISIONS.md).
* Current repository, capability, delivery, risk, and verification state: [`CURRENT_STATE.md`](CURRENT_STATE.md).
* Detailed architecture and change locations: [`../project-map.md`](../project-map.md).
* User/developer setup entry: [`../../README.md`](../../README.md).
* Runtime/domain contracts: the relevant files under [`../../src/`](../../src/).
