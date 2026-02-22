import { describe, expect, it } from 'vitest'
import { getNextAnimationKey, shouldChangeAnimation } from '../src/gameplay/animationState'

describe('animationState behavior', () => {
  it('keeps land animation locked while still playing', () => {
    const next = getNextAnimationKey('land', true, true, true, 0, false)
    expect(next).toBe('land')
  })

  it('prioritizes land animation on touchdown frame', () => {
    const next = getNextAnimationKey('fall', false, true, false, 0, true)
    expect(next).toBe('land')
  })

  it('prioritizes wall slide over fall while airborne', () => {
    const next = getNextAnimationKey('fall', false, false, true, 250, false, true)
    expect(next).toBe('wallSlide')
  })

  it('returns jump while rising in air', () => {
    const next = getNextAnimationKey('idle', false, false, false, -120, false)
    expect(next).toBe('jump')
  })

  it('returns fall while descending in air', () => {
    const next = getNextAnimationKey('jump', false, false, false, 180, false)
    expect(next).toBe('fall')
  })

  it('returns run on ground movement and idle at rest', () => {
    expect(getNextAnimationKey('idle', true, true, true, 0, false)).toBe('run')
    expect(getNextAnimationKey('run', true, true, false, 0, false)).toBe('idle')
  })

  it('only changes animation when key differs', () => {
    expect(shouldChangeAnimation('idle', 'run')).toBe(true)
    expect(shouldChangeAnimation('idle', 'idle')).toBe(false)
  })
})
