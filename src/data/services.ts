import { db, type StoredSettings } from './database'
import { APP_VERSION } from './changelog'
import { normalizeIconId } from '../components/ui/iconRegistry'
import { createNextSortOrder, produceReorderPatch } from './templateOrdering'
import type {
  LedgerRecord,
  LedgerRecordChanges,
  NewLedgerRecord,
  NewRewardTemplate,
  NewTaskTemplate,
  RewardTemplate,
  RewardTemplateChanges,
  Settings,
  TaskTemplate,
  TaskTemplateChanges,
} from './types'
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

const SETTINGS_KEY = 'settings' as const
const DEFAULT_SETTINGS: Readonly<Settings> = {
  themeMode: 'system',
  dayStartTime: '00:00',
  appVersion: APP_VERSION,
}

const now = () => new Date().toISOString()
const newId = () => crypto.randomUUID()

function taskValues(input: NewTaskTemplate) {
  return {
    name: requireName(input.name),
    icon: normalizeIconId(requireIcon(input.icon)),
    points: requirePositiveInteger(input.points, 'points'),
    type: requireTemplateType(input.type),
  }
}

function rewardValues(input: NewRewardTemplate) {
  return {
    name: requireName(input.name),
    icon: normalizeIconId(requireIcon(input.icon)),
    cost: requirePositiveInteger(input.cost, 'cost'),
    type: requireTemplateType(input.type),
  }
}

export const taskTemplateService = {
  list: (includeDeleted = false) => includeDeleted
    ? db.taskTemplates.toArray()
    : db.taskTemplates.filter((item) => !item.deletedAt).toArray(),
  get: (id: string) => db.taskTemplates.get(id),
  async create(input: NewTaskTemplate): Promise<TaskTemplate> {
    const timestamp = now()
    const existing = await taskTemplateService.list()
    const item: TaskTemplate = { id: newId(), ...taskValues(input), sortOrder: createNextSortOrder(existing, input.type), pinned: false, createdAt: timestamp, updatedAt: timestamp }
    await db.taskTemplates.add(item)
    return item
  },
  async update(id: string, changes: TaskTemplateChanges): Promise<TaskTemplate> {
    const current = await db.taskTemplates.get(id)
    if (!current) throw new Error('Task template not found')
    const item = { ...current, ...taskValues({ ...current, ...changes }), updatedAt: now() }
    await db.taskTemplates.put(item)
    return item
  },
  async remove(id: string): Promise<void> {
    const timestamp = now()
    const changed = await db.taskTemplates.update(id, { deletedAt: timestamp, updatedAt: timestamp })
    if (!changed) throw new Error('Task template not found')
  },
  async setPinned(id: string, pinned: boolean): Promise<void> {
    const [current, existing] = await Promise.all([db.taskTemplates.get(id), taskTemplateService.list()])
    if (!current) throw new Error('Task template not found')
    await db.taskTemplates.update(id, {
      pinned,
      sortOrder: createNextSortOrder(existing.filter((item) => item.id !== id), current.type, pinned),
      updatedAt: now(),
    })
  },
  async reorder(idsInNewOrder: string[]): Promise<void> {
    if (idsInNewOrder.length < 2) return
    await db.transaction('rw', db.taskTemplates, async () => {
      const items = await db.taskTemplates.bulkGet(idsInNewOrder)
      if (items.some((item) => !item)) throw new Error('Task template not found')
      const first = items[0]!
      if (items.some((item) => item!.type !== first.type || Boolean(item!.pinned) !== Boolean(first.pinned))) throw new Error('Task templates must share an ordering group')
      const timestamp = now()
      await Promise.all(produceReorderPatch(idsInNewOrder).map(({ id, sortOrder }) => db.taskTemplates.update(id, { sortOrder, updatedAt: timestamp })))
    })
  },
}

