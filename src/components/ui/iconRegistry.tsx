import {
  Bath, Bed, BookOpenText, Brain, BriefcaseBusiness, CakeSlice, CalendarCheck,
  Circle, Clapperboard, Code2, Coffee, CupSoda, Dumbbell, Gamepad2, GraduationCap,
  HandHeart, Heart, Laptop, ListChecks, Lock, MonitorPlay, Music, PenLine,
  ShoppingBag, Smile, Soup, Sparkles, Target, Terminal, Utensils,
  type LucideIcon,
} from 'lucide-react'

export type IconId =
  | 'study' | 'reading' | 'writing' | 'coding' | 'project' | 'terminal' | 'review'
  | 'calendar' | 'workout' | 'sleep' | 'clean' | 'work' | 'brain' | 'focus'
  | 'coffee' | 'meal' | 'soup' | 'game' | 'anime' | 'movie' | 'music' | 'rest'
  | 'massage' | 'bath' | 'shopping' | 'dessert' | 'drink' | 'private' | 'relax'
  | 'pleasure' | 'fallback'

export type IconOption = { id: IconId; label: string; icon: LucideIcon; group: 'vow' | 'giving' | 'common' }

const options: IconOption[] = [
  { id: 'study', label: '学习', icon: GraduationCap, group: 'vow' },
  { id: 'reading', label: '阅读', icon: BookOpenText, group: 'common' },
  { id: 'writing', label: '写作', icon: PenLine, group: 'vow' },
  { id: 'coding', label: '代码', icon: Code2, group: 'vow' },
  { id: 'project', label: '项目', icon: Laptop, group: 'vow' },
  { id: 'terminal', label: '终端', icon: Terminal, group: 'vow' },
  { id: 'review', label: '复盘', icon: ListChecks, group: 'vow' },
  { id: 'calendar', label: '计划', icon: CalendarCheck, group: 'vow' },
  { id: 'workout', label: '锻炼', icon: Dumbbell, group: 'vow' },
  { id: 'sleep', label: '睡眠', icon: Bed, group: 'vow' },
  { id: 'clean', label: '清洁', icon: Sparkles, group: 'vow' },
  { id: 'work', label: '工作', icon: BriefcaseBusiness, group: 'vow' },
  { id: 'brain', label: '思考', icon: Brain, group: 'vow' },
  { id: 'focus', label: '专注', icon: Target, group: 'vow' },
  { id: 'coffee', label: '咖啡', icon: Coffee, group: 'giving' },
  { id: 'meal', label: '正餐', icon: Utensils, group: 'giving' },
  { id: 'soup', label: '汤食', icon: Soup, group: 'giving' },
  { id: 'game', label: '游戏', icon: Gamepad2, group: 'giving' },
  { id: 'anime', label: '动画', icon: MonitorPlay, group: 'giving' },
  { id: 'movie', label: '电影', icon: Clapperboard, group: 'giving' },
  { id: 'music', label: '音乐', icon: Music, group: 'giving' },
  { id: 'rest', label: '休息', icon: Bed, group: 'giving' },
  { id: 'massage', label: '按摩', icon: HandHeart, group: 'giving' },
  { id: 'bath', label: '沐浴', icon: Bath, group: 'giving' },
  { id: 'shopping', label: '购物', icon: ShoppingBag, group: 'giving' },
  { id: 'dessert', label: '甜点', icon: CakeSlice, group: 'giving' },
  { id: 'drink', label: '饮品', icon: CupSoda, group: 'giving' },
  { id: 'private', label: '私人时光', icon: Lock, group: 'giving' },
  { id: 'relax', label: '放松', icon: Smile, group: 'giving' },
  { id: 'pleasure', label: '愉悦', icon: Heart, group: 'giving' },
  { id: 'fallback', label: '其他', icon: Circle, group: 'common' },
]

export const ICON_REGISTRY = Object.fromEntries(options.map((option) => [option.id, option])) as Record<IconId, IconOption>
export const VOW_ICON_OPTIONS = options.filter((option) => option.group === 'vow' || option.id === 'reading')
export const GIVING_ICON_OPTIONS = options.filter((option) => option.group === 'giving' || option.id === 'reading')

export const LEGACY_EMOJI_ICON_MAP: Record<string, IconId> = {
  '✦': 'focus', '⚔️': 'workout', '📜': 'reading', '🕯️': 'focus', '🌙': 'sleep', '🗝️': 'project', '🜁': 'brain', '🜂': 'workout',
  '◆': 'relax', '🍷': 'drink', '🍰': 'dessert', '🎮': 'game', '🎵': 'music', '📖': 'reading', '🌒': 'rest', '🜄': 'bath',
}

export function isKnownIconId(value: string): value is IconId { return value in ICON_REGISTRY }
export function normalizeIconId(value: string): IconId { return isKnownIconId(value) ? value : LEGACY_EMOJI_ICON_MAP[value] ?? 'fallback' }

export function IconGlyph({ value, size = 20, strokeWidth = 1.7 }: { value: string; size?: number; strokeWidth?: number }) {
  const Glyph = ICON_REGISTRY[normalizeIconId(value)].icon
  return <Glyph aria-hidden="true" size={size} strokeWidth={strokeWidth} />
}
