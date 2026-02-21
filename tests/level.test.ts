import { describe, expect, it } from 'vitest'
import { parseLevel } from '../src/level'

describe('parseLevel', () => {
  it('captures spawn, exit, and wall positions', () => {
    const level = ['S.#', '.E~', '.^.']
    const tileSize = 10

    const result = parseLevel(level, tileSize)

    expect(result.width).toBe(30)
    expect(result.height).toBe(30)
    expect(result.spawn).toEqual({ x: 5, y: 5 })
    expect(result.exit).toEqual({ x: 15, y: 15 })
    expect(result.walls).toEqual([{ x: 25, y: 5 }])
    expect(result.thinPlatforms).toEqual([{ x: 25, y: 15 }])
    expect(result.hazards).toEqual([{ x: 15, y: 25 }])
  })

  it('handles empty levels', () => {
    const level = ['...', '...', '...']
    const tileSize = 20

    const result = parseLevel(level, tileSize)

    expect(result.width).toBe(60)
    expect(result.height).toBe(60)
    expect(result.walls).toEqual([])
    expect(result.thinPlatforms).toEqual([])
    expect(result.hazards).toEqual([])
  })

  it('handles multiple walls, platforms, and hazards', () => {
    const level = ['##', '~~', '^^']
    const tileSize = 10

    const result = parseLevel(level, tileSize)

    expect(result.walls).toHaveLength(2)
    expect(result.thinPlatforms).toHaveLength(2)
    expect(result.hazards).toHaveLength(2)
  })

  it('defaults spawn if no S marker', () => {
    const level = ['.E.']
    const tileSize = 10

    const result = parseLevel(level, tileSize)

    expect(result.spawn).toEqual({ x: 5, y: 5 })
  })

  it('has no exit if missing E marker', () => {
    const level = ['S..']
    const tileSize = 10

    const result = parseLevel(level, tileSize)

    expect(result.exit).toBeUndefined()
  })
})
