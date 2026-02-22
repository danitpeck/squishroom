import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSfxVolume, playTone, setSfxVolume } from '../../src/gameplay/sfx'

function createAudioMocks() {
  const oscillatorFrequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  }
  const oscillator = {
    type: 'sine' as OscillatorType,
    frequency: oscillatorFrequency,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  }
  const gainNode = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn()
  }
  const context = {
    currentTime: 5,
    destination: {},
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode)
  }

  return { context, oscillator, gainNode, oscillatorFrequency }
}

describe('sfx runtime volume', () => {
  beforeEach(() => {
    setSfxVolume(0.7)
  })

  it('clamps volume to the [0, 1] range', () => {
    setSfxVolume(1.5)
    expect(getSfxVolume()).toBe(1)

    setSfxVolume(-2)
    expect(getSfxVolume()).toBe(0)

    setSfxVolume(Number.NaN)
    expect(getSfxVolume()).toBe(0.7)
  })

  it('returns early when sound manager has no context', () => {
    expect(() =>
      playTone({} as never, {
        frequency: 440,
        durationMs: 80
      })
    ).not.toThrow()
  })

  it('applies global sfx volume multiplier to tone gain', () => {
    const { context, oscillator, gainNode } = createAudioMocks()
    const sound = { context }

    setSfxVolume(0.5)
    playTone(sound as never, {
      frequency: 440,
      frequencyEnd: 660,
      durationMs: 100,
      volume: 0.04,
      type: 'square'
    })

    expect(context.createOscillator).toHaveBeenCalledTimes(1)
    expect(context.createGain).toHaveBeenCalledTimes(1)
    expect(oscillator.connect).toHaveBeenCalledWith(gainNode)
    expect(gainNode.connect).toHaveBeenCalledWith(context.destination)
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.02, 5)
    expect(oscillator.start).toHaveBeenCalledWith(5)
    expect(oscillator.stop).toHaveBeenCalledWith(5.1)
  })

  it('does not emit tones when volume is muted', () => {
    const { context } = createAudioMocks()
    const sound = { context }

    setSfxVolume(0)
    playTone(sound as never, {
      frequency: 440,
      durationMs: 100
    })

    expect(context.createOscillator).not.toHaveBeenCalled()
    expect(context.createGain).not.toHaveBeenCalled()
  })
})
