import type { LedgerKind, LedgerRecord, TemplateType } from './types'
import { requireDayStartTime } from './validation'

export type DayWindow = { start: Date; end: Date }
export type LedgerStats = {
  balance: number
  gained: number
  spent: number
  taskCount: number
  rewardCount: number
}

export function calculateBalance(records: readonly Pick<LedgerRecord, 'pointsDelta'>[]): number {
  return records.reduce((total, record) => total + record.pointsDelta, 0)
}

export function getDayWindow(reference: Date | string = new Date(), dayStartTime = '00:00'): DayWindow {
  requireDayStartTime(dayStartTime)
  const current = typeof reference === 'string' ? new Date(reference) : new Date(reference)
  if (Number.isNaN(current.getTime())) throw new TypeError('reference must be a valid date')
  const [hours, minutes] = dayStartTime.split(':').map(Number)
  const start = new Date(current)
  start.setHours(hours, minutes, 0, 0)
  if (current < start) start.setDate(start.getDate() - 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export function isWithinDay(occurredAt: string | Date, window: DayWindow): boolean {
  const timestamp = new Date(occurredAt).getTime()
  return timestamp >= window.start.getTime() && timestamp < window.end.getTime()
}

export function recordsForDay(
  records: readonly LedgerRecord[],
  reference: Date | string = new Date(),
  dayStartTime = '00:00',
): LedgerRecord[] {
  const window = getDayWindow(reference, dayStartTime)
  return records.filter((record) => isWithinDay(record.occurredAt, window))
}

export function calculateStats(records: readonly LedgerRecord[]): LedgerStats {
  return records.reduce<LedgerStats>((stats, record) => {
    stats.balance += record.pointsDelta
    if (record.pointsDelta > 0) stats.gained += record.pointsDelta
    if (record.pointsDelta < 0) stats.spent += Math.abs(record.pointsDelta)
    if (record.kind === 'task') stats.taskCount += 1
    if (record.kind === 'reward') stats.rewardCount += 1
    return stats
  }, { balance: 0, gained: 0, spent: 0, taskCount: 0, rewardCount: 0 })
}

export function calculateTodayStats(
  records: readonly LedgerRecord[],
  reference: Date | string = new Date(),
  dayStartTime = '00:00',
): LedgerStats {
  return calculateStats(recordsForDay(records, reference, dayStartTime))
}

export function countRecords(
  records: readonly LedgerRecord[],
  filters: { kind?: LedgerKind; templateId?: string; templateType?: TemplateType } = {},
): number {
  return records.filter((record) =>
    (filters.kind === undefined || record.kind === filters.kind)
    && (filters.templateId === undefined || record.templateId === filters.templateId)
    && (filters.templateType === undefined || record.templateType === filters.templateType),
  ).length
}

export function isOneTimeTemplateUsed(records: readonly LedgerRecord[], templateId: string): boolean {
  return records.some((record) => record.templateId === templateId && record.templateType === 'oneTime')
}
