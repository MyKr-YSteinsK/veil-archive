import 'fake-indexeddb/auto'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { calculateBalance } from './calculations'
import { db } from './database'
import {
  LedgerRuleError,
  ledgerRecordService,
  rewardTemplateService,
  taskTemplateService,
} from './services'
import type { LedgerRecord, RewardTemplate, TaskTemplate } from './types'

const CREATED_AT = '2026-08-01T00:00:00.000Z'

function taskTemplate(overrides: Partial<TaskTemplate> = {}): TaskTemplate {
  return {
    id: 'task-1',
    name: '任务',
    icon: 'focus',
    points: 5,
    type: 'repeatable',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  }
}

function rewardTemplate(overrides: Partial<RewardTemplate> = {}): RewardTemplate {
  return {
    id: 'reward-1',
    name: '异赐',
    icon: 'coffee',
    cost: 3,
    type: 'repeatable',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  }
}

function ledgerRecord(overrides: Partial<LedgerRecord> = {}): LedgerRecord {
  return {
    id: 'record-1',
    kind: 'task',
    templateId: 'task-1',
    templateType: 'repeatable',
    titleSnapshot: '任务',
    iconSnapshot: 'focus',
    pointsDelta: 5,
    occurredAt: '2026-08-02T00:00:00.000Z',
    createdAt: '2026-08-02T00:00:00.000Z',
    updatedAt: '2026-08-02T00:00:00.000Z',
    ...overrides,
  }
}

async function expectRule(promise: Promise<unknown>, code: LedgerRuleError['code']) {
  await expect(promise).rejects.toMatchObject({ code })
}

