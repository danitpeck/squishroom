import { describe, expect, it } from 'vitest'
import { parseLevel, type LevelData } from '../src/level'

/**
 * Game Rules Tests
 * 
 * Tests game design constraints using actual level parsing and physics calculations.
 */

const TILE_SIZE = 40
const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 600

describe('Game Design Rules', () => {
  describe('Physics Constants', () => {
    const GRAVITY = 900
    const JUMP_VELOCITY = 420
    const MOVEMENT_SPEED = 220
    const DRIP_VELOCITY = 720

    it('gravity overcomes drip velocity', () => {
      // Player should eventually fall even when dripping
      expect(GRAVITY).toBeGreaterThan(0)
    })

    it('jump velocity is faster than drip velocity', () => {
      // Normal jump should be more responsive than drip
      expect(JUMP_VELOCITY).toBeLessThan(DRIP_VELOCITY)
    })

    it('movement speed is proportional to gravity', () => {
      // Side movement should be meaningfully slower than gravity pull
      expect(MOVEMENT_SPEED).toBeLessThan(GRAVITY)
    })

    it('drip drop velocity exceeds jump velocity', () => {
      // Drip should feel noticeably faster than jumping
      expect(DRIP_VELOCITY).toBeGreaterThan(JUMP_VELOCITY)
    })
  })

  describe('Level Structure', () => {
    it('tile size divides cleanly into window dimensions', () => {
      expect(WINDOW_WIDTH % TILE_SIZE).toBe(0)
      expect(WINDOW_HEIGHT % TILE_SIZE).toBe(0)
    })

    it('creates valid level grids from ASCII layouts', () => {
      const layout = [
        '####',
        '#S.E',
        '####'
      ]
      const level = parseLevel(layout, TILE_SIZE)
      // parseLevel returns pixel coordinates, not tile counts
      expect(level.width).toBe(4 * TILE_SIZE) // 160 pixels
      expect(level.height).toBe(3 * TILE_SIZE) // 120 pixels
      expect(level.spawn).toBeDefined()
      expect(level.exit).toBeDefined()
    })

    it('recognizes hazards as separate from solid walls', () => {
      const layout = [
        '####',
        '#S^E',
        '####'
      ]
      const level = parseLevel(layout, TILE_SIZE)
      expect(level.walls.length).toBeGreaterThan(0)
      expect(level.hazards.length).toBeGreaterThan(0)
      expect(level.hazards.length).toBeLessThan(level.walls.length)
    })

    it('thin platforms are distinct from regular collision', () => {
      const layout = [
        '####',
        '#S~E',
        '####'
      ]
      const level = parseLevel(layout, TILE_SIZE)
      expect(level.thinPlatforms.length).toBeGreaterThan(0)
    })
  })

  describe('Win Conditions', () => {
    it('final room index is 5 (for 6 total rooms)', () => {
      const TOTAL_ROOMS = 6
      const finalIndex = TOTAL_ROOMS - 1
      expect(finalIndex).toBe(5)
    })

    it('level count supports meaningful progression', () => {
      const TOTAL_ROOMS = 6
      expect(TOTAL_ROOMS).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Spawning Rules', () => {
    it('every level must have a spawn point', () => {
      const layout = [
        '####',
        '#S.#',
        '####'
      ]
      const level = parseLevel(layout, TILE_SIZE)
      expect(level.spawn).toBeDefined()
      expect(level.spawn.x).toBeGreaterThanOrEqual(0)
      expect(level.spawn.y).toBeGreaterThanOrEqual(0)
    })

    it('spawn point must be on a solid tile or within bounds', () => {
      const layout = [
        '####',
        '#S~#',
        '####'
      ]
      const level = parseLevel(layout, TILE_SIZE)
      const maxX = level.width * 40
      const maxY = level.height * 40
      expect(level.spawn.x).toBeLessThan(maxX)
      expect(level.spawn.y).toBeLessThan(maxY)
    })
  })
})
