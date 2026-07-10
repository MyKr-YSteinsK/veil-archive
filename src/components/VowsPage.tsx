import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Check, Plus, ScrollText } from 'lucide-react'
import {
  compareTemplates,
  isWithinDay,
  ledgerRecordService,
  taskTemplateService,
  type LedgerRecord,
  type TaskTemplate,
} from '../data'
import type { DayWindow } from '../data/calculations'
import useAutoClearingToast from '../hooks/useAutoClearingToast'
import useTemplatePageData from '../hooks/useTemplatePageData'
import TemplateFormModal, { type TemplateFormCopy, type TemplateFormState } from './templates/TemplateFormModal'
import { TemplateCardShell, TemplateSection, TemplateSummary } from './templates/TemplatePagePrimitives'
import Toast from './ui/Toast'
import { VOW_ICON_OPTIONS, normalizeIconId } from './ui/iconRegistry'

const EMPTY_FORM: TemplateFormState = { name: '', icon: 'focus', amount: '1', type: 'repeatable' }
const FORM_COPY: TemplateFormCopy = {
  eyebrow: 'INSCRIBE',
  createTitle: '刻约',
  editTitle: '修订誓约',
  nameLabel: '誓约名称',
  namePlaceholder: '例如：读完一章',
  amountLabel: '残响',
  typeLabel: '誓约类型',
  repeatableLabel: '永续誓约',
  oneTimeLabel: '终末誓约',
  createSubmit: '刻入誓约',
  editSubmit: '保存修订',
}

export default function VowsPage() {
  const { toast, showToast } = useAutoClearingToast()
  const onLoadError = useCallback(() => showToast('档案读取失败，请稍后重试'), [showToast])
  const { templates, recordsByTemplate, todayWindow, balance, todayStats, loading, refresh } = useTemplatePageData<TaskTemplate>(taskTemplateService.list, 'task', onLoadError)
  const [busyId, setBusyId] = useState<string>()
  const [editing, setEditing] = useState<TaskTemplate | null | undefined>(undefined)
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const repeatable = useMemo(
    () => templates.filter((template) => template.type === 'repeatable').sort(compareTemplates),
    [templates],
  )
  const oneTime = useMemo(
    () => templates.filter((template) => {
      if (template.type !== 'oneTime') return false
      const completion = recordsByTemplate.get(template.id)?.[0]
      return !completion || isWithinDay(completion.occurredAt, todayWindow)
    }).sort(compareTemplates),
    [recordsByTemplate, templates, todayWindow],
  )

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setEditing(null)
  }

  function openEdit(template: TaskTemplate) {
    setForm({ name: template.name, icon: normalizeIconId(template.icon), amount: String(template.points), type: template.type })
    setFormError('')
    setEditing(template)
  }

  async function saveVow(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    const points = Number(form.amount)
    const values = { name: form.name, icon: form.icon, type: form.type, points }
    try {
      if (editing) await taskTemplateService.update(editing.id, values)
      else await taskTemplateService.create(values)
      await refresh()
      setEditing(undefined)
      showToast(editing ? '誓约已修订' : '誓约已刻入档案')
    } catch (error) {
      setFormError(error instanceof Error ? translateError(error.message) : '无法保存誓约')
    }
  }

  async function removeVow(template: TaskTemplate) {
    if (!window.confirm(`确认抹除誓约“${template.name}”？历史帷录不会被删除。`)) return
    try {
      await taskTemplateService.remove(template.id)
      await refresh()
      showToast('誓约已从当前档案中抹除')
    } catch {
      showToast('抹除失败，请稍后重试')
    }
  }

  async function togglePinned(template: TaskTemplate) {
    try {
      await taskTemplateService.setPinned(template.id, !template.pinned)
      await refresh()
      showToast(template.pinned ? '誓约已取消置顶' : '誓约已置顶')
    } catch {
      showToast('置顶状态保存失败')
    }
  }

  async function reorderVows(ids: string[]) {
    try {
      await taskTemplateService.reorder(ids)
      await refresh()
    } catch {
      showToast('誓约排序保存失败')
      await refresh()
    }
  }

  async function fulfill(template: TaskTemplate) {
    if (busyId) return
    if (template.type === 'oneTime' && (recordsByTemplate.get(template.id)?.length ?? 0) > 0) return
    setBusyId(template.id)
    try {
      await ledgerRecordService.create({
        kind: 'task',
        templateId: template.id,
        templateType: template.type,
        titleSnapshot: template.name,
        iconSnapshot: template.icon,
        pointsDelta: template.points,
        occurredAt: new Date().toISOString(),
      })
      await refresh()
      showToast(`履约完成，获得 ${template.points} 残响`)
    } catch {
      showToast('履约失败，请稍后重试')
    } finally {
      setBusyId(undefined)
    }
  }

  const renderCard = (template: TaskTemplate, dragHandle: ReactNode) => <VowCard
    template={template}
    records={recordsByTemplate.get(template.id) ?? []}
    todayWindow={todayWindow}
    busy={busyId === template.id}
    dragHandle={dragHandle}
    onFulfill={() => fulfill(template)}
    onEdit={() => openEdit(template)}
    onRemove={() => removeVow(template)}
    onPin={() => togglePinned(template)}
  />

  return <main className="content vows-page">
    <div className="page-heading">
      <div><p className="section-mark">VOWS</p><h2>誓约之页</h2></div>
      <button className="round-button" type="button" onClick={openCreate} aria-label="刻约"><Plus size={21} /></button>
    </div>

    <TemplateSummary loading={loading} balance={balance} secondaryLabel="今日获得" secondaryValue={todayStats.gained} secondaryClassName="today-echo" prefix="+" />

    {loading ? <p className="loading-copy">正在翻阅档案……</p> : <>
      <TemplateSection title="永续誓约" empty="尚无永续誓约" emptyIcon={<ScrollText size={18} />} templates={repeatable} renderItem={renderCard} onReorder={reorderVows} />
      <TemplateSection title="终末誓约" empty="尚无终末誓约" emptyIcon={<ScrollText size={18} />} templates={oneTime} renderItem={renderCard} onReorder={reorderVows} />
    </>}

    {editing !== undefined && <TemplateFormModal
      mode={editing ? 'edit' : 'create'}
      form={form}
      error={formError}
      iconOptions={VOW_ICON_OPTIONS}
      copy={FORM_COPY}
      onChange={(changes) => setForm((current) => ({ ...current, ...changes }))}
      onSubmit={saveVow}
      onClose={() => setEditing(undefined)}
    />}
    <Toast message={toast} />
  </main>
}

