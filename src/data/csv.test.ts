import { describe, expect, it } from 'vitest'
import { createArchiveCsv } from './csv'
import type { LedgerRecord, RewardTemplate, TaskTemplate } from './types'

const HEADER = 'entityType,id,name,icon,templateType,pointsOrCost,kind,pointsDelta,occurredAt,createdAt,updatedAt,deletedAt,templateId,titleSnapshot,iconSnapshot'

describe('archive CSV export', () => {
  it('returns the current header for an empty archive', () => {
    expect(createArchiveCsv([], [], [])).toBe(HEADER)
  })

  it('serializes task, reward, and ledger rows with current fields and escaping', () => {
    const task: TaskTemplate = {
      id: 'task-1',
      name: 'Read, "deep"\nnotes',
      icon: 'reading',
      points: 5,
      type: 'repeatable',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
      deletedAt: '2026-08-03T00:00:00.000Z',
    }
    const reward: RewardTemplate = {
      id: 'reward-1',
      name: 'Coffee',
      icon: 'coffee',
      cost: 3,
      type: 'oneTime',
      createdAt: '2026-08-04T00:00:00.000Z',
      updatedAt: '2026-08-05T00:00:00.000Z',
    }
    const record: LedgerRecord = {
      id: 'record-1',
      kind: 'reward',
      templateId: 'reward-1',
      templateType: 'oneTime',
      titleSnapshot: 'Receive, "treat"',
      iconSnapshot: 'relax',
      pointsDelta: -3,
      occurredAt: '2026-08-06T00:00:00.000Z',
      createdAt: '2026-08-06T00:00:00.000Z',
      updatedAt: '2026-08-06T00:00:00.000Z',
    }
    const csv = createArchiveCsv([task], [reward], [record])

    expect(csv.startsWith(`${HEADER}\r\n`)).toBe(true)
    expect(csv).toContain('TASK_TEMPLATE,task-1,"Read, ""deep""\nnotes",reading,repeatable,5')
    expect(csv).toContain('REWARD_TEMPLATE,reward-1,Coffee,coffee,oneTime,3')
    expect(csv).toContain('reward,-3,2026-08-06T00:00:00.000Z,2026-08-06T00:00:00.000Z,2026-08-06T00:00:00.000Z,,reward-1,"Receive, ""treat""",relax')
    expect(csv.indexOf('TASK_TEMPLATE')).toBeLessThan(csv.indexOf('REWARD_TEMPLATE'))
    expect(csv.indexOf('REWARD_TEMPLATE')).toBeLessThan(csv.indexOf('LEDGER_RECORD'))
  })
})
