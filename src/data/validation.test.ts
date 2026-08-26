import { describe, expect, it } from 'vitest'
import {
  requireDayStartTime,
  requireIcon,
  requireIsoDate,
  requireLedgerDelta,
  requireName,
  requirePositiveInteger,
  requireTemplateType,
  requireThemeMode,
} from './validation'

describe('validation', () => {
  it('trims valid names and icons and rejects missing or overlong names', () => {
    expect(requireName('  读书  ')).toBe('读书')
    expect(requireIcon(' focus ')).toBe('focus')
    expect(() => requireName('   ')).toThrow(TypeError)
    expect(() => requireIcon('   ')).toThrow(TypeError)
    expect(() => requireName('a'.repeat(31))).toThrow(RangeError)
  })

  it('accepts only positive safe integers for template amounts', () => {
    expect(requirePositiveInteger(1, 'points')).toBe(1)
    expect(requirePositiveInteger(Number.MAX_SAFE_INTEGER, 'points')).toBe(Number.MAX_SAFE_INTEGER)
    expect(() => requirePositiveInteger(0, 'points')).toThrow(TypeError)
    expect(() => requirePositiveInteger(-1, 'points')).toThrow(TypeError)
    expect(() => requirePositiveInteger(1.5, 'points')).toThrow(TypeError)
  })

  it('validates template types and ledger delta signs', () => {
    expect(requireTemplateType('repeatable')).toBe('repeatable')
    expect(requireTemplateType('oneTime')).toBe('oneTime')
    expect(() => requireTemplateType('weekly' as never)).toThrow(TypeError)

    expect(requireLedgerDelta('task', 3)).toBe(3)
    expect(requireLedgerDelta('reward', -3)).toBe(-3)
    expect(() => requireLedgerDelta('task', -3)).toThrow(TypeError)
    expect(() => requireLedgerDelta('reward', 3)).toThrow(TypeError)
    expect(() => requireLedgerDelta('task', 0)).toThrow(TypeError)
    expect(() => requireLedgerDelta('reward', -1.5)).toThrow(TypeError)
  })

  it('normalizes ISO dates and validates time and theme values', () => {
    expect(requireIsoDate('2026-08-26T08:00:00+08:00', 'occurredAt')).toBe('2026-08-26T00:00:00.000Z')
    expect(() => requireIsoDate('not-a-date', 'occurredAt')).toThrow(TypeError)

    expect(requireDayStartTime('00:00')).toBe('00:00')
    expect(requireDayStartTime('23:59')).toBe('23:59')
    expect(() => requireDayStartTime('24:00')).toThrow(TypeError)
    expect(() => requireDayStartTime('9:00')).toThrow(TypeError)
    expect(() => requireDayStartTime('12:60')).toThrow(TypeError)

    expect(requireThemeMode('system')).toBe('system')
    expect(requireThemeMode('light')).toBe('light')
    expect(requireThemeMode('dark')).toBe('dark')
    expect(() => requireThemeMode('sepia' as never)).toThrow(TypeError)
  })
})
