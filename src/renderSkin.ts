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
  edgeColor?: number
  edgeHeightScale?: number
}

export type RenderPaletteMode = 'normal' | 'high-contrast'

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
    alpha: 0.98,
    edgeColor: 0xbad4b5,
    edgeHeightScale: 0.1
  },
  '~': {
    fillColor: 0x6d9f7d,
    strokeColor: 0xb6dfbf,
    strokeWidth: 2,
    widthScale: 1,
    heightScale: 0.35,
    alpha: 0.96,
    edgeColor: 0xd3ebd8,
    edgeHeightScale: 0.42
  },
  '^': {
    fillColor: 0xcf5b51,
    strokeColor: 0xffb1a8,
    strokeWidth: 2,
    widthScale: 0.7,
    heightScale: 0.4,
    alpha: 0.98,
    edgeColor: 0xffd0ca,
    edgeHeightScale: 0.3
  },
  E: {
    fillColor: 0xd7c775,
    strokeColor: 0xffe7a7,
    strokeWidth: 2,
    widthScale: 0.8,
    heightScale: 0.6,
    alpha: 0.98,
    edgeColor: 0xfff0c7,
    edgeHeightScale: 0.22
  }
}

const HIGH_CONTRAST_TILE_STYLE: Record<TileGlyph, TileRenderStyle> = {
  '#': {
    fillColor: 0x2f5332,
    strokeColor: 0xe8f6e6,
    strokeWidth: 2,
    widthScale: 1,
    heightScale: 1,
    alpha: 1,
    edgeColor: 0xffffff,
    edgeHeightScale: 0.1
  },
  '~': {
    fillColor: 0x4f8f60,
    strokeColor: 0xf0fff1,
    strokeWidth: 2,
    widthScale: 1,
    heightScale: 0.35,
    alpha: 1,
    edgeColor: 0xffffff,
    edgeHeightScale: 0.42
  },
  '^': {
    fillColor: 0xc63d36,
    strokeColor: 0xfff0ee,
    strokeWidth: 2,
    widthScale: 0.7,
    heightScale: 0.4,
    alpha: 1,
    edgeColor: 0xffffff,
    edgeHeightScale: 0.3
  },
  E: {
    fillColor: 0xc5ae40,
    strokeColor: 0xfff5cc,
    strokeWidth: 2,
    widthScale: 0.8,
    heightScale: 0.6,
    alpha: 1,
    edgeColor: 0xffffff,
    edgeHeightScale: 0.22
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

export function resolveRenderPaletteMode(search: string, fallback: RenderPaletteMode = 'normal'): RenderPaletteMode {
  const params = new URLSearchParams(search)
  const requested = params.get('contrast')
  if (requested === 'high') {
    return 'high-contrast'
  }

  return fallback
}

export function getTileRenderStyle(
  glyph: TileGlyph,
  mode: RenderSkinMode,
  palette: RenderPaletteMode = 'normal'
): TileRenderStyle {
  if (mode === 'classic') {
    return CLASSIC_TILE_STYLE[glyph]
  }

  return palette === 'high-contrast' ? HIGH_CONTRAST_TILE_STYLE[glyph] : SKINNED_TILE_STYLE[glyph]
}
