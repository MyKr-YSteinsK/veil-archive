import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  calculateBalance,
  calculateTodayStats,
  getDayWindow,
  ledgerRecordService,
  settingsService,
  type LedgerKind,
  type LedgerRecord,
} from '../data'

export default function useTemplatePageData<T>(
  listTemplates: () => Promise<T[]>,
  recordKind: LedgerKind,
  onLoadError: () => void,
) {
  const [templates, setTemplates] = useState<T[]>([])
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [dayStartTime, setDayStartTime] = useState('00:00')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [nextTemplates, nextRecords, settings] = await Promise.all([
      listTemplates(),
      ledgerRecordService.list(),
      settingsService.get(),
    ])
    setTemplates(nextTemplates)
    setRecords(nextRecords)
    setDayStartTime(settings.dayStartTime)
  }, [listTemplates])

  useEffect(() => {
    refresh().catch(onLoadError).finally(() => setLoading(false))
  }, [onLoadError, refresh])

  const todayWindow = useMemo(() => getDayWindow(new Date(), dayStartTime), [dayStartTime])
  const balance = useMemo(() => calculateBalance(records), [records])
  const todayStats = useMemo(() => calculateTodayStats(records, new Date(), dayStartTime), [records, dayStartTime])
  const recordsByTemplate = useMemo(() => {
    const grouped = new Map<string, LedgerRecord[]>()
    records.forEach((record) => {
      if (record.kind !== recordKind || !record.templateId) return
      const matches = grouped.get(record.templateId) ?? []
      matches.push(record)
      grouped.set(record.templateId, matches)
    })
    return grouped
  }, [recordKind, records])

  return { templates, recordsByTemplate, todayWindow, balance, todayStats, loading, refresh }
}
