# Development

## Workflow
- Run tests before pushing: `npm run test`.
- Verify build output: `npm run build`.
- Add or update tests for any behavior change.
- Keep gameplay rules in testable modules under `src/gameplay` when possible.

## Commands
- `npm run dev` for local development.
- `npm run build` to verify production output.
- `npm run test` for CI-style test runs.
- `npm run test:watch` during active changes.

## Current priorities
1. Background/depth pass (non-colliding layers, parallax, deterministic decals).
2. Juice balance finalization (particles/shake/SFX targets and acceptance thresholds).
3. Content expansion plus short playtest loop and documentation.

## Progress Reporting Convention
- Use `Done / In Progress / Next` labels in planning docs.
- Every `Done` claim should reference evidence (module, test file, or command result) where possible.
- Use conservative status updates: mark `Done` only when implementation and validation are both present.
- Update planning docs after each phase completion or significant milestone.

Reference docs:
- `DESIGN.md`
- `ROADMAP.md`
- `EXECUTION_ORDER.md`

## Test Coverage Focus
- Keep parser tests strong in `tests/level.test.ts`.
- Keep pure gameplay-rule tests in `tests/gameplay/*.test.ts`.
- Keep at least one integration-style check for scene-level behavior.

## Definition of Done
- Tests pass.
- Build passes.
- Changed behavior has regression coverage.
- No undocumented gameplay semantic changes to ASCII glyphs.
- Status docs are updated for completed phases.
