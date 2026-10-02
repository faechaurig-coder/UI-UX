# Kitty Project — Preproduction Source of Truth

**Working codename:** Kitty Crush / Kitty Rescue  
**Status:** PREPRODUCTION — MODIFY  
**Branch purpose:** isolated strategy/design documentation only. No production project has been overwritten.

This folder is the current source of truth for the reinvention of the cat-rescue game.

## Decision

We are **not** building a generic match-3 with cats as rewards.

The target product is:

> **Find them → help them → earn their trust → rescue them → bring them home → live with them → miss them → return.**

The puzzle is a delivery mechanism for the fantasy. The cat is the product.

## North-star hypothesis

> **Can a player fall in love with one digital cat within the first 10–15 minutes and genuinely want to come back to see it again?**

If Mochi does not work, mass-producing levels, cats, rooms, events or monetization is prohibited.

## Documents

- `MASTER_EXECUTION_PLAN.md` — strategic audit, full phased roadmap, vertical slice and GO criteria.
- `PRODUCT_BIBLE.md` — product fantasy, emotional loop, Mochi, home, collections, monetization and design principles.
- `TECHNICAL_FOUNDATION.md` — candidate technical base, what can be reused, rejected or rebuilt.

## Current technical reality

There is currently **no dedicated Kitty repository** in the connected GitHub account. Therefore this branch is a temporary preproduction home only.

Two open-source references were reviewed:

1. `immane/match3-pets` — Godot 4.6 .NET / C#, MIT. Useful match-3 architecture and tests; product direction must be heavily modified.
2. `iuhoay/cat-run` — browser virtual-pet room prototype. Useful as a behavior/room reference; punitive need-decay is not aligned with our target.

A dedicated Kitty repository should be created when implementation begins. These documents should then move there unchanged as the initial design/decision baseline.

## Non-negotiables

- 1 room before 10 rooms.
- 1 unforgettable cat before 8 cats.
- 4 collection territories before feature sprawl.
- Monetize identity and expression before frustration.
- No punitive Tamagotchi loop.
- No gacha as the emotional center.
- No 500-level production run before attachment validation.
- Premium-casual quality target, not “prototype-looking but functional”.
