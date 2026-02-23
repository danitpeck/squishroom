import { describe, expect, it } from 'vitest'
import { CAMPAIGNS, MASTERY_V13_ROOMS } from '../../src/content/rooms'

const VALID_GLYPHS = new Set(['#', '.', 'S', 'E', '~', '^'])

function countGlyph(room: string[], glyph: string): number {
  return room.reduce((total, row) => {
    return total + Array.from(row).filter((cell) => cell === glyph).length
  }, 0)
}

describe('room registry', () => {
  it('exposes both campaigns', () => {
    expect(CAMPAIGNS.core.length).toBeGreaterThan(0)
    expect(CAMPAIGNS.mastery_v13.length).toBe(12)
  })

  it('ensures mastery rooms are valid ASCII maps', () => {
    MASTERY_V13_ROOMS.forEach((room) => {
      expect(room.grid.length).toBe(15)
      room.grid.forEach((row) => {
        expect(row.length).toBe(20)
        Array.from(row).forEach((glyph) => {
          expect(VALID_GLYPHS.has(glyph)).toBe(true)
        })
      })

      expect(countGlyph(room.grid, 'S')).toBe(1)
      expect(countGlyph(room.grid, 'E')).toBe(1)
      expect(room.medalTargets).toBeDefined()
      expect(room.medalTargets!.goldMs).toBeLessThan(room.medalTargets!.silverMs)
      expect(room.medalTargets!.silverMs).toBeLessThan(room.medalTargets!.bronzeMs)
    })
  })
})
