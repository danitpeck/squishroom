import { describe, expect, it } from 'vitest'
import { SFX_VOLUME_STEP, stepSfxVolume, toggleEnabled } from '../../src/gameplay/accessibilityControls'

describe('accessibilityControls', () => {
  it('toggles booleans predictably', () => {
    expect(toggleEnabled(true)).toBe(false)
    expect(toggleEnabled(false)).toBe(true)
  })

  it('steps sfx volume by the configured step size', () => {
    expect(SFX_VOLUME_STEP).toBe(0.05)
    expect(stepSfxVolume(0.7, -1)).toBe(0.65)
    expect(stepSfxVolume(0.7, 1)).toBe(0.75)
  })

  it('clamps stepped values to the 0..1 range', () => {
    expect(stepSfxVolume(0, -1)).toBe(0)
    expect(stepSfxVolume(1, 1)).toBe(1)
  })

  it('rounds to two decimals to avoid floating-point drift', () => {
    expect(stepSfxVolume(0.95, 1)).toBe(1)
    expect(stepSfxVolume(0.9, 1)).toBe(0.95)
    expect(stepSfxVolume(0.1, -1)).toBe(0.05)
  })
})
