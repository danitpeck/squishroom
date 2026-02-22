import './style.css'
import Phaser from 'phaser'
import { parseLevel } from './level'
import { shouldThinPlatformCollide } from './gameplay/thinPlatform'
import { shouldJump, getJumpVelocity, shouldCutJump, getCutJumpVelocity } from './gameplay/jumpInput'
import { shouldEmitTrail, getNextTrailTime, getTrailOffsetX, getTrailJitterX, getTrailJitterY, getTrailCount, getTrailEmitY } from './gameplay/trailEmission'
import { getNextAnimationKey, shouldChangeAnimation } from './gameplay/animationState'
import { shouldStartDrip, getDripVelocity, getDripVelocityX, shouldEndDrip } from './gameplay/dripInput'
import { shouldTriggerHazard, getHazardStateReset, getHazardVelocity, getHazardSplatScale } from './gameplay/hazardInteraction'
import {
  getWallSlideContacts,
  getWallSlideJumpVelocityX,
  getWallSlideLockVelocityX,
  getWallSlideSide,
  getWallSlideVelocityY,
  shouldWallSlide,
  shouldWallSlideJump
} from './gameplay/wallSlide'
import { loadScreenShakeEnabled, saveScreenShakeEnabled } from './gameplay/accessibility'
import { playTone } from './gameplay/sfx'

const PLAYER_SCALE = 2.5
const BASE_PLAYER_SCALE = 2
const BASE_TILE_SIZE = 40
const WORLD_SCALE = PLAYER_SCALE / BASE_PLAYER_SCALE
const TILE_SIZE = Math.round(BASE_TILE_SIZE * WORLD_SCALE)

