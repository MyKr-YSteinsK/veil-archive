import type { RewardTemplate, TaskTemplate, TemplateType } from './types'

export type OrderableTemplate = Pick<TaskTemplate | RewardTemplate, 'id' | 'name' | 'type' | 'createdAt' | 'sortOrder' | 'pinned'>

export function compareTemplates(a: OrderableTemplate, b: OrderableTemplate): number {
  const pinDifference = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
  if (pinDifference) return pinDifference
  if (a.sortOrder !== undefined && b.sortOrder !== undefined && a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder
  }
  return a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
}

export function createNextSortOrder(items: OrderableTemplate[], type: TemplateType, pinned = false): number {
  const orders = items
    .filter((item) => item.type === type && Boolean(item.pinned) === pinned)
    .map((item) => item.sortOrder)
    .filter((order): order is number => order !== undefined)
  return orders.length ? Math.max(...orders) + 1 : 0
}

export function produceReorderPatch(idsInVisualOrder: string[]) {
  return idsInVisualOrder.map((id, sortOrder) => ({ id, sortOrder }))
}
