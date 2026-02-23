import { clampSfxVolume } from './accessibility'

export const SFX_VOLUME_STEP = 0.05

export function toggleEnabled(current: boolean): boolean {
  return !current
}

export function stepSfxVolume(current: number, direction: -1 | 1): number {
  const base = Number.isFinite(current) ? current : 0
  const stepped = Math.round((base + direction * SFX_VOLUME_STEP) * 100) / 100
  return clampSfxVolume(stepped, 0)
}
