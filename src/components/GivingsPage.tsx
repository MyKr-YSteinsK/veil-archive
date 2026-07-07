import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Check, Edit3, Gift, Pin, PinOff, Plus, Trash2, X } from 'lucide-react'
import {
  calculateBalance,
  calculateTodayStats,
  compareTemplates,
  getDayWindow,
  isWithinDay,
  ledgerRecordService,
  rewardTemplateService,
  settingsService,
  type LedgerRecord,
  type RewardTemplate,
  type TemplateType,
} from '../data'
import AnimatedNumber from './ui/AnimatedNumber'
import Toast from './ui/Toast'
import SegmentedTypeSwitch from './ui/SegmentedTypeSwitch'
import { GIVING_ICON_OPTIONS, IconGlyph, normalizeIconId } from './ui/iconRegistry'
import TemplateReorderGroup from './ui/TemplateReorderGroup'

type GivingForm = { name: string; icon: string; cost: string; type: TemplateType }
const EMPTY_FORM: GivingForm = { name: '', icon: 'relax', cost: '1', type: 'repeatable' }

export default function GivingsPage() {
  const [templates, setTemplates] = useState<RewardTemplate[]>([])
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [dayStartTime, setDayStartTime] = useState('00:00')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string>()
  const [editing, setEditing] = useState<RewardTemplate | null | undefined>(undefined)
  const [form, setForm] = useState<GivingForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  const refresh = useCallback(async () => {
    const [nextTemplates, nextRecords, settings] = await Promise.all([
      rewardTemplateService.list(),
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
  const rewardRecords = useMemo(() => records.filter((record) => record.kind === 'reward'), [records])

  const recordsByTemplate = useMemo(() => {
    const map = new Map<string, LedgerRecord[]>()
    rewardRecords.forEach((record) => {
      if (!record.templateId) return
      const matches = map.get(record.templateId) ?? []
      matches.push(record)
      map.set(record.templateId, matches)
    })
    return map
  }, [rewardRecords])

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
    setForm({ name: template.name, icon: normalizeIconId(template.icon), cost: String(template.cost), type: template.type })
    setFormError('')
    setEditing(template)
  }

  async function saveGiving(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    const cost = Number(form.cost)
    try {
      if (editing) await rewardTemplateService.update(editing.id, { ...form, cost })
      else await rewardTemplateService.create({ ...form, cost })
      await refresh()
      setEditing(undefined)
      setToast(editing ? '异赐已修订' : '异赐已录入档案')
    } catch (error) {
      setFormError(error instanceof Error ? translateError(error.message) : '无法保存异赐')
    }
  }

  async function removeGiving(template: RewardTemplate) {
    if (!window.confirm(`确认抹除异赐“${template.name}”？历史帷录不会被删除。`)) return
    try {
      await rewardTemplateService.remove(template.id)
      await refresh()
      setToast('异赐已从当前档案中抹除')
    } catch {
      setToast('抹除失败，请稍后重试')
    }
  }

  async function togglePinned(template: RewardTemplate) {
    try {
      await rewardTemplateService.setPinned(template.id, !template.pinned)
      await refresh()
      setToast(template.pinned ? '异赐已取消置顶' : '异赐已置顶')
    } catch {
      setToast('置顶状态保存失败')
    }
  }

  async function reorderGivings(ids: string[]) {
    try {
      await rewardTemplateService.reorder(ids)
      await refresh()
    } catch {
      setToast('异赐排序保存失败')
      await refresh()
    }
  }

  async function receive(template: RewardTemplate) {
    if (busyId) return
    const missing = template.cost - balance
    if (missing > 0) {
      setToast(`残响不足，还缺 ${missing} 残响`)
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
      setToast(`受赐完成，消耗 ${template.cost} 残响`)
    } catch {
      setToast('受赐失败，请稍后重试')
    } finally {
      setBusyId(undefined)
    }
  }

  return (
    <main className="content givings-page">
      <div className="page-heading">
        <div><p className="section-mark giving-mark">GIVINGS</p><h2>异赐之页</h2></div>
        <button className="round-button giving-round" type="button" onClick={openCreate} aria-label="录赐"><Plus size={21} /></button>
      </div>

      <section className="echo-panel giving-summary" aria-label="残响总览">
        <div className="echo-primary"><span>当前残响</span>{loading ? <strong>—</strong> : <AnimatedNumber value={balance} />}<small>由全部帷录推演</small></div>
        <div className="echo-secondary"><span>今日消耗</span>{loading ? <strong className="spent-echo">—</strong> : <AnimatedNumber className="spent-echo" prefix="-" value={todayStats.spent} />}<small>自昼夜分界起</small></div>
      </section>

      {loading ? <p className="loading-copy">正在翻阅档案……</p> : <>
        <GivingSection title="恒常异赐" empty="尚无恒常异赐" templates={repeatable} balance={balance} recordsByTemplate={recordsByTemplate} todayWindow={todayWindow} busyId={busyId} onReceive={receive} onEdit={openEdit} onRemove={removeGiving} onPin={togglePinned} onReorder={reorderGivings} />
        <GivingSection title="独一异赐" empty="尚无独一异赐" templates={oneTime} balance={balance} recordsByTemplate={recordsByTemplate} todayWindow={todayWindow} busyId={busyId} onReceive={receive} onEdit={openEdit} onRemove={removeGiving} onPin={togglePinned} onReorder={reorderGivings} />
      </>}

      {editing !== undefined && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(undefined)}>
        <section className="vow-modal giving-modal" role="dialog" aria-modal="true" aria-labelledby="giving-form-title">
          <div className="modal-heading">
            <div><p className="section-mark giving-mark">RECORD</p><h3 id="giving-form-title">{editing ? '修订异赐' : '录赐'}</h3></div>
            <button className="icon-button" type="button" onClick={() => setEditing(undefined)} aria-label="关闭"><X size={20} /></button>
          </div>
          <form onSubmit={saveGiving}>
            <fieldset className="icon-fieldset"><legend>图标</legend><div className="icon-options">
              {GIVING_ICON_OPTIONS.map((option) => <button className={normalizeIconId(form.icon) === option.id ? 'selected' : ''} type="button" aria-label={option.label} title={option.label} key={option.id} onClick={() => setForm({ ...form, icon: option.id })}><IconGlyph value={option.id} /></button>)}
            </div></fieldset>
            <label>异赐名称<input required maxLength={30} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：一杯好咖啡" /></label>
            <label>所需残响<input required min="1" step="1" inputMode="numeric" type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} /></label>
            <SegmentedTypeSwitch label="异赐类型" value={form.type} repeatableLabel="恒常异赐" oneTimeLabel="独一异赐" onChange={(type) => setForm({ ...form, type })} />
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button giving-primary" type="submit">{editing ? '保存修订' : '录入异赐'}</button>
          </form>
        </section>
      </div>}
      <Toast message={toast} />
    </main>
  )
}

type GivingSectionProps = {
  title: string
  empty: string
  templates: RewardTemplate[]
  balance: number
  recordsByTemplate: Map<string, LedgerRecord[]>
  todayWindow: ReturnType<typeof getDayWindow>
  busyId?: string
  onReceive: (template: RewardTemplate) => void
  onEdit: (template: RewardTemplate) => void
  onRemove: (template: RewardTemplate) => void
  onPin: (template: RewardTemplate) => void
  onReorder: (ids: string[]) => Promise<void>
}

function GivingSection({ title, empty, templates, balance, recordsByTemplate, todayWindow, busyId, onReceive, onEdit, onRemove, onPin, onReorder }: GivingSectionProps) {
  const renderCard = (template: RewardTemplate, dragHandle: ReactNode) => {
    const matches = recordsByTemplate.get(template.id) ?? []
    const received = template.type === 'oneTime' && matches.length > 0
    const affordable = balance >= template.cost
    const todayCount = matches.filter((record) => isWithinDay(record.occurredAt, todayWindow)).length
    return <article className={`vow-card giving-card${received ? ' completed' : ''}${!affordable && !received ? ' unaffordable' : ''}${template.pinned ? ' pinned' : ''}`}>
      <div className="vow-icon giving-icon"><IconGlyph value={template.icon} /></div>
      <div className="vow-main">
        <div className="vow-title-row"><h4>{template.name}</h4><strong className="giving-cost">-{template.cost} 残响</strong></div>
        {template.type === 'repeatable' && <p>今日受赐 ×{todayCount}<span>累计受赐 ×{matches.length}</span></p>}
        {received && <p className="fulfilled-mark"><Check size={14} /> 今日已受赐</p>}
        {!affordable && !received && <p className="missing-echo">还缺 {template.cost - balance} 残响</p>}
        <div className="vow-actions">
          {dragHandle}
          <button className={`text-button pin-button${template.pinned ? ' active' : ''}`} type="button" aria-label={template.pinned ? '取消置顶' : '置顶'} aria-pressed={Boolean(template.pinned)} onClick={() => onPin(template)}>{template.pinned ? <PinOff size={15} /> : <Pin size={15} />}</button>
          <button className="text-button" type="button" onClick={() => onEdit(template)}><Edit3 size={15} />修订</button>
          <button className="text-button danger" type="button" onClick={() => onRemove(template)}><Trash2 size={15} />抹除</button>
          <button className={`fulfill-button receive-button${!affordable && !received ? ' insufficient' : ''}`} type="button" disabled={received || busyId === template.id} aria-disabled={!affordable || received} aria-busy={busyId === template.id} onClick={() => onReceive(template)}>{received ? '已受赐' : busyId === template.id ? '受赐中…' : '受赐'}</button>
        </div>
      </div>
    </article>
  }
  const pinned = templates.filter((template) => template.pinned)
  const unpinned = templates.filter((template) => !template.pinned)
  return <section className="vow-section"><h3>{title}</h3>{templates.length === 0
    ? <div className="section-empty"><Gift size={18} /><span>{empty}</span></div>
    : <div className="vow-list">
      {pinned.length > 0 && <TemplateReorderGroup items={pinned} renderItem={renderCard} onCommit={onReorder} />}
      {unpinned.length > 0 && <TemplateReorderGroup items={unpinned} renderItem={renderCard} onCommit={onReorder} />}
    </div>}
  </section>
}

function translateError(message: string): string {
  if (message.includes('required')) return '请填写完整的异赐内容'
  if (message.includes('30 characters')) return '异赐名称不可超过 30 个字符'
  if (message.includes('positive integer')) return '残响耗费必须为正整数'
  return message
}
