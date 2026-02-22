import { describe, expect, it } from 'vitest'
import {
  getWallSlideJumpVelocityX,
  getWallSlideSide,
  getWallSlideVelocityY,
  shouldWallSlide,
  shouldWallSlideJump
} from '../../src/gameplay/wallSlide'

describe('wallSlide gameplay rules', () => {
  it('activates only while airborne and pressing into touched wall', () => {
    expect(shouldWallSlide(false, false, true, false, true, false)).toBe(true)
    expect(shouldWallSlide(false, false, false, true, false, true)).toBe(true)
    expect(shouldWallSlide(true, false, true, false, true, false)).toBe(false)
    expect(shouldWallSlide(false, true, true, false, true, false)).toBe(false)
  })

  it('resolves wall side from contact + input', () => {
    expect(getWallSlideSide(true, false, true, false)).toBe('left')
    expect(getWallSlideSide(false, true, false, true)).toBe('right')
    expect(getWallSlideSide(true, false, false, false)).toBeUndefined()
  })

  it('clamps downward velocity but preserves upward velocity', () => {
    expect(getWallSlideVelocityY(500)).toBe(90)
    expect(getWallSlideVelocityY(120)).toBe(90)
    expect(getWallSlideVelocityY(-200)).toBe(-200)
  })

  it('allows jump away using jump key or opposite direction', () => {
    expect(shouldWallSlideJump(true, 'left', true, false)).toBe(true)
    expect(shouldWallSlideJump(true, 'left', false, true)).toBe(true)
    expect(shouldWallSlideJump(true, 'right', false, true)).toBe(true)
    expect(shouldWallSlideJump(true, 'left', false, false)).toBe(false)
  })

  it('launches away from wall side with opposite x velocity', () => {
    expect(getWallSlideJumpVelocityX('left')).toBe(120)
    expect(getWallSlideJumpVelocityX('right')).toBe(-120)
  })
})
