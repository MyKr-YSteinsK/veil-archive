import { describe, expect, it } from 'vitest'
import {
  calculateBalance,
  calculateTodayStats,
  getDayWindow,
  isOneTimeTemplateUsed,
  recordsForDay,
} from './calculations'
import type { LedgerRecord } from './types'

function localDate(day: number, hour: number, minute = 0, second = 0, millisecond = 0) {
  return new Date(2026, 7, day, hour, minute, second, millisecond)
}

function record(pointsDelta: number, occurredAt: Date): LedgerRecord {
  return {
    id: `${occurredAt.toISOString()}-${pointsDelta}`,
    kind: pointsDelta > 0 ? 'task' : 'reward',
    templateType: 'repeatable',
    titleSnapshot: '测试条目',
    iconSnapshot: 'focus',
    pointsDelta,
    occurredAt: occurredAt.toISOString(),
    createdAt: occurredAt.toISOString(),
    updatedAt: occurredAt.toISOString(),
  }
}

describe('ledger calculations', () => {
  it('derives an empty balance as zero and sums positive and negative deltas independent of order', () => {
    const records = [record(5, localDate(26, 9)), record(-2, localDate(26, 10)), record(8, localDate(26, 11))]

    expect(calculateBalance([])).toBe(0)
    expect(calculateBalance(records)).toBe(11)
    expect(calculateBalance([...records].reverse())).toBe(11)
  })

  it('calculates today statistics from records inside the default day window', () => {
    const reference = localDate(26, 12)
    const records = [
      record(5, localDate(26, 9)),
      record(-2, localDate(26, 11)),
      record(20, localDate(27, 1)),
    ]

    expect(calculateTodayStats(records, reference)).toEqual({
      balance: 3,
      gained: 5,
      spent: 2,
      taskCount: 1,
      rewardCount: 1,
    })
  })

  it('uses a non-default day start at the current implementation boundaries', () => {
    const reference = localDate(26, 8)
    const records = [
      record(99, localDate(26, 6, 29, 59, 999)),
      record(5, localDate(26, 6, 30)),
      record(-2, localDate(27, 6, 29, 59, 999)),
      record(11, localDate(27, 6, 30)),
    ]
    const window = getDayWindow(reference, '06:30')

    expect(window.start).toEqual(localDate(26, 6, 30))
    expect(window.end).toEqual(localDate(27, 6, 30))
    expect(recordsForDay(records, reference, '06:30').map((item) => item.pointsDelta)).toEqual([5, -2])
    expect(calculateTodayStats(records, reference, '06:30')).toMatchObject({
      balance: 3,
      gained: 5,
      spent: 2,
      taskCount: 1,
      rewardCount: 1,
    })
  })

  it('keeps the configured statistics window continuous for exactly 24 hours', () => {
    const reference = localDate(27, 2, 30)
    const records = [
      record(99, localDate(26, 3, 59, 59, 999)),
      record(5, localDate(26, 4)),
      record(-2, localDate(27, 3, 59, 59, 999)),
      record(11, localDate(27, 4)),
    ]
    const window = getDayWindow(reference, '04:00')

    expect(window.start).toEqual(localDate(26, 4))
    expect(window.end).toEqual(localDate(27, 4))
    expect(window.end.getTime() - window.start.getTime()).toBe(24 * 60 * 60 * 1000)
    expect(recordsForDay(records, reference, '04:00').map((item) => item.pointsDelta)).toEqual([5, -2])
  })

  it('uses kind and template identity regardless of the historical type snapshot', () => {
    const records = [
      { ...record(5, localDate(26, 9)), id: 'task-shared', kind: 'task' as const, templateId: 'shared' },
      { ...record(-2, localDate(26, 10)), id: 'reward-shared', kind: 'reward' as const, templateId: 'shared', templateType: 'oneTime' as const },
    ]

    expect(isOneTimeTemplateUsed(records, 'task', 'shared')).toBe(true)
    expect(isOneTimeTemplateUsed(records, 'reward', 'shared')).toBe(true)
    expect(isOneTimeTemplateUsed(records, 'task', 'missing')).toBe(false)
    expect(isOneTimeTemplateUsed(records, 'reward', 'missing')).toBe(false)
  })
})
