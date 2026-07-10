import type { ReactNode } from 'react'
import { Edit3, Pin, PinOff, Trash2 } from 'lucide-react'
import AnimatedNumber from '../ui/AnimatedNumber'
import { IconGlyph } from '../ui/iconRegistry'
import TemplateReorderGroup from '../ui/TemplateReorderGroup'

export function TemplateSummary({ loading, balance, secondaryLabel, secondaryValue, secondaryClassName, prefix, className = '' }: {
  loading: boolean
  balance: number
  secondaryLabel: string
  secondaryValue: number
  secondaryClassName: string
  prefix: string
  className?: string
}) {
  return <section className={`echo-panel${className ? ` ${className}` : ''}`} aria-label="残响总览">
    <div className="echo-primary"><span>当前残响</span>{loading ? <strong>—</strong> : <AnimatedNumber value={balance} />}<small>由全部帷录推演</small></div>
    <div className="echo-secondary"><span>{secondaryLabel}</span>{loading ? <strong className={secondaryClassName}>—</strong> : <AnimatedNumber className={secondaryClassName} prefix={prefix} value={secondaryValue} />}<small>自昼夜分界起</small></div>
  </section>
}

type OrderedTemplate = { id: string; pinned?: boolean }

export function TemplateSection<T extends OrderedTemplate>({ title, empty, emptyIcon, templates, renderItem, onReorder }: {
  title: string
  empty: string
  emptyIcon: ReactNode
  templates: T[]
  renderItem: (template: T, dragHandle: ReactNode) => ReactNode
  onReorder: (ids: string[]) => Promise<void>
}) {
  const pinned = templates.filter((template) => template.pinned)
  const unpinned = templates.filter((template) => !template.pinned)
  return <section className="vow-section"><h3>{title}</h3>{templates.length === 0
    ? <div className="section-empty">{emptyIcon}<span>{empty}</span></div>
    : <div className="vow-list">
      {pinned.length > 0 && <TemplateReorderGroup items={pinned} renderItem={renderItem} onCommit={onReorder} />}
      {unpinned.length > 0 && <TemplateReorderGroup items={unpinned} renderItem={renderItem} onCommit={onReorder} />}
    </div>}
  </section>
}

export function TemplateCardShell({ className, iconClassName = '', icon, title, amount, pinned, dragHandle, children, primaryAction, onPin, onEdit, onRemove }: {
  className: string
  iconClassName?: string
  icon: string
  title: string
  amount: ReactNode
  pinned?: boolean
  dragHandle: ReactNode
  children: ReactNode
  primaryAction: ReactNode
  onPin: () => void
  onEdit: () => void
  onRemove: () => void
}) {
  return <article className={`${className}${pinned ? ' pinned' : ''}`}>
    <div className={`vow-icon${iconClassName ? ` ${iconClassName}` : ''}`}><IconGlyph value={icon} /></div>
    <div className="vow-main">
      <div className="vow-title-row"><h4>{title}</h4>{amount}</div>
      {children}
      <div className="vow-actions">
        {dragHandle}
        <button className={`text-button pin-button${pinned ? ' active' : ''}`} type="button" aria-label={pinned ? '取消置顶' : '置顶'} aria-pressed={Boolean(pinned)} onClick={onPin}>{pinned ? <PinOff size={15} /> : <Pin size={15} />}</button>
        <button className="text-button" type="button" onClick={onEdit}><Edit3 size={15} />修订</button>
        <button className="text-button danger" type="button" onClick={onRemove}><Trash2 size={15} />抹除</button>
        {primaryAction}
      </div>
    </div>
  </article>
}
