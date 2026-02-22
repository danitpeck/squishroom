import Phaser from 'phaser'

export type ToneConfig = {
  frequency: number
  durationMs: number
  volume?: number
  type?: OscillatorType
  frequencyEnd?: number
}

export function playTone(sound: Phaser.Sound.BaseSoundManager, config: ToneConfig): void {
  const audioContext = (sound as Phaser.Sound.WebAudioSoundManager).context
  if (!audioContext) {
    return
  }

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  const now = audioContext.currentTime
  const duration = Math.max(config.durationMs, 30) / 1000
  const end = now + duration
  const volume = config.volume ?? 0.03

  oscillator.type = config.type ?? 'sine'
  oscillator.frequency.setValueAtTime(config.frequency, now)

  if (config.frequencyEnd && config.frequencyEnd !== config.frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(config.frequencyEnd, end)
  }

  gainNode.gain.setValueAtTime(volume, now)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start(now)
  oscillator.stop(end)
}
