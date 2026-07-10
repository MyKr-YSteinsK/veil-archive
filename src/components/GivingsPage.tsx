import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Check, Gift, Plus } from 'lucide-react'
import {
  compareTemplates,
  isWithinDay,
  ledgerRecordService,
  rewardTemplateService,
  type LedgerRecord,
  type RewardTemplate,
} from '../data'
import type { DayWindow } from '../data/calculations'
import useAutoClearingToast from '../hooks/useAutoClearingToast'
import useTemplatePageData from '../hooks/useTemplatePageData'
import TemplateFormModal, { type TemplateFormCopy, type TemplateFormState } from './templates/TemplateFormModal'
import { TemplateCardShell, TemplateSection, TemplateSummary } from './templates/TemplatePagePrimitives'
import Toast from './ui/Toast'
import { GIVING_ICON_OPTIONS, normalizeIconId } from './ui/iconRegistry'

const EMPTY_FORM: TemplateFormState = { name: '', icon: 'relax', amount: '1', type: 'repeatable' }
const FORM_COPY: TemplateFormCopy = {
  eyebrow: 'RECORD',
  createTitle: '录赐',
  editTitle: '修订异赐',
  nameLabel: '异赐名称',
  namePlaceholder: '例如：一杯好咖啡',
  amountLabel: '所需残响',
  typeLabel: '异赐类型',
  repeatableLabel: '恒常异赐',
  oneTimeLabel: '独一异赐',
  createSubmit: '录入异赐',
  editSubmit: '保存修订',
}

export default function GivingsPage() {
  const { toast, showToast } = useAutoClearingToast()
  const onLoadError = useCallback(() => showToast('档案读取失败，请稍后重试'), [showToast])
  const { templates, recordsByTemplate, todayWindow, balance, todayStats, loading, refresh } = useTemplatePageData<RewardTemplate>(rewardTemplateService.list, 'reward', onLoadError)
  const [busyId, setBusyId] = useState<string>()
  const [editing, setEditing] = useState<RewardTemplate | null | undefined>(undefined)
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const repeatable = useMemo(
    () => templates.filter((template) => template.type === 'repeatable').sort(compareTemplates),
    [templates],
  )
  const oneTime = useMemo(
    () => templates.filter((template) => {
      if (template.type !== 'oneTime') return false
      const receipt = recordsByTemplate.get(template.id)?.[0]
      return !receipt || isWithinDay(receipt.occurredAt, todayWindow)
    }).sort(compareTemplates),
    [recordsByTemplate, templates, todayWindow],
  )

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setEditing(null)
  }

  function openEdit(template: RewardTemplate) {
    setForm({ name: template.name, icon: normalizeIconId(template.icon), amount: String(template.cost), type: template.type })
    setFormError('')
    setEditing(template)
  }

  async function saveGiving(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    const cost = Number(form.amount)
    const values = { name: form.name, icon: form.icon, type: form.type, cost }
    try {
      if (editing) await rewardTemplateService.update(editing.id, values)
      else await rewardTemplateService.create(values)
      await refresh()
      setEditing(undefined)
      showToast(editing ? '异赐已修订' : '异赐已录入档案')
    } catch (error) {
      setFormError(error instanceof Error ? translateError(error.message) : '无法保存异赐')
    }
  }

  async function removeGiving(template: RewardTemplate) {
    if (!window.confirm(`确认抹除异赐“${template.name}”？历史帷录不会被删除。`)) return
    try {
      await rewardTemplateService.remove(template.id)
      await refresh()
      showToast('异赐已从当前档案中抹除')
    } catch {
      showToast('抹除失败，请稍后重试')
    }
  }

  async function togglePinned(template: RewardTemplate) {
    try {
      await rewardTemplateService.setPinned(template.id, !template.pinned)
      await refresh()
      showToast(template.pinned ? '异赐已取消置顶' : '异赐已置顶')
    } catch {
      showToast('置顶状态保存失败')
    }
  }

  async function reorderGivings(ids: string[]) {
    try {
      await rewardTemplateService.reorder(ids)
      await refresh()
    } catch {
      showToast('异赐排序保存失败')
      await refresh()
    }
  }

  async function receive(template: RewardTemplate) {
    if (busyId) return
    const missing = template.cost - balance
    if (missing > 0) {
      showToast(`残响不足，还缺 ${missing} 残响`)
      return
    }
    if (template.type === 'oneTime' && (recordsByTemplate.get(template.id)?.length ?? 0) > 0) return
    setBusyId(template.id)
    try {
      await ledgerRecordService.create({
        kind: 'reward',
        templateId: template.id,
        templateType: template.type,
        titleSnapshot: template.name,
        iconSnapshot: template.icon,
        pointsDelta: -template.cost,
        occurredAt: new Date().toISOString(),
      })
      await refresh()
      showToast(`受赐完成，消耗 ${template.cost} 残响`)
    } catch {
      showToast('受赐失败，请稍后重试')
    } finally {
      setBusyId(undefined)
    }
  }

  const renderCard = (template: RewardTemplate, dragHandle: ReactNode) => <GivingCard
    template={template}
    records={recordsByTemplate.get(template.id) ?? []}
    todayWindow={todayWindow}
    balance={balance}
    busy={busyId === template.id}
    dragHandle={dragHandle}
    onReceive={() => receive(template)}
    onEdit={() => openEdit(template)}
    onRemove={() => removeGiving(template)}
    onPin={() => togglePinned(template)}
  />

  return <main className="content givings-page">
    <div className="page-heading">
      <div><p className="section-mark giving-mark">GIVINGS</p><h2>异赐之页</h2></div>
      <button className="round-button giving-round" type="button" onClick={openCreate} aria-label="录赐"><Plus size={21} /></button>
    </div>

    <TemplateSummary loading={loading} balance={balance} secondaryLabel="今日消耗" secondaryValue={todayStats.spent} secondaryClassName="spent-echo" prefix="-" className="giving-summary" />

    {loading ? <p className="loading-copy">正在翻阅档案……</p> : <>
      <TemplateSection title="恒常异赐" empty="尚无恒常异赐" emptyIcon={<Gift size={18} />} templates={repeatable} renderItem={renderCard} onReorder={reorderGivings} />
      <TemplateSection title="独一异赐" empty="尚无独一异赐" emptyIcon={<Gift size={18} />} templates={oneTime} renderItem={renderCard} onReorder={reorderGivings} />
    </>}

    {editing !== undefined && <TemplateFormModal
      mode={editing ? 'edit' : 'create'}
      variant="giving"
      form={form}
      error={formError}
      iconOptions={GIVING_ICON_OPTIONS}
      copy={FORM_COPY}
      onChange={(changes) => setForm((current) => ({ ...current, ...changes }))}
      onSubmit={saveGiving}
      onClose={() => setEditing(undefined)}
    />}
    <Toast message={toast} />
  </main>
}

