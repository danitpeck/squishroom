# Squishroom — Mini Design Doc (v0)

## Elevator Pitch
Squishroom is a tiny, single-screen platformer about guiding a squishy slime girl through tight rooms using tactile, playful movement. The joy comes from how she moves -- stretching, squashing, and slipping through cracks -- not from combat or complex systems.

---

## Core Goals
- Finishable scope: small game you can ship in days/weeks
- Movement-first fun: squish, bounce, drip feel good even with no art
- Fast iteration: levels authored as text grids (ASCII)
- Shareable early: playable in browser via GitHub Pages / itch.io

---

## Player Fantasy
You are a soft, resilient slime girl navigating hard, boxy spaces.  
Your body deforms to survive the world.

Key emotions:
- playful
- tactile
- a little silly
- cozy-challenging

---

## Core Mechanics (Locked)

### 1. Movement
- Left / Right
- Jump (variable height)
- Gravity-based physics

### 2. Slime Feel
- Squash & stretch on jump/land
- Soft idle wobble (later polish)

### 3. Special Ability (Phase 2)
Pick one to implement first:
- Drip Drop: press down in midair to fall straight down and slip through thin floors  
  (Wall slide can come later if the project grows, but drip is the slime identity move.)

---

## Level Format
- Single-screen rooms
- ASCII grid authored levels

Tile meanings:
- `#` = wall / solid
- `.` = empty
- `S` = spawn
- `E` = exit
- `~` = thin platform for drip (Phase 2)

Example:
```
##########
#..S.....#
#....##..#
#......E#
##########
```


---

## Hazards (Optional, Phase 2)
- Spikes
- Steam vents
- Acid puddles  
(No enemies, no combat.)

---

## Win / Lose Conditions

**Win:**
- Touch exit tile -> "Level Complete"

**Lose (Phase 2):**
- Touch hazard -> respawn at room start

---

## Scope Guardrails (Non-Goals)
Explicitly out of scope for Squishroom v1:

- No combat
- No inventory
- No dialogue
- No upgrades
- No bosses
- No overworld map
- No level editor UI
- No story systems

---

## Milestones

### Milestone 0 -- Alive (Done)
- Window opens
- Player moves & jumps
- Floor collision
- Squash/stretch on jump

### Milestone 1 -- Complete Loop (Done)
- Exit zone
- "Level Complete" state

### Milestone 2 -- First Room
- ASCII level loading
- One designed room
- Camera bounded to room

### Milestone 3 -- Slime Identity
- Drip Drop mechanic
- One room that requires drip

### Milestone 4 -- Ship v1
- 6 single-screen rooms
- Title screen
- Win screen
- Deployed on GitHub Pages / itch.io

---

## Art Direction (Low Pressure)
- Start with shapes + colors
- Slime girl: rounded rectangle / circle
- Tiles: simple blocks
- Exit: glowing/pulsing shape  
Sprites can replace shapes later without changing logic.

---

## Definition of "Done"
Squishroom v1 is done when:
- You can play from Room 1 -> Room 6
- The slime girl feels good to move
- You can share a link and someone can beat it in ~5--10 minutes

No perfection clause. Done means done.
