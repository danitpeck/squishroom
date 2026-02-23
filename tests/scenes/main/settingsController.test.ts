import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSfxVolume, setSfxVolume } from '../../../src/gameplay/sfx'
import type { AccessibilitySettings } from '../../../src/gameplay/accessibility'
import {
  applyAccessibilityRuntimeState,
  deriveSettingsInputOutcome,
  loadSceneAccessibilitySettings,
  persistSceneAccessibilitySettings
} from '../../../src/scenes/main/settingsController'

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

const BASE_SETTINGS: AccessibilitySettings = {
  screenShakeEnabled: true,
  highContrastEnabled: false,
  sfxVolume: 0.7
}

describe('main settings controller helpers', () => {
  beforeEach(() => {
    setSfxVolume(0.7)
  })

  it('loads fallback high contrast based on query palette when no storage values exist', () => {
    const storage = createMemoryStorage()
    const settings = loadSceneAccessibilitySettings('high-contrast', storage)
    expect(settings.highContrastEnabled).toBe(true)
    expect(settings.screenShakeEnabled).toBe(true)
    expect(settings.sfxVolume).toBe(0.7)
  })

  it('persists and reloads normalized settings', () => {
    const storage = createMemoryStorage()
    const saved = persistSceneAccessibilitySettings(storage, {
      screenShakeEnabled: false,
      highContrastEnabled: true,
      sfxVolume: 5
    })

    expect(saved).toEqual({
      screenShakeEnabled: false,
      highContrastEnabled: true,
      sfxVolume: 1
    })
    expect(loadSceneAccessibilitySettings('normal', storage)).toEqual(saved)
  })

  it('derives settings outcome with stable cue priority and contrast reload flag', () => {
    const outcome = deriveSettingsInputOutcome(BASE_SETTINGS, {
      toggleShake: true,
      toggleContrast: true,
      volumeDown: true,
      volumeUp: true
    })

    expect(outcome.changed).toBe(true)
    expect(outcome.requiresVisualReload).toBe(true)
    expect(outcome.cueFrequency).toBe(760)
    expect(outcome.nextSettings).toEqual({
      screenShakeEnabled: false,
      highContrastEnabled: true,
      sfxVolume: 0.7
    })
  })

  it('returns unchanged state when no settings action was pressed', () => {
    const outcome = deriveSettingsInputOutcome(BASE_SETTINGS, {
      toggleShake: false,
      toggleContrast: false,
      volumeDown: false,
      volumeUp: false
    })

    expect(outcome.changed).toBe(false)
    expect(outcome.requiresVisualReload).toBe(false)
    expect(outcome.nextSettings).toBe(BASE_SETTINGS)
  })

  it('applies runtime palette + sfx state and reports palette changes', () => {
    const runtime = applyAccessibilityRuntimeState(
      { ...BASE_SETTINGS, highContrastEnabled: true, sfxVolume: 0.35 },
      'normal'
    )

    expect(runtime.screenShakeEnabled).toBe(true)
    expect(runtime.renderPaletteMode).toBe('high-contrast')
    expect(runtime.paletteChanged).toBe(true)
    expect(getSfxVolume()).toBe(0.35)
  })
})
