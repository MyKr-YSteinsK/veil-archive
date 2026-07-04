import Dexie, { type EntityTable } from 'dexie'
import type { LedgerRecord, RewardTemplate, Settings, TaskTemplate } from './types'

type StoredSettings = Settings & { key: 'settings' }

class VeilArchiveDatabase extends Dexie {
  taskTemplates!: EntityTable<TaskTemplate, 'id'>
  rewardTemplates!: EntityTable<RewardTemplate, 'id'>
  ledgerRecords!: EntityTable<LedgerRecord, 'id'>
  settings!: EntityTable<StoredSettings, 'key'>

  constructor() {
    super('veilArchive')
    this.version(1).stores({
      taskTemplates: 'id, type, createdAt, updatedAt, deletedAt, [type+deletedAt]',
      rewardTemplates: 'id, type, createdAt, updatedAt, deletedAt, [type+deletedAt]',
      ledgerRecords: 'id, kind, templateId, templateType, occurredAt, createdAt, [kind+occurredAt], [templateId+occurredAt]',
      settings: 'key',
    })
  }
}

export const db = new VeilArchiveDatabase()
export type { StoredSettings }
