import { describe, expect, it } from 'vitest'
import { getDeterministicDecals, getParallaxOffset } from '../src/backgroundDepth'

describe('backgroundDepth', () => {
  describe('getDeterministicDecals', () => {
    const level = [
      '########',
      '#S....E#',
      '#..^...#',
      '#......#',
      '########'
    ]

    it('returns stable decal placement for the same level input', () => {
      const decalsA = getDeterministicDecals(level, 40, 2)
      const decalsB = getDeterministicDecals(level, 40, 2)

      expect(decalsA).toEqual(decalsB)
    })

    it('changes placement when level index changes', () => {
      const decalsA = getDeterministicDecals(level, 40, 1)
      const decalsB = getDeterministicDecals(level, 40, 2)

      expect(decalsA).not.toEqual(decalsB)
    })

    it('keeps decals within room bounds', () => {
      const tileSize = 40
      const decals = getDeterministicDecals(level, tileSize, 2)
      const width = level[0].length * tileSize
      const height = level.length * tileSize

      decals.forEach((decal) => {
        expect(decal.x).toBeGreaterThanOrEqual(0)
        expect(decal.x).toBeLessThanOrEqual(width)
        expect(decal.y).toBeGreaterThanOrEqual(0)
        expect(decal.y).toBeLessThanOrEqual(height)
      })
    })

    it('caps density to keep visuals low-noise', () => {
      const largeOpenLevel = [
        '####################',
        '#..................#',
        '#..................#',
        '#..................#',
        '#..................#',
        '#..................#',
        '#..................#',
        '####################'
      ]

      const decals = getDeterministicDecals(largeOpenLevel, 40, 0)
      expect(decals.length).toBeLessThanOrEqual(Math.floor(largeOpenLevel.length * largeOpenLevel[0].length * 0.05))
    })
  })

  describe('getParallaxOffset', () => {
    it('returns zero at room center', () => {
      expect(getParallaxOffset(400, 400, 0.1, 48)).toBe(0)
    })

    it('applies scaled offset away from center', () => {
      expect(getParallaxOffset(500, 400, 0.1, 48)).toBe(10)
      expect(getParallaxOffset(300, 400, 0.1, 48)).toBe(-10)
    })

    it('clamps to maximum offset', () => {
      expect(getParallaxOffset(2000, 400, 0.2, 48)).toBe(48)
      expect(getParallaxOffset(-1200, 400, 0.2, 48)).toBe(-48)
    })
  })
})
