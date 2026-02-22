import { describe, expect, it, vi } from 'vitest'
import {
  loadScreenShakeEnabled,
  parseScreenShakeSetting,
  saveScreenShakeEnabled,
  SCREEN_SHAKE_STORAGE_KEY
} from '../../src/gameplay/accessibility'

describe('accessibility settings', () => {
  it('defaults screen shake to enabled', () => {
    expect(parseScreenShakeSetting(null)).toBe(true)
    expect(parseScreenShakeSetting('true')).toBe(true)
  })

  it('parses explicit false from storage', () => {
    expect(parseScreenShakeSetting('false')).toBe(false)
  })

  it('loads setting from storage', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue('false')
    }

    expect(loadScreenShakeEnabled(storage)).toBe(false)
    expect(storage.getItem).toHaveBeenCalledWith(SCREEN_SHAKE_STORAGE_KEY)
  })

  it('persists setting to storage', () => {
    const storage = {
      setItem: vi.fn()
    }

    saveScreenShakeEnabled(storage, true)
    saveScreenShakeEnabled(storage, false)

    expect(storage.setItem).toHaveBeenNthCalledWith(1, SCREEN_SHAKE_STORAGE_KEY, 'true')
    expect(storage.setItem).toHaveBeenNthCalledWith(2, SCREEN_SHAKE_STORAGE_KEY, 'false')
  })
})