export const rewardTemplateService = {
  list: (includeDeleted = false) => includeDeleted
    ? db.rewardTemplates.toArray()
    : db.rewardTemplates.filter((item) => !item.deletedAt).toArray(),
  get: (id: string) => db.rewardTemplates.get(id),
  async create(input: NewRewardTemplate): Promise<RewardTemplate> {
    const timestamp = now()
    const existing = await rewardTemplateService.list()
    const item: RewardTemplate = { id: newId(), ...rewardValues(input), sortOrder: createNextSortOrder(existing, input.type), pinned: false, createdAt: timestamp, updatedAt: timestamp }
    await db.rewardTemplates.add(item)
    return item
  },
  async update(id: string, changes: RewardTemplateChanges): Promise<RewardTemplate> {
    const current = await db.rewardTemplates.get(id)
    if (!current) throw new Error('Reward template not found')
    const item = { ...current, ...rewardValues({ ...current, ...changes }), updatedAt: now() }
    await db.rewardTemplates.put(item)
    return item
  },
  async remove(id: string): Promise<void> {
    const timestamp = now()
    const changed = await db.rewardTemplates.update(id, { deletedAt: timestamp, updatedAt: timestamp })
    if (!changed) throw new Error('Reward template not found')
  },
  async setPinned(id: string, pinned: boolean): Promise<void> {
    const [current, existing] = await Promise.all([db.rewardTemplates.get(id), rewardTemplateService.list()])
    if (!current) throw new Error('Reward template not found')
    await db.rewardTemplates.update(id, {
      pinned,
      sortOrder: createNextSortOrder(existing.filter((item) => item.id !== id), current.type, pinned),
      updatedAt: now(),
    })
  },
  async reorder(idsInNewOrder: string[]): Promise<void> {
    if (idsInNewOrder.length < 2) return
    await db.transaction('rw', db.rewardTemplates, async () => {
      const items = await db.rewardTemplates.bulkGet(idsInNewOrder)
      if (items.some((item) => !item)) throw new Error('Reward template not found')
      const first = items[0]!
      if (items.some((item) => item!.type !== first.type || Boolean(item!.pinned) !== Boolean(first.pinned))) throw new Error('Reward templates must share an ordering group')
      const timestamp = now()
      await Promise.all(produceReorderPatch(idsInNewOrder).map(({ id, sortOrder }) => db.rewardTemplates.update(id, { sortOrder, updatedAt: timestamp })))
    })
  },
}

export const ledgerRecordService = {
  list: () => db.ledgerRecords.orderBy('occurredAt').reverse().toArray(),
  get: (id: string) => db.ledgerRecords.get(id),
  async create(input: NewLedgerRecord): Promise<LedgerRecord> {
    const timestamp = now()
    const item: LedgerRecord = {
      id: newId(),
      kind: input.kind,
      templateId: input.templateId,
      templateType: requireTemplateType(input.templateType),
      titleSnapshot: requireName(input.titleSnapshot, 'titleSnapshot'),
      iconSnapshot: normalizeIconId(requireIcon(input.iconSnapshot)),
      pointsDelta: requireLedgerDelta(input.kind, input.pointsDelta),
      occurredAt: requireIsoDate(input.occurredAt, 'occurredAt'),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    await db.ledgerRecords.add(item)
    return item
  },
  async update(id: string, changes: LedgerRecordChanges): Promise<LedgerRecord> {
    const current = await db.ledgerRecords.get(id)
    if (!current) throw new Error('Ledger record not found')
    const item: LedgerRecord = {
      ...current,
      titleSnapshot: changes.titleSnapshot === undefined ? current.titleSnapshot : requireName(changes.titleSnapshot, 'titleSnapshot'),
      pointsDelta: changes.pointsDelta === undefined ? current.pointsDelta : requireLedgerDelta(current.kind, changes.pointsDelta),
      occurredAt: changes.occurredAt === undefined ? current.occurredAt : requireIsoDate(changes.occurredAt, 'occurredAt'),
      updatedAt: now(),
    }
    await db.ledgerRecords.put(item)
    return item
  },
  async remove(id: string): Promise<void> {
    if (!(await db.ledgerRecords.get(id))) throw new Error('Ledger record not found')
    await db.ledgerRecords.delete(id)
  },
}

export const settingsService = {
  async get(): Promise<Settings> {
    const stored = await db.settings.get(SETTINGS_KEY)
    if (stored) {
      const { key: _key, ...storedSettings } = stored
      const settings = { ...storedSettings, appVersion: APP_VERSION }
      if (stored.appVersion !== APP_VERSION) await db.settings.put({ ...stored, appVersion: APP_VERSION })
      return settings
    }
    const initial: StoredSettings = { key: SETTINGS_KEY, ...DEFAULT_SETTINGS }
    await db.settings.put(initial)
    return { ...DEFAULT_SETTINGS }
  },
  async update(changes: Partial<Settings>): Promise<Settings> {
    return db.transaction('rw', db.settings, async () => {
      const stored = await db.settings.get(SETTINGS_KEY)
      const current: Settings = stored ?? DEFAULT_SETTINGS
      const settings: Settings = {
        themeMode: changes.themeMode === undefined ? current.themeMode : requireThemeMode(changes.themeMode),
        dayStartTime: changes.dayStartTime === undefined ? current.dayStartTime : requireDayStartTime(changes.dayStartTime),
        appVersion: APP_VERSION,
      }
      await db.settings.put({ key: SETTINGS_KEY, ...settings })
      return settings
    })
  },
  defaults: DEFAULT_SETTINGS,
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.taskTemplates, db.rewardTemplates, db.ledgerRecords, db.settings], async () => {
    await Promise.all([
      db.taskTemplates.clear(),
      db.rewardTemplates.clear(),
      db.ledgerRecords.clear(),
      db.settings.clear(),
    ])
  })
}
