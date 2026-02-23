# Squishroom

## Project Overview
Squishroom is a tiny, single-screen platformer about squishy movement in tight rooms. The project keeps movement mechanics fixed while iterating on readability, feel polish, and short-form content.

### Visual Identity
- Player Base: `#B58CFF`
- Player Highlight: `#F2C9FF`
- Player Shadow: `#6D4CC2`
- Player Eyes: `#2B1B4A`

## Current State
- Core render-skin work is implemented (tile skinning, high-contrast palette, background/depth layers, deterministic decals, parallax).
- Juice systems are implemented (particles, screen shake toggle, SFX hooks) and are now in polish-tuning closure.
- Accessibility/settings work is active: title + in-game settings surface with persistence for shake, contrast, and SFX volume.
- v1.3 content system is active: campaign selection (`Core Run`, `Mastery Pack`, `Stats`), 12-room mastery ladder, per-room medals, and local run stats.
- Phase 3/4 polish closure remains active in parallel with content tuning.

## Quick Start
- Install deps: `npm install`
- Run locally: `npm run dev`
- Build: `npm run build`

## Controls
- Move: `A/D` or `Left/Right Arrow`
- Jump: `Space` or `Up Arrow`
- Drip drop: `S` or `Down Arrow`
- Title mode select: `Left/Right Arrow`
- Confirm title mode: `Space` or `Enter`
- Title settings: `T` shake, `C` contrast, `[` volume down, `]` volume up
- In-game settings panel: `Esc` (open/close), then `T` shake, `C` contrast, `[` and `]` volume
- Mastery clear panel: `N`/`Enter`/`Space` next, `R` retry, `B` back to title
- Stats screen return: `B`/`Esc`/`Enter`/`Space`
- Physics debug: `F1`

## Runtime Flags
- Skin mode: `?skin=classic|skinned`
- Contrast mode: `?contrast=high`

Example:
- `http://localhost:5173/?skin=classic&contrast=high`

## Testing/Build
- Test suite: `npm run test`
- Watch tests: `npm run test:watch`
- Production build check: `npm run build`

Current validation snapshot (February 23, 2026):
- `npm run test`: 20 files passed, 224 tests passed.
- `npm run build`: TypeScript + Vite build succeeded.

## Agent Improvement Loop
- Read process rules in `.vscode/AGENT.md` before substantial work.
- Review active lessons in `tasks/lessons.md` at session start and before finalizing complex changes.
- Add a new lesson entry after user corrections, reverted fixes, or repeated bug patterns.
- When project state claims change, update status docs (`README.md`, `DEVELOPMENT.md`, `EXECUTION_ORDER.md`, `ROADMAP.md`) in the same cycle.

## Docs Map
- `DESIGN.md`: product intent, locked mechanics, scope guardrails, current status.
- `ROADMAP.md`: active tracks, immediate milestones, release framing.
- `EXECUTION_ORDER.md`: implementation phasing and validation checklist.
- `DEVELOPMENT.md`: contributor workflow, priorities, acceptance criteria.
- `.vscode/AGENT.md`: agent operating rules, verification contract, and project non-negotiables.
- `tasks/lessons.md`: active lessons log and recurrence-prevention patterns.
