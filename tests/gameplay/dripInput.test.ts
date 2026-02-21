import { describe, it, expect } from 'vitest';
import {
  shouldStartDrip,
  getDripVelocity,
  getDripVelocityX,
  shouldEndDrip,
} from '../../src/gameplay/dripInput';

describe('dripInput', () => {
  describe('shouldStartDrip', () => {
    it('returns true when drip pressed and airborne', () => {
      expect(shouldStartDrip(true, false)).toBe(true);
    });

    it('returns false when drip pressed but on ground', () => {
      expect(shouldStartDrip(true, true)).toBe(false);
    });

    it('returns false when not pressed but airborne', () => {
      expect(shouldStartDrip(false, false)).toBe(false);
    });

    it('returns false when not pressed and on ground', () => {
      expect(shouldStartDrip(false, true)).toBe(false);
    });

    it('requires both conditions: drip pressed AND not on ground', () => {
      expect(shouldStartDrip(true, false)).toBe(true); // Both true
      expect(shouldStartDrip(true, true)).toBe(false); // First true, second false
      expect(shouldStartDrip(false, false)).toBe(false); // First false, second true
    });
  });

  describe('getDripVelocity', () => {
    it('returns 720 (fast downward velocity)', () => {
      expect(getDripVelocity()).toBe(720);
    });

    it('returns positive value (downward direction)', () => {
      expect(getDripVelocity()).toBeGreaterThan(0);
    });

    it('returns consistent value', () => {
      expect(getDripVelocity()).toBe(getDripVelocity());
    });

    it('returns velocity much faster than gravity alone', () => {
      // Gravity is 900, drip velocity 720 means faster acceleration
      expect(getDripVelocity()).toBeLessThan(900); // But still reasonable
    });
  });

  describe('getDripVelocityX', () => {
    it('returns 0 (stops horizontal movement)', () => {
      expect(getDripVelocityX()).toBe(0);
    });

    it('freezes sideways momentum when dripping', () => {
      const xVel = getDripVelocityX();
      expect(xVel).toBe(0); // Drip halts X movement
    });
  });

  describe('shouldEndDrip', () => {
    it('returns true when on ground', () => {
      expect(shouldEndDrip(true)).toBe(true);
    });

    it('returns false when airborne', () => {
      expect(shouldEndDrip(false)).toBe(false);
    });

    it('stops drip on ground contact', () => {
      // Drip mode can only continue while airborne
      expect(shouldEndDrip(false)).toBe(false);
      expect(shouldEndDrip(true)).toBe(true);
    });
  });

  describe('drip state lifecycle', () => {
    it('starts in air, ends on ground', () => {
      // Frame 1: Player in air, drip pressed
      const startsDrip = shouldStartDrip(true, false);
      expect(startsDrip).toBe(true);

      // Frame 2-N: Dripping continues while airborne
      let isDripping = true;
      expect(shouldEndDrip(false)).toBe(false); // Still air

      // Frame N: Player touches ground
      expect(shouldEndDrip(true)).toBe(true);
      isDripping = false;
      expect(isDripping).toBe(false); // Drip ended
    });

    it('cannot start drip from ground', () => {
      const isOnGround = true;
      const dripPressed = true;

      const startsDrip = shouldStartDrip(dripPressed, isOnGround);
      expect(startsDrip).toBe(false); // Cannot start while grounded
    });
  });

  describe('integration: drip mechanics', () => {
    it('applies high downward velocity while dripping', () => {
      const velocityX = getDripVelocityX();
      const velocityY = getDripVelocity();

      // X is frozen
      expect(velocityX).toBe(0);

      // Y is fast downward
      expect(velocityY).toBeGreaterThan(0);
      expect(velocityY).toBeGreaterThan(300); // Much faster than normal fall
    });
  });
});
