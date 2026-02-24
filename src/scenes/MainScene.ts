import Phaser from 'phaser'
import { CAMPAIGNS, type CampaignId, type RoomDefinition } from '../content/rooms'
import { parseLevel } from '../level'
import { shouldThinPlatformCollide } from '../gameplay/thinPlatform'
import { shouldJump, getJumpVelocity, shouldCutJump, getCutJumpVelocity } from '../gameplay/jumpInput'
import {
  shouldEmitTrail,
  getNextTrailTime,
  getTrailOffsetX,
  getTrailJitterX,
  getTrailJitterY,
  getTrailCount,
  getTrailEmitY
} from '../gameplay/trailEmission'
import { getNextAnimationKey, shouldChangeAnimation } from '../gameplay/animationState'
import { shouldStartDrip, getDripVelocity, getDripVelocityX, shouldEndDrip } from '../gameplay/dripInput'
import {
  shouldTriggerHazard,
  getHazardStateReset,
  getHazardVelocity,
  getHazardSplatScale
} from '../gameplay/hazardInteraction'
import { compareRunForRanking, getMedalForTime } from '../gameplay/medals'
import { loadStats, saveRoomResult } from '../gameplay/runStats'
import {
  getWallSlideContacts,
  getWallSlideJumpVelocityX,
  getWallSlideLockVelocityX,
  getWallSlideSide,
  getWallSlideVelocityY,
  hasWallJumpGrace,
  shouldWallSlide,
  shouldWallSlideJump,
  type WallSide
} from '../gameplay/wallSlide'
import {
  type AccessibilitySettings
} from '../gameplay/accessibility'
import { playTone } from '../gameplay/sfx'
import { applyPlayerBodyConfig } from '../playerPhysics'
import { getDeterministicDecals, getParallaxOffset } from '../backgroundDepth'
import {
  getTileRenderStyle,
  resolveRenderPaletteMode,
  resolveRenderSkinMode,
  type RenderPaletteMode,
  type TileRenderStyle
} from '../renderSkin'
import {
  PLAYER_SCALE,
  TILE_SIZE,
  type ClearPanelResult,
  type MainSceneData,
  getMedalLabel
} from './shared'
import {
  formatMasteryAttemptHudText,
  formatMasteryClearPanelText
} from './uiText'
import {
  applyAccessibilityRuntimeState,
  createInGameSettingsUi,
  deriveSettingsInputOutcome,
  loadSceneAccessibilitySettings,
  persistSceneAccessibilitySettings,
  setInGameSettingsOpen,
  updateInGameSettingsUiText,
  type InGameSettingsKeys,
  type InGameSettingsUi
} from './main/settingsController'

export class MainScene extends Phaser.Scene {
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
  private exitZone?: Phaser.GameObjects.GameObject
  private exitGlow?: Phaser.GameObjects.Ellipse
  private exitTween?: Phaser.Tweens.Tween
  private levelText?: Phaser.GameObjects.Text
  private overlay?: Phaser.GameObjects.Rectangle
  private isComplete = false
  private isDripping = false
  private isWallSliding = false
  private lastWallContactAt = Number.NEGATIVE_INFINITY
  private lastWallSide: WallSide | undefined
  private lastAirborneFallSpeed = 0
  private campaignId: CampaignId = 'core'
  private rooms: RoomDefinition[] = CAMPAIGNS.core
  private levelIndex = 0
  private levelClearPanelVisible = false
  private levelClearHasNext = false
  private attemptStartedAt = 0
  private attemptDeaths = 0
  private attemptHudText?: Phaser.GameObjects.Text
  private clearPanel?: Phaser.GameObjects.Container
  private clearPanelText?: Phaser.GameObjects.Text
  private clearActionKeys?: {
    next: Phaser.Input.Keyboard.Key
    retry: Phaser.Input.Keyboard.Key
    back: Phaser.Input.Keyboard.Key
    enter: Phaser.Input.Keyboard.Key
    space: Phaser.Input.Keyboard.Key
  }
  private idleTween?: Phaser.Tweens.Tween
  private spawnPoint = { x: TILE_SIZE / 2, y: TILE_SIZE / 2 }
  private jumpEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private landEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private dripEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private spikeEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private trailEmitter?: Phaser.GameObjects.Particles.ParticleEmitter
  private nextTrailAt = 0
  private debugToggleKey?: Phaser.Input.Keyboard.Key
  private settingsToggleKey?: Phaser.Input.Keyboard.Key
  private settingsKeys?: InGameSettingsKeys
  private settingsUi?: InGameSettingsUi
  private isSettingsOpen = false
  private queryPaletteMode = resolveRenderPaletteMode(window.location.search)
  private accessibilitySettings: AccessibilitySettings = {
    screenShakeEnabled: true,
    highContrastEnabled: false,
    sfxVolume: 0.7
  }
  private screenShakeEnabled = true
  private renderSkinMode = resolveRenderSkinMode(window.location.search)
  private renderPaletteMode: RenderPaletteMode = 'normal'
  private decorativeLayerTiles: Phaser.GameObjects.GameObject[] = []
  private backgroundFarLayer?: Phaser.GameObjects.Container
  private backgroundMidLayer?: Phaser.GameObjects.Container
  private backgroundDecalLayer?: Phaser.GameObjects.Container
  private currentLevelWidth = 0
  private currentLevelHeight = 0

