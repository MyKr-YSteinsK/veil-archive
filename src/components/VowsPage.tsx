import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, Edit3, Plus, ScrollText, Trash2, X } from 'lucide-react'
import {
  calculateBalance,
  calculateTodayStats,
  getDayWindow,
  isWithinDay,
  ledgerRecordService,
  settingsService,
  taskTemplateService,
  type LedgerRecord,
  type TaskTemplate,
  type TemplateType,
} from '../data'

const ICONS = ['✦', '⚔️', '📜', '🕯️', '🌙', '🗝️', '🜁', '🜂']

type VowForm = { name: string; icon: string; points: string; type: TemplateType }
const EMPTY_FORM: VowForm = { name: '', icon: '✦', points: '1', type: 'repeatable' }

export default function VowsPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [dayStartTime, setDayStartTime] = useState('00:00')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string>()
  const [editing, setEditing] = useState<TaskTemplate | null | undefined>(undefined)
  const [form, setForm] = useState<VowForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  const refresh = useCallback(async () => {
    const [nextTemplates, nextRecords, settings] = await Promise.all([
      taskTemplateService.list(),
      ledgerRecordService.list(),
      settingsService.get(),
    ])
    setTemplates(nextTemplates)
    setRecords(nextRecords)
    setDayStartTime(settings.dayStartTime)
  }, [])

  useEffect(() => {
    refresh().catch(() => setToast('档案读取失败，请稍后重试')).finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const todayWindow = useMemo(() => getDayWindow(new Date(), dayStartTime), [dayStartTime])
  const balance = useMemo(() => calculateBalance(records), [records])
  const todayStats = useMemo(() => calculateTodayStats(records, new Date(), dayStartTime), [records, dayStartTime])
  const taskRecords = useMemo(() => records.filter((record) => record.kind === 'task'), [records])

  const recordsByTemplate = useMemo(() => {
    const map = new Map<string, LedgerRecord[]>()
    taskRecords.forEach((record) => {
      if (!record.templateId) return
      const matches = map.get(record.templateId) ?? []
      matches.push(record)
      map.set(record.templateId, matches)
    })
    return map
  }, [taskRecords])

  const repeatable = useMemo(
    () => templates.filter((template) => template.type === 'repeatable').sort((a, b) => a.points - b.points),
    [templates],
  )
  const oneTime = useMemo(
    () => templates.filter((template) => {
      if (template.type !== 'oneTime') return false
      const completion = recordsByTemplate.get(template.id)?.[0]
      return !completion || isWithinDay(completion.occurredAt, todayWindow)
    }).sort((a, b) => a.points - b.points),
    [recordsByTemplate, templates, todayWindow],
  )

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setEditing(null)
  }

  function openEdit(template: TaskTemplate) {
    setForm({ name: template.name, icon: template.icon, points: String(template.points), type: template.type })
    setFormError('')
    setEditing(template)
  }

  async function saveVow(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    const points = Number(form.points)
    try {
      if (editing) await taskTemplateService.update(editing.id, { ...form, points })
      else await taskTemplateService.create({ ...form, points })
      await refresh()
      setEditing(undefined)
      setToast(editing ? '誓约已修订' : '誓约已刻入档案')
    } catch (error) {
      setFormError(error instanceof Error ? translateError(error.message) : '无法保存誓约')
    }
  }

  async function removeVow(template: TaskTemplate) {
    if (!window.confirm(`确认抹除誓约“${template.name}”？历史帷录不会被删除。`)) return
    try {
      await taskTemplateService.remove(template.id)
      await refresh()
      setToast('誓约已从当前档案中抹除')
    } catch {
      setToast('抹除失败，请稍后重试')
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
      setToast(`履约完成，获得 ${template.points} 残响`)
    } catch {
      setToast('履约失败，请稍后重试')
    } finally {
      setBusyId(undefined)
    }
  }

  return (
    <main className="content vows-page">
      <div className="page-heading">
        <div><p className="section-mark">VOWS</p><h2>誓约之页</h2></div>
        <button className="round-button" type="button" onClick={openCreate} aria-label="刻约"><Plus size={21} /></button>
      </div>

      <section className="echo-panel" aria-label="残响总览">
        <div><span>当前残响</span><strong>{loading ? '—' : balance}</strong></div>
        <div><span>今日获得残响</span><strong className="today-echo">+{loading ? '—' : todayStats.gained}</strong></div>
      </section>

      {loading ? <p className="loading-copy">正在翻阅档案……</p> : (
        <>
          <VowSection title="永续誓约" empty="尚无永续誓约" templates={repeatable} recordsByTemplate={recordsByTemplate} todayWindow={todayWindow} busyId={busyId} onFulfill={fulfill} onEdit={openEdit} onRemove={removeVow} />
          <VowSection title="终末誓约" empty="尚无终末誓约" templates={oneTime} recordsByTemplate={recordsByTemplate} todayWindow={todayWindow} busyId={busyId} onFulfill={fulfill} onEdit={openEdit} onRemove={removeVow} />
        </>
      )}

      {editing !== undefined && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(undefined)}>
          <section className="vow-modal" role="dialog" aria-modal="true" aria-labelledby="vow-form-title">
            <div className="modal-heading">
              <div><p className="section-mark">INSCRIBE</p><h3 id="vow-form-title">{editing ? '修订誓约' : '刻约'}</h3></div>
              <button className="icon-button" type="button" onClick={() => setEditing(undefined)} aria-label="关闭"><X size={20} /></button>
            </div>
            <form onSubmit={saveVow}>
              <fieldset className="icon-fieldset"><legend>图标</legend><div className="icon-options">
                {ICONS.map((icon) => <button className={form.icon === icon ? 'selected' : ''} type="button" key={icon} onClick={() => setForm({ ...form, icon })}>{icon}</button>)}
              </div></fieldset>
              <label>誓约名称<input required maxLength={30} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：读完一章" /></label>
              <label>残响<input required min="1" step="1" inputMode="numeric" type="number" value={form.points} onChange={(event) => setForm({ ...form, points: event.target.value })} /></label>
              <label>誓约类型<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as TemplateType })}>
                <option value="repeatable">永续誓约</option><option value="oneTime">终末誓约</option>
              </select></label>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="primary-button" type="submit">{editing ? '保存修订' : '刻入誓约'}</button>
            </form>
          </section>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}

