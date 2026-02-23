# Squishroom Roadmap (Post-v1)

## Guiding Principle
Do not replace the roadmap; extend it. The game is already fun and playable, so we focus on polish, readability, and content density.

## Roadmap Status
- Track A - Presentation + Accessibility (Primary): `In Progress`
- Track B - Gameplay Feel (Secondary): `In Progress`
- Track C - Content (Mastery Expansion): `In Progress`

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

## Track C - Content (Mastery Expansion)
- [Done] Add campaign selection flow (`Core Run`, `Mastery Pack`, `Stats`) at title.
- [Done] Ship `Mastery Pack` room set with 12 rooms (`M1-01` through `M3-04`).
- [Done] Add per-room medal targets (Bronze/Silver/Gold) and local best-run persistence.
- [In Progress] Tune room readability/friction and medal thresholds (`±10%` max adjustment budget).
- [Next] Add playtest-derived room revisions and lock final targets.

## Immediate Next Milestones
1. Finish full readability + contrast pass for all 12 mastery rooms.
2. Tune medal thresholds and clear outliers before target lock.
3. Finalize measurable juice targets (shake intensity bands, SFX loudness/cadence thresholds).
4. Run structured playtest loop and capture room-by-room revisions.

## Not planned (unless roadmap changes)
- Combat systems
- Progression/meta unlock loops
- Narrative expansion systems

## Release framing
- v1.1: Render Skin Layer + accessibility/juice polish closure (`In Progress`).
- v1.2: Content extension with no major new mechanics (`Done`).
- v1.3: Mastery campaign + stats/medals system (`In Progress`).
