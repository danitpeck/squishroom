import type { AccessibilitySettings } from '../gameplay/accessibility'
import { formatDurationMs } from './shared'

export type MasteryClearPanelTextInput = {
  roomName: string
  clearMs: number
  deaths: number
  medalLabel: string
  isNewPb: boolean
  chapterComplete: boolean
  chapter: number
  packComplete: boolean
  hasNext: boolean
}

function formatAccessibilitySettingsLines(settings: AccessibilitySettings, volume: number): string[] {
  return [
    `Screen Shake: ${settings.screenShakeEnabled ? 'ON' : 'OFF'} (T)`,
    `Contrast: ${settings.highContrastEnabled ? 'HIGH' : 'NORMAL'} (C)`,
    `SFX Volume: ${Math.round(volume * 100)}% ([ / ])`
  ]
}

export function formatTitleAccessibilityText(settings: AccessibilitySettings): string {
  return formatAccessibilitySettingsLines(settings, settings.sfxVolume).join('\n')
}

export function formatInGameAccessibilityText(settings: AccessibilitySettings, volume: number): string {
  return ['Settings (ESC to close)', ...formatAccessibilitySettingsLines(settings, volume)].join('\n')
}

export function formatInGameSettingsHintText(isOpen: boolean): string {
  return isOpen
    ? 'ESC Close Settings'
    : 'ESC Settings | T Shake | C Contrast | [ / ] Volume'
}

export function formatMasteryAttemptHudText(roomId: string, elapsedMs: number, deaths: number): string {
  return `Mode: Mastery Pack\nRoom: ${roomId}\nTimer: ${formatDurationMs(elapsedMs)}\nDeaths: ${deaths}`
}

export function formatMasteryClearPanelText(input: MasteryClearPanelTextInput): string {
  const actionHint = input.hasNext
    ? 'N / Enter / Space: Next   R: Retry   B: Back'
    : 'Enter / Space: Finish   R: Retry   B: Back'
  return [
    `${input.roomName} Cleared`,
    `Time: ${formatDurationMs(input.clearMs)}`,
    `Deaths: ${input.deaths}`,
    `Medal: ${input.medalLabel}${input.isNewPb ? '   (New PB)' : ''}`,
    '',
    input.chapterComplete ? `Chapter ${input.chapter} complete` : '',
    input.packComplete ? 'Mastery Pack complete' : '',
    '',
    actionHint
  ]
    .filter((line) => line.length > 0)
    .join('\n')
}
