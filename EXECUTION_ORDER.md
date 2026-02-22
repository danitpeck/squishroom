# Execution Order - Render Skin Layer First

This is the practical implementation order for the current cycle, now tracked with explicit progress status.

## Progress Snapshot
- Assessment date: February 22, 2026
- Validation status: `npm run test` and `npm run build` are green.
- Latest run result: `npm run test` -> 16 files passed, 203 tests passed.
- Latest run result: `npm run build` -> TypeScript + Vite build completed successfully.
- Legend: `Done` = completed and validated, `In Progress` = functional but not finalized, `Next` = not yet implemented.

## Phase 0 - Baseline and Safety (0.5 day)
- Status: `Done` (baseline) + `Next` (visual reference capture)
1. Freeze gameplay behavior with current tests. (`Done`)
2. Add/confirm assertions around tile semantics and collision sizing. (`Done`)
3. Capture before/after visual references for existing rooms. (`Next`)
- Done criteria met: tests and build are passing; parser/gameplay coverage is in place.
- Remaining completion criteria: archive before/after room captures for documentation.

## Phase 1 - Render Skin Layer Foundation (1-2 days)
- Status: `Done`
1. Tile-to-visual mapping module created (`src/renderSkin.ts`).
2. Physics still reads parsed level semantics (`src/level.ts`, gameplay rule modules).
3. Feature/config switch exists via query params (`?skin=classic|skinned`, `?contrast=high`).
- Done criteria met: same collision semantics with safer visual iteration controls.

## Phase 2 - Wall/Platform/Hazard Visual Pass (1-2 days)
- Status: `Done`
1. Skinned variants applied for `#`, `~`, `^`.
2. Edge treatment added for room-shape readability (`createDecorativeEdge`).
3. Contrast mode support added (`high-contrast` palette).
- Done criteria met: no intended gameplay delta and stronger visual legibility.

## Phase 3 - Background and Depth Pass (1 day)
- Status: `In Progress`
1. Add non-colliding background layers and simple parallax. (`Done`)
2. Add room-safe decorative decals with deterministic placement. (`Done`)
3. Keep visuals low-noise for gameplay clarity. (`In Progress`)
- Remaining completion criteria: complete manual readability validation across all rooms and tune depth intensity if needed.

## Phase 4 - Juice Integration (1 day)
- Status: `In Progress`
1. Jump/land/drip/hazard particles are implemented.
2. Camera shake accessibility toggle and persistence are implemented.
3. SFX event hooks are implemented.
- Remaining completion criteria: finalize balancing targets for intensity, cadence, and mix levels; add explicit tuning checklist.

## Phase 5 - Content Follow-up (1-2 days)
- Status: `Next`
1. Add 3-6 readability-focused rooms using the current mechanic set.
2. Keep mechanics stable; avoid adding major new abilities.
3. Run short playtest loop and document frustration trims.
- Remaining completion criteria: room additions plus playtest notes/results committed to docs.

## Validation Checklist (every phase)
- `npm run test`
- `npm run build`
- Manual run through all existing rooms
- Verify ASCII level files are unchanged in semantics
- Update status docs after each phase checkpoint
