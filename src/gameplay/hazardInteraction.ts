/**
 * Hazard interaction and respawn logic.
 * Handles what happens when player touches a spike/hazard.
 */

/**
 * Determines if hazard should trigger (player death/respawn).
 * Prevents multiple triggers in same frame and after level completion.
 * 
 * @param isComplete - Whether level is already completed
 * @param hasPlayer - Whether player exists
 * @returns true if hazard interaction should proceed
 */
export function shouldTriggerHazard(
  isComplete: boolean,
  hasPlayer: boolean
): boolean {
  return !isComplete && hasPlayer;
}

/**
 * State resets when hazard is triggered.
 * Returns the state changes needed.
 */
export interface HazardStateReset {
  isDripping: boolean;
  wasOnGround: boolean;
  velocityX: number;
  velocityY: number;
  scale: number;
}

/**
 * Gets the default state reset for hazard hit.
 * Stops all movement, resets drip state, prepares for respawn animation.
 */
export function getHazardStateReset(): HazardStateReset {
  return {
    isDripping: false,
    wasOnGround: false,
    velocityX: 0,
    velocityY: 0,
    scale: 2, // Visually expand for "splat" effect
  };
}

/**
 * Gets the initial velocity when hazard is hit.
 * Player stops moving before respawn.
 */
export function getHazardVelocity(): { x: number; y: number } {
  return { x: 0, y: 0 };
}

/**
 * Gets the scale factor for "splat" effect when hitting hazard.
 * 2x scale shows visual feedback before respawn.
 */
export function getHazardSplatScale(): number {
  return 2;
}
