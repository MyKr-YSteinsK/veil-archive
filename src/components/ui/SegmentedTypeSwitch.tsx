import { motion, useReducedMotion } from 'framer-motion'
import { useId } from 'react'
import type { TemplateType } from '../../data'

export default function SegmentedTypeSwitch({
  label,
  value,
  repeatableLabel,
  oneTimeLabel,
  onChange,
}: {
  label: string
  value: TemplateType
  repeatableLabel: string
  oneTimeLabel: string
  onChange: (value: TemplateType) => void
}) {
  const id = useId()
  const reduceMotion = useReducedMotion()
  const options: { value: TemplateType; label: string }[] = [
    { value: 'repeatable', label: repeatableLabel },
    { value: 'oneTime', label: oneTimeLabel },
  ]

  return <fieldset className="type-switch"><legend>{label}</legend><div>
    {options.map((option) => {
      const active = option.value === value
      return <button type="button" aria-pressed={active} key={option.value} onClick={() => onChange(option.value)}>
        {active && <motion.span className="type-switch-active" layoutId={`type-switch-${id}`} transition={{ duration: reduceMotion ? 0.01 : 0.18 }} />}
        <span className="type-switch-label">{option.label}</span>
      </button>
    })}
  </div></fieldset>
}
