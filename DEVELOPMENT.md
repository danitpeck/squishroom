# Development

## Workflow
- Run tests before pushing: `npm run test`.
- Add or update tests for any new behavior.
- Keep tests small and fast; prefer pure logic in `src` that is easy to verify.

## Commands
- `npm run dev` for local development.
- `npm run build` to verify production output.
- `npm run test` for CI-style test runs.
- `npm run test:watch` during active changes.

## Test Coverage Review (Current)
- Baseline status: `3` test files, `32` tests, all passing.
- Reliable coverage area: `src/level.ts` (`parseLevel`) has direct behavior tests.
- Weak coverage area: gameplay tests in `tests/gameRules.test.ts` and `tests/animations.test.ts` mostly validate hardcoded constants, not live game logic in `src/main.ts`.
- Biggest risk: core runtime behavior (movement, drip-through, thin platform filtering, particle triggers, collision body alignment, win progression) is effectively untested.

## Testing Plan (Agent Handoff)

### Goals
1. Keep fast unit tests for pure logic.
2. Move gameplay rules out of scene internals into testable pure helpers.
3. Add integration checks for scene-level behavior without brittle rendering assertions.
4. Enforce minimum quality gates on every gameplay change.

### Phase 1: Immediate (Now)
1. Keep `tests/level.test.ts` and expand edge cases:
	- inconsistent row lengths
	- unknown glyph handling
	- multiple spawn/exit markers (document intended winner)
2. Replace constant-only tests with behavior-driven tests:
	- remove or rewrite low-value cases in `tests/gameRules.test.ts` and `tests/animations.test.ts`
	- every test should call a function under `src/` and assert output/state transitions
3. Extract pure helpers from `src/main.ts` (no Phaser scene dependency), such as:
	- thin platform process decision
	- drip state transitions
	- trail emission timing policy

### Phase 2: Short Term (Next 1-2 sessions)
1. Create `src/gameplay/` module for pure rules.
2. Add unit tests for each helper:
	- platform pass-through matrix (dripping, from above, moving up/down)
	- jump/drip input transition logic
	- particle emission throttling logic
3. Add one integration-style scene smoke test suite:
	- scene can create without exception
	- level loads and spawn position is valid
	- collider process callback returns expected values for representative bodies

### Phase 3: Ongoing Policy
For each gameplay PR:
1. Add or update tests for changed behavior before merge.
2. Run full gate locally:
	- `npm run test`
	- `npm run build`
3. If bugfix: include a regression test that fails before fix and passes after.
4. Prefer adding logic to pure helpers first, then call from scene.

## Agent Execution Checklist
Use this exact flow when assigning to another coding agent.

1. **Audit step**
	- list current tests and map each to source behavior it actually validates
	- identify tests that only assert constants and mark for rewrite
2. **Refactor step**
	- extract one gameplay rule at a time from `src/main.ts` into `src/gameplay/*.ts`
	- keep behavior identical; no UX changes during extraction
3. **Test step**
	- write focused unit tests for extracted rule
	- include at least one edge case and one regression case
4. **Validation step**
	- run `npm run test` and `npm run build`
	- report: files changed, tests added, risk notes

## Definition of Done (Testing)
- New gameplay behavior ships with tests tied to executable logic (not constants).
- Existing bugfixes include regression tests.
- All tests pass and production build passes.
- No untested gameplay-critical branch introduced in `src/main.ts`.