function VowCard({ template, records, todayWindow, busy, dragHandle, onFulfill, onEdit, onRemove, onPin }: {
  template: TaskTemplate
  records: LedgerRecord[]
  todayWindow: DayWindow
  busy: boolean
  dragHandle: ReactNode
  onFulfill: () => void
  onEdit: () => void
  onRemove: () => void
  onPin: () => void
}) {
  const completed = template.type === 'oneTime' && records.length > 0
  const todayCount = records.filter((record) => isWithinDay(record.occurredAt, todayWindow)).length
  const primaryAction = <button className="fulfill-button" type="button" disabled={completed || busy} aria-busy={busy} onClick={onFulfill}>{completed ? '已履约' : busy ? '履约中…' : '履约'}</button>

  return <TemplateCardShell
    className={completed ? 'vow-card completed' : 'vow-card'}
    icon={template.icon}
    title={template.name}
    amount={<strong>+{template.points} 残响</strong>}
    pinned={template.pinned}
    dragHandle={dragHandle}
    primaryAction={primaryAction}
    onPin={onPin}
    onEdit={onEdit}
    onRemove={onRemove}
  >
    {template.type === 'repeatable' && <p>今日履约 ×{todayCount}<span>累计履约 ×{records.length}</span></p>}
    {completed && <p className="fulfilled-mark"><Check size={14} /> 今日已履约</p>}
  </TemplateCardShell>
}

function translateError(message: string): string {
  if (message.includes('required')) return '请填写完整的誓约内容'
  if (message.includes('30 characters')) return '誓约名称不可超过 30 个字符'
  if (message.includes('positive integer')) return '残响必须为正整数'
  return message
}
