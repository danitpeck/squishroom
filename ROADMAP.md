# Squishroom Roadmap (Post-v1)

## Guiding Principle
Do not replace the roadmap; extend it. The game is already fun and playable, so we focus on polish, readability, and content density.

## Roadmap Status
- Track A - Presentation + Accessibility (Primary): `In Progress`
- Track B - Gameplay Feel (Secondary): `In Progress`
- Track C - Content (After polish closure): `Next`

## Track A - Presentation + Accessibility (Primary)
### Render Skin Layer (priority)
- [Done] Add a rendering abstraction that maps ASCII tiles to richer visual treatment.
- [Done] Keep collision/logic driven by existing glyph semantics.
- [Done] Introduce optional decorative layers (background/parallax/decals) that do not affect gameplay.
- [In Progress] Add palette/config knobs for accessibility and readability (high-contrast exists; checklist validation still pending).
- [In Progress] Accessibility/settings UX surface (title + in-game panel) with persisted shake, contrast, and SFX volume; final ergonomics pass pending.

### Juice Pass
- [Done] Particle hooks for jump, land, drip, and hazard events.
- [Done] Screen shake with accessibility toggle and persisted default.
- [In Progress] SFX balancing and consistent event cadence tuning.

## Track B - Gameplay Feel (Secondary)
- [In Progress] Movement tuning pass after visual upgrades (mechanics stable, final polish pass still pending).
- [Done] Regression checks for thin platform behavior, drip timing, wall interaction.
- [Next] Minor room adjustments only where readability/mechanics demand.

## Track C - Content (After polish closure)
- [Next] Add 3-6 additional single-screen rooms using existing mechanics.
- [Next] Create one compact skill-check sequence of 2-3 rooms for endgame flow.
- [Next] Keep total game length intentionally short and replayable.

## Immediate Next Milestones
1. Finish room-by-room readability and contrast checklist (normal + high-contrast).
2. Ship options/settings closure with persisted shake, contrast, and SFX volume behavior validated.
3. Finalize measurable juice targets (shake intensity bands, SFX loudness/cadence thresholds).
4. Start content expansion rooms and playtest logging.

## Not planned (unless roadmap changes)
- Combat systems
- Progression/meta unlock loops
- Narrative expansion systems

## Release framing
- v1.1: Render Skin Layer + accessibility/juice polish closure (`In Progress`).
- v1.2: Content extension with no major new mechanics (`Next`).
