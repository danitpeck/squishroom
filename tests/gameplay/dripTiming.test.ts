import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  shouldEmitDrip,
  getNextDripTime,
  getDripJitterX,
  getDripJitterY,
  getDripCount,
} from '../../src/gameplay/dripTiming';

describe('dripTiming', () => {
  describe('shouldEmitDrip', () => {
    it('returns true when current time >= next emit time', () => {
      expect(shouldEmitDrip(1000, 1000)).toBe(true);
    });

    it('returns true when current time > next emit time', () => {
      expect(shouldEmitDrip(1005, 1000)).toBe(true);
    });

    it('returns false when current time < next emit time', () => {
      expect(shouldEmitDrip(999, 1000)).toBe(false);
    });

    it('returns false when current time slightly before next time', () => {
      expect(shouldEmitDrip(999.9, 1000)).toBe(false);
    });

    it('handles large time values', () => {
      expect(shouldEmitDrip(100000, 100000)).toBe(true);
    });

    it('handles zero times', () => {
      expect(shouldEmitDrip(0, 0)).toBe(true);
    });
  });

  describe('getNextDripTime', () => {
    it('returns a time > current time', () => {
      const current = 1000;
      const next = getNextDripTime(current);
      expect(next).toBeGreaterThan(current);
    });

    it('returns interval between 95 and 145ms', () => {
      const current = 1000;
      const next = getNextDripTime(current);
      const interval = next - current;
      expect(interval).toBeGreaterThanOrEqual(95);
      expect(interval).toBeLessThanOrEqual(145);
    });

    it('returns different values on sequential calls (randomized)', () => {
      const current = 1000;
      const next1 = getNextDripTime(current);
      const next2 = getNextDripTime(current);
      // Very small chance of same value, but acceptable
      expect([next1, next2].length).toBe(2);
    });

    it('produces varied intervals across multiple calls', () => {
      const current = 1000;
      const intervals = new Set();
      for (let i = 0; i < 10; i++) {
        const next = getNextDripTime(current);
        intervals.add(Math.round(next - current));
      }
      // Should have variety, not all the same value
      expect(intervals.size).toBeGreaterThan(1);
    });

    it('maintains correct interval from arbitrary start times', () => {
      const times = [0, 100, 5000, 999999];
      times.forEach(current => {
        const next = getNextDripTime(current);
        const interval = next - current;
        expect(interval).toBeGreaterThanOrEqual(95);
        expect(interval).toBeLessThanOrEqual(145);
      });
    });
  });

  describe('getDripJitterX', () => {
    it('returns value between -4 and +4', () => {
      for (let i = 0; i < 100; i++) {
        const jitter = getDripJitterX();
        expect(jitter).toBeGreaterThanOrEqual(-4);
        expect(jitter).toBeLessThanOrEqual(4);
      }
    });

    it('includes both negative and positive values', () => {
      const samples = new Set();
      for (let i = 0; i < 50; i++) {
        const jitter = getDripJitterX();
        samples.add(Math.sign(jitter));
      }
      // Should have both -1 and 1 (or 0 for center)
      expect(samples.size).toBeGreaterThan(1);
    });

    it('can reach extreme values', () => {
      let hasNegative = false;
      let hasPositive = false;
      for (let i = 0; i < 1000; i++) {
        const jitter = getDripJitterX();
        if (jitter < -3) hasNegative = true;
        if (jitter > 3) hasPositive = true;
      }
      expect(hasNegative).toBe(true);
      expect(hasPositive).toBe(true);
    });
  });

  describe('getDripJitterY', () => {
    it('returns value between -1 and +2', () => {
      for (let i = 0; i < 100; i++) {
        const jitter = getDripJitterY();
        expect(jitter).toBeGreaterThanOrEqual(-1);
        expect(jitter).toBeLessThanOrEqual(2);
      }
    });

    it('spans the full range across samples', () => {
      let minSeen = Infinity;
      let maxSeen = -Infinity;
      for (let i = 0; i < 1000; i++) {
        const jitter = getDripJitterY();
        minSeen = Math.min(minSeen, jitter);
        maxSeen = Math.max(maxSeen, jitter);
      }
      expect(minSeen).toBeLessThan(-0.5);
      expect(maxSeen).toBeGreaterThan(1.5);
    });
  });

  describe('getDripCount', () => {
    it('returns integer between 2 and 4', () => {
      for (let i = 0; i < 100; i++) {
        const count = getDripCount();
        expect(Number.isInteger(count)).toBe(true);
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(4);
      }
    });

    it('can return all valid values (2, 3, 4)', () => {
      const counts = new Set();
      for (let i = 0; i < 100; i++) {
        counts.add(getDripCount());
      }
      expect(counts.size).toBe(3); // Should have 2, 3, and 4
      expect(counts.has(2)).toBe(true);
      expect(counts.has(3)).toBe(true);
      expect(counts.has(4)).toBe(true);
    });
  });
});
