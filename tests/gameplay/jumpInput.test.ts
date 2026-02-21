import { describe, it, expect } from 'vitest';
import {
  shouldJump,
  getJumpVelocity,
  shouldCutJump,
  getCutJumpVelocity,
} from '../../src/gameplay/jumpInput';

describe('jumpInput', () => {
  describe('shouldJump', () => {
    it('returns true when space pressed and on ground', () => {
      expect(shouldJump(true, false, true)).toBe(true);
    });

    it('returns true when up arrow pressed and on ground', () => {
      expect(shouldJump(false, true, true)).toBe(true);
    });

    it('returns true when either pressed and on ground', () => {
      expect(shouldJump(true, true, true)).toBe(true);
    });

    it('returns false when jump pressed but not on ground', () => {
      expect(shouldJump(true, false, false)).toBe(false);
    });

    it('returns false when up pressed but not on ground', () => {
      expect(shouldJump(false, true, false)).toBe(false);
    });

    it('returns false when on ground but neither key pressed', () => {
      expect(shouldJump(false, false, true)).toBe(false);
    });

    it('returns false when in air and neither key pressed', () => {
      expect(shouldJump(false, false, false)).toBe(false);
    });
  });

  describe('getJumpVelocity', () => {
    it('returns -420 (upward velocity constant)', () => {
      expect(getJumpVelocity()).toBe(-420);
    });

    it('returns consistent value on multiple calls', () => {
      expect(getJumpVelocity()).toBe(getJumpVelocity());
    });
  });

  describe('shouldCutJump', () => {
    it('returns true when space released while moving upward', () => {
      expect(shouldCutJump(true, false, -100)).toBe(true);
    });

    it('returns true when up released while moving upward', () => {
      expect(shouldCutJump(false, true, -50)).toBe(true);
    });

    it('returns true when either released while moving upward', () => {
      expect(shouldCutJump(true, true, -200)).toBe(true);
    });

    it('returns false when released but moving downward', () => {
      expect(shouldCutJump(true, false, 100)).toBe(false);
    });

    it('returns false when released but stationary', () => {
      expect(shouldCutJump(true, false, 0)).toBe(false);
    });

    it('returns false when moving upward but no release input', () => {
      expect(shouldCutJump(false, false, -150)).toBe(false);
    });

    it('returns false at boundary (velocity = 0)', () => {
      expect(shouldCutJump(true, false, 0)).toBe(false);
    });

    it('returns true with minimal upward velocity', () => {
      expect(shouldCutJump(true, false, -0.1)).toBe(true);
    });
  });

  describe('getCutJumpVelocity', () => {
    it('returns 50% of given upward velocity', () => {
      expect(getCutJumpVelocity(-400)).toBe(-200);
    });

    it('returns 50% of strong upward velocity', () => {
      expect(getCutJumpVelocity(-420)).toBe(-210);
    });

    it('handles small negative velocities', () => {
      expect(getCutJumpVelocity(-10)).toBe(-5);
    });

    it('returns 0 when given 0', () => {
      expect(getCutJumpVelocity(0)).toBe(0);
    });

    it('scales positive velocities correctly (edge case)', () => {
      // While unusual, function should handle gracefully
      expect(getCutJumpVelocity(100)).toBe(50);
    });

    it('handles fractional velocities', () => {
      expect(getCutJumpVelocity(-123.4)).toBe(-61.7);
    });

    it('is idempotent twice (cutting cut jump)', () => {
      const first = getCutJumpVelocity(-420);
      const second = getCutJumpVelocity(first);
      expect(second).toBe(-105); // 50% of -210
    });
  });
});
