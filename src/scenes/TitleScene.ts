import Phaser from 'phaser'
import type { CampaignId } from '../content/rooms'
import {
  loadAccessibilitySettings,
  saveAccessibilitySettings
} from '../gameplay/accessibility'
import { stepSfxVolume, toggleEnabled } from '../gameplay/accessibilityControls'
import { playTone, setSfxVolume } from '../gameplay/sfx'
import { resolveRenderPaletteMode } from '../renderSkin'
import { type MainSceneData, TITLE_MODE_OPTIONS } from './shared'
import { formatTitleAccessibilityText } from './uiText'

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title')
  }

  create() {
    const { width, height } = this.cameras.main
    const queryPaletteMode = resolveRenderPaletteMode(window.location.search)
    let accessibilitySettings = loadAccessibilitySettings(window.localStorage, {
      highContrastEnabled: queryPaletteMode === 'high-contrast'
    })
    setSfxVolume(accessibilitySettings.sfxVolume)

    this.add
      .text(width / 2, height / 2 - 40, 'Squishroom', {
        fontSize: '56px',
        color: '#f4f2e6',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 8, 'Left/Right to choose mode | Space/Enter to confirm', {
        fontSize: '20px',
        color: '#cbd7c0',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    let modeIndex = 0
    const modeText = this.add
      .text(width / 2, height / 2 + 44, '', {
        fontSize: '20px',
        color: '#dbe8d5',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    const settingsText = this.add
      .text(width / 2, height / 2 + 132, '', {
        fontSize: '15px',
        color: '#9fb59a',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    const persistSettings = () => {
      accessibilitySettings = saveAccessibilitySettings(window.localStorage, accessibilitySettings)
      setSfxVolume(accessibilitySettings.sfxVolume)
    }

    const updateModeText = () => {
      const mode = TITLE_MODE_OPTIONS[modeIndex]
      modeText.setText(`Mode: ${mode.label} (${mode.description})`)
    }

    const updateSettingsText = () => {
      settingsText.setText(formatTitleAccessibilityText(accessibilitySettings))
    }
    updateModeText()
    updateSettingsText()

    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    const left = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
    const right = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    const toggleShake = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T)
    const toggleContrast = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.C)
    const volumeDown = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET)
    const volumeUp = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET)

    const cycleMode = (delta: number) => {
      modeIndex = (modeIndex + delta + TITLE_MODE_OPTIONS.length) % TITLE_MODE_OPTIONS.length
      updateModeText()
      playTone(this.sound, { frequency: 510, durationMs: 50, volume: 0.018, type: 'triangle' })
    }

    const confirmMode = () => {
      const selected = TITLE_MODE_OPTIONS[modeIndex]
      if (selected.id === 'stats') {
        this.scene.start('stats')
        return
      }

      const campaignId: CampaignId = selected.id === 'mastery' ? 'mastery_v13' : 'core'
      this.scene.start('main', { campaignId, roomIndex: 0 } satisfies MainSceneData)
    }

    toggleShake?.on('down', () => {
      accessibilitySettings.screenShakeEnabled = toggleEnabled(accessibilitySettings.screenShakeEnabled)
      persistSettings()
      updateSettingsText()
      playTone(this.sound, { frequency: 650, durationMs: 80, volume: 0.025, type: 'triangle' })
    })

    toggleContrast?.on('down', () => {
      accessibilitySettings.highContrastEnabled = toggleEnabled(accessibilitySettings.highContrastEnabled)
      persistSettings()
      updateSettingsText()
      playTone(this.sound, { frequency: 560, durationMs: 80, volume: 0.025, type: 'triangle' })
    })

    volumeDown?.on('down', () => {
      accessibilitySettings.sfxVolume = stepSfxVolume(accessibilitySettings.sfxVolume, -1)
      persistSettings()
      updateSettingsText()
      playTone(this.sound, { frequency: 380, durationMs: 60, volume: 0.03, type: 'square' })
    })

    volumeUp?.on('down', () => {
      accessibilitySettings.sfxVolume = stepSfxVolume(accessibilitySettings.sfxVolume, 1)
      persistSettings()
      updateSettingsText()
      playTone(this.sound, { frequency: 720, durationMs: 60, volume: 0.03, type: 'square' })
    })

    left?.on('down', () => cycleMode(-1))
    right?.on('down', () => cycleMode(1))
    space?.on('down', confirmMode)
    enter?.on('down', confirmMode)
  }
}