describe('ledger service domain invariants', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterAll(async () => {
    await db.delete()
  })

  it('enforces one-time task usage and reopens after the final usage is deleted', async () => {
    await db.taskTemplates.add(taskTemplate({ type: 'oneTime' }))

    await expect(ledgerRecordService.fulfillTask('task-1')).resolves.toMatchObject({
      kind: 'task',
      templateId: 'task-1',
      pointsDelta: 5,
    })
    await expectRule(ledgerRecordService.fulfillTask('task-1'), 'one-time-used')

    const first = await db.ledgerRecords.toArray()
    expect(first).toHaveLength(1)
    await ledgerRecordService.remove(first[0].id)

    await expect(ledgerRecordService.fulfillTask('task-1')).resolves.toMatchObject({ templateId: 'task-1' })
  })

  it('counts same-kind history independently of the snapshot type across template transitions', async () => {
    await db.taskTemplates.add(taskTemplate())
    const history = ledgerRecord({ templateType: 'repeatable' })
    await db.ledgerRecords.add(history)

    await taskTemplateService.update('task-1', { type: 'oneTime' })
    await expectRule(ledgerRecordService.fulfillTask('task-1'), 'one-time-used')

    const unchanged = await db.ledgerRecords.get(history.id)
    expect(unchanged).toEqual(history)

    await taskTemplateService.update('task-1', { type: 'repeatable' })
    await expect(ledgerRecordService.fulfillTask('task-1')).resolves.toMatchObject({ templateId: 'task-1' })
    await taskTemplateService.update('task-1', { type: 'oneTime' })
    await expectRule(ledgerRecordService.fulfillTask('task-1'), 'one-time-used')
  })

  it('does not cross-match task and reward identities that share a template ID', async () => {
    await db.taskTemplates.add(taskTemplate({ id: 'shared', type: 'oneTime' }))
    await db.rewardTemplates.add(rewardTemplate({ id: 'shared', type: 'oneTime', cost: 3 }))
    await db.ledgerRecords.add(ledgerRecord({ id: 'task-history', templateId: 'shared' }))

    await expect(ledgerRecordService.receiveReward('shared')).resolves.toMatchObject({
      kind: 'reward',
      templateId: 'shared',
      pointsDelta: -3,
    })
    await expectRule(ledgerRecordService.receiveReward('shared'), 'one-time-used')
  })

  it('enforces live reward affordability from the transaction ledger state', async () => {
    await db.rewardTemplates.add(rewardTemplate({ cost: 4 }))
    await expectRule(ledgerRecordService.receiveReward('reward-1'), 'insufficient-balance')

    await db.ledgerRecords.add(ledgerRecord({ id: 'earned', pointsDelta: 5 }))
    await expect(ledgerRecordService.receiveReward('reward-1')).resolves.toMatchObject({ pointsDelta: -4 })
    await expectRule(ledgerRecordService.receiveReward('reward-1'), 'insufficient-balance')
    expect(calculateBalance(await db.ledgerRecords.toArray())).toBe(1)
  })

  it('serializes concurrent live reward attempts so they cannot both spend one balance', async () => {
    await db.rewardTemplates.add(rewardTemplate({ cost: 4 }))
    await db.ledgerRecords.add(ledgerRecord({ id: 'earned', pointsDelta: 5 }))

    const outcomes = await Promise.allSettled([
      ledgerRecordService.receiveReward('reward-1'),
      ledgerRecordService.receiveReward('reward-1'),
    ])

    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1)
    expect(outcomes.filter((outcome) => outcome.status === 'rejected')).toHaveLength(1)
    expect(outcomes.some((outcome) => outcome.status === 'rejected' && outcome.reason?.code === 'insufficient-balance')).toBe(true)
    expect(calculateBalance(await db.ledgerRecords.toArray())).toBe(1)
  })

  it('allows reward backfill below the current balance and keeps live affordability separate', async () => {
    await db.rewardTemplates.add(rewardTemplate({ cost: 10 }))

    await expect(ledgerRecordService.createBackfill({
      kind: 'reward',
      templateId: 'reward-1',
      occurredAt: '2026-07-01T00:00:00.000Z',
    })).resolves.toMatchObject({ pointsDelta: -10, occurredAt: '2026-07-01T00:00:00.000Z' })

    expect(calculateBalance(await db.ledgerRecords.toArray())).toBe(-10)
    await expectRule(ledgerRecordService.receiveReward('reward-1'), 'insufficient-balance')

    await db.ledgerRecords.add(ledgerRecord({ id: 'replenish', pointsDelta: 20 }))
    await expect(ledgerRecordService.receiveReward('reward-1')).resolves.toMatchObject({ pointsDelta: -10 })
  })

  it('enforces one-time usage for both backfill kinds while repeatable backfill remains repeatable', async () => {
    await db.taskTemplates.add(taskTemplate({ id: 'one-task', type: 'oneTime' }))
    await db.rewardTemplates.add(rewardTemplate({ id: 'one-reward', type: 'oneTime', cost: 8 }))
    await db.taskTemplates.add(taskTemplate({ id: 'repeat-task', type: 'repeatable' }))

    const backfill = (kind: 'task' | 'reward', templateId: string) => ledgerRecordService.createBackfill({
      kind,
      templateId,
      occurredAt: '2026-07-01T00:00:00.000Z',
    })

    await expect(backfill('task', 'one-task')).resolves.toMatchObject({ templateId: 'one-task' })
    await expectRule(backfill('task', 'one-task'), 'one-time-used')
    await expect(backfill('reward', 'one-reward')).resolves.toMatchObject({ templateId: 'one-reward', pointsDelta: -8 })
    await expectRule(backfill('reward', 'one-reward'), 'one-time-used')
    await expect(backfill('task', 'repeat-task')).resolves.toMatchObject({ templateId: 'repeat-task' })
    await expect(backfill('task', 'repeat-task')).resolves.toMatchObject({ templateId: 'repeat-task' })
  })

  it('keeps historical edits and deletes truthful even when the final balance becomes negative', async () => {
    await db.ledgerRecords.bulkAdd([
      ledgerRecord({ id: 'earned', pointsDelta: 5 }),
      ledgerRecord({ id: 'spent', kind: 'reward', templateId: 'reward-1', templateType: 'repeatable', titleSnapshot: '异赐', iconSnapshot: 'coffee', pointsDelta: -1 }),
    ])

    await ledgerRecordService.update('spent', { pointsDelta: -10 })
    expect(calculateBalance(await db.ledgerRecords.toArray())).toBe(-5)
    await ledgerRecordService.remove('earned')

    expect(calculateBalance(await db.ledgerRecords.toArray())).toBe(-10)
    expect(await db.ledgerRecords.count()).toBe(1)
  })

  it('does not release one-time usage when a record is edited, but does after its deletion', async () => {
    await db.taskTemplates.add(taskTemplate({ type: 'oneTime' }))
    const history = ledgerRecord({ id: 'history', templateType: 'repeatable' })
    await db.ledgerRecords.add(history)

    await expectRule(ledgerRecordService.fulfillTask('task-1'), 'one-time-used')
    await ledgerRecordService.update(history.id, {
      titleSnapshot: '修订后的任务',
      pointsDelta: 7,
      occurredAt: '2026-08-04T00:00:00.000Z',
    })
    await expectRule(ledgerRecordService.fulfillTask('task-1'), 'one-time-used')

    await ledgerRecordService.remove(history.id)
    await expect(ledgerRecordService.fulfillTask('task-1')).resolves.toMatchObject({ templateId: 'task-1' })
  })

  it('keeps legacy duplicate one-time history readable and blocks only new usage', async () => {
    const template = taskTemplate({ type: 'oneTime' })
    const first = ledgerRecord({ id: 'legacy-a', templateType: 'repeatable' })
    const second = ledgerRecord({ id: 'legacy-b', templateType: 'oneTime', occurredAt: '2026-08-03T00:00:00.000Z', createdAt: '2026-08-03T00:00:00.000Z', updatedAt: '2026-08-03T00:00:00.000Z' })
    await db.taskTemplates.add(template)
    await db.ledgerRecords.bulkAdd([first, second])

    expect(await ledgerRecordService.list()).toHaveLength(2)
    await expectRule(ledgerRecordService.fulfillTask(template.id), 'one-time-used')
    expect(await db.ledgerRecords.bulkGet([first.id, second.id])).toEqual([first, second])
  })

  it('does not create new usage for a soft-deleted template while retaining its history', async () => {
    await db.taskTemplates.add(taskTemplate({ type: 'oneTime' }))
    const history = ledgerRecord()
    await db.ledgerRecords.add(history)
    await taskTemplateService.remove('task-1')

    await expectRule(ledgerRecordService.fulfillTask('task-1'), 'template-not-found')
    expect(await db.ledgerRecords.get(history.id)).toEqual(history)
  })
})
