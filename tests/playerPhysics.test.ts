import { describe, expect, it } from 'vitest'
import { PLAYER_BODY_OFFSET, PLAYER_BODY_SIZE } from '../src/playerPhysicsConfig'

describe('playerPhysics constants', () => {
  it('keeps collision body sizing stable', () => {
    expect(PLAYER_BODY_SIZE).toEqual({ width: 24, height: 20 })
    expect(PLAYER_BODY_OFFSET).toEqual({ x: 4, y: 4 })
  })
})
