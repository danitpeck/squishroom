export const SCREEN_SHAKE_STORAGE_KEY = 'squishroom.screenShakeEnabled'

export function parseScreenShakeSetting(value: string | null): boolean {
  if (value === 'false') {
    return false
  }

  return true
}

export function loadScreenShakeEnabled(storage: Pick<Storage, 'getItem'> | undefined): boolean {
  if (!storage) {
    return true
  }

  return parseScreenShakeSetting(storage.getItem(SCREEN_SHAKE_STORAGE_KEY))
}

export function saveScreenShakeEnabled(
  storage: Pick<Storage, 'setItem'> | undefined,
  enabled: boolean
): void {
  storage?.setItem(SCREEN_SHAKE_STORAGE_KEY, String(enabled))
}
