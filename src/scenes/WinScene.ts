import Phaser from 'phaser'

export class WinScene extends Phaser.Scene {
  constructor() {
    super('win')
  }

  create() {
    const { width, height } = this.cameras.main

    this.add
      .text(width / 2, height / 2 - 30, 'You Win!', {
        fontSize: '48px',
        color: '#f4f2e6',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 30, 'Press Space to Play Again', {
        fontSize: '20px',
        color: '#cbd7c0',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    space?.once('down', () => this.scene.start('title'))
  }
}
