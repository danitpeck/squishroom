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
  wallSegments: { x: number; y: number; width: number; height: number }[]
  thinPlatforms: LevelPoint[]
  hazards: LevelPoint[]
}

export function parseLevel(level: string[], tileSize: number): LevelData {
  const rows = level.length
  const cols = level[0]?.length ?? 0

  let spawn: LevelPoint = { x: tileSize / 2, y: tileSize / 2 }
  let exit: LevelPoint | undefined
  const walls: LevelPoint[] = []
  const wallRunsByColumn = new Map<number, { startRow: number; endRow: number }[]>()
  const thinPlatforms: LevelPoint[] = []
  const hazards: LevelPoint[] = []

  level.forEach((row, rowIndex) => {
    Array.from(row).forEach((cell, colIndex) => {
      const x = colIndex * tileSize + tileSize / 2
      const y = rowIndex * tileSize + tileSize / 2

      if (cell === '#') {
        walls.push({ x, y })

        const runs = wallRunsByColumn.get(colIndex)
        const currentRow = rowIndex
        const lastRun = runs?.at(-1)

        if (!runs) {
          wallRunsByColumn.set(colIndex, [{ startRow: currentRow, endRow: currentRow }])
        } else if (lastRun && lastRun.endRow + 1 === currentRow) {
          lastRun.endRow = currentRow
        } else {
          runs.push({ startRow: currentRow, endRow: currentRow })
        }
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

  const wallSegments = Array.from(wallRunsByColumn.entries())
    .sort(([leftCol], [rightCol]) => leftCol - rightCol)
    .flatMap(([colIndex, runs]) => {
      const x = colIndex * tileSize + tileSize / 2

      return runs.map((run) => {
        const tileCount = run.endRow - run.startRow + 1
        const topEdge = run.startRow * tileSize
        const height = tileCount * tileSize

        return {
          x,
          y: topEdge + height / 2,
          width: tileSize,
          height
        }
      })
    })

  return {
    width: cols * tileSize,
    height: rows * tileSize,
    spawn,
    exit,
    walls,
    wallSegments,
    thinPlatforms,
    hazards
  }
}
