import { APP_VERSION } from './changelog'
import { db, type StoredSettings } from './database'
import type {
  LedgerKind,
  LedgerRecord,
  RewardTemplate,
  Settings,
  TaskTemplate,
  TemplateType,
} from './types'
import {
  requireDayStartTime,
  requireIcon,
  requireLedgerDelta,
  requireName,
  requirePositiveInteger,
  requireTemplateType,
  requireThemeMode,
} from './validation'

export const BACKUP_FORMAT = 'veil-archive-backup' as const
export const BACKUP_FORMAT_VERSION = 1 as const
export const BACKUP_DATABASE_SCHEMA_VERSION = 1 as const

export type BackupSettings = Pick<Settings, 'themeMode' | 'dayStartTime'>

export type ArchiveBackup = {
  format: typeof BACKUP_FORMAT
  formatVersion: typeof BACKUP_FORMAT_VERSION
  databaseSchemaVersion: typeof BACKUP_DATABASE_SCHEMA_VERSION
  exportedAt: string
  appVersion: string
  data: {
    taskTemplates: TaskTemplate[]
    rewardTemplates: RewardTemplate[]
    ledgerRecords: LedgerRecord[]
    settings: BackupSettings
  }
}

export type BackupTemplateSummary = {
  total: number
  active: number
  deleted: number
}

export type BackupSummary = {
  exportedAt: string
  appVersion: string
  taskTemplates: BackupTemplateSummary
  rewardTemplates: BackupTemplateSummary
  ledgerRecords: number
}

type UnknownRecord = Record<string, unknown>

export function createArchiveBackup(
  tasks: readonly TaskTemplate[],
  rewards: readonly RewardTemplate[],
  records: readonly LedgerRecord[],
  settings: Pick<Settings, 'themeMode' | 'dayStartTime'>,
  exportedAt = new Date().toISOString(),
): ArchiveBackup {
  return validateArchiveBackup({
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    databaseSchemaVersion: BACKUP_DATABASE_SCHEMA_VERSION,
    exportedAt,
    appVersion: APP_VERSION,
    data: {
      taskTemplates: tasks.map((item) => ({ ...item })),
      rewardTemplates: rewards.map((item) => ({ ...item })),
      ledgerRecords: records.map((item) => ({ ...item })),
      settings: {
        themeMode: settings.themeMode,
        dayStartTime: settings.dayStartTime,
      },
    },
  })
}

export function serializeArchiveBackup(backup: ArchiveBackup): string {
  return JSON.stringify(backup, null, 2)
}

export function parseArchiveBackup(text: string): ArchiveBackup {
  let value: unknown
  try {
    value = JSON.parse(text) as unknown
  } catch {
    throw new TypeError('备份文件不是有效的 JSON')
  }
  return validateArchiveBackup(value)
}

export function validateArchiveBackup(value: unknown): ArchiveBackup {
  const source = asRecord(value, 'backup')
  if (source.format !== BACKUP_FORMAT) throw new TypeError('不支持的备份格式')
  requireVersion(source.formatVersion, BACKUP_FORMAT_VERSION, 'formatVersion')
  requireVersion(source.databaseSchemaVersion, BACKUP_DATABASE_SCHEMA_VERSION, 'databaseSchemaVersion')

  const data = asRecord(source.data, 'data')
  const settingsSource = asRecord(data.settings, 'data.settings')
  const taskTemplates = validateTasks(data.taskTemplates)
  const rewardTemplates = validateRewards(data.rewardTemplates)
  const ledgerRecords = validateLedgerRecords(data.ledgerRecords)
  rejectDuplicateIds(taskTemplates, 'data.taskTemplates')
  rejectDuplicateIds(rewardTemplates, 'data.rewardTemplates')
  rejectDuplicateIds(ledgerRecords, 'data.ledgerRecords')
  validateLedgerReferences(ledgerRecords, taskTemplates, rewardTemplates)

  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    databaseSchemaVersion: BACKUP_DATABASE_SCHEMA_VERSION,
    exportedAt: requireCanonicalIsoDate(source.exportedAt, 'exportedAt'),
    appVersion: requireNonEmptyString(source.appVersion, 'appVersion'),
    data: {
      taskTemplates,
      rewardTemplates,
      ledgerRecords,
      settings: {
        themeMode: requireThemeMode(settingsSource.themeMode as Settings['themeMode']),
        dayStartTime: requireDayStartTime(settingsSource.dayStartTime as string),
      },
    },
  }
}

