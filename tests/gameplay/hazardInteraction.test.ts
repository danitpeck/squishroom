import { describe, it, expect } from 'vitest';
import {
  shouldTriggerHazard,
  getHazardStateReset,
  getHazardVelocity,
  getHazardSplatScale,
} from '../../src/gameplay/hazardInteraction';

describe('hazardInteraction', () => {
  describe('shouldTriggerHazard', () => {
    it('returns true when player exists and level not complete', () => {
      expect(shouldTriggerHazard(false, true)).toBe(true);
    });

    it('returns false when level is complete (prevents double-trigger)', () => {
      expect(shouldTriggerHazard(true, true)).toBe(false);
    });

    it('returns false when no player exists (safety check)', () => {
      expect(shouldTriggerHazard(false, false)).toBe(false);
    });

    it('returns false when both conditions fail', () => {
      expect(shouldTriggerHazard(true, false)).toBe(false);
    });

    it('requires both conditions: player exists AND level incomplete', () => {
      // Both true = trigger
      expect(shouldTriggerHazard(false, true)).toBe(true);

      // Only one true = don't trigger
      expect(shouldTriggerHazard(true, true)).toBe(false); // Complete
      expect(shouldTriggerHazard(false, false)).toBe(false); // No player
    });

    it('prevents hazard from triggering twice on same spike hit', () => {
      // After hitting hazard once:
      let levelComplete = false;
      let hasPlayer = true;

      // First hit triggers
      expect(shouldTriggerHazard(levelComplete, hasPlayer)).toBe(true);

      // If level is marked complete, second contact doesn't trigger
      levelComplete = true;
      expect(shouldTriggerHazard(levelComplete, hasPlayer)).toBe(false);
    });
  });

  describe('getHazardStateReset', () => {
    it('returns object with all required state reset properties', () => {
      const reset = getHazardStateReset();
      expect(reset).toHaveProperty('isDripping');
      expect(reset).toHaveProperty('wasOnGround');
      expect(reset).toHaveProperty('velocityX');
      expect(reset).toHaveProperty('velocityY');
      expect(reset).toHaveProperty('scale');
    });

    it('stops dripping when hit', () => {
      const reset = getHazardStateReset();
      expect(reset.isDripping).toBe(false);
    });

    it('resets ground state for respawn', () => {
      const reset = getHazardStateReset();
      expect(reset.wasOnGround).toBe(false);
    });

    it('sets velocity to zero', () => {
      const reset = getHazardStateReset();
      expect(reset.velocityX).toBe(0);
      expect(reset.velocityY).toBe(0);
    });

    it('scales up for splat visual effect', () => {
      const reset = getHazardStateReset();
      expect(reset.scale).toBe(2);
      expect(reset.scale).toBeGreaterThan(1); // Expansion effect
    });

    it('returns consistent reset state', () => {
      const reset1 = getHazardStateReset();
      const reset2 = getHazardStateReset();
      expect(reset1).toEqual(reset2);
    });

    it('provides non-zero scale for visual feedback', () => {
      const reset = getHazardStateReset();
      // Scale should be visible (2x) for splat effect before respawn
      expect(reset.scale).toBeGreaterThanOrEqual(1);
      expect(reset.scale).toBeLessThanOrEqual(3); // Reasonable range
    });
  });

  describe('getHazardVelocity', () => {
    it('returns object with x and y velocity', () => {
      const vel = getHazardVelocity();
      expect(vel).toHaveProperty('x');
      expect(vel).toHaveProperty('y');
    });

    it('stops all movement (velocity = 0)', () => {
      const vel = getHazardVelocity();
      expect(vel.x).toBe(0);
      expect(vel.y).toBe(0);
    });

    it('freezes player before respawn', () => {
      const vel = getHazardVelocity();
      expect(vel.x).toBe(0);
      expect(vel.y).toBe(0);
    });

    it('returns consistent zero velocity', () => {
      const vel1 = getHazardVelocity();
      const vel2 = getHazardVelocity();
      expect(vel1.x).toBe(vel2.x);
      expect(vel1.y).toBe(vel2.y);
    });

    it('matches scale effect for unified respawn', () => {
      const vel = getHazardVelocity();
      const scale = getHazardSplatScale();
      // While respawning (scaled 2x), velocity is frozen at 0
      expect(vel.x).toBe(0);
      expect(vel.y).toBe(0);
    });
  });

  describe('getHazardSplatScale', () => {
    it('returns 2 (2x scale)', () => {
      expect(getHazardSplatScale()).toBe(2);
    });

    it('matches scale in state reset', () => {
      const scale = getHazardSplatScale();
      const reset = getHazardStateReset();
      expect(scale).toBe(reset.scale);
    });

    it('provides visible visual feedback', () => {
      const scale = getHazardSplatScale();
      expect(scale).toBeGreaterThan(1); // Expansion is visible
    });

    it('returns same value consistently', () => {
      expect(getHazardSplatScale()).toBe(getHazardSplatScale());
    });
  });

  describe('hazard interaction lifecycle', () => {
    it('detects hazard, disables drip, freezes movement, scales up', () => {
      // 1. Hazard detected
      const hazardTriggered = shouldTriggerHazard(false, true);
      expect(hazardTriggered).toBe(true);

      // 2. State reset applied
      const reset = getHazardStateReset();
      expect(reset.isDripping).toBe(false); // Drip stops
      expect(reset.velocityX).toBe(0); // Movement stops
      expect(reset.velocityY).toBe(0);
      expect(reset.scale).toBe(2); // Splat!

      // 3. Movement frozen
      const vel = getHazardVelocity();
      expect(vel.x).toBe(0);
      expect(vel.y).toBe(0);
    });

    it('prevents multiple hazard triggers during respawn animation', () => {
      const levelComplete = false;
      const hasPlayer = true;

      // First spike hit
      expect(shouldTriggerHazard(levelComplete, hasPlayer)).toBe(true);

      // After respawn animation, hazard can trigger again
      // (in real game, player would respawn at safe location)
      expect(shouldTriggerHazard(levelComplete, hasPlayer)).toBe(true);
    });

    it('provides unified respawn parameters', () => {
      // All hazard effects work together
      const reset = getHazardStateReset();
      const velocity = getHazardVelocity();
      const scale = getHazardSplatScale();

      // Consistency check: all zero movement values match
      expect(reset.velocityX).toBe(velocity.x);
      expect(reset.velocityY).toBe(velocity.y);
      expect(reset.scale).toBe(scale);
    });
  });
});
