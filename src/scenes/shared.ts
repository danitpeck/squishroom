import type { CampaignId } from '../content/rooms'
import type { MedalTier } from '../gameplay/medals'

export const PLAYER_SCALE = 2
export const BASE_PLAYER_SCALE = 2
export const BASE_TILE_SIZE = 40
export const WORLD_SCALE = PLAYER_SCALE / BASE_PLAYER_SCALE
export const TILE_SIZE = Math.round(BASE_TILE_SIZE * WORLD_SCALE)

export type TitleMode = 'core' | 'mastery' | 'stats'

export type MainSceneData = {
  campaignId?: CampaignId
  roomIndex?: number
}

export type ClearPanelResult = {
  roomName: string
  clearMs: number
  deaths: number
  medal: MedalTier
  isNewPb: boolean
  chapterComplete: boolean
  packComplete: boolean
}

export const TITLE_MODE_OPTIONS: { id: TitleMode; label: string; description: string }[] = [
  { id: 'core', label: 'Core Run', description: 'Original campaign' },
  { id: 'mastery', label: 'Mastery Pack', description: 'v1.3 ladder rooms' },
  { id: 'stats', label: 'Stats', description: 'Best times and medals' }
]

export function formatDurationMs(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms))
  const minutes = Math.floor(safeMs / 60_000)
  const seconds = Math.floor((safeMs % 60_000) / 1000)
  const centiseconds = Math.floor((safeMs % 1000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

export function getMedalLabel(medal: MedalTier): string {
  if (medal === 'gold') return 'Gold'
  if (medal === 'silver') return 'Silver'
  if (medal === 'bronze') return 'Bronze'
  return 'None'
}
