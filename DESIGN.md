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

### Milestone 4 -- Ship v1 (Done)
- 6 single-screen rooms (Done)
- Title screen (Done)
- Win screen (Done)
- Deployed on GitHub Pages (Done)

### Milestone 5 -- Slime Identity Polish (Next)
- Particle effects: goo drip trails
- Wall slide mechanic
- Screen shake + accessibility toggle
- SFX integration
- Scale/visibility tuning

---

## Milestone 5: Detailed Specs

### Feature A: Particle Effects (Goo Drips)

**Visual Purpose:** Make movement feel tactile and "slimy" — she leaves little goo trails as she moves.

**Particles Needed:**
1. **Jump Puff** — small burst on takeoff
   - Color: player base color (#B58CFF)
   - Count: 4-6 particles
   - Lifetime: 0.3s
   - Spread: 360° radial
   - Velocity: small upward/outward

2. **Land Splat** — bigger burst on ground impact
   - Color: player base color (#B58CFF)
   - Count: 8-10 particles
   - Lifetime: 0.4s
   - Direction: downward splash
   - Squish visual (fall toward ground plane)

3. **Drip Trail** — continuous during drip drop
   - Color: player base (#B58CFF)
   - Spawn rate: every 2-3 frames while dripping
   - Lifetime: 0.5s
   - Velocity: inherit fall speed, slight sideways drift
   - Size: tiny (3-5px)

4. **Spike Splat** — on hazard contact
   - Color: player base (#B58CFF)
   - Count: 12 particles (violent)
   - Lifetime: 0.5s
   - Direction: explosive outward
   - Also triggers respawn, so particles should feel "dispersal"

**Design Decision:** Start with player base color (#B58CFF) for all particles. Adjust tone/darkness in testing based on visual feedback.

---

### Feature B: Wall Slide Mechanic

**Concept:** When pressing toward a wall while in air, player sticks to it and falls slowly. Reinforces "sticky slime girl" identity.

**Mechanics:**
- Player must be airborne (not on ground)
- Player must be touching a wall (left or right collision)
- Player must be pressing toward that wall (left key + left wall, OR right key + right wall)
- When sliding: gravity reduced by 50% (slow fall speed)
- **No horizontal input while sliding** (locked to wall, can't steer left/right)
- Jump off: press opposite direction OR Space → releases upward with normal jump velocity

**Design Decision:** Locked horizontal movement keeps wall slide simple and "sticky" feeling — she's *stuck* to the wall until she actively jumps away or presses opposite. This reinforces slime adhesion.

**Animation State:**
- Add new animation: `wallSlide` (can reuse jump frame or create a new "stuck" frame)
- State machine: detect `wallSlide` condition and prioritize over other states

**Frame:**
- New sprite frame (optional): thin version of player pressed against wall
- Placeholder: same as jump frame for now

**Input for Testing:**
```
- Jump to wall
- Press toward wall → slides down (slow)
- Press away OR Space → releases upward
```

**Level Design Gate:**
- Design 1 test room: requires wall slide to reach exit
- Simple example: two tall walls with exit between them

---

### Feature C: Screen Shake + Accessibility Toggle

**Screen Shake Events:**
1. **On Land** — brief feedback (0.15s, **3-4px subtle**)
   - Easing: ease-out

2. **On Spike Hit** — brief feedback (0.15s, **3-4px subtle**, same as land)
   - Easing: ease-out

**Design Decision:** Subtle shake (3-4px) provides tactile feedback without causing motion sickness. Not on jump (would feel too constant).

**Accessibility Toggle:**
- Settings menu: "Screen Shake: ON / OFF"
- Store in localStorage for persistence
- Default: ON (opt-out for motion sickness)
- When OFF: skip all camera.shake() calls

**UI Placement:**
- Title screen: add settings button (opens modal)
- Modal: toggle switch for screen shake
- Simple text + toggle, no fancy animations

---

### Feature D: SFX Integration Points

**Audio Assets Needed** — Cozy Platformer + Slime Theme

| Effect | Search Terms | Tone | Duration | Volume |
|--------|--------------|------|----------|--------|
| **jump.wav** | "spring bounce soft", "boing", "wet splurt" | Squishy, springy, wet | 0.15-0.2s | Moderate |
| **land.wav** | "splat", "soft thud", "wet impact" | Soft impact, gooey | 0.2-0.3s | Moderate-Loud |
| **drip.wav** | "drip water", "liquid drop", "slime drop" | Liquid, gravity | 0.2-0.3s | Quiet-Moderate |
| **spike_hit.wav** | "splatter", "wet impact", "slime hit" | Wet, impactful | 0.3s | Loud |
| **win_chime.wav** | "bells", "chime", "cheerful", "success" | Playful, melodic | 0.5-1s | Moderate |
| **ui_confirm.wav** | "beep", "click", "confirm" | Simple, clear | 0.1s | Quiet-Moderate |

**Freesound Search Strategy:**
1. `jump.wav`: Search "wet spring" OR "splort sound" OR "boing soft"
   - Tags: `#springy #wet #bounce`
2. `land.wav`: Search "splat ground" OR "soft impact" OR "thud splat"
   - Category: Foley > Impacts or SFX
3. `drip.wav`: Search "water drop" OR "drip sound" OR "liquid drop"
   - Tags: `#gravity #drip #liquid`
4. `spike_hit.wav`: Search "wet splatter" OR "impact splat" OR "goo hit"
   - Category: Foley > Impacts, SFX
5. `win_chime.wav`: Search "bells cozy" OR "success chime" OR "cheerful sound"
   - Look for "8-bit success" or "magical chime" in Music/Chimes
6. `ui_confirm.wav`: Search "beep confirm" OR "click ui" OR "simple select"
   - Category: UI Sounds, Menu

**Asset Strategy:**
- Primary: Freesound.org (free + CC-licensed, requires account)
- Fallback: Jsfxr.net (browser SFX generator, instant prototyping)
- Music: YouTube Audio Library or Incompetech.com

**Integration Points in Code:**
- Jump → play jump.wav (at velocity.y < 0)
- Landing → play land.wav (just touched ground)
- Drip activation → play drip.wav (whenever drip starts)
- Spike collision → play spike_hit.wav (hazard contact)
- Exit touch (final room) → play win_chime.wav (win scene)
- Settings toggle / button interactions → play ui_confirm.wav

**Music (Background Loop):**
- One looping track (30-60s loop)
- Royalty-free from YouTube Audio Library or Incompetech
- Search: "cozy platformer" OR "indie game music" OR "slime" themes
- Placement: play on MainScene.create(), fade out on WinScene
- Alternative: Incompetech.com (free, CC-licensed, curated indie collections)

---

### Feature E: Scale & Visibility Tuning

**Current State:** Player sprite is 2x scale (32px source → 64px visual)

**Problem:** Hard to see on big monitors (1920x1080+)

**Solution:** Test scale options in order:
1. **Scale 2.5x (80px visual)** — first try, minor visibility boost
2. **Scale 3x (96px visual)** — fallback if 2.5 still too small

**Implementation:**
- Change `sprite.setScale(2)` → `sprite.setScale(2.5)` in loadLevel()
- Physics body stays 18x18 (offset 7,4) — scales automatically
- Playtest: does she feel right visually?

**Note:** Do NOT increase window size (would require redesigning all 6 levels). Just scale the sprite.

---

## Work Breakdown (Estimated)

| Feature | Time | Dependency |
|---------|------|------------|
| A. Particles | 3-4 hrs | None |
| B. Wall Slide | 2-3 hrs | None |
| C. Screen Shake + Toggle | 2 hrs | Particles (for testing) |
| D. SFX | 2-3 hrs (asset hunting) + 1 hr (integration) | None |
| E. Scale Tuning | 0.5 hr | Playtest |
| **Test Room + Playtest** | 1-2 hrs | A, B, C, D |
| **TOTAL** | **11-16 hrs** | — |

**Realistic Timeline:** 2-3 days (3-4 hrs/day focused work)

---

## Success Criteria

**After Milestone 5, game should feel:**
- ✅ Tactile (particles on every action)
- ✅ "Slimy" (wall slide + drip visual fluidity)
- ✅ Responsive (sound feedback on all input)
- ✅ Accessible (screen shake toggle for motion sickness)
- ✅ Visible (scale appropriate for large monitors)
- ✅ Juicy (movement has *weight* and *feedback*)

**Playtesting Question:** "Does the slime feel alive and fun to move?"
- Before: No (just colored box)
- After: YES (tactile, sonic, visual feedback)

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
