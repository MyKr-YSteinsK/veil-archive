import { useId, type FormEventHandler } from 'react'
import { X } from 'lucide-react'
import type { TemplateType } from '../../data'
import SegmentedTypeSwitch from '../ui/SegmentedTypeSwitch'
import { IconGlyph, normalizeIconId, type IconOption } from '../ui/iconRegistry'

export type TemplateFormState = {
  name: string
  icon: string
  amount: string
  type: TemplateType
}

export type TemplateFormCopy = {
  eyebrow: string
  createTitle: string
  editTitle: string
  nameLabel: string
  namePlaceholder: string
  amountLabel: string
  typeLabel: string
  repeatableLabel: string
  oneTimeLabel: string
  createSubmit: string
  editSubmit: string
}

type Props = {
  mode: 'create' | 'edit'
  variant?: 'vow' | 'giving'
  form: TemplateFormState
  error: string
  iconOptions: IconOption[]
  copy: TemplateFormCopy
  onChange: (changes: Partial<TemplateFormState>) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onClose: () => void
}

export default function TemplateFormModal({ mode, variant = 'vow', form, error, iconOptions, copy, onChange, onSubmit, onClose }: Props) {
  const titleId = useId()
  const giving = variant === 'giving'

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`vow-modal${giving ? ' giving-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal-heading">
        <div><p className={`section-mark${giving ? ' giving-mark' : ''}`}>{copy.eyebrow}</p><h3 id={titleId}>{mode === 'edit' ? copy.editTitle : copy.createTitle}</h3></div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="关闭"><X size={20} /></button>
      </div>
      <form onSubmit={onSubmit}>
        <fieldset className="icon-fieldset"><legend>图标</legend><div className="icon-options">
          {iconOptions.map((option) => <button className={normalizeIconId(form.icon) === option.id ? 'selected' : ''} type="button" aria-label={option.label} title={option.label} key={option.id} onClick={() => onChange({ icon: option.id })}><IconGlyph value={option.id} /></button>)}
        </div></fieldset>
        <label>{copy.nameLabel}<input required maxLength={30} value={form.name} onChange={(event) => onChange({ name: event.target.value })} placeholder={copy.namePlaceholder} /></label>
        <label>{copy.amountLabel}<input required min="1" step="1" inputMode="numeric" type="number" value={form.amount} onChange={(event) => onChange({ amount: event.target.value })} /></label>
        <SegmentedTypeSwitch label={copy.typeLabel} value={form.type} repeatableLabel={copy.repeatableLabel} oneTimeLabel={copy.oneTimeLabel} onChange={(type) => onChange({ type })} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className={`primary-button${giving ? ' giving-primary' : ''}`} type="submit">{mode === 'edit' ? copy.editSubmit : copy.createSubmit}</button>
      </form>
    </section>
  </div>
}
