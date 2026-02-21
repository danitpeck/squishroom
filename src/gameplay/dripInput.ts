/**
 * Drip input detection and state management.
 * Handles when player enters drip mode and when it ends.
 */

/**
 * Determines if drip should start.
 * Can only start while airborne (not on ground).
 * 
 * @param dripPressed - Whether drip key (down arrow) was just pressed
 * @param isOnGround - Whether player is touching ground
 * @returns true if drip mode should activate
 */
export function shouldStartDrip(
  dripPressed: boolean,
  isOnGround: boolean
): boolean {
  return dripPressed && !isOnGround;
}

/**
 * Gets the velocity to apply when dripping.
 * High downward velocity to accelerate fall dramatically.
 */
export function getDripVelocity(): number {
  return 720; // Fast downward
}

/**
 * Gets the X velocity when starting drip.
 * Drip freezes horizontal momentum.
 */
export function getDripVelocityX(): number {
  return 0; // Stop sideways movement
}

/**
 * Determines if drip should end.
 * Drip automatically ends on ground contact.
 * 
 * @param isOnGround - Whether player is touching ground
 * @returns true if drip mode should deactivate
 */
export function shouldEndDrip(isOnGround: boolean): boolean {
  return isOnGround;
}
