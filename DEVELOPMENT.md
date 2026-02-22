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
1. Accessibility/options UI + persistence closure (shake, contrast, SFX volume).
2. Measurable juice balancing closure (SFX cadence/mix + shake targets).
3. Readability validation checklist completion (normal + high-contrast).
4. Content expansion plus short playtest loop and documentation.

## Polish Acceptance Targets
- Shake intensity bounds: keep shake triggers within current gameplay range (`0.0006`-`0.009`) and never shake when disabled.
- SFX volume controls: default `70%`, adjustable `0-100%`, and persisted across reload.
- Readability pass: every room reviewed in normal and high-contrast modes with pass/fail notes.

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
