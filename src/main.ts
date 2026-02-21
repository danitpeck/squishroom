import './style.css'
import Phaser from 'phaser'
import { parseLevel } from './level'

const TILE_SIZE = 40

const LEVELS = [
  [
    '####################',
    '#..S...............#',
    '#..........##......#',
    '#..................#',
    '#......####........#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..........##...E..#',
    '#..................#',
    '#.....##...........#',
    '#..................#',
    '#..........##......#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#..........####....#',
    '#..................#',
    '#~~~~~~~~~~~~~~~~~~#',
    '#..................#',
    '#..................#',
    '#..............E...#',
    '#..................#',
    '#.....######.......#',
    '#..................#',
    '#..........##......#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#....####..........#',
    '#..................#',
    '#..........^^^.....#',
    '#..........###.....#',
    '#..................#',
    '#..............E...#',
    '#..................#',
    '#.....##...........#',
    '#..................#',
    '#..........##......#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#....####..........#',
    '#..................#',
    '#~~~~~~............#',
    '#......###.........#',
    '#..................#',
    '#..............E...#',
    '#..................#',
    '#.....######.......#',
    '#..................#',
    '#..........##......#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#.....^^^..........#',
    '#.....###..........#',
    '#..................#',
    '#..........####....#',
    '#..................#',
    '#..............E...#',
    '#..................#',
    '#.....##...........#',
    '#..................#',
    '#..........##......#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#....####..........#',
    '#..................#',
    '#~~~~~~~~~~~~~~~~..#',
    '#..........^^^.....#',
    '#..........###.....#',
    '#................E.#',
    '#..................#',
    '#.....##...........#',
    '#..................#',
    '#..........##......#',
    '#..................#',
    '####################'
  ]
]

class TitleScene extends Phaser.Scene {
  constructor() {
    super('title')
  }

  create() {
    const { width, height } = this.cameras.main

    this.add
      .text(width / 2, height / 2 - 40, 'Squishroom', {
        fontSize: '56px',
        color: '#f4f2e6',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 30, 'Press Space or Enter', {
        fontSize: '20px',
        color: '#cbd7c0',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

    this.input.keyboard?.once('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        this.scene.start('main')
      }
    })

    space?.once('down', () => this.scene.start('main'))
    enter?.once('down', () => this.scene.start('main'))
  }
}

class WinScene extends Phaser.Scene {
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

class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private keys?: {
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    jump: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
  }
  private player?: Phaser.GameObjects.Rectangle
  private wasOnGround = false
  private walls?: Phaser.Physics.Arcade.StaticGroup
  private thinPlatforms?: Phaser.Physics.Arcade.StaticGroup
  private hazards?: Phaser.Physics.Arcade.StaticGroup
  private wallCollider?: Phaser.Physics.Arcade.Collider
  private thinCollider?: Phaser.Physics.Arcade.Collider
  private hazardOverlap?: Phaser.Physics.Arcade.Collider
  private exitZone?: Phaser.GameObjects.Rectangle
  private levelText?: Phaser.GameObjects.Text
  private overlay?: Phaser.GameObjects.Rectangle
  private isComplete = false
  private isDripping = false
  private levelIndex = 0
  private idleTween?: Phaser.Tweens.Tween
  private spawnPoint = { x: TILE_SIZE / 2, y: TILE_SIZE / 2 }

  constructor() {
    super('main')
  }

  create() {
    const keyboard = this.input.keyboard
    this.cursors = keyboard?.createCursorKeys()
    this.keys = keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      down: Phaser.Input.Keyboard.KeyCodes.S
    }) as typeof this.keys

    this.walls = this.physics.add.staticGroup()
    this.thinPlatforms = this.physics.add.staticGroup()
    this.hazards = this.physics.add.staticGroup()

