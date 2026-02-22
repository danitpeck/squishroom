import Phaser from 'phaser'

import { PLAYER_BODY_OFFSET, PLAYER_BODY_SIZE } from './playerPhysicsConfig'

export function applyPlayerBodyConfig(body: Phaser.Physics.Arcade.Body) {
  body.setSize(PLAYER_BODY_SIZE.width, PLAYER_BODY_SIZE.height)
  body.setOffset(PLAYER_BODY_OFFSET.x, PLAYER_BODY_OFFSET.y)
  body.setCollideWorldBounds(true)
}