function GivingCard({ template, records, todayWindow, balance, busy, dragHandle, onReceive, onEdit, onRemove, onPin }: {
  template: RewardTemplate
  records: LedgerRecord[]
  todayWindow: DayWindow
  balance: number
  busy: boolean
  dragHandle: ReactNode
  onReceive: () => void
  onEdit: () => void
  onRemove: () => void
  onPin: () => void
}) {
  const received = template.type === 'oneTime' && records.length > 0
  const affordable = balance >= template.cost
  const todayCount = records.filter((record) => isWithinDay(record.occurredAt, todayWindow)).length
  const primaryAction = <button className={`fulfill-button receive-button${!affordable && !received ? ' insufficient' : ''}`} type="button" disabled={received || busy} aria-disabled={!affordable || received} aria-busy={busy} onClick={onReceive}>{received ? '已受赐' : busy ? '受赐中…' : '受赐'}</button>

  return <TemplateCardShell
    className={`vow-card giving-card${received ? ' completed' : ''}${!affordable && !received ? ' unaffordable' : ''}`}
    iconClassName="giving-icon"
    icon={template.icon}
    title={template.name}
    amount={<strong className="giving-cost">-{template.cost} 残响</strong>}
    pinned={template.pinned}
    dragHandle={dragHandle}
    primaryAction={primaryAction}
    onPin={onPin}
    onEdit={onEdit}
    onRemove={onRemove}
  >
    {template.type === 'repeatable' && <p>今日受赐 ×{todayCount}<span>累计受赐 ×{records.length}</span></p>}
    {received && <p className="fulfilled-mark"><Check size={14} /> 今日已受赐</p>}
    {!affordable && !received && <p className="missing-echo">还缺 {template.cost - balance} 残响</p>}
  </TemplateCardShell>
}

function translateError(message: string): string {
  if (message.includes('required')) return '请填写完整的异赐内容'
  if (message.includes('30 characters')) return '异赐名称不可超过 30 个字符'
  if (message.includes('positive integer')) return '残响耗费必须为正整数'
  return message
}
