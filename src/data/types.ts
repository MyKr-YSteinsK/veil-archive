export type TemplateType = 'repeatable' | 'oneTime'
export type LedgerKind = 'task' | 'reward'
export type ThemeMode = 'system' | 'light' | 'dark'

export type TaskTemplate = {
  id: string
  name: string
  icon: string
  points: number
  type: TemplateType
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type RewardTemplate = {
  id: string
  name: string
  icon: string
  cost: number
  type: TemplateType
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type LedgerRecord = {
  id: string
  kind: LedgerKind
  templateId?: string
  templateType: TemplateType
  titleSnapshot: string
  iconSnapshot: string
  pointsDelta: number
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export type Settings = {
  themeMode: ThemeMode
  dayStartTime: string
  appVersion: string
}

export type NewTaskTemplate = Pick<TaskTemplate, 'name' | 'icon' | 'points' | 'type'>
export type NewRewardTemplate = Pick<RewardTemplate, 'name' | 'icon' | 'cost' | 'type'>
export type NewLedgerRecord = Pick<
  LedgerRecord,
  'kind' | 'templateType' | 'titleSnapshot' | 'iconSnapshot' | 'pointsDelta' | 'occurredAt'
> & Pick<Partial<LedgerRecord>, 'templateId'>

export type TaskTemplateChanges = Partial<NewTaskTemplate>
export type RewardTemplateChanges = Partial<NewRewardTemplate>
export type LedgerRecordChanges = Partial<Pick<LedgerRecord, 'occurredAt' | 'titleSnapshot' | 'pointsDelta'>>
