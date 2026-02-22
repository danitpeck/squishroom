/**
 * Wall slide gameplay rules.
 * Keeps wall interaction deterministic and testable outside of Phaser scene internals.
 */

export type WallSide = 'left' | 'right'

const MAX_WALL_SLIDE_SPEED = 90
const WALL_JUMP_LAUNCH_SPEED = 120

/**
 * Wall-slide should only consider persistent blocked side contacts.
 * `touching` values can stay true on transient corner separation frames.
 */
export function getWallSlideContacts(
  blockedLeft: boolean,
  blockedRight: boolean,
  _touchingLeft: boolean,
  _touchingRight: boolean
): { touchingLeftWall: boolean; touchingRightWall: boolean } {
  return {
    touchingLeftWall: blockedLeft,
    touchingRightWall: blockedRight
  }
}

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
  if (currentVelocityY <= 0) {
    return currentVelocityY
  }

  return Math.min(currentVelocityY, MAX_WALL_SLIDE_SPEED)
}

/**
 * Determines if the player should jump away from wall while sliding.
 * Either jump button or opposite direction can trigger release jump.
 */
export function shouldWallSlideJump(
  isWallSliding: boolean,
  wallSide: WallSide | undefined,
  jumpPressed: boolean,
  oppositePressed: boolean
): boolean {
  if (!isWallSliding || !wallSide) {
    return false
  }

  return jumpPressed || oppositePressed
}

/**
 * Horizontal launch velocity when jumping off a wall.
 */
export function getWallSlideJumpVelocityX(wallSide: WallSide): number {
  return wallSide === 'left' ? WALL_JUMP_LAUNCH_SPEED : -WALL_JUMP_LAUNCH_SPEED
}
