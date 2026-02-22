/**
 * Wall slide gameplay rules.
 * Keeps wall interaction deterministic and testable outside of Phaser scene internals.
 */

export type WallSide = 'left' | 'right'

/**
 * Determines whether wall slide should be active.
 */
export function shouldWallSlide(
  isOnGround: boolean,
  isDripping: boolean,
  touchingLeftWall: boolean,
  touchingRightWall: boolean,
  pressingLeft: boolean,
  pressingRight: boolean
): boolean {
  if (isOnGround || isDripping) {
    return false
  }

  const pressingIntoLeftWall = touchingLeftWall && pressingLeft
  const pressingIntoRightWall = touchingRightWall && pressingRight

  return pressingIntoLeftWall || pressingIntoRightWall
}

/**
 * Returns which wall side the player is actively sliding against.
 */
export function getWallSlideSide(
  touchingLeftWall: boolean,
  touchingRightWall: boolean,
  pressingLeft: boolean,
  pressingRight: boolean
): WallSide | undefined {
  if (touchingLeftWall && pressingLeft) {
    return 'left'
  }

  if (touchingRightWall && pressingRight) {
    return 'right'
  }

  return undefined
}

/**
 * Clamps downward speed while wall sliding.
 * Upward velocity is preserved.
 */
export function getWallSlideVelocityY(currentVelocityY: number): number {
  const maxSlideSpeed = 360

  if (currentVelocityY <= 0) {
    return currentVelocityY
  }

  return Math.min(currentVelocityY, maxSlideSpeed)
}

/**
 * Determines if the player should jump away from wall while sliding.
 * Either jump button or opposite direction can trigger release jump.
 */
export function shouldWallSlideJump(
  isWallSliding: boolean,
  wallSide: WallSide | undefined,
  jumpPressed: boolean,
  jumpHeld: boolean,
  justStartedWallSlide: boolean,
  pressingLeft: boolean,
  pressingRight: boolean
): boolean {
  if (!isWallSliding || !wallSide) {
    return false
  }

  const pressingOpposite =
    (wallSide === 'left' && pressingRight) ||
    (wallSide === 'right' && pressingLeft)

  const bufferedJumpWhileLatching = jumpHeld && justStartedWallSlide

  return jumpPressed || pressingOpposite || bufferedJumpWhileLatching
}

/**
 * Horizontal launch velocity when jumping off a wall.
 */
export function getWallSlideJumpVelocityX(wallSide: WallSide): number {
  const launchSpeed = 180
  return wallSide === 'left' ? launchSpeed : -launchSpeed
}
