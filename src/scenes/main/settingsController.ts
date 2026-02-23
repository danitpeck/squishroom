import type Phaser from 'phaser'
import {
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  type AccessibilitySettings
} from '../../gameplay/accessibility'
import { stepSfxVolume, toggleEnabled } from '../../gameplay/accessibilityControls'
import { getSfxVolume, setSfxVolume } from '../../gameplay/sfx'
import { getPaletteModeForAccessibility, type RenderPaletteMode } from '../../renderSkin'
import { formatInGameAccessibilityText, formatInGameSettingsHintText } from '../uiText'

export type InGameSettingsKeys = {
  toggleShake: Phaser.Input.Keyboard.Key
  toggleContrast: Phaser.Input.Keyboard.Key
  volumeDown: Phaser.Input.Keyboard.Key
  volumeUp: Phaser.Input.Keyboard.Key
}

export type InGameSettingsUi = {
  panel: Phaser.GameObjects.Container
  text: Phaser.GameObjects.Text
  hintText: Phaser.GameObjects.Text
}

export type SettingsActions = {
  toggleShake: boolean
  toggleContrast: boolean
  volumeDown: boolean
  volumeUp: boolean
}

export type SettingsInputOutcome = {
  nextSettings: AccessibilitySettings
  changed: boolean
  requiresVisualReload: boolean
  cueFrequency: number
}

export type AppliedAccessibilityRuntime = {
  screenShakeEnabled: boolean
  renderPaletteMode: RenderPaletteMode
  paletteChanged: boolean
}

export function loadSceneAccessibilitySettings(
  queryPaletteMode: RenderPaletteMode,
  storage: Pick<Storage, 'getItem'> | undefined
): AccessibilitySettings {
  return loadAccessibilitySettings(storage, {
    highContrastEnabled: queryPaletteMode === 'high-contrast'
  })
}

export function persistSceneAccessibilitySettings(
  storage: Pick<Storage, 'setItem'> | undefined,
  settings: AccessibilitySettings
): AccessibilitySettings {
  return saveAccessibilitySettings(storage, settings)
}

export function applyAccessibilityRuntimeState(
  settings: AccessibilitySettings,
  previousPalette: RenderPaletteMode
): AppliedAccessibilityRuntime {
  const renderPaletteMode = getPaletteModeForAccessibility(settings.highContrastEnabled, 'normal')
  setSfxVolume(settings.sfxVolume)
  return {
    screenShakeEnabled: settings.screenShakeEnabled,
    renderPaletteMode,
    paletteChanged: renderPaletteMode !== previousPalette
  }
}

export function deriveSettingsInputOutcome(
  settings: AccessibilitySettings,
  actions: SettingsActions
): SettingsInputOutcome {
  let changed = false
  let requiresVisualReload = false
  let cueFrequency = 700
  const nextSettings: AccessibilitySettings = { ...settings }

  if (actions.toggleShake) {
    nextSettings.screenShakeEnabled = toggleEnabled(nextSettings.screenShakeEnabled)
    cueFrequency = 620
    changed = true
  }

  if (actions.toggleContrast) {
    nextSettings.highContrastEnabled = toggleEnabled(nextSettings.highContrastEnabled)
    cueFrequency = 540
    changed = true
    requiresVisualReload = true
  }

  if (actions.volumeDown) {
    nextSettings.sfxVolume = stepSfxVolume(nextSettings.sfxVolume, -1)
    cueFrequency = 430
    changed = true
  }

  if (actions.volumeUp) {
    nextSettings.sfxVolume = stepSfxVolume(nextSettings.sfxVolume, 1)
    cueFrequency = 760
    changed = true
  }

  return {
    nextSettings: changed ? nextSettings : settings,
    changed,
    requiresVisualReload,
    cueFrequency
  }
}

export function createInGameSettingsUi(scene: Phaser.Scene): InGameSettingsUi {
  const panelBackground = scene.add
    .rectangle(14, 14, 320, 128, 0x0b120c, 0.86)
    .setOrigin(0, 0)
    .setStrokeStyle(1, 0x9fb59a, 0.7)
    .setScrollFactor(0)
    .setDepth(40)

  const settingsText = scene.add
    .text(26, 26, '', {
      fontSize: '14px',
      color: '#d6e5ce',
      fontFamily: 'Trebuchet MS, sans-serif',
      lineSpacing: 5
    })
    .setScrollFactor(0)
    .setDepth(41)

  const panel = scene.add.container(0, 0, [panelBackground, settingsText])
  panel.setVisible(false)
  panel.setDepth(40)

  const settingsHintText = scene.add
    .text(16, 16, '', {
      fontSize: '12px',
      color: '#9fb59a',
      fontFamily: 'Trebuchet MS, sans-serif'
    })
    .setScrollFactor(0)
    .setDepth(42)

  return {
    panel,
    text: settingsText,
    hintText: settingsHintText
  }
}

export function updateInGameSettingsUiText(
  ui: InGameSettingsUi,
  settings: AccessibilitySettings,
  isOpen: boolean
): void {
  ui.text.setText(formatInGameAccessibilityText(settings, getSfxVolume()))
  ui.hintText.setText(formatInGameSettingsHintText(isOpen))
}

export function setInGameSettingsOpen(scene: Phaser.Scene, ui: InGameSettingsUi, isOpen: boolean): void {
  ui.panel.setVisible(isOpen)
  if (isOpen) {
    scene.physics.world.pause()
    return
  }

  scene.physics.world.resume()
}
