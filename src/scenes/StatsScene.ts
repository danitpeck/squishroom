import Phaser from 'phaser'
import { CAMPAIGNS } from '../content/rooms'
import { loadStats } from '../gameplay/runStats'
import { formatDurationMs, getMedalLabel } from './shared'

export class StatsScene extends Phaser.Scene {
  constructor() {
    super('stats')
  }

  create() {
    const { width } = this.cameras.main
    const stats = loadStats(window.localStorage)
    const masteryStats = stats.campaigns.mastery_v13
    const masteryRooms = CAMPAIGNS.mastery_v13
    const medalTotals = { bronze: 0, silver: 0, gold: 0 }
    const chapterProgress: Record<number, { cleared: number; total: number }> = {
      1: { cleared: 0, total: 0 },
      2: { cleared: 0, total: 0 },
      3: { cleared: 0, total: 0 }
    }

    const roomLines = masteryRooms.map((room) => {
      const best = masteryStats.rooms[room.id]
      if (chapterProgress[room.chapter]) {
        chapterProgress[room.chapter].total += 1
        if (best) {
          chapterProgress[room.chapter].cleared += 1
        }
      }

      if (best?.bestMedal === 'bronze') medalTotals.bronze += 1
      if (best?.bestMedal === 'silver') medalTotals.silver += 1
      if (best?.bestMedal === 'gold') medalTotals.gold += 1

      const bestTime = best ? formatDurationMs(best.bestMs) : '--:--.--'
      const deaths = best ? String(best.fewestDeaths) : '--'
      const medal = best ? getMedalLabel(best.bestMedal) : 'None'
      return `${room.id.padEnd(6)} ${bestTime}  deaths:${deaths.padStart(2, ' ')}  medal:${medal}`
    })

    this.add
      .text(width / 2, 36, 'Mastery Pack Stats', {
        fontSize: '34px',
        color: '#f4f2e6',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    this.add
      .text(
        24,
        78,
        [
          `Chapter 1: ${chapterProgress[1].cleared}/${chapterProgress[1].total}`,
          `Chapter 2: ${chapterProgress[2].cleared}/${chapterProgress[2].total}`,
          `Chapter 3: ${chapterProgress[3].cleared}/${chapterProgress[3].total}`,
          `Medals -> Bronze: ${medalTotals.bronze}, Silver: ${medalTotals.silver}, Gold: ${medalTotals.gold}`
        ].join('\n'),
        {
          fontSize: '16px',
          color: '#cfdcc8',
          fontFamily: 'Trebuchet MS, sans-serif',
          lineSpacing: 4
        }
      )

    this.add.text(24, 172, roomLines.join('\n'), {
      fontSize: '14px',
      color: '#b7cbb0',
      fontFamily: 'Consolas, monospace',
      lineSpacing: 3
    })

    this.add
      .text(width / 2, 576, 'Press B, ESC, Space, or Enter to return', {
        fontSize: '16px',
        color: '#9fb59a',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    const backKeys = this.input.keyboard?.addKeys({
      back: Phaser.Input.Keyboard.KeyCodes.B,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER
    }) as
      | {
          back: Phaser.Input.Keyboard.Key
          esc: Phaser.Input.Keyboard.Key
          space: Phaser.Input.Keyboard.Key
          enter: Phaser.Input.Keyboard.Key
        }
      | undefined

    const goBack = () => this.scene.start('title')
    backKeys?.back.on('down', goBack)
    backKeys?.esc.on('down', goBack)
    backKeys?.space.on('down', goBack)
    backKeys?.enter.on('down', goBack)
  }
}
