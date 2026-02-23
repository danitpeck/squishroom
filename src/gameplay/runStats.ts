import type { CampaignId, RoomId } from '../content/rooms'
import { compareRunForRanking, isMedalTier, maxMedalTier, type MedalTier } from './medals'

export const RUN_STATS_STORAGE_KEY = 'squishroom.runStats.v1'

export type RoomBest = {
  bestMs: number
  fewestDeaths: number
  bestMedal: MedalTier
  clears: number
}

export type CampaignStats = {
  rooms: Record<RoomId, RoomBest>
  totalPlayMs: number
}

export type StatsSaveV1 = {
  version: 1
  campaigns: Record<CampaignId, CampaignStats>
  updatedAtIso: string
}

export type RoomResult = {
  clearMs: number
  deaths: number
  medal: MedalTier
}

function createEmptyCampaignStats(): CampaignStats {
  return {
    rooms: {},
    totalPlayMs: 0
  }
}

function createDefaultStats(nowIso = new Date().toISOString()): StatsSaveV1 {
  return {
    version: 1,
    campaigns: {
      core: createEmptyCampaignStats(),
      mastery_v13: createEmptyCampaignStats()
    },
    updatedAtIso: nowIso
  }
}

function clampNonNegativeNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0
  }

  return value
}

function clampNonNegativeInteger(value: unknown): number {
  return Math.floor(clampNonNegativeNumber(value))
}

function normalizeRoomBest(value: unknown): RoomBest | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const record = value as Partial<RoomBest>
  const bestMs = clampNonNegativeNumber(record.bestMs)
  const fewestDeaths = clampNonNegativeInteger(record.fewestDeaths)
  const clears = clampNonNegativeInteger(record.clears)
  const bestMedal = isMedalTier(record.bestMedal) ? record.bestMedal : 'none'

  if (bestMs <= 0 || clears <= 0) {
    return undefined
  }

  return {
    bestMs,
    fewestDeaths,
    clears,
    bestMedal
  }
}

function normalizeCampaignStats(value: unknown): CampaignStats {
  if (!value || typeof value !== 'object') {
    return createEmptyCampaignStats()
  }

  const record = value as Partial<CampaignStats>
  const normalizedRooms: Record<RoomId, RoomBest> = {}

  if (record.rooms && typeof record.rooms === 'object') {
    Object.entries(record.rooms).forEach(([roomId, roomValue]) => {
      const normalized = normalizeRoomBest(roomValue)
      if (normalized) {
        normalizedRooms[roomId] = normalized
      }
    })
  }

  return {
    rooms: normalizedRooms,
    totalPlayMs: clampNonNegativeNumber(record.totalPlayMs)
  }
}

function normalizeStats(value: unknown): StatsSaveV1 {
  if (!value || typeof value !== 'object') {
    return createDefaultStats()
  }

  const parsed = value as Partial<StatsSaveV1>
  const campaigns = parsed.campaigns && typeof parsed.campaigns === 'object' ? parsed.campaigns : undefined
  const updatedAtIso = typeof parsed.updatedAtIso === 'string' ? parsed.updatedAtIso : new Date().toISOString()

  return {
    version: 1,
    campaigns: {
      core: normalizeCampaignStats(campaigns?.core),
      mastery_v13: normalizeCampaignStats(campaigns?.mastery_v13)
    },
    updatedAtIso
  }
}

function persistStats(storage: Pick<Storage, 'setItem'> | undefined, stats: StatsSaveV1): void {
  storage?.setItem(RUN_STATS_STORAGE_KEY, JSON.stringify(stats))
}

export function loadStats(storage: Pick<Storage, 'getItem'> | undefined): StatsSaveV1 {
  if (!storage) {
    return createDefaultStats()
  }

  const raw = storage.getItem(RUN_STATS_STORAGE_KEY)
  if (!raw) {
    return createDefaultStats()
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    return normalizeStats(parsed)
  } catch {
    return createDefaultStats()
  }
}

export function saveRoomResult(
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined,
  campaignId: CampaignId,
  roomId: RoomId,
  result: RoomResult
): StatsSaveV1 {
  const current = loadStats(storage)
  const campaign = current.campaigns[campaignId]
  const existing = campaign.rooms[roomId]
  const currentRun = {
    clearMs: clampNonNegativeNumber(result.clearMs),
    deaths: clampNonNegativeInteger(result.deaths)
  }

  const isNewBest =
    !existing ||
    compareRunForRanking(currentRun, { clearMs: existing.bestMs, deaths: existing.fewestDeaths }) < 0

  const nextBest: RoomBest = {
    bestMs: isNewBest ? currentRun.clearMs : existing?.bestMs ?? currentRun.clearMs,
    fewestDeaths: isNewBest ? currentRun.deaths : existing?.fewestDeaths ?? currentRun.deaths,
    bestMedal: maxMedalTier(existing?.bestMedal ?? 'none', result.medal),
    clears: (existing?.clears ?? 0) + 1
  }

  const next: StatsSaveV1 = {
    version: 1,
    campaigns: {
      ...current.campaigns,
      [campaignId]: {
        ...campaign,
        rooms: {
          ...campaign.rooms,
          [roomId]: nextBest
        },
        totalPlayMs: campaign.totalPlayMs + currentRun.clearMs
      }
    },
    updatedAtIso: new Date().toISOString()
  }

  persistStats(storage, next)
  return next
}

export function resetCampaignStats(
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined,
  campaignId: CampaignId
): void {
  const current = loadStats(storage)
  const next: StatsSaveV1 = {
    ...current,
    campaigns: {
      ...current.campaigns,
      [campaignId]: createEmptyCampaignStats()
    },
    updatedAtIso: new Date().toISOString()
  }

  persistStats(storage, next)
}
