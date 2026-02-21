/**
 * Jump input detection and physics calculation.
 * Determines when jump should be triggered and applies jump velocity.
 */

/**
 * Determines if jump should be initiated.
 * 
 * @param jumpPressed - Whether jump key was just pressed this frame
 * @param upPressed - Whether up arrow key was just pressed this frame
 * @param isOnGround - Whether player is currently on ground
 * @returns true if jump should be activated
 */
export function shouldJump(
  jumpPressed: boolean,
  upPressed: boolean,
  isOnGround: boolean
): boolean {
  const anyJumpPressed = jumpPressed || upPressed;
  return anyJumpPressed && isOnGround;
}

/**
 * Gets the jump velocity to apply.
 * Constant value for consistency.
 */
export function getJumpVelocity(): number {
  return -420; // Negative because up is negative Y
}

/**
 * Determines if jump should be cut short.
 * Called when jump key is released while moving upward.
 * 
 * @param jumpReleased - Whether jump key was just released this frame
 * @param upReleased - Whether up arrow key was just released this frame
 * @param currentVelocityY - Current vertical velocity (negative = upward)
 * @returns true if jump velocity should be reduced
 */
export function shouldCutJump(
  jumpReleased: boolean,
  upReleased: boolean,
  currentVelocityY: number
): boolean {
  const anyJumpReleased = jumpReleased || upReleased;
  const isMovingUpward = currentVelocityY < 0;
  return anyJumpReleased && isMovingUpward;
}

/**
 * Calculates velocity reduction when jump is cut.
 * Reduces current upward velocity by half to create responsive feel.
 * 
 * @param currentVelocityY - Current vertical velocity
 * @returns new velocity after cut (50% of original)
 */
export function getCutJumpVelocity(currentVelocityY: number): number {
  return currentVelocityY * 0.5;
}
