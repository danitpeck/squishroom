import type { MedalTargets } from '../content/rooms'

export type MedalTier = 'none' | 'bronze' | 'silver' | 'gold'

export type RankedRun = {
  clearMs: number
  deaths: number
}

const MEDAL_RANK: Record<MedalTier, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3
}

export function getMedalForTime(clearMs: number, targets: MedalTargets): MedalTier {
  if (clearMs <= targets.goldMs) {
    return 'gold'
  }

  if (clearMs <= targets.silverMs) {
    return 'silver'
  }

  if (clearMs <= targets.bronzeMs) {
    return 'bronze'
  }

  return 'none'
}

export function compareRunForRanking(a: RankedRun, b: RankedRun): number {
  if (a.clearMs !== b.clearMs) {
    return a.clearMs - b.clearMs
  }

  return a.deaths - b.deaths
}

export function maxMedalTier(a: MedalTier, b: MedalTier): MedalTier {
  return MEDAL_RANK[a] >= MEDAL_RANK[b] ? a : b
}

export function isMedalTier(value: unknown): value is MedalTier {
  return value === 'none' || value === 'bronze' || value === 'silver' || value === 'gold'
}
