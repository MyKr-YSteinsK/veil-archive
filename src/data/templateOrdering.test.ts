import { describe, expect, it } from 'vitest'
import {
  compareTemplates,
  createNextSortOrder,
  produceReorderPatch,
  type OrderableTemplate,
} from './templateOrdering'

function template(overrides: Partial<OrderableTemplate> = {}): OrderableTemplate {
  return {
    id: 'template',
    name: '模板',
    type: 'repeatable',
    createdAt: '2026-08-01T00:00:00.000Z',
    sortOrder: 0,
    pinned: false,
    ...overrides,
  }
}

describe('template ordering', () => {
  it('sorts pinned templates before unpinned templates and respects manual order within a group', () => {
    const items = [
      template({ id: 'unpinned-later', sortOrder: 1 }),
      template({ id: 'pinned', pinned: true, sortOrder: 99 }),
      template({ id: 'unpinned-first', sortOrder: 0 }),
    ]

    expect(items.sort(compareTemplates).map((item) => item.id)).toEqual([
      'pinned',
      'unpinned-first',
      'unpinned-later',
    ])
  })

  it('falls back deterministically for legacy templates without sortOrder', () => {
    const items = [
      template({ id: 'newer', createdAt: '2026-08-02T00:00:00.000Z', sortOrder: undefined }),
      template({ id: 'older', createdAt: '2026-08-01T00:00:00.000Z', sortOrder: undefined }),
    ]

    expect(items.sort(compareTemplates).map((item) => item.id)).toEqual(['older', 'newer'])
  })

  it('allocates the next order only inside the requested type and pinning group', () => {
    const items = [
      template({ id: 'repeatable-pinned-1', sortOrder: 2, pinned: true }),
      template({ id: 'repeatable-pinned-2', sortOrder: 5, pinned: true }),
      template({ id: 'repeatable-unpinned', sortOrder: 99 }),
      template({ id: 'one-time-pinned', type: 'oneTime', sortOrder: 100, pinned: true }),
    ]

    expect(createNextSortOrder(items, 'repeatable', true)).toBe(6)
    expect(createNextSortOrder(items, 'oneTime', false)).toBe(0)
  })

  it('derives reorder patches only for the supplied visual group', () => {
    expect(produceReorderPatch(['second', 'first'])).toEqual([
      { id: 'second', sortOrder: 0 },
      { id: 'first', sortOrder: 1 },
    ])
  })
})
