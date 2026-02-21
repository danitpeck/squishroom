import { describe, it, expect } from 'vitest';
import { shouldThinPlatformCollide } from '../../src/gameplay/thinPlatform';

describe('shouldThinPlatformCollide', () => {
  describe('dripping behavior', () => {
    it('returns false when dripping (always pass through)', () => {
      // Regression test: drip-through was broken in Phase 3
      const result = shouldThinPlatformCollide(
        true,           // isDripping
        100,            // playerBottom
        90,             // platformTop
        100             // playerVelocityY (falling)
      );
      expect(result).toBe(false);
    });

    it('returns false when dripping even while moving upward', () => {
      const result = shouldThinPlatformCollide(
        true,           // isDripping
        100,            // playerBottom
        90,             // platformTop
        -50             // playerVelocityY (moving up)
      );
      expect(result).toBe(false);
    });

    it('returns false when dripping even at exact platform boundary', () => {
      const result = shouldThinPlatformCollide(
        true,           // isDripping
        100,            // playerBottom
        100,            // platformTop (exact match)
        0               // playerVelocityY (stationary)
      );
      expect(result).toBe(false);
    });
  });

  describe('falling from above', () => {
    it('returns true when falling from above (standard case)', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        100,            // playerBottom
        110,            // platformTop (below player)
        50              // playerVelocityY (falling)
      );
      expect(result).toBe(true);
    });

    it('returns true when stationary above platform', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        100,            // playerBottom
        110,            // platformTop (below player)
        0               // playerVelocityY (stationary)
      );
      expect(result).toBe(true);
    });

    it('returns true at collision threshold (playerBottom <= platformTop + 10)', () => {
      // Edge case: player at exact boundary tolerance
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        110,            // playerBottom
        100,            // platformTop
        10              // playerVelocityY (falling)
      );
      expect(result).toBe(true);
    });

    it('returns true just barely within threshold', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        109.9,          // playerBottom (just within platformTop + 10)
        100,            // platformTop
        5               // playerVelocityY (falling)
      );
      expect(result).toBe(true);
    });
  });

  describe('moving upward', () => {
    it('returns false when moving upward through platform', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        100,            // playerBottom
        95,             // platformTop (player below, moving up)
        -50             // playerVelocityY (moving up)
      );
      expect(result).toBe(false);
    });

    it('returns false when jumping upward from below', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        120,            // playerBottom (below platform)
        100,            // platformTop
        -100            // playerVelocityY (strong upward)
      );
      expect(result).toBe(false);
    });

    it('returns false even when very close to platform while moving up', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        105,            // playerBottom (just below platform + tolerance)
        100,            // platformTop
        -1              // playerVelocityY (minimal upward velocity)
      );
      expect(result).toBe(false);
    });
  });

  describe('missed collision cases', () => {
    it('returns false when below platform (not approaching from above)', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        150,            // playerBottom (well below platform)
        100,            // platformTop
        100             // playerVelocityY (falling)
      );
      expect(result).toBe(false);
    });

    it('returns false when beyond tolerance threshold', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        120,            // playerBottom
        100,            // platformTop (tolerance is ±10)
        50              // playerVelocityY (falling)
      );
      expect(result).toBe(false);
    });
  });

  describe('boundary conditions', () => {
    it('handles zero velocity (player stationary)', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        100,            // playerBottom
        110,            // platformTop
        0               // playerVelocityY (stationary)
      );
      expect(result).toBe(true);
    });

    it('handles minimum falling velocity', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        100,            // playerBottom
        110,            // platformTop
        0.1             // playerVelocityY (barely falling)
      );
      expect(result).toBe(true);
    });

    it('handles large falling velocity', () => {
      const result = shouldThinPlatformCollide(
        false,          // isDripping
        100,            // playerBottom
        110,            // platformTop
        500             // playerVelocityY (very fast fall)
      );
      expect(result).toBe(true);
    });
  });
});
