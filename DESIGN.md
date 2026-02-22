# Squishroom - Design Doc (v1.1)

## Elevator Pitch
Squishroom is a tiny, single-screen platformer about guiding a squishy slime girl through tight rooms using tactile, playful movement. The joy comes from how she moves - stretching, squashing, and slipping through cracks.

## Product Goals
- Keep scope shippable and small.
- Preserve movement-first feel.
- Keep levels authored as ASCII grids.
- Improve presentation without adding systemic bloat.

## Core Player Fantasy
You are soft and resilient in a hard world. Rooms are strict and geometric; your motion is playful and organic.

## Locked Mechanics
1. Horizontal movement + variable jump.
2. Drip drop (fast downward fall with pass-through behavior on thin platforms).
3. Wall slide + wall jump.
4. Hazards cause quick respawn.

## ASCII Room Authoring (Non-negotiable)
We will continue using ASCII as the source-of-truth level format.

Tile glyphs:
- `#` wall / solid
- `.` empty
- `S` spawn
- `E` exit
- `~` thin platform
- `^` spikes/hazard

## Scope Guardrails (Still in effect)
Out of scope unless explicitly re-scoped:
- No combat
- No inventory
- No dialogue tree systems
- No upgrade trees
- No bosses
- No overworld map
- No in-game level editor UI

## What changed since v1
- Wall slide is implemented and seam-related climbing issues are resolved.
- Test coverage includes parser, gameplay-rule modules, and integration checks.
- Render skin layer core is implemented (`src/renderSkin.ts`) with mode switching in `src/main.ts`.
- Visual treatment for walls, thin platforms, hazards, and exit tiles is implemented with decorative edge accents.
- Juice hooks are implemented for particles, SFX, and accessibility-aware screen shake.

## Delivery Status
- `Done`: baseline validation (tests/build), render-skin foundation, core tile visual pass, gameplay semantics preserved by parser/rule modules.
- `In Progress`: readability/contrast verification workflow and final juice balancing targets.
- `Next`: background/depth layer pass and post-visual content expansion/playtest documentation.

## Current Priority Theme
Render Skin core is complete. Priority now shifts to depth/background pass, polish closure, and content follow-up while preserving ASCII semantics.