  constructor() {
    super('main')
  }

  init(data: MainSceneData) {
    const requestedCampaign = data.campaignId ?? 'core'
    this.campaignId = requestedCampaign
    this.rooms = CAMPAIGNS[requestedCampaign]
    this.levelIndex = Phaser.Math.Clamp(data.roomIndex ?? 0, 0, Math.max(0, this.rooms.length - 1))
  }

  preload() {
    this.load.spritesheet('player', './assets/player.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.image('tile-block', './assets/tiles/block.png')
    this.load.image('tile-ledge', './assets/tiles/ledge.png')
    this.load.image('tile-spikes', './assets/tiles/spikes.png')
    this.load.image('tile-flag', './assets/tiles/flag.png')
  }

  create() {
    // Set nearest-neighbor filtering for crisp pixel art tiles
    ;['tile-block', 'tile-ledge', 'tile-spikes', 'tile-flag'].forEach((key) => {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    })
    const keyboard = this.input.keyboard
    this.cursors = keyboard?.createCursorKeys()
    this.keys = keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      down: Phaser.Input.Keyboard.KeyCodes.S
    }) as typeof this.keys
    this.debugToggleKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F1)
    this.settingsToggleKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.settingsKeys = keyboard?.addKeys({
      toggleShake: Phaser.Input.Keyboard.KeyCodes.T,
      toggleContrast: Phaser.Input.Keyboard.KeyCodes.C,
      volumeDown: Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET,
      volumeUp: Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET
    }) as InGameSettingsKeys | undefined
    this.clearActionKeys = keyboard?.addKeys({
      next: Phaser.Input.Keyboard.KeyCodes.N,
      retry: Phaser.Input.Keyboard.KeyCodes.R,
      back: Phaser.Input.Keyboard.KeyCodes.B,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    }) as typeof this.clearActionKeys
    this.accessibilitySettings = loadSceneAccessibilitySettings(this.queryPaletteMode, window.localStorage)
    const initialAccessibilityRuntime = applyAccessibilityRuntimeState(this.accessibilitySettings, this.renderPaletteMode)
    this.screenShakeEnabled = initialAccessibilityRuntime.screenShakeEnabled
    this.renderPaletteMode = initialAccessibilityRuntime.renderPaletteMode
    this.setPhysicsDebugEnabled(false)

    // Reset player for fresh start
    this.player?.destroy()
    this.player = undefined
    this.wasOnGround = false
    this.justLanded = false
    this.isDripping = false
    this.isWallSliding = false
    this.lastWallContactAt = Number.NEGATIVE_INFINITY
    this.lastWallSide = undefined
    this.lastAirborneFallSpeed = 0
    this.nextTrailAt = 0
    this.attemptStartedAt = this.time.now
    this.attemptDeaths = 0
    this.levelClearPanelVisible = false

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

    this.createAttemptHud()
    this.createClearPanel()
    this.settingsUi = createInGameSettingsUi(this)
    this.loadLevel(this.levelIndex, { resetAttempt: true })
    if (this.settingsUi) {
      updateInGameSettingsUiText(this.settingsUi, this.accessibilitySettings, this.isSettingsOpen)
    }
    this.updateAttemptHud()
  }

  update() {
    if (this.levelClearPanelVisible) {
      this.handleClearPanelInput()
      return
    }

    if (this.settingsToggleKey && this.settingsUi && Phaser.Input.Keyboard.JustDown(this.settingsToggleKey)) {
      this.isSettingsOpen = !this.isSettingsOpen
      setInGameSettingsOpen(this, this.settingsUi, this.isSettingsOpen)
      updateInGameSettingsUiText(this.settingsUi, this.accessibilitySettings, this.isSettingsOpen)
    }

    if (this.isSettingsOpen) {
      this.handleSettingsInput()
      return
    }

    if (this.debugToggleKey && Phaser.Input.Keyboard.JustDown(this.debugToggleKey)) {
      this.setPhysicsDebugEnabled(!this.physics.world.drawDebug)
    }

    if (this.player) {
      this.updateBackgroundParallax()
    }

    if (this.isMasteryCampaign()) {
      this.updateAttemptHud()
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
    if (wallSlideSide) {
      this.lastWallSide = wallSlideSide
      this.lastWallContactAt = this.time.now
    }
    const wallJumpInGraceWindow =
      !isOnGround &&
      !this.isDripping &&
      this.lastWallSide !== undefined &&
      hasWallJumpGrace(this.time.now - this.lastWallContactAt)
    const effectiveWallSide = wallSlideSide ?? (wallJumpInGraceWindow ? this.lastWallSide : undefined)
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
      (effectiveWallSide === 'left' && !!rightPressed) ||
      (effectiveWallSide === 'right' && !!leftPressed)

    if (
      shouldWallSlideJump(
        this.isWallSliding || wallJumpInGraceWindow,
        effectiveWallSide,
        !!jumpPressed,
        oppositePressed
      ) &&
      effectiveWallSide
    ) {
      this.stopIdleWobble()
      body.setVelocityY(getJumpVelocity())
      body.setVelocityX(getWallSlideJumpVelocityX(effectiveWallSide))
      this.justLanded = false
      this.playJumpStretch()
      this.isWallSliding = false
      this.lastWallContactAt = Number.NEGATIVE_INFINITY
      this.lastWallSide = undefined
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

    if (!this.isMasteryCampaign()) {
      if (this.levelIndex < this.rooms.length - 1) {
        this.loadLevel(this.levelIndex + 1, { resetAttempt: true })
        return
      }

      this.isComplete = true
      playTone(this.sound, { frequency: 520, frequencyEnd: 780, durationMs: 260, volume: 0.035, type: 'sine' })
      this.scene.start('win')
      return
    }

    const room = this.getCurrentRoom()
    const clearMs = Math.max(1, Math.floor(this.time.now - this.attemptStartedAt))
    const deaths = this.attemptDeaths
    const medal = room.medalTargets ? getMedalForTime(clearMs, room.medalTargets) : 'none'
    const statsBefore = loadStats(window.localStorage)
    const existing = statsBefore.campaigns[this.campaignId].rooms[room.id]
    const isNewPb =
      !existing ||
      compareRunForRanking(
        { clearMs, deaths },
        { clearMs: existing.bestMs, deaths: existing.fewestDeaths }
      ) < 0
    const updated = saveRoomResult(window.localStorage, this.campaignId, room.id, {
      clearMs,
      deaths,
      medal
    })
    const chapterRooms = this.rooms.filter((candidate) => candidate.chapter === room.chapter)
    const chapterComplete = chapterRooms.every(
      (candidate) => (updated.campaigns[this.campaignId].rooms[candidate.id]?.clears ?? 0) > 0
    )
    const packComplete = this.levelIndex >= this.rooms.length - 1

    playTone(this.sound, { frequency: 620, frequencyEnd: 840, durationMs: 210, volume: 0.03, type: 'sine' })
    this.openClearPanel({
      roomName: room.name,
      clearMs,
      deaths,
      medal,
      isNewPb,
      chapterComplete,
      packComplete
    })
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

    if (this.isMasteryCampaign()) {
      this.attemptDeaths += 1
      this.attemptStartedAt = this.time.now
      this.updateAttemptHud()
    }
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

  private reloadCurrentLevelVisuals() {
    if (!this.player) {
      this.loadLevel(this.levelIndex, { preserveAttemptState: true, resetAttempt: false })
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const previousState = {
      x: this.player.x,
      y: this.player.y,
      velocityX: body.velocity.x,
      velocityY: body.velocity.y,
      flipX: this.player.flipX
    }

    this.loadLevel(this.levelIndex, { preserveAttemptState: true, resetAttempt: false })

    if (!this.player) {
      return
    }

    const reloadedBody = this.player.body as Phaser.Physics.Arcade.Body
    this.player.setPosition(
      Phaser.Math.Clamp(previousState.x, TILE_SIZE / 2, this.currentLevelWidth - TILE_SIZE / 2),
      Phaser.Math.Clamp(previousState.y, TILE_SIZE / 2, this.currentLevelHeight - TILE_SIZE / 2)
    )
    this.player.setFlipX(previousState.flipX)
    reloadedBody.setVelocity(previousState.velocityX, previousState.velocityY)
  }

  private handleSettingsInput() {
    if (!this.settingsKeys || !this.settingsUi) {
      return
    }

    const outcome = deriveSettingsInputOutcome(this.accessibilitySettings, {
      toggleShake: Phaser.Input.Keyboard.JustDown(this.settingsKeys.toggleShake),
      toggleContrast: Phaser.Input.Keyboard.JustDown(this.settingsKeys.toggleContrast),
      volumeDown: Phaser.Input.Keyboard.JustDown(this.settingsKeys.volumeDown),
      volumeUp: Phaser.Input.Keyboard.JustDown(this.settingsKeys.volumeUp)
    })

    if (!outcome.changed) {
      return
    }

    this.accessibilitySettings = persistSceneAccessibilitySettings(window.localStorage, outcome.nextSettings)
    const accessibilityRuntime = applyAccessibilityRuntimeState(this.accessibilitySettings, this.renderPaletteMode)
    this.screenShakeEnabled = accessibilityRuntime.screenShakeEnabled
    this.renderPaletteMode = accessibilityRuntime.renderPaletteMode

    if (outcome.requiresVisualReload && accessibilityRuntime.paletteChanged) {
      this.reloadCurrentLevelVisuals()
    }

    updateInGameSettingsUiText(this.settingsUi, this.accessibilitySettings, this.isSettingsOpen)
    playTone(this.sound, { frequency: outcome.cueFrequency, durationMs: 55, volume: 0.015, type: 'square' })
  }

  private isMasteryCampaign(): boolean {
    return this.campaignId === 'mastery_v13'
  }

  private getCurrentRoom(): RoomDefinition {
    return this.rooms[this.levelIndex]
  }

  private updateAttemptStateForLevelLoad(options: { preserveAttemptState?: boolean; resetAttempt?: boolean }) {
    if (!this.isMasteryCampaign()) {
      return
    }

    if (options.preserveAttemptState) {
      return
    }

    const shouldResetAttempt = options.resetAttempt ?? true
    if (!shouldResetAttempt) {
      return
    }

    this.attemptStartedAt = this.time.now
    this.attemptDeaths = 0
  }

  private createAttemptHud() {
    this.attemptHudText = this.add
      .text(12, 70, '', {
        fontSize: '14px',
        color: '#cddcc8',
        fontFamily: 'Consolas, monospace'
      })
      .setScrollFactor(0)
      .setDepth(43)
  }

  private updateAttemptHud() {
    if (!this.attemptHudText) {
      return
    }

    if (!this.isMasteryCampaign()) {
      this.attemptHudText.setVisible(false)
      return
    }

    const elapsed = Math.max(0, Math.floor(this.time.now - this.attemptStartedAt))
    this.attemptHudText.setVisible(true)
    this.attemptHudText.setText(formatMasteryAttemptHudText(this.getCurrentRoom().id, elapsed, this.attemptDeaths))
  }

  private createClearPanel() {
    const panelBackground = this.add
      .rectangle(72, 128, 656, 304, 0x0a110a, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xcfe2c6, 0.7)
      .setScrollFactor(0)
      .setDepth(55)

    this.clearPanelText = this.add
      .text(96, 152, '', {
        fontSize: '18px',
        color: '#e0eed9',
        fontFamily: 'Trebuchet MS, sans-serif',
        lineSpacing: 6
      })
      .setScrollFactor(0)
      .setDepth(56)

    this.clearPanel = this.add.container(0, 0, [panelBackground, this.clearPanelText])
    this.clearPanel.setVisible(false)
    this.clearPanel.setDepth(55)
  }

  private openClearPanel(result: ClearPanelResult) {
    if (!this.clearPanelText || !this.clearPanel) {
      return
    }

    this.levelClearPanelVisible = true
    this.levelClearHasNext = this.levelIndex < this.rooms.length - 1
    this.isComplete = true
    this.physics.world.pause()
    this.clearPanel.setVisible(true)

    this.clearPanelText.setText(
      formatMasteryClearPanelText({
        roomName: result.roomName,
        clearMs: result.clearMs,
        deaths: result.deaths,
        medalLabel: getMedalLabel(result.medal),
        isNewPb: result.isNewPb,
        chapterComplete: result.chapterComplete,
        chapter: this.getCurrentRoom().chapter,
        packComplete: result.packComplete,
        hasNext: this.levelClearHasNext
      })
    )
  }

  private closeClearPanel() {
    this.levelClearPanelVisible = false
    this.clearPanel?.setVisible(false)
    this.isComplete = false
    this.physics.world.resume()
  }

  private handleClearPanelInput() {
    if (!this.clearActionKeys) {
      return
    }

    const confirmNext =
      Phaser.Input.Keyboard.JustDown(this.clearActionKeys.next) ||
      Phaser.Input.Keyboard.JustDown(this.clearActionKeys.enter) ||
      Phaser.Input.Keyboard.JustDown(this.clearActionKeys.space)
    const retry = Phaser.Input.Keyboard.JustDown(this.clearActionKeys.retry)
    const back = Phaser.Input.Keyboard.JustDown(this.clearActionKeys.back)

    if (back) {
      this.closeClearPanel()
      this.scene.start('title')
      return
    }

    if (retry) {
      this.closeClearPanel()
      this.loadLevel(this.levelIndex, { resetAttempt: true })
      return
    }

    if (!confirmNext) {
      return
    }

    this.closeClearPanel()
    if (this.levelClearHasNext) {
      this.loadLevel(this.levelIndex + 1, { resetAttempt: true })
      return
    }

    this.scene.start('title')
  }

  private createTileRect(x: number, y: number, baseWidth: number, baseHeight: number, style: TileRenderStyle) {
    const width = baseWidth * (style.widthScale ?? 1)
    const height = baseHeight * (style.heightScale ?? 1)
    const yOffset = baseHeight * (style.yOffsetScale ?? 0)
    const tile = this.add.rectangle(x, y + yOffset, width, height, style.fillColor, style.alpha ?? 1)

    if (style.strokeColor !== undefined && style.strokeWidth !== undefined) {
      tile.setStrokeStyle(style.strokeWidth, style.strokeColor, 0.9)
    }

    return tile
  }

  private createTileImage(x: number, y: number, displayWidth: number, displayHeight: number, textureKey: string) {
    const img = this.add.image(x, y, textureKey)
    img.setDisplaySize(displayWidth, displayHeight)
    return img
  }

  private createWallTileSprite(x: number, y: number, width: number, height: number) {
    const wall = this.add.tileSprite(x, y, width, height, 'tile-block')
    wall.setTileScale(TILE_SIZE / 18)
    wall.setTint(0x3d5a3a)
    return wall
  }

  private createDecorativeEdge(x: number, y: number, width: number, height: number, style: TileRenderStyle) {
    if (!style.edgeColor || !style.edgeHeightScale) {
      return
    }

    const edgeHeight = Math.max(2, height * style.edgeHeightScale)
    const edge = this.add.rectangle(x, y - height / 2 + edgeHeight / 2, width, edgeHeight, style.edgeColor, 0.45)
    edge.setDepth(1)
    this.decorativeLayerTiles.push(edge)
  }

  private clearBackgroundDepth() {
    this.backgroundFarLayer?.destroy(true)
    this.backgroundMidLayer?.destroy(true)
    this.backgroundDecalLayer?.destroy(true)
    this.backgroundFarLayer = undefined
    this.backgroundMidLayer = undefined
    this.backgroundDecalLayer = undefined
  }

  private createBackgroundDepth(levelIndex: number, levelWidth: number, levelHeight: number) {
    this.clearBackgroundDepth()

    const centerX = levelWidth / 2
    const centerY = levelHeight / 2

    const farLayer = this.add.container(centerX, centerY)
    farLayer.setDepth(-30)
    farLayer.add(this.add.rectangle(0, 0, levelWidth, levelHeight, 0x101911, 1))
    farLayer.add(this.add.rectangle(0, -levelHeight * 0.24, levelWidth * 1.2, levelHeight * 0.38, 0x1b2a1b, 0.3))
    farLayer.add(this.add.rectangle(0, levelHeight * 0.28, levelWidth * 1.2, levelHeight * 0.34, 0x0d120d, 0.38))
    this.backgroundFarLayer = farLayer

    const midLayer = this.add.container(centerX, centerY)
    midLayer.setDepth(-20)
    midLayer.add(this.add.ellipse(-levelWidth * 0.26, -levelHeight * 0.17, 240, 120, 0x243b24, 0.18))
    midLayer.add(this.add.ellipse(levelWidth * 0.22, -levelHeight * 0.08, 300, 130, 0x2c472d, 0.16))
    midLayer.add(this.add.ellipse(-levelWidth * 0.1, levelHeight * 0.24, 340, 150, 0x203420, 0.14))
    this.backgroundMidLayer = midLayer

    const decalLayer = this.add.container(centerX, centerY)
    decalLayer.setDepth(-10)
    const room = this.rooms[levelIndex]
    const seedIndex = this.campaignId === 'mastery_v13' ? levelIndex + 100 : levelIndex
    const decals = getDeterministicDecals(room.grid, TILE_SIZE, seedIndex)
    decals.forEach((decal) => {
      const ellipse = this.add.ellipse(
        decal.x - centerX,
        decal.y - centerY,
        decal.radius * 2.2,
        decal.radius * 1.35,
        decal.color,
        decal.alpha
      )
      decalLayer.add(ellipse)
    })
    this.backgroundDecalLayer = decalLayer
  }

  private updateBackgroundParallax() {
    if (!this.player) {
      return
    }

    const centerX = this.currentLevelWidth / 2
    const centerY = this.currentLevelHeight / 2

    if (this.backgroundFarLayer) {
      const offsetX = getParallaxOffset(this.player.x, centerX, 0.04, TILE_SIZE * 0.6)
      const offsetY = getParallaxOffset(this.player.y, centerY, 0.03, TILE_SIZE * 0.45)
      this.backgroundFarLayer.setPosition(centerX - offsetX, centerY - offsetY)
    }

    if (this.backgroundMidLayer) {
      const offsetX = getParallaxOffset(this.player.x, centerX, 0.09, TILE_SIZE * 1.1)
      const offsetY = getParallaxOffset(this.player.y, centerY, 0.05, TILE_SIZE * 0.8)
      this.backgroundMidLayer.setPosition(centerX - offsetX, centerY - offsetY)
    }

    if (this.backgroundDecalLayer) {
      const offsetX = getParallaxOffset(this.player.x, centerX, 0.12, TILE_SIZE * 1.25)
      const offsetY = getParallaxOffset(this.player.y, centerY, 0.07, TILE_SIZE * 0.9)
      this.backgroundDecalLayer.setPosition(centerX - offsetX, centerY - offsetY)
    }
  }

  private loadLevel(
    index: number,
    options: { preserveAttemptState?: boolean; resetAttempt?: boolean } = {}
  ) {
    const room = this.rooms[index]
    if (!room) {
      return
    }

    const levelData = parseLevel(room.grid, TILE_SIZE)
    const levelWidth = levelData.width
    const levelHeight = levelData.height

    this.levelIndex = index
    this.levelClearPanelVisible = false
    this.isComplete = false
    this.isDripping = false
    this.isWallSliding = false
    this.lastWallContactAt = Number.NEGATIVE_INFINITY
    this.lastWallSide = undefined
    this.wasOnGround = false
    this.lastAirborneFallSpeed = 0

    this.exitZone?.destroy()
    this.exitGlow?.destroy()
    this.exitTween?.destroy()
    this.exitGlow = undefined
    this.exitTween = undefined
    this.overlay?.destroy()
    this.levelText?.destroy()
    this.stopIdleWobble()
    this.clearBackgroundDepth()
    this.clearPanel?.setVisible(false)
    this.updateAttemptStateForLevelLoad(options)

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
    this.decorativeLayerTiles.forEach((tile) => tile.destroy())
    this.decorativeLayerTiles = []

    this.physics.world.setBounds(0, 0, levelWidth, levelHeight)
    this.cameras.main.setBounds(0, 0, levelWidth, levelHeight)
    this.currentLevelWidth = levelWidth
    this.currentLevelHeight = levelHeight
    this.createBackgroundDepth(index, levelWidth, levelHeight)

    this.spawnPoint = { x: levelData.spawn.x, y: levelData.spawn.y }

    const useImages = this.renderSkinMode === 'skinned'

    const wallStyle = getTileRenderStyle('#', this.renderSkinMode, this.renderPaletteMode)
    const thinStyle = getTileRenderStyle('~', this.renderSkinMode, this.renderPaletteMode)
    const hazardStyle = getTileRenderStyle('^', this.renderSkinMode, this.renderPaletteMode)
    const exitStyle = getTileRenderStyle('E', this.renderSkinMode, this.renderPaletteMode)

    levelData.wallSegments.forEach(({ x, y, width, height }) => {
      let wall: Phaser.GameObjects.GameObject
      if (useImages) {
        wall = this.createWallTileSprite(x, y, width, height)
      } else {
        wall = this.createTileRect(x, y, width, height, wallStyle)
        this.createDecorativeEdge(x, y, width, height, wallStyle)
      }
      this.physics.add.existing(wall, true)
      const body = (wall as unknown as { body: Phaser.Physics.Arcade.StaticBody }).body
      body.setSize(width, height)
      this.walls!.add(wall)
    })

    levelData.thinPlatforms.forEach(({ x, y }) => {
      let thin: Phaser.GameObjects.GameObject
      const thinWidth = TILE_SIZE
      const thinHeight = TILE_SIZE * 0.35
      const thinDisplayHeight = TILE_SIZE * 0.65
      if (useImages) {
        const img = this.createTileImage(x, y, thinWidth, thinDisplayHeight, 'tile-ledge')
        ;(img as Phaser.GameObjects.Image).setTint(0x8a9a88)
        thin = img
      } else {
        thin = this.createTileRect(x, y, TILE_SIZE, TILE_SIZE, thinStyle)
        const rect = thin as Phaser.GameObjects.Rectangle
        this.createDecorativeEdge(rect.x, rect.y, rect.width, rect.height, thinStyle)
      }
      this.physics.add.existing(thin, true)
      const body = (thin as unknown as { body: Phaser.Physics.Arcade.StaticBody }).body
      body.setSize(thinWidth, thinHeight)
      this.thinPlatforms!.add(thin)
    })

    levelData.hazards.forEach(({ x, y }) => {
      let hazard: Phaser.GameObjects.GameObject
      const hazardWidth = TILE_SIZE * 0.7
      const hazardHeight = TILE_SIZE * 0.4
      // Push spikes to bottom of tile cell so they sit on the ground
      const hazardYOffset = (TILE_SIZE - hazardHeight) / 2
      if (useImages) {
        hazard = this.createTileImage(x, y + hazardYOffset, hazardWidth, hazardHeight, 'tile-spikes')
      } else {
        hazard = this.createTileRect(x, y, TILE_SIZE, TILE_SIZE, hazardStyle)
        const rect = hazard as Phaser.GameObjects.Rectangle
        this.createDecorativeEdge(rect.x, rect.y, rect.width, rect.height, hazardStyle)
      }
      this.physics.add.existing(hazard, true)
      const body = (hazard as unknown as { body: Phaser.Physics.Arcade.StaticBody }).body
      body.setSize(hazardWidth, hazardHeight)
      body.setOffset((TILE_SIZE * 0.3) / 2, hazardYOffset)
      this.hazards!.add(hazard)
    })

    if (levelData.exit) {
      const exitWidth = TILE_SIZE * 0.8
      const exitHeight = TILE_SIZE * 0.6

      // Outer soft glow
      const outerGlow = this.add.ellipse(levelData.exit.x, levelData.exit.y, exitWidth * 3, exitHeight * 3, 0xd7c775, 0.15)
      outerGlow.setDepth(0)
      // Inner bright glow
      const glow = this.add.ellipse(levelData.exit.x, levelData.exit.y, exitWidth * 1.6, exitHeight * 1.6, 0xfff0c7, 0.35)
      glow.setDepth(0)
      this.exitGlow = glow
      this.decorativeLayerTiles.push(outerGlow)
      this.exitTween = this.tweens.add({
        targets: [glow, outerGlow],
        alpha: { from: 0.2, to: 0.55 },
        scaleX: { from: 0.9, to: 1.15 },
        scaleY: { from: 0.9, to: 1.15 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      if (useImages) {
        this.exitZone = this.createTileImage(levelData.exit.x, levelData.exit.y, exitWidth, exitHeight, 'tile-flag')
      } else {
        this.exitZone = this.createTileRect(levelData.exit.x, levelData.exit.y, TILE_SIZE, TILE_SIZE, exitStyle)
      }
      ;(this.exitZone as unknown as Phaser.GameObjects.Components.Depth).setDepth(1)
      this.physics.add.existing(this.exitZone, true)
      const body = (this.exitZone as unknown as { body: Phaser.Physics.Arcade.StaticBody }).body
      body.setSize(exitWidth, exitHeight)
    }

    if (!this.player) {
      const sprite = this.add.sprite(levelData.spawn.x, levelData.spawn.y, 'player', 0)
      sprite.setScale(PLAYER_SCALE)
      this.physics.add.existing(sprite)
      this.player = sprite as Phaser.Physics.Arcade.Sprite
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body

      applyPlayerBodyConfig(playerBody)
      this.player.play('idle')
    } else {
      let playerBody = this.player.body as Phaser.Physics.Arcade.Body | null
      if (!playerBody) {
        this.physics.add.existing(this.player)
        playerBody = this.player.body as Phaser.Physics.Arcade.Body
      }
      // Re-apply physics body configuration
      applyPlayerBodyConfig(playerBody)
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
        const playerBody = (obj1 as Phaser.Types.Physics.Arcade.GameObjectWithBody)
          .body as Phaser.Physics.Arcade.Body
        const platformBody = (obj2 as Phaser.Types.Physics.Arcade.GameObjectWithBody)
          .body as Phaser.Physics.Arcade.Body

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
      .text(8, 8, room.grid.join('\n'), {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#cbd7c0'
      })
      .setAlpha(0.35)

    this.updateAttemptHud()
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
