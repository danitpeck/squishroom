import { describe, it, expect } from 'vitest';
import {
  getNextAnimationKey,
  shouldChangeAnimation,
} from '../../src/gameplay/animationState';

describe('animationState', () => {
  describe('getNextAnimationKey', () => {
    describe('land animation priority', () => {
      it('returns "land" when just landed', () => {
        const result = getNextAnimationKey(
          'jump',           // currentAnimKey
          true,             // isAnimPlaying
          true,             // isOnGround
          false,            // isMoving
          0,                // velocityY
          true              // justLanded
        );
        expect(result).toBe('land');
      });

      it('maintains "land" animation when it\'s still playing', () => {
        const result = getNextAnimationKey(
          'land',           // currentAnimKey
          true,             // isAnimPlaying (land is playing)
          true,             // isOnGround
          false,            // isMoving
          0,                // velocityY
          false             // justLanded
        );
        expect(result).toBe('land');
      });

      it('doesn\'t interrupt land with other animations', () => {
        const result = getNextAnimationKey(
          'land',           // currentAnimKey
          true,             // isAnimPlaying
          true,             // isOnGround
          true,             // isMoving (would normally be "run")
          0,                // velocityY
          false             // justLanded
        );
        expect(result).toBe('land'); // Land not interrupted
      });
    });

    describe('airborne animations (not on ground)', () => {
      it('returns "fall" when falling (velocityY > 0)', () => {
        const result = getNextAnimationKey(
          'jump',           // currentAnimKey
          true,             // isAnimPlaying
          false,            // isOnGround
          false,            // isMoving
          100,              // velocityY (falling)
          false             // justLanded
        );
        expect(result).toBe('fall');
      });

      it('returns "fall" when falling at high speed', () => {
        const result = getNextAnimationKey(
          'jump',
          true,
          false,
          false,
          500,              // velocityY (fast fall)
          false
        );
        expect(result).toBe('fall');
      });

      it('returns "jump" when moving upward (velocityY < 0)', () => {
        const result = getNextAnimationKey(
          'fall',           // currentAnimKey
          true,             // isAnimPlaying
          false,            // isOnGround
          false,            // isMoving
          -200,             // velocityY (moving up)
          false             // justLanded
        );
        expect(result).toBe('jump');
      });

      it('returns "jump" when moving upward at high speed', () => {
        const result = getNextAnimationKey(
          'fall',
          true,
          false,
          false,
          -420,             // velocityY (strong upward)
          false
        );
        expect(result).toBe('jump');
      });

      it('defaults to "jump" when airborne but stationary (edge case)', () => {
        const result = getNextAnimationKey(
          'fall',
          true,
          false,
          false,
          0,                // velocityY (stationary in air - rare)
          false
        );
        expect(result).toBe('jump');
      });

      it('handles minimal upward velocity', () => {
        const result = getNextAnimationKey(
          'fall',
          true,
          false,
          false,
          -0.1,             // velocityY (barely moving up)
          false
        );
        expect(result).toBe('jump');
      });

      it('handles minimal downward velocity', () => {
        const result = getNextAnimationKey(
          'jump',
          true,
          false,
          false,
          0.1,              // velocityY (barely moving down)
          false
        );
        expect(result).toBe('fall');
      });
    });

    describe('grounded animations (on ground)', () => {
      it('returns "run" when on ground and moving', () => {
        const result = getNextAnimationKey(
          'idle',           // currentAnimKey
          true,             // isAnimPlaying
          true,             // isOnGround
          true,             // isMoving
          0,                // velocityY
          false             // justLanded
        );
        expect(result).toBe('run');
      });

      it('returns "idle" when on ground and stationary', () => {
        const result = getNextAnimationKey(
          'run',            // currentAnimKey
          true,             // isAnimPlaying
          true,             // isOnGround
          false,            // isMoving
          0,                // velocityY
          false             // justLanded
        );
        expect(result).toBe('idle');
      });

      it('returns "run" even while jumping (if on ground)', () => {
        const result = getNextAnimationKey(
          'jump',
          true,
          true,             // isOnGround
          true,             // isMoving
          -420,             // velocityY
          false
        );
        expect(result).toBe('run');
      });

      it('ignores velocity when on ground', () => {
        const result = getNextAnimationKey(
          'idle',
          true,
          true,             // isOnGround
          false,            // isMoving
          -300,             // velocityY (shouldn't matter)
          false
        );
        expect(result).toBe('idle');
      });
    });

    describe('state transitions', () => {
      it('transitions from jump to fall when velocity changes', () => {
        // Jump phase
        const jumpAnim = getNextAnimationKey(
          'jump', true, false, false, -100, false
        );
        expect(jumpAnim).toBe('jump');

        // Fall phase
        const fallAnim = getNextAnimationKey(
          jumpAnim, true, false, false, 50, false
        );
        expect(fallAnim).toBe('fall');
      });

      it('transitions from fall to land when landing', () => {
        const result = getNextAnimationKey(
          'fall', true, true, false, 0, true
        );
        expect(result).toBe('land');
      });

      it('transitions from run to idle when stopping', () => {
        const result = getNextAnimationKey(
          'run', true, true, false, 0, false
        );
        expect(result).toBe('idle');
      });

      it('transitions from idle to run when starting movement', () => {
        const result = getNextAnimationKey(
          'idle', true, true, true, 0, false
        );
        expect(result).toBe('run');
      });
    });

    describe('animation playing state', () => {
      it('ignores isAnimPlaying except for land animation', () => {
        const resultPlaying = getNextAnimationKey(
          'jump', true, true, true, 100, false
        );
        const resultNotPlaying = getNextAnimationKey(
          'jump', false, true, true, 100, false
        );
        expect(resultPlaying).toBe(resultNotPlaying); // Both should be "run"
      });
    });
  });

  describe('shouldChangeAnimation', () => {
    it('returns true when animation key changes', () => {
      expect(shouldChangeAnimation('idle', 'run')).toBe(true);
    });

    it('returns true when changing from jump to fall', () => {
      expect(shouldChangeAnimation('jump', 'fall')).toBe(true);
    });

    it('returns false when animation stays the same', () => {
      expect(shouldChangeAnimation('idle', 'idle')).toBe(false);
    });

    it('returns false when both are undefined', () => {
      expect(shouldChangeAnimation(undefined, undefined)).toBe(false);
    });

    it('returns true when changing from undefined to animation', () => {
      expect(shouldChangeAnimation(undefined, 'idle')).toBe(true);
    });

    it('returns true when changing from animation to undefined', () => {
      expect(shouldChangeAnimation('idle', undefined as any)).toBe(true);
    });

    it('handles all valid animation transitions', () => {
      const anim = ['idle', 'run', 'jump', 'fall', 'land'];
      anim.forEach(from => {
        anim.forEach(to => {
          const result = shouldChangeAnimation(from, to);
          expect(result).toBe(from !== to);
        });
      });
    });
  });
});
