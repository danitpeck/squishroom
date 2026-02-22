# Execution Order — Render Skin Layer First

This is the practical implementation order for the next cycle.

## Phase 0 — Baseline & Safety (0.5 day)
1. Freeze gameplay behavior with current tests.
2. Add/confirm snapshot-like assertions around tile semantics and collision sizing.
3. Capture before/after visual references for the existing rooms.

## Phase 1 — Render Skin Layer Foundation (1-2 days)
1. Create a tile-to-visual mapping module (ASCII glyph -> render prefab/style).
2. Ensure physics still reads from parsed level data exactly as before.
3. Add a feature flag/config switch so visual skin can be iterated safely.

**Exit criteria:** same collisions, same spawn/exit/hazard behavior, improved visual flexibility.

## Phase 2 — Wall/Platform/Hazard Visual Pass (1-2 days)
1. Replace flat tile blocks with skinned variants for `#`, `~`, `^`.
2. Add subtle edge treatment so room shapes are easier to read.
3. Validate contrast against player sprite in all shipped rooms.

**Exit criteria:** no gameplay delta; rooms are more legible at a glance.

## Phase 3 — Background & Depth Pass (1 day)
1. Add non-colliding background layer(s) and simple parallax.
2. Add room-safe decorative decals with deterministic placement.
3. Keep visuals low-noise to preserve gameplay clarity.

**Exit criteria:** rooms feel alive without obscuring hazards/platforms.

## Phase 4 — Juice Integration (1 day)
1. Tune particles for jump/land/drip/hazard.
2. Add camera shake intensity setting with accessibility defaults.
3. Balance SFX levels and cadence.

**Exit criteria:** movement feels more tactile; accessibility settings remain respected.

## Phase 5 — Content Follow-up (1-2 days)
1. Add 3-6 rooms built for readability with new visual skin.
2. Keep mechanics set stable; no major new abilities in this phase.
3. Perform short playtest loop and trim frustration points.

## Validation Checklist (every phase)
- `npm run test`
- `npm run build`
- Manual run through all existing rooms
- Verify ASCII level files are unchanged in semantics
