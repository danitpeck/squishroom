/**
 * Drip particle emission timing with randomization.
 * Manages the interval-based emission of drip particles while falling.
 */

/**
 * Determines if drip particles should be emitted this frame.
 * Uses a randomized interval (95-145ms with ±4px, ±1-2px jitter) to create
 * organic, non-uniform dripping effect.
 * 
 * @param currentTime - Current game time in milliseconds
 * @param nextEmitTime - Time when next drip should be emitted
 * @returns true if drip should emit now
 */
export function shouldEmitDrip(
  currentTime: number,
  nextEmitTime: number
): boolean {
  return currentTime >= nextEmitTime;
}

/**
 * Calculates the next drip emission time.
 * Randomized between 95-145ms to create natural, irregular dripping.
 * 
 * @param currentTime - Current game time in milliseconds
 * @returns time when next drip should emit
 */
export function getNextDripTime(currentTime: number): number {
  const interval = 95 + Math.random() * 50; // 95-145ms
  return currentTime + interval;
}

/**
 * Calculates horizontal jitter for drip particles.
 * Adds ±4px randomization for organic appearance.
 * 
 * @returns jitter amount in pixels
 */
export function getDripJitterX(): number {
  return -4 + Math.random() * 8; // -4 to +4
}

/**
 * Calculates vertical jitter for drip particles.
 * Adds ±1-2px randomization for slight vertical spread.
 * 
 * @returns jitter amount in pixels
 */
export function getDripJitterY(): number {
  return -1 + Math.random() * 3; // -1 to +2
}

/**
 * Calculates particle count for drip emission.
 * Randomized between 2-4 particles per drip for varied coverage.
 * 
 * @returns number of particles to emit
 */
export function getDripCount(): number {
  return 2 + Math.floor(Math.random() * 3); // 2-4 particles
}
