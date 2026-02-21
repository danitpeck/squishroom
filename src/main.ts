import './style.css'
import Phaser from 'phaser'
import { parseLevel } from './level'

const TILE_SIZE = 40

const LEVELS = [
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#........####...E..#',
    '#..................#',
    '#......##..........#',
    '#..................#',
    '#....##............#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#~~~~~~~~~~~~~~~~~~#',
    '#..................#',
    '#..................#',
    '#..............E...#',
    '#..................#',
    '#........####......#',
    '#..................#',
    '#.............##...#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#.........#....E...#',
    '#..................#',
    '#.....##.....##....#',
    '#....#..^^^^^......#',
    '#...#...#####......#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#~~~~~~#############',
    '#..................#',
    '#..................#',
    '#..............E...#',
    '#..................#',
    '#.....##########...#',
    '#..................#',
    '#..................#',
    '#^^^^^^^^^^^^^^^^^^#',
    '####################'
  ],
  [
    '####################',
    '#..S.#.............#',
    '#....#.............#',
    '#....#.............#',
    '#....#.............#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#.........##...E...#',
    '#.......##.........#',
    '#.....##...........#',
    '#^^^^^.............#',
    '######.............#',
    '#..................#',
    '####################'
  ],
  [
    '####################',
    '#..S...............#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#~~~~~~~~~~~~~~~~~~#',
    '#.^^^^^^^^^^^^^^^^^#',
    '#.##################',
    '#..#############.E.#',
    '##~#############...#',
    '#..................#',
    '#~#~~~~~~~~~~~~~~~~#',
    '#..................#',
    '#^^^^^^######^^^^^^#',
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
  private player?: Phaser.Physics.Arcade.Sprite
  private wasOnGround = false
  private justLanded = false
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

  preload() {
    this.load.spritesheet('player', './assets/player.png', {
      frameWidth: 32,
      frameHeight: 32
    })
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

    // Create animations
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
      frameRate: 2,
      repeat: -1
    })

    this.anims.create({
      key: 'run',
      frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
      frameRate: 2,
      repeat: -1
    })

    this.anims.create({
      key: 'jump',
      frames: [{ key: 'player', frame: 2 }],
      frameRate: 1
    })

    this.anims.create({
      key: 'fall',
      frames: [{ key: 'player', frame: 2 }],
      frameRate: 1
    })

    this.anims.create({
      key: 'land',
      frames: [{ key: 'player', frame: 3 }],
      frameRate: 3,
      repeat: 0
    })

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
    const isMoving = leftDown || rightDown

    // Movement
    if (!this.isDripping) {
      if (leftDown) {
        body.setVelocityX(-speed)
        this.player!.setFlipX(false)
      } else if (rightDown) {
        body.setVelocityX(speed)
        this.player!.setFlipX(true)
      } else {
        body.setVelocityX(0)
      }
    } else {
      body.setVelocityX(0)
      body.setVelocityY(720)
    }

    // Jump
    const jumpPressed =
      (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump)

    if (jumpPressed && isOnGround) {
      this.stopIdleWobble()
      body.setVelocityY(-420)
      this.justLanded = false
      this.playJumpStretch()
    }

    // Drip
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

    // Landing detection
    if (!this.wasOnGround && isOnGround) {
      this.justLanded = true
      this.playLandSquash()
    }

    if (isOnGround) {
      this.isDripping = false
    }

    // Animation state machine
    this.updateAnimationState(isOnGround, isMoving)

    this.wasOnGround = isOnGround
  }

  private updateAnimationState(isOnGround: boolean, isMoving: boolean) {
    if (!this.player) return

    const currentAnim = this.player.anims.currentAnim
    const currentAnimKey = currentAnim?.key
    const isAnimPlaying = this.player.anims.isPlaying

    // If land is playing, don't interrupt it
    if (currentAnimKey === 'land' && isAnimPlaying) {
      return
    }

    // Just landed - play land animation once
    if (this.justLanded) {
      this.player.play('land', true)
      this.justLanded = false
      return
    }

    // In air
    if (!isOnGround) {
      const velocityY = (this.player.body as Phaser.Physics.Arcade.Body).velocity.y
      if (velocityY > 0) {
        if (currentAnimKey !== 'fall') {
          this.player.play('fall', true)
        }
      } else if (velocityY < 0) {
        if (currentAnimKey !== 'jump') {
          this.player.play('jump', true)
        }
      }
      return
    }

    // On ground
    if (isMoving) {
      if (currentAnimKey !== 'run') {
        this.player.play('run', true)
      }
    } else {
      if (currentAnimKey !== 'idle') {
        this.startIdleWobble()
        this.player.play('idle', true)
      }
    }
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

    // Recommended: bottom-center origin for platformers
    this.player.setOrigin(0.5, 1);

    // Scale it up visually
    this.player.setScale(2)

    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y)
    this.player.play('idle')
  }

  private playJumpStretch() {
    if (!this.player) {
      return
    }

    this.stopIdleWobble()
    // Scale tween disabled to keep sprite at consistent size
  }

  private playLandSquash() {
    if (!this.player) {
      return
    }

    this.stopIdleWobble()
    // Scale tween disabled to keep sprite at consistent size
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

    this.walls?.clear(true, true)
    this.thinPlatforms?.clear(true, true)
    this.hazards?.clear(true, true)

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
      const sprite = this.add.sprite(levelData.spawn.x, levelData.spawn.y, 'player', 0)
      sprite.setScale(2)
      this.physics.add.existing(sprite)
      this.player = sprite as Phaser.Physics.Arcade.Sprite
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body


      // IMPORTANT: define body size in *source pixels* (before scale),
      // Phaser will scale the body automatically when you scale the sprite.
      playerBody.setSize(18, 18);      // width, height (tune)
      playerBody.setOffset(7, 4);     // x, y inside the 32x32 frame (tune)

      playerBody.setCollideWorldBounds(true)
      this.player.play('idle')
    } else {
      let playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
      if (!playerBody) {
        this.physics.add.existing(this.player)
        playerBody = this.player.body as Phaser.Physics.Arcade.Body
      }
      playerBody.moves = true
      playerBody.setVelocity(0, 0)
      this.player.setScale(2)
      this.player.setPosition(levelData.spawn.x, levelData.spawn.y)
      this.player.play('idle')
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
    // Idle wobble disabled to prevent scale interference with sprite
    if (!this.player) {
      return
    }

    // Make sure we're playing the idle animation
    const anim = this.player.anims.currentAnim
    if (!anim || anim.key !== 'idle') {
      this.player.play('idle')
    }
  }

  private stopIdleWobble() {
    if (!this.player || !this.idleTween) {
      return
    }

    this.idleTween.stop()
    this.idleTween.remove()
    this.idleTween = undefined
    // Keep scale at 2
    this.player.setScale(2)
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
      debug: true
    }
  },
  scene: [TitleScene, MainScene, WinScene]
}

new Phaser.Game(config)
