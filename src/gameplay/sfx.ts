import type Phaser from 'phaser'

export type ToneConfig = {
  frequency: number
  durationMs: number
  volume?: number
  type?: OscillatorType
  frequencyEnd?: number
}

let sfxVolume = 0.7

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.7
  }

  return Math.max(0, Math.min(1, value))
}

export function setSfxVolume(volume: number): void {
  sfxVolume = clampVolume(volume)
}

export function getSfxVolume(): number {
  return sfxVolume
}

export function playTone(sound: Phaser.Sound.BaseSoundManager, config: ToneConfig): void {
  const effectiveVolume = (config.volume ?? 0.03) * sfxVolume
  if (effectiveVolume <= 0) {
    return
  }

  const audioContext = (sound as Phaser.Sound.WebAudioSoundManager).context
  if (!audioContext) {
    return
  }

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  const now = audioContext.currentTime
  const duration = Math.max(config.durationMs, 30) / 1000
  const end = now + duration

  oscillator.type = config.type ?? 'sine'
  oscillator.frequency.setValueAtTime(config.frequency, now)

  if (config.frequencyEnd && config.frequencyEnd !== config.frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(config.frequencyEnd, end)
  }

  gainNode.gain.setValueAtTime(effectiveVolume, now)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start(now)
  oscillator.stop(end)
}
