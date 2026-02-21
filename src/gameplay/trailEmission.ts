/**
 * Slime trail particle emission while moving on ground.
 * Manages trail timing and visual parameters (position, jitter, count).
 */

/**
 * Determines if slime trail should be emitted this frame.
 * Uses interval-based emission (95-145ms) to create footprint effect.
 * 
 * @param currentTime - Current game time in milliseconds
 * @param nextEmitTime - Time when next trail should be emitted
 * @returns true if trail should emit now
 */
export function shouldEmitTrail(
  currentTime: number,
  nextEmitTime: number
): boolean {
  return currentTime >= nextEmitTime;
}

/**
 * Calculates the next trail emission time.
 * Randomized between 95-145ms (same interval as drip for consistency).
 * 
 * @param currentTime - Current game time in milliseconds
 * @returns time when next trail should emit
 */
export function getNextTrailTime(currentTime: number): number {
  const interval = 95 + Math.random() * 50; // 95-145ms
  return currentTime + interval;
}

/**
 * Determines horizontal offset for trail particles based on movement direction.
 * Particles emit slightly behind the slime as it moves.
 * 
 * @param velocityX - Player's horizontal velocity
 * @returns offset in pixels (negative = left of player, positive = right)
 */
export function getTrailOffsetX(velocityX: number): number {
  // Emit particles opposite to direction of movement
  return velocityX >= 0 ? -8 : 8;
}

/**
 * Calculates horizontal jitter for trail particles.
 * Adds ±4px randomization for organic spread.
 * 
 * @returns jitter amount in pixels
 */
export function getTrailJitterX(): number {
  return -4 + Math.random() * 8; // -4 to +4
}

/**
 * Calculates vertical jitter for trail particles.
 * Adds ±1-2px randomization for varied height.
 * 
 * @returns jitter amount in pixels
 */
export function getTrailJitterY(): number {
  return -1 + Math.random() * 3; // -1 to +2
}

/**
 * Calculates particle count for trail emission.
 * Randomized between 2-4 particles per step for varied density.
 * 
 * @returns number of particles to emit
 */
export function getTrailCount(): number {
  return 2 + Math.floor(Math.random() * 3); // 2-4 particles
}

/**
 * Calculates the Y offset for trail particles.
 * Particles emit from near the bottom of the slime character.
 */
export function getTrailEmitY(baseY: number): number {
  return baseY + 15;
}
