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
- Spikes (implemented)
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
- Soft idle wobble

### 3. Special Ability
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
- `~` = thin platform for drip
- `^` = spikes

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
- Spikes (implemented)
- Steam vents
- Acid puddles  
(No enemies, no combat.)

---

## Win / Lose Conditions

**Win:**
- Touch exit tile -> advance to next room; final exit shows win screen

**Lose:**
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

### Milestone 2 -- First Room (Done)
- ASCII level loading
- One designed room
- Camera bounded to room

### Milestone 3 -- Slime Identity (Done)
- Drip Drop mechanic
- One room that requires drip

### Milestone 4 -- Ship v1 (In Progress)
- 6 single-screen rooms (Done)
- Title screen (Done)
- Win screen (Done)
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

## Controls & Feel (Locked v0)

### Controls
- Left / Right: Arrow keys or A / D
- Jump: Up arrow or Space
- Drip Drop: Down arrow or S while in midair

### Movement Feel Targets
These are qualitative targets to guide tuning:

- Jump: floaty but responsive (player can short-hop or full-jump)
- Air control: moderate (can adjust trajectory midair, but not hover)
- Fall speed: slightly faster than rise (snappy landings feel good)
- Landing: visible squash on impact
- Idle: subtle wobble so the slime feels alive

### Non-Goals for Feel
- No momentum-heavy ice physics
- No precision Kaizo-level difficulty
- No pixel-perfect platforming requirements

### Tuning Guardrails
- Prefer “feels good” over “realistic physics”
- If tuning gets stuck for more than 10 minutes, lock values and move on

## Camera & Room Boundaries (Locked v0)

- Each level is a single fixed screen.
- Camera does not scroll.
- Player is constrained to the room bounds.
- Rooms are small enough to be readable at a glance.
- No off-screen hazards in v1.

## Art Direction

### Player Palette (Locked v0)
- Base: #B58CFF
- Highlight: #F2C9FF
- Shadow: #6D4CC2
- Eyes: #2B1B4A
