import { describe, expect, it } from 'vitest'
import { getTileRenderStyle, resolveRenderPaletteMode, resolveRenderSkinMode } from '../src/renderSkin'

describe('renderSkin', () => {
  it('uses skinned mode by default', () => {
    expect(resolveRenderSkinMode('')).toBe('skinned')
  })

  it('supports explicit classic mode via query string', () => {
    expect(resolveRenderSkinMode('?skin=classic')).toBe('classic')
  })

  it('falls back when unknown skin mode is provided', () => {
    expect(resolveRenderSkinMode('?skin=retro', 'classic')).toBe('classic')
  })

  it('supports high-contrast palette mode via query string', () => {
    expect(resolveRenderPaletteMode('?contrast=high')).toBe('high-contrast')
    expect(resolveRenderPaletteMode('?contrast=normal')).toBe('normal')
  })

  it('keeps classic and skinned dimensions aligned for gameplay safety', () => {
    const classicWall = getTileRenderStyle('#', 'classic')
    const skinnedWall = getTileRenderStyle('#', 'skinned')

    expect(skinnedWall.widthScale).toBe(classicWall.widthScale)
    expect(skinnedWall.heightScale).toBe(classicWall.heightScale)

    const classicHazard = getTileRenderStyle('^', 'classic')
    const skinnedHazard = getTileRenderStyle('^', 'skinned')

    expect(skinnedHazard.widthScale).toBe(classicHazard.widthScale)
    expect(skinnedHazard.heightScale).toBe(classicHazard.heightScale)
  })

  it('keeps high-contrast skin dimensions aligned with normal skinned mode', () => {
    const skinnedExit = getTileRenderStyle('E', 'skinned', 'normal')
    const contrastExit = getTileRenderStyle('E', 'skinned', 'high-contrast')

    expect(contrastExit.widthScale).toBe(skinnedExit.widthScale)
    expect(contrastExit.heightScale).toBe(skinnedExit.heightScale)
  })
})
