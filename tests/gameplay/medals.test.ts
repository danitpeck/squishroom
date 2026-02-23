import { describe, expect, it } from 'vitest'
import { compareRunForRanking, getMedalForTime, maxMedalTier } from '../../src/gameplay/medals'

describe('medals', () => {
  const targets = {
    bronzeMs: 55_000,
    silverMs: 40_000,
    goldMs: 28_000
  }

  it('classifies medal boundaries inclusively', () => {
    expect(getMedalForTime(28_000, targets)).toBe('gold')
    expect(getMedalForTime(40_000, targets)).toBe('silver')
    expect(getMedalForTime(55_000, targets)).toBe('bronze')
  })

  it('returns none when slower than bronze', () => {
    expect(getMedalForTime(55_001, targets)).toBe('none')
  })

  it('ranks runs by time first, deaths second', () => {
    expect(compareRunForRanking({ clearMs: 20_000, deaths: 2 }, { clearMs: 21_000, deaths: 0 })).toBeLessThan(0)
    expect(compareRunForRanking({ clearMs: 20_000, deaths: 1 }, { clearMs: 20_000, deaths: 3 })).toBeLessThan(0)
    expect(compareRunForRanking({ clearMs: 20_000, deaths: 3 }, { clearMs: 20_000, deaths: 1 })).toBeGreaterThan(0)
  })

  it('keeps the higher medal tier when merging progress', () => {
    expect(maxMedalTier('none', 'bronze')).toBe('bronze')
    expect(maxMedalTier('silver', 'bronze')).toBe('silver')
    expect(maxMedalTier('gold', 'silver')).toBe('gold')
  })
})
