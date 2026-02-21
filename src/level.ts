export type LevelPoint = {
  x: number
  y: number
}

export type LevelData = {
  width: number
  height: number
  spawn: LevelPoint
  exit?: LevelPoint
  walls: LevelPoint[]
  thinPlatforms: LevelPoint[]
  hazards: LevelPoint[]
}

export function parseLevel(level: string[], tileSize: number): LevelData {
  const rows = level.length
  const cols = level[0]?.length ?? 0

  let spawn: LevelPoint = { x: tileSize / 2, y: tileSize / 2 }
  let exit: LevelPoint | undefined
  const walls: LevelPoint[] = []
  const thinPlatforms: LevelPoint[] = []
  const hazards: LevelPoint[] = []

  level.forEach((row, rowIndex) => {
    Array.from(row).forEach((cell, colIndex) => {
      const x = colIndex * tileSize + tileSize / 2
      const y = rowIndex * tileSize + tileSize / 2

      if (cell === '#') {
        walls.push({ x, y })
      } else if (cell === 'S') {
        spawn = { x, y }
      } else if (cell === 'E') {
        exit = { x, y }
      } else if (cell === '~') {
        thinPlatforms.push({ x, y })
      } else if (cell === '^') {
        hazards.push({ x, y })
      }
    })
  })

  return {
    width: cols * tileSize,
    height: rows * tileSize,
    spawn,
    exit,
    walls,
    thinPlatforms,
    hazards
  }
}
