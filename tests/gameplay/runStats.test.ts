import { describe, expect, it, vi } from 'vitest'
import { loadStats, resetCampaignStats, RUN_STATS_STORAGE_KEY, saveRoomResult } from '../../src/gameplay/runStats'

type MemoryStorage = {
  getItem: ReturnType<typeof vi.fn<(key: string) => string | null>>
  setItem: ReturnType<typeof vi.fn<(key: string, value: string) => void>>
}

function createMemoryStorage(seed: Record<string, string> = {}): MemoryStorage {
  const store = new Map<string, string>(Object.entries(seed))
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    })
  }
}

describe('runStats', () => {
  it('returns default schema when storage is empty', () => {
    const storage = createMemoryStorage()
    const stats = loadStats(storage)
    expect(stats.version).toBe(1)
    expect(stats.campaigns.core.totalPlayMs).toBe(0)
    expect(stats.campaigns.mastery_v13.totalPlayMs).toBe(0)
  })

  it('falls back safely when stored payload is malformed', () => {
    const storage = createMemoryStorage({
      [RUN_STATS_STORAGE_KEY]: '{broken-json'
    })
    const stats = loadStats(storage)
    expect(stats.version).toBe(1)
    expect(stats.campaigns.mastery_v13.rooms).toEqual({})
  })

  it('persists room results and only replaces PB when improved', () => {
    const storage = createMemoryStorage()
    saveRoomResult(storage, 'mastery_v13', 'M1-01', {
      clearMs: 45_000,
      deaths: 3,
      medal: 'silver'
    })

    const afterFirst = loadStats(storage)
    expect(afterFirst.campaigns.mastery_v13.rooms['M1-01']).toEqual({
      bestMs: 45_000,
      fewestDeaths: 3,
      bestMedal: 'silver',
      clears: 1
    })

    saveRoomResult(storage, 'mastery_v13', 'M1-01', {
      clearMs: 50_000,
      deaths: 1,
      medal: 'bronze'
    })

    const afterSlower = loadStats(storage)
    expect(afterSlower.campaigns.mastery_v13.rooms['M1-01']).toEqual({
      bestMs: 45_000,
      fewestDeaths: 3,
      bestMedal: 'silver',
      clears: 2
    })

    saveRoomResult(storage, 'mastery_v13', 'M1-01', {
      clearMs: 44_500,
      deaths: 2,
      medal: 'gold'
    })

    const afterImproved = loadStats(storage)
    expect(afterImproved.campaigns.mastery_v13.rooms['M1-01']).toEqual({
      bestMs: 44_500,
      fewestDeaths: 2,
      bestMedal: 'gold',
      clears: 3
    })
  })

  it('supports campaign-level reset', () => {
    const storage = createMemoryStorage()
    saveRoomResult(storage, 'mastery_v13', 'M1-01', {
      clearMs: 40_000,
      deaths: 0,
      medal: 'gold'
    })
    saveRoomResult(storage, 'core', 'C-01', {
      clearMs: 70_000,
      deaths: 4,
      medal: 'none'
    })

    resetCampaignStats(storage, 'mastery_v13')
    const next = loadStats(storage)
    expect(next.campaigns.mastery_v13.rooms).toEqual({})
    expect(next.campaigns.mastery_v13.totalPlayMs).toBe(0)
    expect(next.campaigns.core.rooms['C-01']).toBeDefined()
  })
})
