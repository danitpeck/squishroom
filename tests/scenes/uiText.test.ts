import { describe, expect, it } from 'vitest'
import type { AccessibilitySettings } from '../../src/gameplay/accessibility'
import {
  formatInGameAccessibilityText,
  formatInGameSettingsHintText,
  formatMasteryAttemptHudText,
  formatMasteryClearPanelText,
  formatTitleAccessibilityText
} from '../../src/scenes/uiText'

const BASE_SETTINGS: AccessibilitySettings = {
  screenShakeEnabled: true,
  highContrastEnabled: false,
  sfxVolume: 0.7
}

describe('scene ui text helpers', () => {
  it('formats title settings summary text', () => {
    expect(formatTitleAccessibilityText(BASE_SETTINGS)).toBe(
      ['Screen Shake: ON (T)', 'Contrast: NORMAL (C)', 'SFX Volume: 70% ([ / ])'].join('\n')
    )
  })

  it('formats in-game settings text with header', () => {
    expect(formatInGameAccessibilityText(BASE_SETTINGS, 0.55)).toBe(
      ['Settings (ESC to close)', 'Screen Shake: ON (T)', 'Contrast: NORMAL (C)', 'SFX Volume: 55% ([ / ])'].join(
        '\n'
      )
    )
  })

  it('formats settings hint by panel visibility state', () => {
    expect(formatInGameSettingsHintText(true)).toBe('ESC Close Settings')
    expect(formatInGameSettingsHintText(false)).toBe('ESC Settings | T Shake | C Contrast | [ / ] Volume')
  })

  it('formats mastery attempt hud text', () => {
    expect(formatMasteryAttemptHudText('M2-01', 74_321, 2)).toBe(
      ['Mode: Mastery Pack', 'Room: M2-01', 'Timer: 01:14.32', 'Deaths: 2'].join('\n')
    )
  })

  it('formats mastery clear panel text for next-room flow', () => {
    expect(
      formatMasteryClearPanelText({
        roomName: 'M1-01 Soft Steps',
        clearMs: 28_000,
        deaths: 1,
        medalLabel: 'Gold',
        isNewPb: true,
        chapterComplete: false,
        chapter: 1,
        packComplete: false,
        hasNext: true
      })
    ).toContain('N / Enter / Space: Next   R: Retry   B: Back')
  })

  it('formats mastery clear panel text for pack completion', () => {
    const output = formatMasteryClearPanelText({
      roomName: 'M3-04 Final Squeeze',
      clearMs: 78_900,
      deaths: 0,
      medalLabel: 'Gold',
      isNewPb: false,
      chapterComplete: true,
      chapter: 3,
      packComplete: true,
      hasNext: false
    })

    expect(output).toContain('Chapter 3 complete')
    expect(output).toContain('Mastery Pack complete')
    expect(output).toContain('Enter / Space: Finish   R: Retry   B: Back')
  })
})