export function summarizeArchiveBackup(backup: ArchiveBackup): BackupSummary {
  return {
    exportedAt: backup.exportedAt,
    appVersion: backup.appVersion,
    taskTemplates: summarizeTemplates(backup.data.taskTemplates),
    rewardTemplates: summarizeTemplates(backup.data.rewardTemplates),
    ledgerRecords: backup.data.ledgerRecords.length,
  }
}

export async function restoreArchiveBackup(value: unknown): Promise<void> {
  const backup = validateArchiveBackup(value)
  const storedSettings: StoredSettings = {
    key: 'settings',
    ...backup.data.settings,
    appVersion: APP_VERSION,
  }

  await db.transaction('rw', [db.taskTemplates, db.rewardTemplates, db.ledgerRecords, db.settings], async () => {
    await db.taskTemplates.clear()
    await db.rewardTemplates.clear()
    await db.ledgerRecords.clear()
    await db.settings.clear()
    await db.taskTemplates.bulkAdd(backup.data.taskTemplates)
    await db.rewardTemplates.bulkAdd(backup.data.rewardTemplates)
    await db.ledgerRecords.bulkAdd(backup.data.ledgerRecords)
    await db.settings.add(storedSettings)
  })
}

function asRecord(value: unknown, field: string): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object`)
  }
  return value as UnknownRecord
}

function asArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`)
  return value
}

function requireVersion(value: unknown, expected: number, field: string): void {
  if (value !== expected) throw new TypeError(`unsupported ${field}`)
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value || value.trim() !== value) throw new TypeError(`${field} must be a non-empty string`)
  return value
}

function requirePreservedName(value: unknown, field: string): string {
  const text = requireNonEmptyString(value, field)
  if (requireName(text, field) !== text) throw new TypeError(`${field} must use its stored trimmed value`)
  return text
}

function requirePreservedIcon(value: unknown, field: string): string {
  const text = requireNonEmptyString(value, field)
  if (requireIcon(text) !== text) throw new TypeError(`${field} must use its stored trimmed value`)
  return text
}

function requireCanonicalIsoDate(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value) throw new TypeError(`${field} must be a valid ISO date`)
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) throw new TypeError(`${field} must be a valid ISO date`)
  return value
}

function requireId(value: unknown, field: string): string {
  return requireNonEmptyString(value, field)
}

function requireLedgerKind(value: unknown, field: string): LedgerKind {
  if (value !== 'task' && value !== 'reward') throw new TypeError(`${field} must be task or reward`)
  return value
}

function requireOptionalSortOrder(source: UnknownRecord, item: TaskTemplate | RewardTemplate): void {
  if (source.sortOrder === undefined) return
  if (!Number.isSafeInteger(source.sortOrder) || (source.sortOrder as number) < 0) throw new TypeError('sortOrder must be a non-negative integer')
  item.sortOrder = source.sortOrder as number
}

function requireOptionalPinned(source: UnknownRecord, item: TaskTemplate | RewardTemplate): void {
  if (source.pinned === undefined) return
  if (typeof source.pinned !== 'boolean') throw new TypeError('pinned must be a boolean')
  item.pinned = source.pinned
}

function requireOptionalDeletedAt(source: UnknownRecord, item: TaskTemplate | RewardTemplate): void {
  if (source.deletedAt === undefined) return
  item.deletedAt = requireCanonicalIsoDate(source.deletedAt, 'deletedAt')
}

function validateTask(value: unknown, index: number): TaskTemplate {
  const source = asRecord(value, `data.taskTemplates[${index}]`)
  const item: TaskTemplate = {
    id: requireId(source.id, `data.taskTemplates[${index}].id`),
    name: requirePreservedName(source.name, `data.taskTemplates[${index}].name`),
    icon: requirePreservedIcon(source.icon, `data.taskTemplates[${index}].icon`),
    points: requirePositiveInteger(source.points as number, `data.taskTemplates[${index}].points`),
    type: requireTemplateType(source.type as TemplateType),
    createdAt: requireCanonicalIsoDate(source.createdAt, `data.taskTemplates[${index}].createdAt`),
    updatedAt: requireCanonicalIsoDate(source.updatedAt, `data.taskTemplates[${index}].updatedAt`),
  }
  requireOptionalSortOrder(source, item)
  requireOptionalPinned(source, item)
  requireOptionalDeletedAt(source, item)
  return item
}

