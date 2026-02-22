export type TileGlyph = '#' | '~' | '^' | 'E'

export type RenderSkinMode = 'classic' | 'skinned'

export type TileRenderStyle = {
  fillColor: number
  strokeColor?: number
  strokeWidth?: number
  alpha?: number
  widthScale?: number
  heightScale?: number
  yOffsetScale?: number
}

const CLASSIC_TILE_STYLE: Record<TileGlyph, TileRenderStyle> = {
  '#': { fillColor: 0x3f5d3a, widthScale: 1, heightScale: 1 },
  '~': { fillColor: 0x7aa17a, widthScale: 1, heightScale: 0.35 },
  '^': { fillColor: 0xd24a43, widthScale: 0.7, heightScale: 0.4 },
  E: { fillColor: 0xd4c24f, widthScale: 0.8, heightScale: 0.6 }
}

const SKINNED_TILE_STYLE: Record<TileGlyph, TileRenderStyle> = {
  '#': {
    fillColor: 0x4d7650,
    strokeColor: 0x9dc29b,
    strokeWidth: 2,
    widthScale: 1,
    heightScale: 1,
    alpha: 0.98
  },
  '~': {
    fillColor: 0x6d9f7d,
    strokeColor: 0xb6dfbf,
    strokeWidth: 2,
    widthScale: 1,
    heightScale: 0.35,
    alpha: 0.96
  },
  '^': {
    fillColor: 0xcf5b51,
    strokeColor: 0xffb1a8,
    strokeWidth: 2,
    widthScale: 0.7,
    heightScale: 0.4,
    alpha: 0.98
  },
  E: {
    fillColor: 0xd7c775,
    strokeColor: 0xffe7a7,
    strokeWidth: 2,
    widthScale: 0.8,
    heightScale: 0.6,
    alpha: 0.98
  }
}

export function resolveRenderSkinMode(search: string, fallback: RenderSkinMode = 'skinned'): RenderSkinMode {
  const params = new URLSearchParams(search)
  const requested = params.get('skin')
  if (requested === 'classic' || requested === 'skinned') {
    return requested
  }

  return fallback
}

export function getTileRenderStyle(glyph: TileGlyph, mode: RenderSkinMode): TileRenderStyle {
  return mode === 'classic' ? CLASSIC_TILE_STYLE[glyph] : SKINNED_TILE_STYLE[glyph]
}
