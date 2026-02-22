# Wall-Seam Climb Fix Plan (Handoff)

## Goal
Fix the bug where the player gets stopped at tile boundaries while climbing/sliding up walls, especially on stacked wall columns.

## Working hypothesis
The root issue is likely **physics seam collision**, not wall-slide state logic:

1. Walls are created as one static body per `#` tile.
2. Adjacent tile boundaries create many collision edges.
3. While ascending against a wall, tiny per-frame contact changes at seams cause snagging/stutter.
4. Existing wall-slide contact bridging helps state continuity but cannot remove collider seam geometry.

## Constraints
- Keep the current visual style and level glyph format unchanged (`#`, `S`, `E`, `~`, `^`).
- Minimize gameplay behavior changes beyond seam fixes.
- Preserve existing wall-slide controls (press into wall, jump off wall, opposite-direction release behavior).

---

## Implementation order (minimal risk)

### Step 1 — Add merged wall geometry support in level parsing
**Files:** `src/level.ts`, `tests/level.test.ts`

1. Extend level parsing output with a merged-wall primitive, e.g.:
   - `wallSegments: { x: number; y: number; width: number; height: number }[]`
2. Keep existing `walls` tile centers during transition for compatibility, then remove once usage is migrated.
3. Start with deterministic vertical-run merge by column:
   - Merge contiguous `#` tiles in same column into one segment.
   - This specifically targets wall-climb seam boundaries.
4. Add parser tests for:
   - Single long vertical column => one merged segment.
   - Two separated vertical runs => two segments.
   - Mixed map with isolated blocks still represented correctly.

**Acceptance for Step 1:**
- Tests assert merged segment count and dimensions are correct.
- No scene behavior changes yet.

---

### Step 2 — Switch physics wall construction to merged segments
**Files:** `src/main.ts`

1. In `loadLevel`, replace per-tile wall body creation with `wallSegments` creation.
2. For each segment, create one static rectangle body at merged center with merged width/height.
3. Keep wall color/style unchanged.
4. Remove legacy per-tile wall construction path once verified.

**Acceptance for Step 2:**
- Game loads every level without runtime errors.
- Physics debug shows fewer, larger wall bodies.
- Player can traverse previously problematic stacked-wall seams more smoothly.

---

### Step 3 — Reduce wall-slide inward push that amplifies seam jitter
**Files:** `src/main.ts`, optional `tests/gameplay/wallSlide.integration.test.ts`

1. Adjust wall-slide X lock behavior:
   - Replace constant `±20` inward push with `0` by default, OR
   - apply tiny conditional bias only on bridging frames if needed.
2. Keep wall-slide activation logic and jump-off logic unchanged.
3. Verify no regressions in control feel:
   - Still slides while holding into wall.
   - Still wall-jumps reliably.

**Acceptance for Step 3:**
- No reintroduced sticky behavior.
- No oscillation when hugging wall.

---

### Step 4 — Add regression tests focused on seam behavior
**Files:** `tests/level.test.ts`, `tests/gameplay/wallSlide.integration.test.ts` (or new dedicated test)

1. Parser-level regression:
   - Validate merged geometry on representative wall stacks.
2. Gameplay integration regression (logic-level where possible):
   - Simulate seam transition frames and ensure wall-slide continuity while ascending.
3. Keep tests deterministic and independent of real-time physics timing.

**Acceptance for Step 4:**
- New tests fail without seam fix and pass with fix.
- Existing gameplay tests remain green.

---

## Suggested commit sequence
1. `feat(level): add merged wall segment output + parser tests`
2. `feat(physics): build wall colliders from merged segments`
3. `tweak(wall-slide): reduce inward lock velocity at wall`
4. `test: add seam regression coverage`

This sequence makes rollback easy and isolates risk per commit.

---

## Manual QA checklist
- Test on level(s) with tall stacked walls (especially current failing case).
- Hold into wall and jump upward repeatedly across multiple tile boundaries.
- Confirm no pause/stick at seam lines.
- Confirm wall jump away works on both left and right walls.
- Confirm dripping, thin platforms, hazards, and exits still behave as before.

---

## Fallbacks if seam persists
1. Merge both vertical and horizontal contiguous blocks (full rectangle decomposition).
2. Add tiny coyote-like wall contact grace window (e.g., 40–60ms) only for upward movement.
3. Clamp/round player X while sliding to a stable offset from wall face.

Use these only if merged colliders + reduced inward push are insufficient.
