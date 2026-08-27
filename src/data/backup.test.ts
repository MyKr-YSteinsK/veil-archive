import 'fake-indexeddb/auto'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateBalance } from './calculations'
import { APP_VERSION } from './changelog'
import { db } from './database'
import {
  createArchiveBackup,
  parseArchiveBackup,
  restoreArchiveBackup,
  serializeArchiveBackup,
  validateArchiveBackup,
} from './backup'
import type { RewardTemplate, TaskTemplate } from './types'

const task: TaskTemplate = {
  id: 'task-1',
  name: '阅读',
  icon: '📖',
  points: 5,
  type: 'repeatable',
  sortOrder: 3,
  pinned: true,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
  deletedAt: '2026-08-03T00:00:00.000Z',
}

const reward: RewardTemplate = {
  id: 'reward-1',
  name: '休息',
  icon: 'rest',
  cost: 3,
  type: 'oneTime',
  sortOrder: 1,
  pinned: false,
  createdAt: '2026-08-04T00:00:00.000Z',
  updatedAt: '2026-08-05T00:00:00.000Z',
}

const record = {
  id: 'record-1',
  kind: 'task' as const,
  templateId: task.id,
  templateType: 'repeatable' as const,
  titleSnapshot: task.name,
  iconSnapshot: task.icon,
  pointsDelta: task.points,
  occurredAt: '2026-08-06T00:00:00.000Z',
  createdAt: '2026-08-06T00:00:00.000Z',
  updatedAt: '2026-08-06T00:00:00.000Z',
}

function backup() {
  return createArchiveBackup([task], [reward], [record], { themeMode: 'dark', dayStartTime: '05:30' }, '2026-08-27T00:00:00.000Z')
}

describe('archive JSON backup', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterAll(async () => {
    await db.delete()
  })

  it('round-trips every user-state field that CSV omits', () => {
    const source = backup()
    const restored = parseArchiveBackup(serializeArchiveBackup(source))

    expect(restored).toEqual(source)
    expect(restored.data.taskTemplates[0]).toMatchObject({ sortOrder: 3, pinned: true, deletedAt: task.deletedAt })
    expect(restored.data.settings).toEqual({ themeMode: 'dark', dayStartTime: '05:30' })
    expect(restored.data.ledgerRecords[0]).toMatchObject({ titleSnapshot: task.name, iconSnapshot: task.icon, templateId: task.id })
  })

  it('rejects unsupported versions, duplicate IDs, and dangling references before writes', () => {
    const source = backup()

    expect(() => validateArchiveBackup({ ...source, formatVersion: 2 } as unknown)).toThrow('unsupported formatVersion')
    expect(() => validateArchiveBackup({
      ...source,
      data: { ...source.data, taskTemplates: [task, task] },
    })).toThrow('duplicate ids')
    expect(() => validateArchiveBackup({
      ...source,
      data: { ...source.data, ledgerRecords: [{ ...record, templateId: 'missing' }] },
    })).toThrow('references a missing task template')
  })

  it('replaces all four tables and keeps the current code-owned app version', async () => {
    await db.taskTemplates.add({ ...task, id: 'old-task' })
    await db.settings.put({ key: 'settings', themeMode: 'light', dayStartTime: '00:00', appVersion: 'old-version' })

    await restoreArchiveBackup({ ...backup(), appVersion: 'old-exporter-version' })

    expect(await db.taskTemplates.toArray()).toEqual([task])
    expect(await db.rewardTemplates.toArray()).toEqual([reward])
    expect(await db.ledgerRecords.toArray()).toEqual([record])
    expect(await db.settings.get('settings')).toEqual({
      key: 'settings', themeMode: 'dark', dayStartTime: '05:30', appVersion: APP_VERSION,
    })
  })

  it('rolls back the replacement when a later table write fails', async () => {
    const oldTask: TaskTemplate = { ...task, id: 'old-task', name: '旧档案', deletedAt: undefined }
    await db.taskTemplates.add(oldTask)
    await db.settings.put({ key: 'settings', themeMode: 'light', dayStartTime: '00:00', appVersion: APP_VERSION })
    const bulkAdd = vi.spyOn(db.rewardTemplates, 'bulkAdd').mockRejectedValueOnce(new Error('simulated write failure'))

    await expect(restoreArchiveBackup(backup())).rejects.toThrow('simulated write failure')

    expect(await db.taskTemplates.toArray()).toEqual([oldTask])
    expect(await db.rewardTemplates.toArray()).toEqual([])
    expect(await db.ledgerRecords.toArray()).toEqual([])
    expect(await db.settings.get('settings')).toEqual({
      key: 'settings', themeMode: 'light', dayStartTime: '00:00', appVersion: APP_VERSION,
    })
    bulkAdd.mockRestore()
  })

  it('restores legacy duplicate one-time history and negative balance without rewriting it', async () => {
    const legacyRecords = [
      record,
      {
        ...record,
        id: 'legacy-reward-a',
        kind: 'reward' as const,
        templateId: reward.id,
        templateType: 'oneTime' as const,
        titleSnapshot: reward.name,
        iconSnapshot: reward.icon,
        pointsDelta: -reward.cost,
      },
      {
        ...record,
        id: 'legacy-reward-b',
        kind: 'reward' as const,
        templateId: reward.id,
        templateType: 'repeatable' as const,
        titleSnapshot: reward.name,
        iconSnapshot: reward.icon,
        pointsDelta: -reward.cost,
        occurredAt: '2026-08-07T00:00:00.000Z',
        createdAt: '2026-08-07T00:00:00.000Z',
        updatedAt: '2026-08-07T00:00:00.000Z',
      },
    ]
    const source = createArchiveBackup([task], [reward], legacyRecords, { themeMode: 'dark', dayStartTime: '05:30' })

    await restoreArchiveBackup(source)

    expect(await db.ledgerRecords.bulkGet(legacyRecords.map((item) => item.id))).toEqual(legacyRecords)
    expect(calculateBalance(await db.ledgerRecords.toArray())).toBe(-1)
  })
})
