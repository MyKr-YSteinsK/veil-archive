import type { LedgerRecord, RewardTemplate, TaskTemplate } from './types'

const FIELDS = [
  'entityType', 'id', 'name', 'icon', 'templateType', 'pointsOrCost', 'kind', 'pointsDelta',
  'occurredAt', 'createdAt', 'updatedAt', 'deletedAt', 'templateId', 'titleSnapshot', 'iconSnapshot',
] as const

type CsvRow = Record<(typeof FIELDS)[number], string | number | undefined>

export function createArchiveCsv(
  tasks: readonly TaskTemplate[],
  rewards: readonly RewardTemplate[],
  records: readonly LedgerRecord[],
): string {
  const rows: CsvRow[] = [
    ...tasks.map((item) => ({
      entityType: 'TASK_TEMPLATE', id: item.id, name: item.name, icon: item.icon,
      templateType: item.type, pointsOrCost: item.points, createdAt: item.createdAt,
      updatedAt: item.updatedAt, deletedAt: item.deletedAt,
    } as CsvRow)),
    ...rewards.map((item) => ({
      entityType: 'REWARD_TEMPLATE', id: item.id, name: item.name, icon: item.icon,
      templateType: item.type, pointsOrCost: item.cost, createdAt: item.createdAt,
      updatedAt: item.updatedAt, deletedAt: item.deletedAt,
    } as CsvRow)),
    ...records.map((item) => ({
      entityType: 'LEDGER_RECORD', id: item.id, templateType: item.templateType,
      kind: item.kind, pointsDelta: item.pointsDelta, occurredAt: item.occurredAt,
      createdAt: item.createdAt, updatedAt: item.updatedAt, templateId: item.templateId,
      titleSnapshot: item.titleSnapshot, iconSnapshot: item.iconSnapshot,
    } as CsvRow)),
  ]
  return [FIELDS.join(','), ...rows.map((row) => FIELDS.map((field) => csvCell(row[field])).join(','))].join('\r\n')
}

function csvCell(value: string | number | undefined): string {
  const text = value === undefined ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