type VowSectionProps = {
  title: string
  empty: string
  templates: TaskTemplate[]
  recordsByTemplate: Map<string, LedgerRecord[]>
  todayWindow: ReturnType<typeof getDayWindow>
  busyId?: string
  onFulfill: (template: TaskTemplate) => void
  onEdit: (template: TaskTemplate) => void
  onRemove: (template: TaskTemplate) => void
}

function VowSection({ title, empty, templates, recordsByTemplate, todayWindow, busyId, onFulfill, onEdit, onRemove }: VowSectionProps) {
  return <section className="vow-section"><h3>{title}</h3>{templates.length === 0
    ? <div className="section-empty"><ScrollText size={18} /><span>{empty}</span></div>
    : <div className="vow-list">{templates.map((template) => {
      const matches = recordsByTemplate.get(template.id) ?? []
      const completed = template.type === 'oneTime' && matches.length > 0
      const todayCount = matches.filter((record) => isWithinDay(record.occurredAt, todayWindow)).length
      return <article className={completed ? 'vow-card completed' : 'vow-card'} key={template.id}>
        <div className="vow-icon" aria-hidden="true">{template.icon}</div>
        <div className="vow-main">
          <div className="vow-title-row"><h4>{template.name}</h4><strong>+{template.points} 残响</strong></div>
          {template.type === 'repeatable' && <p>今日履约 ×{todayCount}<span>累计履约 ×{matches.length}</span></p>}
          {completed && <p className="fulfilled-mark"><Check size={14} /> 今日已履约</p>}
          <div className="vow-actions">
            <button className="text-button" type="button" onClick={() => onEdit(template)}><Edit3 size={15} />修订</button>
            <button className="text-button danger" type="button" onClick={() => onRemove(template)}><Trash2 size={15} />抹除</button>
            <button className="fulfill-button" type="button" disabled={completed || busyId === template.id} onClick={() => onFulfill(template)}>{completed ? '已履约' : '履约'}</button>
          </div>
        </div>
      </article>
    })}</div>}
  </section>
}

function translateError(message: string): string {
  if (message.includes('required')) return '请填写完整的誓约内容'
  if (message.includes('30 characters')) return '誓约名称不可超过 30 个字符'
  if (message.includes('positive integer')) return '残响必须为正整数'
  return message
}
