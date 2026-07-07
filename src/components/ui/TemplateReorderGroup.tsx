import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import { Reorder, useDragControls, useReducedMotion } from 'framer-motion'

type OrderedItem = { id: string }

type Props<T extends OrderedItem> = {
  items: T[]
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode
  onCommit: (ids: string[]) => Promise<void>
}

export default function TemplateReorderGroup<T extends OrderedItem>({ items, renderItem, onCommit }: Props<T>) {
  const signature = items.map((item) => item.id).join('|')
  const [orderedIds, setOrderedIds] = useState(() => items.map((item) => item.id))
  const initialOrder = useRef(signature)
  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  useEffect(() => {
    setOrderedIds(items.map((item) => item.id))
    initialOrder.current = signature
  }, [signature])

  async function commitOrder() {
    const nextSignature = orderedIds.join('|')
    if (nextSignature === initialOrder.current) return
    initialOrder.current = nextSignature
    await onCommit(orderedIds)
  }

  return <Reorder.Group className="template-reorder-group" axis="y" values={orderedIds} onReorder={setOrderedIds}>
    {orderedIds.map((id) => {
      const item = itemMap.get(id)
      return item ? <ReorderCard key={id} id={id} onDragEnd={commitOrder}>{(handle) => renderItem(item, handle)}</ReorderCard> : null
    })}
  </Reorder.Group>
}

function ReorderCard({ id, onDragEnd, children }: { id: string; onDragEnd: () => void; children: (handle: ReactNode) => ReactNode }) {
  const controls = useDragControls()
  const reduceMotion = useReducedMotion()
  const [dragging, setDragging] = useState(false)
  const handle = <button
    className="drag-handle"
    type="button"
    aria-label="按住并拖动排序"
    title="按住并拖动排序"
    onClick={(event) => event.preventDefault()}
    onPointerDown={(event) => controls.start(event.nativeEvent)}
  ><GripVertical size={16} /></button>

  return <Reorder.Item
    className={`template-reorder-item${dragging ? ' dragging' : ''}`}
    value={id}
    dragListener={false}
    dragControls={controls}
    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
    onDragStart={() => setDragging(true)}
    onDragEnd={() => { setDragging(false); onDragEnd() }}
  >{children(handle)}</Reorder.Item>
}
