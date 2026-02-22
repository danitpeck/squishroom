# Squishroom Roadmap (Post-v1)

## Guiding Principle
Do not replace the roadmap; extend it. The game is already fun and playable, so we focus on polish, readability, and content density.

## Track A — Presentation (Primary)
### Render Skin Layer (priority)
- Add a rendering abstraction that maps ASCII tiles to richer visual treatment.
- Keep collision/logic driven by existing glyph semantics.
- Introduce optional decorative layers (background/parallax/decals) that do not affect gameplay.
- Add palette/config knobs for accessibility and readability.

### Juice Pass
- Particle tuning for jump, land, drip, and hazard events.
- Screen shake with accessibility toggle and sane defaults.
- SFX balancing and consistent event triggering.

## Track B — Gameplay Feel (Secondary)
- Movement tuning pass after visual upgrades (ensure readability and feel remain aligned).
- Regression checks for thin platform behavior, drip timing, wall interaction.
- Minor room adjustments only where readability/mechanics demand.

## Track C — Content (After visual base)
- Add 3-6 additional single-screen rooms using existing mechanics.
- Create one compact “skill-check sequence” of 2-3 rooms for endgame flow.
- Keep total game length intentionally short and replayable.

## Not planned (unless roadmap changes)
- Combat systems
- Progression/meta unlock loops
- Narrative expansion systems

## Release framing
- **v1.1:** Render Skin Layer + polish pass.
- **v1.2:** Content extension with no major new mechanics.
