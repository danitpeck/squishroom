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
1. Render Skin Layer foundation and tile skin mapping.
2. Presentation polish (particles, shake/accessibility, SFX tuning).
3. Short content expansion after visual baseline is complete.

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
