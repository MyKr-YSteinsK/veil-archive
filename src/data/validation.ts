import type { LedgerKind, TemplateType, ThemeMode } from './types'

const DAY_START_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export function requireName(name: string, field = 'name'): string {
  const value = name.trim()
  if (!value) throw new TypeError(`${field} is required`)
  if ([...value].length > 30) throw new RangeError(`${field} must be at most 30 characters`)
  return value
}

export function requireIcon(icon: string): string {
  const value = icon.trim()
  if (!value) throw new TypeError('icon is required')
  return value
}

export function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive integer`)
  }
  return value
}

export function requireTemplateType(value: TemplateType): TemplateType {
  if (value !== 'repeatable' && value !== 'oneTime') throw new TypeError('invalid template type')
  return value
}

export function requireLedgerDelta(kind: LedgerKind, value: number): number {
  if (!Number.isSafeInteger(value) || value === 0) throw new TypeError('pointsDelta must be a non-zero integer')
  if (kind === 'task' && value < 0) throw new TypeError('task pointsDelta must be positive')
  if (kind === 'reward' && value > 0) throw new TypeError('reward pointsDelta must be negative')
  return value
}

export function requireIsoDate(value: string, field: string): string {
  if (!value || Number.isNaN(Date.parse(value))) throw new TypeError(`${field} must be a valid date`)
  return new Date(value).toISOString()
}

export function requireDayStartTime(value: string): string {
  if (!DAY_START_PATTERN.test(value)) throw new TypeError('dayStartTime must use HH:mm format')
  return value
}

export function requireThemeMode(value: ThemeMode): ThemeMode {
  if (!['system', 'light', 'dark'].includes(value)) throw new TypeError('invalid theme mode')
  return value
}
