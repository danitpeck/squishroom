/**
 * Animation state machine logic.
 * Determines which animation should play based on player state.
 */

/**
 * Determines which animation should currently play.
 * Priority: land > airborne (jump/fall) > grounded (run/idle)
 * 
 * @param currentAnimKey - Currently playing animation key
 * @param isAnimPlaying - Whether an animation is actively playing
 * @param isOnGround - Whether player is touching ground
 * @param isMoving - Whether player is moving horizontally
 * @param velocityY - Vertical velocity (negative = up, positive = down)
 * @param justLanded - Whether player just landed this frame
 * @returns animation key to play ('idle', 'run', 'jump', 'fall', or 'land')
 */
export function getNextAnimationKey(
  currentAnimKey: string | undefined,
  isAnimPlaying: boolean,
  isOnGround: boolean,
  isMoving: boolean,
  velocityY: number,
  justLanded: boolean
): string {
  // Land animation takes priority and can't be interrupted
  if (currentAnimKey === 'land' && isAnimPlaying) {
    return currentAnimKey;
  }

  // Just landed - play land animation once, then fall through to state logic
  if (justLanded) {
    return 'land';
  }

  // Not on ground - determine airborne animation
  if (!isOnGround) {
    if (velocityY > 0) {
      return 'fall'; // Falling
    } else if (velocityY < 0) {
      return 'jump'; // Jumping/moving up
    }
    // Stationary in air (shouldn't happen, but default to jump)
    return 'jump';
  }

  // On ground - determine grounded animation
  if (isMoving) {
    return 'run';
  } else {
    return 'idle';
  }
}

/**
 * Determines if animation should change to the new key.
 * Avoids redundant plays of same animation.
 * 
 * @param currentKey - Currently playing animation
 * @param nextKey - Desired animation
 * @returns true if animation should be played
 */
export function shouldChangeAnimation(
  currentKey: string | undefined,
  nextKey: string
): boolean {
  return currentKey !== nextKey;
}