function validateReward(value: unknown, index: number): RewardTemplate {
  const source = asRecord(value, `data.rewardTemplates[${index}]`)
  const item: RewardTemplate = {
    id: requireId(source.id, `data.rewardTemplates[${index}].id`),
    name: requirePreservedName(source.name, `data.rewardTemplates[${index}].name`),
    icon: requirePreservedIcon(source.icon, `data.rewardTemplates[${index}].icon`),
    cost: requirePositiveInteger(source.cost as number, `data.rewardTemplates[${index}].cost`),
    type: requireTemplateType(source.type as TemplateType),
    createdAt: requireCanonicalIsoDate(source.createdAt, `data.rewardTemplates[${index}].createdAt`),
    updatedAt: requireCanonicalIsoDate(source.updatedAt, `data.rewardTemplates[${index}].updatedAt`),
  }
  requireOptionalSortOrder(source, item)
  requireOptionalPinned(source, item)
  requireOptionalDeletedAt(source, item)
  return item
}

function validateLedgerRecord(value: unknown, index: number): LedgerRecord {
  const source = asRecord(value, `data.ledgerRecords[${index}]`)
  const kind = requireLedgerKind(source.kind, `data.ledgerRecords[${index}].kind`)
  const item: LedgerRecord = {
    id: requireId(source.id, `data.ledgerRecords[${index}].id`),
    kind,
    templateType: requireTemplateType(source.templateType as TemplateType),
    titleSnapshot: requirePreservedName(source.titleSnapshot, `data.ledgerRecords[${index}].titleSnapshot`),
    iconSnapshot: requirePreservedIcon(source.iconSnapshot, `data.ledgerRecords[${index}].iconSnapshot`),
    pointsDelta: requireLedgerDelta(kind, source.pointsDelta as number),
    occurredAt: requireCanonicalIsoDate(source.occurredAt, `data.ledgerRecords[${index}].occurredAt`),
    createdAt: requireCanonicalIsoDate(source.createdAt, `data.ledgerRecords[${index}].createdAt`),
    updatedAt: requireCanonicalIsoDate(source.updatedAt, `data.ledgerRecords[${index}].updatedAt`),
  }
  if (source.templateId !== undefined) item.templateId = requireId(source.templateId, `data.ledgerRecords[${index}].templateId`)
  return item
}

function validateTasks(value: unknown): TaskTemplate[] {
  return asArray(value, 'data.taskTemplates').map(validateTask)
}

function validateRewards(value: unknown): RewardTemplate[] {
  return asArray(value, 'data.rewardTemplates').map(validateReward)
}

function validateLedgerRecords(value: unknown): LedgerRecord[] {
  return asArray(value, 'data.ledgerRecords').map(validateLedgerRecord)
}

function rejectDuplicateIds(items: readonly { id: string }[], field: string): void {
  const ids = new Set<string>()
  for (const item of items) {
    if (ids.has(item.id)) throw new TypeError(`${field} contains duplicate ids`)
    ids.add(item.id)
  }
}

function validateLedgerReferences(
  records: readonly LedgerRecord[],
  tasks: readonly TaskTemplate[],
  rewards: readonly RewardTemplate[],
): void {
  const taskIds = new Set(tasks.map((item) => item.id))
  const rewardIds = new Set(rewards.map((item) => item.id))
  for (const record of records) {
    if (record.templateId === undefined) continue
    const ids = record.kind === 'task' ? taskIds : rewardIds
    if (!ids.has(record.templateId)) throw new TypeError(`ledger record ${record.id} references a missing ${record.kind} template`)
  }
}

function summarizeTemplates(items: readonly (TaskTemplate | RewardTemplate)[]): BackupTemplateSummary {
  const deleted = items.filter((item) => item.deletedAt !== undefined).length
  return { total: items.length, active: items.length - deleted, deleted }
}
