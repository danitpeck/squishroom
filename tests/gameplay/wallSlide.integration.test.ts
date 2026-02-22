import { describe, expect, it } from 'vitest'
import {
  getWallSlideContacts,
  getWallSlideSide,
  getWallSlideVelocityY,
  shouldWallSlide
} from '../../src/gameplay/wallSlide'

type Frame = {
  blockedLeft: boolean
  touchingLeft: boolean
  velocityY: number
}

describe('wall slide integration', () => {
  it('keeps climbing through a stacked-wall block break while holding into the wall', () => {
    const frames: Frame[] = [
      { blockedLeft: true, touchingLeft: true, velocityY: -220 },
      { blockedLeft: true, touchingLeft: true, velocityY: -200 },
      // Seam frame where blocked briefly drops, but touching remains true.
      { blockedLeft: false, touchingLeft: true, velocityY: -180 },
      { blockedLeft: true, touchingLeft: true, velocityY: -160 },
      { blockedLeft: true, touchingLeft: true, velocityY: -140 }
    ]

    const slideStates = frames.map((frame) => {
      const contacts = getWallSlideContacts(
        frame.blockedLeft,
        false,
        frame.touchingLeft,
        false,
        frame.velocityY < 0
      )

      const isWallSliding = shouldWallSlide(
        false,
        false,
        contacts.touchingLeftWall,
        contacts.touchingRightWall,
        true,
        false
      )

      const wallSide = getWallSlideSide(
        contacts.touchingLeftWall,
        contacts.touchingRightWall,
        true,
        false
      )

      return {
        isWallSliding,
        wallSide,
        velocityY: getWallSlideVelocityY(frame.velocityY)
      }
    })

    expect(slideStates.every((state) => state.isWallSliding)).toBe(true)
    expect(slideStates.every((state) => state.wallSide === 'left')).toBe(true)
    expect(slideStates.map((state) => state.velocityY)).toEqual([-220, -200, -180, -160, -140])
  })
})