const LEVELS = [
  [
    '####################',
    '#..S...............#',
    '#..#######.........#',
    '#........#.........#',
    '#........#.....E...#',
    '#........#..####...#',
    '#........#.........#',
    '#........#.........#',
    '#...###..#####.....#',
    '#...#....#.........#',
    '#...#....#.........#',
    '#...#....#.........#',
    '#...#....#.........#',
    '#...######.........#',
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
    '#..^^^^^^^^^^^^^^^^#',
    '#..#################',
    '#..#############.E.#',
    '#~~#############...#',
    '#..................#',
    '###~~~~~~~~~~~~~~~~#',
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
    let screenShakeEnabled = loadScreenShakeEnabled(window.localStorage)

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

    const shakeText = this.add
      .text(width / 2, height / 2 + 64, '', {
        fontSize: '16px',
        color: '#9fb59a',
        fontFamily: 'Trebuchet MS, sans-serif'
      })
      .setOrigin(0.5)

    const updateShakeText = () => {
      shakeText.setText(`Screen Shake: ${screenShakeEnabled ? 'ON' : 'OFF'} (Press T)`) 
    }
    updateShakeText()

    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    const toggleShake = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T)

    toggleShake?.on('down', () => {
      screenShakeEnabled = !screenShakeEnabled
      saveScreenShakeEnabled(window.localStorage, screenShakeEnabled)
      updateShakeText()
      playTone(this.sound, { frequency: 650, durationMs: 80, volume: 0.025, type: 'triangle' })
    })

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
  private isDrippingParticles = false
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
  private isWallSliding = false
  private lastAirborneFallSpeed = 0
  private levelIndex = 0
  private idleTween?: Phaser.Tweens.Tween
  private spawnPoint = { x: TILE_SIZE / 2, y: TILE_SIZE / 2 }
  private jumpEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private landEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private dripEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private spikeEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private trailEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private nextTrailAt = 0
  private debugToggleKey?: Phaser.Input.Keyboard.Key
  private screenShakeEnabled = true

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
    this.debugToggleKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F1)
    this.screenShakeEnabled = loadScreenShakeEnabled(window.localStorage)
    this.setPhysicsDebugEnabled(false)

    // Reset player for fresh start
    this.player?.destroy()
    this.player = undefined
    this.wasOnGround = false
    this.justLanded = false
    this.isDripping = false
    this.isWallSliding = false
    this.lastAirborneFallSpeed = 0
    this.nextTrailAt = 0

    // Create a simple particle texture (only once)
    if (!this.textures.exists('particle')) {
      const graphics = this.make.graphics()
      graphics.fillStyle(0xffffff, 1)
      graphics.fillRect(0, 0, 4, 4)
      graphics.generateTexture('particle', 4, 4)
      graphics.destroy()
    }

    // Create animations (only if they don't exist)
    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
        frameRate: 2,
        repeat: -1
      })
    }

    if (!this.anims.exists('run')) {
      this.anims.create({
        key: 'run',
        frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
        frameRate: 2,
        repeat: -1
      })
    }

    if (!this.anims.exists('jump')) {
      this.anims.create({
        key: 'jump',
        frames: [{ key: 'player', frame: 2 }],
        frameRate: 1
      })
    }

    if (!this.anims.exists('fall')) {
      this.anims.create({
        key: 'fall',
        frames: [{ key: 'player', frame: 2 }],
        frameRate: 1
      })
    }

    if (!this.anims.exists('land')) {
      this.anims.create({
        key: 'land',
        frames: [{ key: 'player', frame: 3 }],
        frameRate: 3,
        repeat: 0
      })
    }

    if (!this.anims.exists('wallSlide')) {
      this.anims.create({
        key: 'wallSlide',
        frames: [{ key: 'player', frame: 2 }],
        frameRate: 1
      })
    }

    this.walls = this.physics.add.staticGroup()
    this.thinPlatforms = this.physics.add.staticGroup()
    this.hazards = this.physics.add.staticGroup()

    // Create particle emitters (Phaser 3.60+ API)
    this.jumpEmitter = this.add.particles(0, 0, 'particle', {
      speedX: { min: -70, max: 70 },
      speedY: { min: -22, max: 6 },
      scale: { start: 0.9, end: 0.2 },
      alpha: { start: 0.78, end: 0 },
      lifespan: 390,
      gravityY: 125,
      emitting: false,
      tint: 0xB58CFF
    })

    this.landEmitter = this.add.particles(0, 0, 'particle', {
      speedX: { min: -120, max: 120 },
      speedY: { min: -26, max: 12 },
      scale: { start: 1.25, end: 0.3 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 520,
      gravityY: 180,
      emitting: false,
      maxParticles: 24,
      tint: 0xB58CFF
    })

    this.dripEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: -10, max: 10 },
      angle: 270,
      scale: { start: 0.6, end: 0 },
      lifespan: 500,
      emitting: false,
      frequency: 50,
      maxParticles: 50,
      tint: 0xB58CFF
    })

    this.spikeEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: -150, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      emitting: false,
      maxParticles: 15,
      tint: 0xB58CFF
    })

    this.trailEmitter = this.add.particles(0, 0, 'particle', {
      speedX: { min: -16, max: 16 },
      speedY: { min: -3, max: 7 },
      scale: { start: 1.05, end: 0.28 },
      alpha: { start: 0.82, end: 0 },
      lifespan: 760,
      gravityY: 45,
      emitting: false,
      maxParticles: 180,
      tint: [0xB58CFF, 0xA876FF, 0xC79EFF]
    })

    this.loadLevel(0)
  }

  update() {
    if (this.debugToggleKey && Phaser.Input.Keyboard.JustDown(this.debugToggleKey)) {
      this.setPhysicsDebugEnabled(!this.physics.world.drawDebug)
    }

    if (!this.player || !this.cursors || !this.keys || this.isComplete) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 220
    const isOnGround = body.blocked.down
    const { touchingLeftWall, touchingRightWall } = getWallSlideContacts(
      body.blocked.left,
      body.blocked.right,
      body.touching.left,
      body.touching.right,
      body.velocity.y < 0
    )

    const leftDown = this.cursors.left?.isDown || this.keys.left.isDown
    const rightDown = this.cursors.right?.isDown || this.keys.right.isDown
    const leftPressed =
      (this.cursors.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.left)
    const rightPressed =
      (this.cursors.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.right)
    const isMoving = leftDown || rightDown
    this.isWallSliding = shouldWallSlide(
      isOnGround,
      this.isDripping,
      touchingLeftWall,
      touchingRightWall,
      !!leftDown,
      !!rightDown
    )
    const wallSlideSide = getWallSlideSide(
      touchingLeftWall,
      touchingRightWall,
      !!leftDown,
      !!rightDown
    )
    const wallSlideLockVelocityX = getWallSlideLockVelocityX()

    // Movement
    if (!this.isDripping && !this.isWallSliding) {
      if (leftDown) {
        body.setVelocityX(-speed)
        this.player!.setFlipX(false)
      } else if (rightDown) {
        body.setVelocityX(speed)
        this.player!.setFlipX(true)
      } else {
        body.setVelocityX(0)
      }
    } else if (this.isDripping) {
      body.setVelocityX(0)
      body.setVelocityY(720)
    }

    if (this.isWallSliding) {
      body.setVelocityX(wallSlideLockVelocityX)
      body.setVelocityY(getWallSlideVelocityY(body.velocity.y))
    }

    // Jump
    const jumpPressed =
      (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump)
    const upPressed = this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)

    if (shouldJump(jumpPressed, upPressed, isOnGround)) {
      this.stopIdleWobble()
      body.setVelocityY(getJumpVelocity())
      this.justLanded = false
      this.playJumpStretch()
    }

    const oppositePressed =
      (wallSlideSide === 'left' && !!rightPressed) ||
      (wallSlideSide === 'right' && !!leftPressed)

    if (
      shouldWallSlideJump(
        this.isWallSliding,
        wallSlideSide,
        !!jumpPressed,
        oppositePressed
      ) &&
      wallSlideSide
    ) {
      this.stopIdleWobble()
      body.setVelocityY(getJumpVelocity())
      body.setVelocityX(getWallSlideJumpVelocityX(wallSlideSide))
      this.justLanded = false
      this.playJumpStretch()
      this.isWallSliding = false
    }

    if (!isOnGround && body.velocity.y > 0) {
      this.lastAirborneFallSpeed = Math.max(this.lastAirborneFallSpeed, body.velocity.y)
    }

    // Drip
    const dripPressed =
      (this.cursors.down && Phaser.Input.Keyboard.JustDown(this.cursors.down)) ||
      Phaser.Input.Keyboard.JustDown(this.keys.down)

    if (shouldStartDrip(dripPressed, isOnGround)) {
      this.isDripping = true
      this.isDrippingParticles = true
      body.setVelocityX(getDripVelocityX())
      body.setVelocityY(getDripVelocity())
      playTone(this.sound, { frequency: 420, frequencyEnd: 180, durationMs: 120, volume: 0.03, type: 'triangle' })
    }

    const jumpReleased =
      (this.cursors.up && Phaser.Input.Keyboard.JustUp(this.cursors.up)) ||
      Phaser.Input.Keyboard.JustUp(this.keys.jump)
    const upReleased = this.cursors.up && Phaser.Input.Keyboard.JustUp(this.cursors.up)

    if (shouldCutJump(jumpReleased, upReleased, body.velocity.y)) {
      body.setVelocityY(getCutJumpVelocity(body.velocity.y))
    }

    // Landing detection
    if (!this.wasOnGround && isOnGround) {
      this.justLanded = true
      this.playLandSquash(this.lastAirborneFallSpeed, this.isDripping)
      this.lastAirborneFallSpeed = 0
    }

    if (shouldEndDrip(isOnGround)) {
      this.isDripping = false
      this.isDrippingParticles = false
    }

    // Animation state machine
    this.updateAnimationState(isOnGround, isMoving)

    // Emit drip particles while dripping
    if (this.isDrippingParticles && this.player) {
      this.dripEmitter?.emitParticleAt(this.player.x, this.player.y + 16, 1)
    }

    // Emit slime trail while moving on the ground
    if (isMoving && isOnGround && !this.isDripping) {
      const now = this.time.now
      if (shouldEmitTrail(now, this.nextTrailAt)) {
        const trailOffsetX = getTrailOffsetX(body.velocity.x)
        const jitterX = getTrailJitterX()
        const jitterY = getTrailJitterY()
        const count = getTrailCount()
        const emitY = getTrailEmitY(this.player.y)
        this.trailEmitter?.emitParticleAt(this.player.x + trailOffsetX + jitterX, emitY + jitterY, count)
        this.nextTrailAt = getNextTrailTime(now)
      }
    }

    this.wasOnGround = isOnGround
  }

  private updateAnimationState(isOnGround: boolean, isMoving: boolean) {
    if (!this.player) return

    const currentAnim = this.player.anims.currentAnim
    const currentAnimKey = currentAnim?.key
    const isAnimPlaying = this.player.anims.isPlaying
    const velocityY = (this.player.body as Phaser.Physics.Arcade.Body).velocity.y

    const nextKey = getNextAnimationKey(
      currentAnimKey,
      isAnimPlaying,
      isOnGround,
      isMoving,
      velocityY,
      this.justLanded,
      this.isWallSliding
    )

    if (shouldChangeAnimation(currentAnimKey, nextKey)) {
      this.player.play(nextKey, true)
      
      // Idle wobble state machine
      if (nextKey === 'idle') {
        this.startIdleWobble()
      } else {
        this.stopIdleWobble()
      }
    }

    // Clear justLanded flag after land animation is queued
    if (this.justLanded && nextKey === 'land') {
      this.justLanded = false
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
    playTone(this.sound, { frequency: 520, frequencyEnd: 780, durationMs: 260, volume: 0.035, type: 'sine' })
    this.scene.start('win')
  }

  private handleHazard() {
    if (!shouldTriggerHazard(this.isComplete, !!this.player)) {
      return
    }

    // Emit spike particles
    if (this.spikeEmitter) {
      this.spikeEmitter.emitParticleAt(this.player!.x, this.player!.y, 12)
    }
    playTone(this.sound, { frequency: 180, frequencyEnd: 90, durationMs: 140, volume: 0.045, type: 'sawtooth' })

    // Apply hazard state reset
    const reset = getHazardStateReset()
    const body = this.player!.body as Phaser.Physics.Arcade.Body
    const vel = getHazardVelocity()

    body.setVelocity(vel.x, vel.y)
    this.isDripping = reset.isDripping
    this.wasOnGround = reset.wasOnGround

    // Scale it up visually for splat effect
    this.player!.setScale(getHazardSplatScale())

    this.player!.setPosition(this.spawnPoint.x, this.spawnPoint.y)
    this.player!.play('idle')
  }

  private playJumpStretch() {
    if (!this.player) {
      return
    }

    this.stopIdleWobble()
    // Emit jump particles
    if (this.jumpEmitter) {
      this.jumpEmitter.emitParticleAt(this.player.x, this.player.y + 17, 6)
    }
    playTone(this.sound, { frequency: 460, frequencyEnd: 580, durationMs: 90, volume: 0.025, type: 'square' })
  }

  private playLandSquash(impactSpeed: number, fromDrip: boolean) {
    if (!this.player) {
      return
    }

    this.stopIdleWobble()
    // Emit land particles
    if (this.landEmitter) {
      this.landEmitter.emitParticleAt(this.player.x, this.player.y + 17, 12)
    }
    playTone(this.sound, { frequency: 190, frequencyEnd: 140, durationMs: 80, volume: 0.03, type: 'triangle' })

    if (fromDrip) {
      this.triggerScreenShake(0.009, 130)
      return
    }

    if (impactSpeed < 220) {
      return
    }

    const normalizedImpact = Phaser.Math.Clamp((impactSpeed - 220) / 380, 0, 1)
    const intensity = Phaser.Math.Linear(0.0006, 0.0021, normalizedImpact)
    const durationMs = Math.round(Phaser.Math.Linear(35, 70, normalizedImpact))
    this.triggerScreenShake(intensity, durationMs)
  }

  private triggerScreenShake(intensity: number, durationMs: number) {
    if (!this.screenShakeEnabled) {
      return
    }

    this.cameras.main.shake(durationMs, intensity)
  }

  private loadLevel(index: number) {
    const levelData = parseLevel(LEVELS[index], TILE_SIZE)
    const levelWidth = levelData.width
    const levelHeight = levelData.height

    this.levelIndex = index
    this.isComplete = false
    this.isDripping = false
    this.isWallSliding = false
    this.wasOnGround = false
    this.lastAirborneFallSpeed = 0

    this.exitZone?.destroy()
    this.overlay?.destroy()
    this.levelText?.destroy()
    this.stopIdleWobble()

    // Stop and clear all particle emitters to prevent memory leak
    this.jumpEmitter?.stop()
    this.jumpEmitter?.killAll()
    this.landEmitter?.stop()
    this.landEmitter?.killAll()
    this.dripEmitter?.stop()
    this.dripEmitter?.killAll()
    this.spikeEmitter?.stop()
    this.spikeEmitter?.killAll()
    this.trailEmitter?.stop()
    this.trailEmitter?.killAll()

    this.walls?.clear(true, true)
    this.thinPlatforms?.clear(true, true)
    this.hazards?.clear(true, true)

    this.physics.world.setBounds(0, 0, levelWidth, levelHeight)
    this.cameras.main.setBounds(0, 0, levelWidth, levelHeight)

    this.spawnPoint = { x: levelData.spawn.x, y: levelData.spawn.y }

    levelData.wallSegments.forEach(({ x, y, width, height }) => {
      const wall = this.add.rectangle(x, y, width, height, 0x3f5d3a)
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
      sprite.setScale(PLAYER_SCALE)
      this.physics.add.existing(sprite)
      this.player = sprite as Phaser.Physics.Arcade.Sprite
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body

      // IMPORTANT: define body size in *source pixels* (before scale),
      // Phaser will scale the body automatically when you scale the sprite.
      playerBody.setSize(24, 20);      // width, height (tune)
      playerBody.setOffset(4, 4);      // keep body aligned to visible slime pixels

      playerBody.setCollideWorldBounds(true)
      this.player.play('idle')
    } else {
      let playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
      if (!playerBody) {
        this.physics.add.existing(this.player)
        playerBody = this.player.body as Phaser.Physics.Arcade.Body
      }
      // Re-apply physics body configuration
      playerBody.setSize(24, 20)
      playerBody.setOffset(4, 4)
      playerBody.setCollideWorldBounds(true)
      playerBody.setVelocity(0, 0)
      this.player.setScale(PLAYER_SCALE)
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
      (obj1, obj2) => {
        // One-way thin platforms + drip-through behavior
        const playerBody = (obj1 as any).body as Phaser.Physics.Arcade.Body
        const platformBody = (obj2 as any).body as Phaser.Physics.Arcade.Body

        return shouldThinPlatformCollide(
          this.isDripping,
          playerBody.bottom,
          platformBody.top,
          playerBody.velocity.y
        )
      },
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

  private setPhysicsDebugEnabled(enabled: boolean) {
    const world = this.physics.world as Phaser.Physics.Arcade.World & {
      createDebugGraphic?: () => Phaser.GameObjects.Graphics
      debugGraphic?: Phaser.GameObjects.Graphics
    }

    if (enabled && !world.debugGraphic) {
      world.createDebugGraphic?.()
    }

    world.drawDebug = enabled

    if (world.debugGraphic) {
      world.debugGraphic.setVisible(enabled)
      if (!enabled) {
        world.debugGraphic.clear()
      }
    }
  }

  private stopIdleWobble() {
    if (!this.player || !this.idleTween) {
      return
    }

    this.idleTween.stop()
    this.idleTween.remove()
    this.idleTween = undefined
    // Keep configured scale
    this.player.setScale(PLAYER_SCALE)
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
