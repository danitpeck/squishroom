import { describe, expect, it } from 'vitest'
import { parseLevel } from '../src/level'
import { getDripVelocity } from '../src/gameplay/dripInput'
import { getJumpVelocity } from '../src/gameplay/jumpInput'
import { shouldThinPlatformCollide } from '../src/gameplay/thinPlatform'

const TILE_SIZE = 40

describe('game rules: executable behavior', () => {
  describe('physics tuning relationships', () => {
    it('keeps drip drop faster than jump launch magnitude', () => {
      expect(getDripVelocity()).toBeGreaterThan(Math.abs(getJumpVelocity()))
    })
  })

  describe('parseLevel contracts', () => {
    it('builds walls, spawn, exit, thin platforms and hazards from glyphs', () => {
      const level = parseLevel(
        [
          '#####',
          '#S~E#',
          '#.^.#',
          '#####'
        ],
        TILE_SIZE
      )

      expect(level.width).toBe(5 * TILE_SIZE)
      expect(level.height).toBe(4 * TILE_SIZE)
      expect(level.spawn).toEqual({ x: 60, y: 60 })
      expect(level.exit).toEqual({ x: 140, y: 60 })
      expect(level.thinPlatforms).toEqual([{ x: 100, y: 60 }])
      expect(level.hazards).toEqual([{ x: 100, y: 100 }])
      expect(level.walls.length).toBeGreaterThan(0)
    })

    it('uses the last spawn and exit marker when multiples exist', () => {
      const level = parseLevel(
        [
          'S..E',
          '.S.E'
        ],
        TILE_SIZE
      )

      expect(level.spawn).toEqual({ x: 60, y: 60 })
      expect(level.exit).toEqual({ x: 140, y: 60 })
    })

    it('ignores unknown glyphs without throwing', () => {
      const level = parseLevel(
        [
          'S?X',
          '.E.'
        ],
        TILE_SIZE
      )

      expect(level.walls).toEqual([])
      expect(level.hazards).toEqual([])
      expect(level.thinPlatforms).toEqual([])
      expect(level.exit).toEqual({ x: 60, y: 60 })
    })
  })

  describe('thin platform collision matrix', () => {
    it('collides while falling from above', () => {
      expect(shouldThinPlatformCollide(false, 108, 100, 40)).toBe(true)
    })

    it('passes through while moving upward', () => {
      expect(shouldThinPlatformCollide(false, 108, 100, -10)).toBe(false)
    })

    it('always passes through while dripping', () => {
      expect(shouldThinPlatformCollide(true, 108, 100, 40)).toBe(false)
    })
  })
})
