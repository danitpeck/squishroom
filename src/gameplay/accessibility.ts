export const SCREEN_SHAKE_STORAGE_KEY = 'squishroom.screenShakeEnabled'
export const HIGH_CONTRAST_STORAGE_KEY = 'squishroom.highContrastEnabled'
export const SFX_VOLUME_STORAGE_KEY = 'squishroom.sfxVolume'
export const ACCESSIBILITY_SETTINGS_STORAGE_KEY = 'squishroom.accessibilitySettings'

export type AccessibilitySettings = {
  screenShakeEnabled: boolean
  highContrastEnabled: boolean
  sfxVolume: number
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  screenShakeEnabled: true,
  highContrastEnabled: false,
  sfxVolume: 0.7
}

export function parseScreenShakeSetting(value: string | null): boolean {
  if (value === 'false') {
    return false
  }

  return true
}

export function parseHighContrastSetting(value: string | null): boolean {
  return value === 'true'
}

export function clampSfxVolume(value: number, fallback = DEFAULT_ACCESSIBILITY_SETTINGS.sfxVolume): number {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, Math.min(1, value))
}

export function parseSfxVolumeSetting(value: string | null): number {
  if (value === null) {
    return DEFAULT_ACCESSIBILITY_SETTINGS.sfxVolume
  }

  const parsed = Number.parseFloat(value)
  return clampSfxVolume(parsed)
}

function parseSettingsRecord(raw: string | null): Partial<AccessibilitySettings> {
  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings> | null
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return parsed
  } catch {
    return {}
  }
}

function normalizeAccessibilitySettings(settings: Partial<AccessibilitySettings>): AccessibilitySettings {
  return {
    screenShakeEnabled:
      typeof settings.screenShakeEnabled === 'boolean'
        ? settings.screenShakeEnabled
        : DEFAULT_ACCESSIBILITY_SETTINGS.screenShakeEnabled,
    highContrastEnabled:
      typeof settings.highContrastEnabled === 'boolean'
        ? settings.highContrastEnabled
        : DEFAULT_ACCESSIBILITY_SETTINGS.highContrastEnabled,
    sfxVolume:
      typeof settings.sfxVolume === 'number'
        ? clampSfxVolume(settings.sfxVolume)
        : DEFAULT_ACCESSIBILITY_SETTINGS.sfxVolume
  }
}

export function loadAccessibilitySettings(
  storage: Pick<Storage, 'getItem'> | undefined,
  fallback: Partial<AccessibilitySettings> = {}
): AccessibilitySettings {
  const fallbackSettings = normalizeAccessibilitySettings({
    screenShakeEnabled: fallback.screenShakeEnabled,
    highContrastEnabled: fallback.highContrastEnabled,
    sfxVolume: fallback.sfxVolume
  })

  if (!storage) {
    return fallbackSettings
  }

  const combined = parseSettingsRecord(storage.getItem(ACCESSIBILITY_SETTINGS_STORAGE_KEY))
  const legacyShake = storage.getItem(SCREEN_SHAKE_STORAGE_KEY)
  const legacyContrast = storage.getItem(HIGH_CONTRAST_STORAGE_KEY)
  const legacyVolume = storage.getItem(SFX_VOLUME_STORAGE_KEY)
  const merged = normalizeAccessibilitySettings({
    screenShakeEnabled:
      combined.screenShakeEnabled ??
      (legacyShake === null ? fallbackSettings.screenShakeEnabled : parseScreenShakeSetting(legacyShake)),
    highContrastEnabled:
      combined.highContrastEnabled ??
      (legacyContrast === null ? fallbackSettings.highContrastEnabled : parseHighContrastSetting(legacyContrast)),
    sfxVolume: combined.sfxVolume ?? (legacyVolume === null ? fallbackSettings.sfxVolume : parseSfxVolumeSetting(legacyVolume))
  })

  return merged
}

export function saveAccessibilitySettings(
  storage: Pick<Storage, 'setItem'> | undefined,
  settings: AccessibilitySettings
): AccessibilitySettings {
  const normalized = normalizeAccessibilitySettings(settings)
  storage?.setItem(ACCESSIBILITY_SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
  storage?.setItem(SCREEN_SHAKE_STORAGE_KEY, String(normalized.screenShakeEnabled))
  storage?.setItem(HIGH_CONTRAST_STORAGE_KEY, String(normalized.highContrastEnabled))
  storage?.setItem(SFX_VOLUME_STORAGE_KEY, String(normalized.sfxVolume))
  return normalized
}

export function loadScreenShakeEnabled(storage: Pick<Storage, 'getItem'> | undefined): boolean {
  return loadAccessibilitySettings(storage).screenShakeEnabled
}

export function saveScreenShakeEnabled(
  storage: Pick<Storage, 'setItem'> | undefined,
  enabled: boolean
): void {
  storage?.setItem(SCREEN_SHAKE_STORAGE_KEY, String(enabled))
}
