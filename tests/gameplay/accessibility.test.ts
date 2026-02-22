import { describe, expect, it, vi } from 'vitest'
import {
  ACCESSIBILITY_SETTINGS_STORAGE_KEY,
  clampSfxVolume,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  HIGH_CONTRAST_STORAGE_KEY,
  loadAccessibilitySettings,
  loadScreenShakeEnabled,
  parseHighContrastSetting,
  parseScreenShakeSetting,
  parseSfxVolumeSetting,
  saveAccessibilitySettings,
  saveScreenShakeEnabled,
  SCREEN_SHAKE_STORAGE_KEY,
  SFX_VOLUME_STORAGE_KEY
} from '../../src/gameplay/accessibility'

describe('accessibility settings', () => {
  it('keeps legacy screen shake parsing behavior', () => {
    expect(parseScreenShakeSetting(null)).toBe(true)
    expect(parseScreenShakeSetting('true')).toBe(true)
  })

  it('parses explicit values from storage strings', () => {
    expect(parseScreenShakeSetting('false')).toBe(false)
    expect(parseHighContrastSetting('true')).toBe(true)
    expect(parseHighContrastSetting('false')).toBe(false)
    expect(parseSfxVolumeSetting('0.3')).toBe(0.3)
  })

  it('clamps invalid sfx values', () => {
    expect(parseSfxVolumeSetting('2')).toBe(1)
    expect(parseSfxVolumeSetting('-1')).toBe(0)
    expect(parseSfxVolumeSetting('wat')).toBe(DEFAULT_ACCESSIBILITY_SETTINGS.sfxVolume)
    expect(clampSfxVolume(Number.NaN)).toBe(DEFAULT_ACCESSIBILITY_SETTINGS.sfxVolume)
  })

  it('loads defaults when storage is unavailable', () => {
    expect(loadAccessibilitySettings(undefined)).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS)
  })

  it('supports fallback defaults when no persisted values exist', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(null)
    }

    const settings = loadAccessibilitySettings(storage, {
      highContrastEnabled: true
    })

    expect(settings).toEqual({
      screenShakeEnabled: true,
      highContrastEnabled: true,
      sfxVolume: 0.7
    })
  })

  it('loads legacy keys when combined settings key is missing', () => {
    const storageValues = new Map<string, string>([
      [SCREEN_SHAKE_STORAGE_KEY, 'false'],
      [HIGH_CONTRAST_STORAGE_KEY, 'true'],
      [SFX_VOLUME_STORAGE_KEY, '0.42']
    ])
    const storage = {
      getItem: vi.fn((key: string) => storageValues.get(key) ?? null)
    }

    const settings = loadAccessibilitySettings(storage)
    expect(settings).toEqual({
      screenShakeEnabled: false,
      highContrastEnabled: true,
      sfxVolume: 0.42
    })
  })

  it('prefers combined settings and persists both combined + legacy keys', () => {
    const storageValues = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => storageValues.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storageValues.set(key, value)
      })
    }

    const saved = saveAccessibilitySettings(storage, {
      screenShakeEnabled: false,
      highContrastEnabled: true,
      sfxVolume: 1.4
    })

    expect(saved).toEqual({
      screenShakeEnabled: false,
      highContrastEnabled: true,
      sfxVolume: 1
    })
    expect(storage.setItem).toHaveBeenCalledWith(
      ACCESSIBILITY_SETTINGS_STORAGE_KEY,
      JSON.stringify(saved)
    )
    expect(storage.setItem).toHaveBeenCalledWith(SCREEN_SHAKE_STORAGE_KEY, 'false')
    expect(storage.setItem).toHaveBeenCalledWith(HIGH_CONTRAST_STORAGE_KEY, 'true')
    expect(storage.setItem).toHaveBeenCalledWith(SFX_VOLUME_STORAGE_KEY, '1')
    expect(loadAccessibilitySettings(storage)).toEqual(saved)
  })

  it('ignores malformed combined settings payloads', () => {
    const storage = {
      getItem: vi.fn((key: string) => {
        if (key === ACCESSIBILITY_SETTINGS_STORAGE_KEY) {
          return '{not-json'
        }
        return null
      })
    }

    expect(loadAccessibilitySettings(storage)).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS)
  })

  it('loads setting from storage', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue('false')
    }

    expect(loadScreenShakeEnabled(storage)).toBe(false)
    expect(storage.getItem).toHaveBeenCalledWith(SCREEN_SHAKE_STORAGE_KEY)
  })

  it('persists setting to storage', () => {
    const storage = {
      setItem: vi.fn()
    }

    saveScreenShakeEnabled(storage, true)
    saveScreenShakeEnabled(storage, false)

    expect(storage.setItem).toHaveBeenNthCalledWith(1, SCREEN_SHAKE_STORAGE_KEY, 'true')
    expect(storage.setItem).toHaveBeenNthCalledWith(2, SCREEN_SHAKE_STORAGE_KEY, 'false')
  })
})
