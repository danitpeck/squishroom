/**
 * Thin platform collision logic.
 * Determines whether a falling player should collide with a thin platform.
 * 
 * Rules:
 * - If player is dripping: always pass through (return false)
 * - If player is not dripping: collide only if approaching from above while falling/stationary
 */

/**
 * Determines if a player should collide with a thin platform.
 * 
 * @param isDripping - Whether player is currently dripping
 * @param playerBottom - Y coordinate of player body bottom
 * @param platformTop - Y coordinate of platform body top
 * @param playerVelocityY - Player's vertical velocity (positive = falling)
 * @returns true if collision should occur, false if player should pass through
 */
export function shouldThinPlatformCollide(
  isDripping: boolean,
  playerBottom: number,
  platformTop: number,
  playerVelocityY: number
): boolean {
  // If player is dripping, always pass through thin platforms
  if (isDripping) {
    return false;
  }

  // Player must be approaching platform from above (with tolerance for rounding)
  const isAboveTop = playerBottom <= platformTop + 10;

  // Player must be falling or stationary (not moving upward)
  const isFallingOrStill = playerVelocityY >= 0;

  // Collide only if both conditions are true
  return isAboveTop && isFallingOrStill;
}
