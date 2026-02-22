# Squishroom Roadmap (Post-v1)

## Guiding Principle
Do not replace the roadmap; extend it. The game is already fun and playable, so we focus on polish, readability, and content density.

## Roadmap Status
- Track A - Presentation (Primary): `In Progress`
- Track B - Gameplay Feel (Secondary): `In Progress`
- Track C - Content (After visual base): `Next`

## Track A - Presentation (Primary)
### Render Skin Layer (priority)
- [Done] Add a rendering abstraction that maps ASCII tiles to richer visual treatment.
- [Done] Keep collision/logic driven by existing glyph semantics.
- [Next] Introduce optional decorative layers (background/parallax/decals) that do not affect gameplay.
- [In Progress] Add palette/config knobs for accessibility and readability (high-contrast exists; validation checklist still pending).

### Juice Pass
- [Done] Particle hooks for jump, land, drip, and hazard events.
- [Done] Screen shake with accessibility toggle and persisted default.
- [In Progress] SFX balancing and consistent event cadence tuning.

## Track B - Gameplay Feel (Secondary)
- [In Progress] Movement tuning pass after visual upgrades (mechanics stable, final polish pass still pending).
- [Done] Regression checks for thin platform behavior, drip timing, wall interaction.
- [Next] Minor room adjustments only where readability/mechanics demand.

## Track C - Content (After visual base)
- [Next] Add 3-6 additional single-screen rooms using existing mechanics.
- [Next] Create one compact skill-check sequence of 2-3 rooms for endgame flow.
- [Next] Keep total game length intentionally short and replayable.

## Immediate Next Milestones
1. Implement non-colliding background/depth layer with parallax and deterministic decal placement.
2. Complete juice balancing pass with explicit targets (shake intensity bands, SFX loudness/cadence).
3. Add content expansion rooms (3-6) and log playtest observations in project docs.
4. Add room-by-room readability and contrast verification checklist.

## Not planned (unless roadmap changes)
- Combat systems
- Progression/meta unlock loops
- Narrative expansion systems

## Release framing
- v1.1: Render Skin Layer + polish pass (`In Progress`).
- v1.2: Content extension with no major new mechanics (`Next`).
