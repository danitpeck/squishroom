/**
 * Animation state machine logic.
 * Determines which animation should play based on player state.
 */

/**
 * Determines which animation should currently play.
 * Priority: land > wallSlide > airborne (jump/fall) > grounded (run/idle)
 */
export function getNextAnimationKey(
  currentAnimKey: string | undefined,
  isAnimPlaying: boolean,
  isOnGround: boolean,
  isMoving: boolean,
  velocityY: number,
  justLanded: boolean,
  isWallSliding = false
): string {
  // Land animation takes priority and can't be interrupted
  if (currentAnimKey === 'land' && isAnimPlaying) {
    return currentAnimKey
  }

  if (justLanded) {
    return 'land'
  }

  if (isWallSliding) {
    return 'wallSlide'
  }

  if (!isOnGround) {
    if (velocityY > 0) {
      return 'fall'
    }

    if (velocityY < 0) {
      return 'jump'
    }

    return 'jump'
  }

  return isMoving ? 'run' : 'idle'
}

/**
 * Determines if animation should change to the new key.
 */
export function shouldChangeAnimation(
  currentKey: string | undefined,
  nextKey: string
): boolean {
  return currentKey !== nextKey
}
