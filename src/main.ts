import './style.css'
import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene'
import { StatsScene } from './scenes/StatsScene'
import { TitleScene } from './scenes/TitleScene'
import { WinScene } from './scenes/WinScene'

const app = document.querySelector<HTMLDivElement>('#app')
app?.replaceChildren()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 600,
  backgroundColor: '#1a241a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false
    }
  },
  scene: [TitleScene, MainScene, StatsScene, WinScene]
}

new Phaser.Game(config)
