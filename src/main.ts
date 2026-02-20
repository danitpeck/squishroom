import './style.css'
import Phaser from 'phaser'

class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private player?: Phaser.GameObjects.Rectangle
  private wasOnGround = false
  private exitZone?: Phaser.GameObjects.Rectangle
  private completeText?: Phaser.GameObjects.Text
  private overlay?: Phaser.GameObjects.Rectangle
  private isComplete = false

  constructor() {
    super('main')
  }

  create() {
    this.cursors = this.input.keyboard?.createCursorKeys()

    const floor = this.add.rectangle(400, 560, 760, 40, 0x4c7a3d)
    this.physics.add.existing(floor, true)

    this.exitZone = this.add.rectangle(700, 530, 70, 30, 0xd4c24f)
    this.physics.add.existing(this.exitZone, true)

    this.player = this.add.rectangle(400, 300, 40, 60, 0x8a5a44)
    this.physics.add.existing(this.player)

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)
    playerBody.setSize(40, 60)

    this.physics.add.collider(this.player, floor)
    this.physics.add.overlap(this.player, this.exitZone, this.handleExit, undefined, this)

    this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0)
    this.overlay.setDepth(10)
  }

  update() {
    if (!this.player || !this.cursors || this.isComplete) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 220
    const isOnGround = body.blocked.down

    if (this.cursors.left?.isDown) {
      body.setVelocityX(-speed)
    } else if (this.cursors.right?.isDown) {
      body.setVelocityX(speed)
    } else {
      body.setVelocityX(0)
    }

    if (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up) && isOnGround) {
      body.setVelocityY(-420)
      this.playJumpStretch()
    }

    if (!this.wasOnGround && isOnGround) {
      this.playLandSquash()
    }

    this.wasOnGround = isOnGround
  }

  private handleExit() {
    if (this.isComplete || !this.player || !this.exitZone) {
      return
    }

    this.isComplete = true

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    body.moves = false

    this.completeText = this.add
      .text(400, 300, 'Level Complete', {
        fontSize: '40px',
        color: '#f4f2e6',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)
      .setDepth(11)

    this.tweens.add({
      targets: this.exitZone,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 160,
      yoyo: true,
      repeat: 2,
      ease: 'Quad.Out'
    })

    if (this.overlay) {
      this.tweens.add({
        targets: this.overlay,
        alpha: 0.25,
        duration: 200,
        ease: 'Quad.Out'
      })
    }
  }

  private playJumpStretch() {
    if (!this.player) {
      return
    }

    this.tweens.killTweensOf(this.player)
    this.tweens.add({
      targets: this.player,
      scaleX: 0.85,
      scaleY: 1.15,
      duration: 90,
      ease: 'Quad.Out',
      yoyo: true
    })
  }

  private playLandSquash() {
    if (!this.player) {
      return
    }

    this.tweens.killTweensOf(this.player)
    this.tweens.add({
      targets: this.player,
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 90,
      ease: 'Quad.Out',
      yoyo: true
    })
  }
}

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
  scene: [MainScene]
}

new Phaser.Game(config)
