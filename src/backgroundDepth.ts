export type DecalPlacement = {
  x: number
  y: number
  radius: number
  alpha: number
  color: number
}

function hash32(seed: number): number {
  let x = seed | 0
  x ^= x >>> 16
  x = Math.imul(x, 0x7feb352d)
  x ^= x >>> 15
  x = Math.imul(x, 0x846ca68b)
  x ^= x >>> 16
  return x >>> 0
}

function random01(levelIndex: number, row: number, col: number, salt: number): number {
  const seed =
    (levelIndex + 1) * 73856093 ^
    (row + 1) * 19349663 ^
    (col + 1) * 83492791 ^
    salt * 2654435761
  return hash32(seed) / 0xffffffff
}

function getCell(level: string[], row: number, col: number): string | undefined {
  if (row < 0 || col < 0 || row >= level.length) {
    return undefined
  }

  return level[row]?.[col]
}

function isRoomSafeDecalCell(level: string[], row: number, col: number): boolean {
  if (getCell(level, row, col) !== '.') {
    return false
  }

  if (row <= 0 || col <= 0 || row >= level.length - 1 || col >= (level[row]?.length ?? 0) - 1) {
    return false
  }

  for (let y = -1; y <= 1; y += 1) {
    for (let x = -1; x <= 1; x += 1) {
      const cell = getCell(level, row + y, col + x)
      if (cell === '^' || cell === 'S' || cell === 'E') {
        return false
      }
    }
  }

  return true
}

export function getDeterministicDecals(level: string[], tileSize: number, levelIndex: number): DecalPlacement[] {
  const rows = level.length
  const cols = level[0]?.length ?? 0
  const candidates: DecalPlacement[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!isRoomSafeDecalCell(level, row, col)) {
        continue
      }

      const include = random01(levelIndex, row, col, 1)
      if (include > 0.2) {
        continue
      }

      const jitterX = (random01(levelIndex, row, col, 2) - 0.5) * tileSize * 0.52
      const jitterY = (random01(levelIndex, row, col, 3) - 0.5) * tileSize * 0.52
      const radius = tileSize * (0.1 + random01(levelIndex, row, col, 4) * 0.14)
      const alpha = 0.045 + random01(levelIndex, row, col, 5) * 0.05
      const color = random01(levelIndex, row, col, 6) > 0.5 ? 0x2f4a2e : 0x365637

      candidates.push({
        x: col * tileSize + tileSize / 2 + jitterX,
        y: row * tileSize + tileSize / 2 + jitterY,
        radius,
        alpha,
        color
      })
    }
  }

  const maxDecals = Math.max(6, Math.floor(rows * cols * 0.05))
  return candidates.slice(0, maxDecals)
}

export function getParallaxOffset(playerCoord: number, roomCenterCoord: number, factor: number, maxOffset: number): number {
  const offset = (playerCoord - roomCenterCoord) * factor
  return Math.max(-maxOffset, Math.min(maxOffset, offset))
}
