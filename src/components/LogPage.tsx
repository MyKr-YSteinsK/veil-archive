import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookOpenText, ChevronDown, Edit3, Plus, Trash2, X } from 'lucide-react'
import {
  calculateBalance,
  ledgerRecordService,
  rewardTemplateService,
  taskTemplateService,
  type LedgerKind,
  type LedgerRecord,
  type RewardTemplate,
  type TaskTemplate,
} from '../data'
import AnimatedNumber from './ui/AnimatedNumber'
import Toast from './ui/Toast'
import { IconGlyph } from './ui/iconRegistry'

type Filter = 'all' | LedgerKind
type TemplateChoice = {
  key: string
  id: string
  kind: LedgerKind
  name: string
  icon: string
  amount: number
  type: TaskTemplate['type']
}
type MonthGroup = { key: string; label: string; days: { key: string; label: string; records: LedgerRecord[] }[] }
type AddForm = { templateKey: string; occurredAt: string }
type EditForm = { titleSnapshot: string; pointsDelta: string; occurredAt: string }

export default function LogPage() {
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [tasks, setTasks] = useState<TaskTemplate[]>([])
  const [rewards, setRewards] = useState<RewardTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => new Set([monthKey(new Date())]))
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<LedgerRecord>()
  const [editing, setEditing] = useState(false)
  const [addForm, setAddForm] = useState<AddForm>({ templateKey: '', occurredAt: toLocalInput(new Date()) })
  const [editForm, setEditForm] = useState<EditForm>({ titleSnapshot: '', pointsDelta: '', occurredAt: '' })
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  const refresh = useCallback(async () => {
    const [nextRecords, nextTasks, nextRewards] = await Promise.all([
      ledgerRecordService.list(),
      taskTemplateService.list(),
      rewardTemplateService.list(),
    ])
    setRecords(nextRecords)
    setTasks(nextTasks)
    setRewards(nextRewards)
    setSelected((current) => current ? nextRecords.find((record) => record.id === current.id) : undefined)
  }, [])

  useEffect(() => {
    refresh().catch(() => setToast('帷录读取失败，请稍后重试')).finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const balance = useMemo(() => calculateBalance(records), [records])
  const choices = useMemo<TemplateChoice[]>(() => [
    ...tasks.map((task) => ({ key: `task:${task.id}`, id: task.id, kind: 'task' as const, name: task.name, icon: task.icon, amount: task.points, type: task.type })),
    ...rewards.map((reward) => ({ key: `reward:${reward.id}`, id: reward.id, kind: 'reward' as const, name: reward.name, icon: reward.icon, amount: reward.cost, type: reward.type })),
  ], [rewards, tasks])

  const groups = useMemo(() => groupRecords(
    filter === 'all' ? records : records.filter((record) => record.kind === filter),
  ), [filter, records])

  const balanceFlows = useMemo(() => {
    const chronological = [...records].sort((a, b) =>
      a.occurredAt.localeCompare(b.occurredAt) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
    )
    let running = 0
    const flows = new Map<string, { before: number; after: number }>()
    chronological.forEach((record) => {
      const before = running
      running += record.pointsDelta
      flows.set(record.id, { before, after: running })
    })
    return flows
  }, [records])

  function openAdd() {
    setAddForm({ templateKey: choices[0]?.key ?? '', occurredAt: toLocalInput(new Date()) })
    setFormError('')
    setAdding(true)
  }

  function openDetails(record: LedgerRecord) {
    setSelected(record)
    setEditing(false)
    setFormError('')
  }

  function startEdit(record: LedgerRecord) {
    setEditForm({ titleSnapshot: record.titleSnapshot, pointsDelta: String(record.pointsDelta), occurredAt: toLocalInput(record.occurredAt) })
    setFormError('')
    setEditing(true)
  }

  async function addRecord(event: FormEvent) {
    event.preventDefault()
    const template = choices.find((choice) => choice.key === addForm.templateKey)
    if (!template) return setFormError('请选择一个现有誓约或异赐')
    if (template.kind === 'reward' && balance < template.amount) {
      return setFormError(`残响不足，还缺 ${template.amount - balance} 残响`)
    }
    try {
      await ledgerRecordService.create({
        kind: template.kind,
        templateId: template.id,
        templateType: template.type,
        titleSnapshot: template.name,
        iconSnapshot: template.icon,
        pointsDelta: template.kind === 'task' ? template.amount : -template.amount,
        occurredAt: new Date(addForm.occurredAt).toISOString(),
      })
      await refresh()
      setAdding(false)
      setExpandedMonths((current) => new Set(current).add(monthKey(new Date(addForm.occurredAt))))
      setToast('帷录已补录')
    } catch (error) {
      setFormError(error instanceof Error ? translateError(error.message) : '补录失败')
    }
  }

  async function updateRecord(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    try {
      const updated = await ledgerRecordService.update(selected.id, {
        titleSnapshot: editForm.titleSnapshot,
        pointsDelta: Number(editForm.pointsDelta),
        occurredAt: new Date(editForm.occurredAt).toISOString(),
      })
      await refresh()
      setSelected(updated)
      setEditing(false)
      setExpandedMonths((current) => new Set(current).add(monthKey(new Date(updated.occurredAt))))
      setToast('帷录条目已修订')
    } catch (error) {
      setFormError(error instanceof Error ? translateError(error.message) : '修订失败')
    }
  }

  async function removeRecord(record: LedgerRecord) {
    if (!window.confirm(`确认抹除“${record.titleSnapshot}”这条帷录？余额将随之重算。`)) return
    try {
      await ledgerRecordService.remove(record.id)
      setSelected(undefined)
      await refresh()
      setToast('帷录条目已抹除，残响已重算')
    } catch {
      setToast('抹除失败，请稍后重试')
    }
  }

  function toggleMonth(key: string) {
    setExpandedMonths((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return <main className="content log-page">
    <div className="page-heading">
      <div><p className="section-mark">VEIL LOG</p><h2>帷录条目</h2></div>
      <button className="round-button" type="button" onClick={openAdd} aria-label="补录帷录"><Plus size={21} /></button>
    </div>

    <section className="log-balance"><span>当前残响</span>{loading ? <strong>—</strong> : <AnimatedNumber value={balance} />}</section>
    <div className="filter-tabs" aria-label="帷录筛选">
      {([['all', '全部'], ['task', '履约'], ['reward', '受赐']] as const).map(([value, label]) =>
        <button className={filter === value ? 'active' : ''} type="button" key={value} onClick={() => setFilter(value)}>{label}</button>,
      )}
    </div>

    {loading ? <p className="loading-copy">正在翻阅帷录……</p> : groups.length === 0
      ? <div className="log-empty"><BookOpenText size={23} /><strong>帷幕之后，尚无回声</strong><span>履约与受赐会在这里留下条目</span></div>
      : <div className="month-list">{groups.map((month) => {
        const expanded = expandedMonths.has(month.key)
        return <section className="month-group" key={month.key}>
          <button className="month-toggle" type="button" aria-expanded={expanded} onClick={() => toggleMonth(month.key)}>
            <span>{month.label}</span><small>{month.days.reduce((sum, day) => sum + day.records.length, 0)} 条</small><ChevronDown className={expanded ? 'rotated' : ''} size={18} />
          </button>
          {expanded && <div className="days-list">{month.days.map((day) => <section className="day-group" key={day.key}>
            <h3>{day.label}</h3>
            <div>{day.records.map((record) => <button className="record-row" type="button" key={record.id} onClick={() => openDetails(record)}>
              <time>{formatTime(record.occurredAt)}</time><span className={`record-icon ${record.kind}-icon`}><IconGlyph value={record.iconSnapshot} size={17} /></span><strong>{record.titleSnapshot}</strong>
              <b className={record.pointsDelta > 0 ? 'positive' : 'negative'}>{record.pointsDelta > 0 ? '+' : ''}{record.pointsDelta} 残响</b>
            </button>)}</div>
          </section>)}</div>}
        </section>
      })}</div>}

    {adding && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAdding(false)}>
      <section className="vow-modal" role="dialog" aria-modal="true" aria-labelledby="add-record-title">
        <ModalHeading eyebrow="BACKFILL" title="补录帷录" titleId="add-record-title" onClose={() => setAdding(false)} />
        <form onSubmit={addRecord}>
          <label>誓约或异赐<select required value={addForm.templateKey} onChange={(event) => setAddForm({ ...addForm, templateKey: event.target.value })}>
            {choices.length === 0 && <option value="">暂无可用模板</option>}
            {tasks.length > 0 && <optgroup label="誓约">{choices.filter((item) => item.kind === 'task').map((item) => <option value={item.key} key={item.key}>{item.icon} {item.name}（+{item.amount}）</option>)}</optgroup>}
            {rewards.length > 0 && <optgroup label="异赐">{choices.filter((item) => item.kind === 'reward').map((item) => <option value={item.key} key={item.key}>{item.icon} {item.name}（-{item.amount}）</option>)}</optgroup>}
          </select></label>
          <label>发生时刻<input required type="datetime-local" value={addForm.occurredAt} onChange={(event) => setAddForm({ ...addForm, occurredAt: event.target.value })} /></label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="primary-button" type="submit" disabled={choices.length === 0}>写入帷录</button>
        </form>
      </section>
    </div>}

    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(undefined)}>
      <section className="vow-modal record-modal" role="dialog" aria-modal="true" aria-labelledby="record-detail-title">
        <ModalHeading eyebrow="ENTRY" title={editing ? '修订条目' : '帷录详情'} titleId="record-detail-title" onClose={() => setSelected(undefined)} />
        {editing ? <form onSubmit={updateRecord}>
          <label>名称快照<input required maxLength={30} value={editForm.titleSnapshot} onChange={(event) => setEditForm({ ...editForm, titleSnapshot: event.target.value })} /></label>
          <label>残响变化<input required step="1" type="number" value={editForm.pointsDelta} onChange={(event) => setEditForm({ ...editForm, pointsDelta: event.target.value })} /></label>
          <label>发生时刻<input required type="datetime-local" value={editForm.occurredAt} onChange={(event) => setEditForm({ ...editForm, occurredAt: event.target.value })} /></label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="primary-button" type="submit">保存修订</button>
          <button className="secondary-button" type="button" onClick={() => setEditing(false)}>返回详情</button>
        </form> : <RecordDetails record={selected} flow={balanceFlows.get(selected.id)} onEdit={() => startEdit(selected)} onRemove={() => removeRecord(selected)} />}
      </section>
    </div>}
    <Toast message={toast} />
  </main>
}

function ModalHeading({ eyebrow, title, titleId, onClose }: { eyebrow: string; title: string; titleId: string; onClose: () => void }) {
  return <div className="modal-heading"><div><p className="section-mark">{eyebrow}</p><h3 id={titleId}>{title}</h3></div><button className="icon-button" type="button" onClick={onClose} aria-label="关闭"><X size={20} /></button></div>
}

function RecordDetails({ record, flow, onEdit, onRemove }: { record: LedgerRecord; flow?: { before: number; after: number }; onEdit: () => void; onRemove: () => void }) {
  return <div className="record-details">
    <div className="record-hero"><span className={`${record.kind}-icon`}><IconGlyph value={record.iconSnapshot} size={24} /></span><div><small>{record.kind === 'task' ? '履约条目' : '受赐条目'}</small><h4>{record.titleSnapshot}</h4></div><strong className={record.pointsDelta > 0 ? 'positive' : 'negative'}>{record.pointsDelta > 0 ? '+' : ''}{record.pointsDelta}</strong></div>
    <dl>
      <div><dt>发生时刻</dt><dd>{formatDateTime(record.occurredAt)}</dd></div>
      <div><dt>创建时刻</dt><dd>{formatDateTime(record.createdAt)}</dd></div>
      <div><dt>更新时间</dt><dd>{formatDateTime(record.updatedAt)}</dd></div>
      <div className="balance-flow"><dt>残响流转</dt><dd>{flow?.before ?? 0}<span>→</span>{flow?.after ?? record.pointsDelta}</dd></div>
    </dl>
    <div className="detail-actions"><button className="secondary-button" type="button" onClick={onEdit}><Edit3 size={16} />修订条目</button><button className="secondary-button danger" type="button" onClick={onRemove}><Trash2 size={16} />抹除条目</button></div>
  </div>
}

function groupRecords(records: LedgerRecord[]): MonthGroup[] {
  const months = new Map<string, Map<string, LedgerRecord[]>>()
  records.forEach((record) => {
    const date = new Date(record.occurredAt)
    const month = monthKey(date)
    const day = dayKey(date)
    const days = months.get(month) ?? new Map<string, LedgerRecord[]>()
    const entries = days.get(day) ?? []
    entries.push(record)
    days.set(day, entries)
    months.set(month, days)
  })
  return [...months.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([key, days]) => ({
    key,
    label: new Date(`${key}-01T12:00:00`).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
    days: [...days.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([day, entries]) => ({
      key: day,
      label: new Date(`${day}T12:00:00`).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }),
      records: entries.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.createdAt.localeCompare(a.createdAt)),
    })),
  }))
}

function monthKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` }
function dayKey(date: Date) { return `${monthKey(date)}-${String(date.getDate()).padStart(2, '0')}` }
function formatTime(value: string) { return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) }
function formatDateTime(value: string) { return new Date(value).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short', hour12: false }) }
function toLocalInput(value: Date | string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
function translateError(message: string) {
  if (message.includes('titleSnapshot')) return '名称快照必填且不可超过 30 个字符'
  if (message.includes('pointsDelta')) return '履约残响须为正整数，受赐残响须为负整数'
  if (message.includes('valid date')) return '请选择有效的发生时刻'
  return message
}
