import { describe, it, expect } from 'vitest';
import {
  shouldEmitTrail,
  getNextTrailTime,
  getTrailOffsetX,
  getTrailJitterX,
  getTrailJitterY,
  getTrailCount,
  getTrailEmitY,
} from '../../src/gameplay/trailEmission';

describe('trailEmission', () => {
  describe('shouldEmitTrail', () => {
    it('returns true when current time >= next emit time', () => {
      expect(shouldEmitTrail(1000, 1000)).toBe(true);
    });

    it('returns true when current time > next emit time', () => {
      expect(shouldEmitTrail(1050, 1000)).toBe(true);
    });

    it('returns false when current time < next emit time', () => {
      expect(shouldEmitTrail(999, 1000)).toBe(false);
    });

    it('handles edge case at exact time boundary', () => {
      expect(shouldEmitTrail(1000.0, 1000.0)).toBe(true);
    });
  });

  describe('getNextTrailTime', () => {
    it('returns time > current time', () => {
      const current = 2000;
      const next = getNextTrailTime(current);
      expect(next).toBeGreaterThan(current);
    });

    it('returns interval between 95 and 145ms', () => {
      const current = 2000;
      const next = getNextTrailTime(current);
      const interval = next - current;
      expect(interval).toBeGreaterThanOrEqual(95);
      expect(interval).toBeLessThanOrEqual(145);
    });

    it('uses same randomization as drip (95-145ms)', () => {
      const current = 1000;
      const intervals = [];
      for (let i = 0; i < 20; i++) {
        const next = getNextTrailTime(current);
        intervals.push(next - current);
      }
      intervals.forEach(interval => {
        expect(interval).toBeGreaterThanOrEqual(95);
        expect(interval).toBeLessThanOrEqual(145);
      });
    });

    it('produces varied intervals across calls', () => {
      const current = 1000;
      const intervals = new Set();
      for (let i = 0; i < 10; i++) {
        const next = getNextTrailTime(current);
        intervals.add(Math.round(next - current));
      }
      expect(intervals.size).toBeGreaterThan(1);
    });
  });

  describe('getTrailOffsetX', () => {
    it('returns -8 when moving right (positive velocity)', () => {
      expect(getTrailOffsetX(100)).toBe(-8);
    });

    it('returns -8 when moving right at high speed', () => {
      expect(getTrailOffsetX(500)).toBe(-8);
    });

    it('returns 8 when moving left (negative velocity)', () => {
      expect(getTrailOffsetX(-100)).toBe(8);
    });

    it('returns 8 when moving left at high speed', () => {
      expect(getTrailOffsetX(-500)).toBe(8);
    });

    it('returns -8 when stationary (zero velocity)', () => {
      // At rest, emit particles behind (arbitrary convention -8)
      expect(getTrailOffsetX(0)).toBe(-8);
    });

    it('emits opposite to direction (left movement, right particles)', () => {
      // Moving left means trail behind should be to the right
      expect(getTrailOffsetX(-50)).toBe(8);
    });

    it('emits opposite to direction (right movement, left particles)', () => {
      // Moving right means trail behind should be to the left
      expect(getTrailOffsetX(50)).toBe(-8);
    });

    it('has consistent offset magnitude', () => {
      expect(Math.abs(getTrailOffsetX(100))).toBe(8);
      expect(Math.abs(getTrailOffsetX(-100))).toBe(8);
    });

    it('handles fractional velocities', () => {
      expect(getTrailOffsetX(0.1)).toBe(-8);
      expect(getTrailOffsetX(-0.1)).toBe(8);
    });
  });

  describe('getTrailJitterX', () => {
    it('returns value between -4 and +4', () => {
      for (let i = 0; i < 100; i++) {
        const jitter = getTrailJitterX();
        expect(jitter).toBeGreaterThanOrEqual(-4);
        expect(jitter).toBeLessThanOrEqual(4);
      }
    });

    it('includes variation across samples', () => {
      const samples = new Set();
      for (let i = 0; i < 50; i++) {
        samples.add(Math.round(getTrailJitterX() * 10) / 10);
      }
      expect(samples.size).toBeGreaterThan(5);
    });
  });

  describe('getTrailJitterY', () => {
    it('returns value between -1 and +2', () => {
      for (let i = 0; i < 100; i++) {
        const jitter = getTrailJitterY();
        expect(jitter).toBeGreaterThanOrEqual(-1);
        expect(jitter).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('getTrailCount', () => {
    it('returns integer between 2 and 4 (inclusive)', () => {
      for (let i = 0; i < 100; i++) {
        const count = getTrailCount();
        expect(Number.isInteger(count)).toBe(true);
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(4);
      }
    });

    it('can return all valid values', () => {
      const counts = new Set();
      for (let i = 0; i < 100; i++) {
        counts.add(getTrailCount());
      }
      expect(counts.size).toBe(3);
      expect(counts.has(2)).toBe(true);
      expect(counts.has(3)).toBe(true);
      expect(counts.has(4)).toBe(true);
    });
  });

  describe('getTrailEmitY', () => {
    it('returns baseY + 15', () => {
      expect(getTrailEmitY(100)).toBe(115);
    });

    it('works with various base values', () => {
      expect(getTrailEmitY(0)).toBe(15);
      expect(getTrailEmitY(50)).toBe(65);
      expect(getTrailEmitY(200)).toBe(215);
    });

    it('handles negative values', () => {
      expect(getTrailEmitY(-10)).toBe(5);
    });

    it('emits from bottom area of slime character', () => {
      // Trail should emit near the bottom (Y + 15)
      // Player sprite is roughly 20px tall, so bottom is around Y + 17-20
      // Therefore Y + 15 makes sense
      const emitY = getTrailEmitY(100);
      expect(emitY).toBe(115);
    });
  });

  describe('integration: trail parameters together', () => {
    it('offset points opposite to movement direction', () => {
      // Right movement: particles left (negative offset)
      expect(getTrailOffsetX(100)).toBe(-8);
      // Left movement: particles right (positive offset)
      expect(getTrailOffsetX(-100)).toBe(8);
    });

    it('jitter adds variability to offset', () => {
      const offset = getTrailOffsetX(50);
      const jitter = getTrailJitterX();
      // Final position = offset + jitter
      // Should be within bounds
      expect(offset + jitter).toBeGreaterThan(-20);
      expect(offset + jitter).toBeLessThan(20);
    });

    it('count and jitter create organic footprints', () => {
      const count = getTrailCount(); // 2-4 particles
      expect(count).toBeGreaterThanOrEqual(2);
      // Each particle gets individual jitter for spread
      const jitters = [];
      for (let i = 0; i < count; i++) {
        jitters.push({
          x: getTrailJitterX(),
          y: getTrailJitterY(),
        });
      }
      expect(jitters.length).toBe(count);
    });
  });
});