    this.loadLevel(0)
  }

  update() {
    if (!this.player || !this.cursors || !this.keys || this.isComplete) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 220
    const isOnGround = body.blocked.down

    const leftDown = this.cursors.left?.isDown || this.keys.left.isDown
    const rightDown = this.cursors.right?.isDown || this.keys.right.isDown

    if (!this.isDripping) {
      if (leftDown) {
        body.setVelocityX(-speed)
      } else if (rightDown) {
        body.setVelocityX(speed)
      } else {
        body.setVelocityX(0)
      }
    } else {
      body.setVelocityX(0)
      body.setVelocityY(720)
    }

    const jumpPressed =
      (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump)

    if (jumpPressed && isOnGround) {
      this.stopIdleWobble()
      body.setVelocityY(-420)
      this.playJumpStretch()
    }

    const dripPressed =
      (this.cursors.down && Phaser.Input.Keyboard.JustDown(this.cursors.down)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.down)

    if (dripPressed && !isOnGround) {
      this.isDripping = true
      body.setVelocityX(0)
      body.setVelocityY(720)
    }

    const jumpReleased =
      (this.cursors.up && Phaser.Input.Keyboard.JustUp(this.cursors.up)) ||
      Phaser.Input.Keyboard.JustUp(this.keys.jump)

    if (jumpReleased && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.5)
    }

    if (!this.wasOnGround && isOnGround) {
      this.playLandSquash()
    }

    if (isOnGround) {
      this.isDripping = false
    }

    const isIdle =
      isOnGround &&
      !this.isDripping &&
      !leftDown &&
      !rightDown &&
      !jumpPressed &&
      Math.abs(body.velocity.x) < 1

    if (isIdle) {
      this.startIdleWobble()
    } else {
      this.stopIdleWobble()
    }

    this.wasOnGround = isOnGround
  }

  private handleExit() {
    if (this.isComplete || !this.player || !this.exitZone) {
      return
    }

    if (this.levelIndex < LEVELS.length - 1) {
      this.loadLevel(this.levelIndex + 1)
      return
    }

    this.isComplete = true
    this.scene.start('win')
  }

  private handleHazard() {
    if (!this.player || this.isComplete) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    body.moves = true
    this.isDripping = false
    this.wasOnGround = false
    this.player.setScale(1, 1)
    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y)
  }

  private playJumpStretch() {
    if (!this.player) {
      return
    }

    this.stopIdleWobble()

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

    this.stopIdleWobble()

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

  private loadLevel(index: number) {
    const levelData = parseLevel(LEVELS[index], TILE_SIZE)
    const levelWidth = levelData.width
    const levelHeight = levelData.height

    this.levelIndex = index
    this.isComplete = false
    this.isDripping = false
    this.wasOnGround = false

    this.exitZone?.destroy()
    this.overlay?.destroy()
    this.levelText?.destroy()
    this.stopIdleWobble()

    this.walls!.clear(true, true)
    this.thinPlatforms!.clear(true, true)
    this.hazards!.clear(true, true)

    this.physics.world.setBounds(0, 0, levelWidth, levelHeight)
    this.cameras.main.setBounds(0, 0, levelWidth, levelHeight)

    this.spawnPoint = { x: levelData.spawn.x, y: levelData.spawn.y }

    levelData.walls.forEach(({ x, y }) => {
      const wall = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x3f5d3a)
      this.physics.add.existing(wall, true)
      this.walls!.add(wall)
    })

    levelData.thinPlatforms.forEach(({ x, y }) => {
      const thin = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE * 0.35, 0x7aa17a)
      this.physics.add.existing(thin, true)
      this.thinPlatforms!.add(thin)
    })

    levelData.hazards.forEach(({ x, y }) => {
      const hazard = this.add.rectangle(x, y, TILE_SIZE * 0.7, TILE_SIZE * 0.4, 0xd24a43)
      this.physics.add.existing(hazard, true)
      this.hazards!.add(hazard)
    })

    if (levelData.exit) {
      this.exitZone = this.add.rectangle(
        levelData.exit.x,
        levelData.exit.y,
        TILE_SIZE * 0.8,
        TILE_SIZE * 0.6,
        0xd4c24f
      )
      this.physics.add.existing(this.exitZone, true)
    }

    if (!this.player) {
      this.player = this.add.rectangle(levelData.spawn.x, levelData.spawn.y, 40, 60, 0x8a5a44)
      this.physics.add.existing(this.player)
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body
      playerBody.setSize(40, 60)
      playerBody.setCollideWorldBounds(true)
    } else {
      let playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
      if (!playerBody) {
        this.physics.add.existing(this.player)
        playerBody = this.player.body as Phaser.Physics.Arcade.Body
      }
      playerBody.moves = true
      playerBody.setVelocity(0, 0)
      this.player.setScale(1, 1)
      this.player.setPosition(levelData.spawn.x, levelData.spawn.y)
    }

    this.wallCollider?.destroy()
    this.wallCollider = this.physics.add.collider(this.player!, this.walls!)

    this.thinCollider?.destroy()
    this.thinCollider = this.physics.add.collider(
      this.player!,
      this.thinPlatforms!,
      undefined,
      () => !this.isDripping,
      this
    )

    this.hazardOverlap?.destroy()
    this.hazardOverlap = this.physics.add.overlap(this.player!, this.hazards!, this.handleHazard, undefined, this)

    if (this.exitZone) {
      this.physics.add.overlap(this.player!, this.exitZone, this.handleExit, undefined, this)
    }

    this.overlay = this.add.rectangle(levelWidth / 2, levelHeight / 2, levelWidth, levelHeight, 0x000000, 0)
    this.overlay.setDepth(10)

    this.levelText = this.add
      .text(8, 8, LEVELS[index].join('\n'), {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#cbd7c0'
      })
      .setAlpha(0.35)
  }

  private startIdleWobble() {
    if (!this.player || this.idleTween) {
      return
    }

    this.idleTween = this.tweens.add({
      targets: this.player,
      scaleX: 1.04,
      scaleY: 0.96,
      duration: 700,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1
    })
  }

  private stopIdleWobble() {
    if (!this.player || !this.idleTween) {
      return
    }

    this.idleTween.stop()
    this.idleTween.remove()
    this.idleTween = undefined
    this.player.setScale(1, 1)
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
  scene: [TitleScene, MainScene, WinScene]
}

new Phaser.Game(config)
