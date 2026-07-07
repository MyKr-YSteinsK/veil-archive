import { useEffect, useState } from 'react'
import { BookOpenText, Gift, ScrollText, Settings2, type LucideIcon } from 'lucide-react'
import VowsPage from './components/VowsPage'
import GivingsPage from './components/GivingsPage'
import LogPage from './components/LogPage'
import CodexPage, { applyTheme } from './components/CodexPage'
import { settingsService } from './data'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PwaUpdatePrompt from './components/ui/PwaUpdatePrompt'

type TabId = 'vows' | 'givings' | 'log' | 'codex'
type Tab = { id: TabId; label: string; eyebrow: string; title: string; description: string; icon: LucideIcon }

const tabs: Tab[] = [
  { id: 'vows', label: '誓约', eyebrow: 'VOWS', title: '誓约之页', description: '尚无誓约刻入档案。', icon: ScrollText },
  { id: 'givings', label: '异赐', eyebrow: 'GIVINGS', title: '异赐之页', description: '尚无异赐等待受领。', icon: Gift },
  { id: 'log', label: '帷录', eyebrow: 'VEIL LOG', title: '帷录条目', description: '帷幕之后，尚无回声。', icon: BookOpenText },
  { id: 'codex', label: '源典', eyebrow: 'SOURCE CODEX', title: '源典', description: '档案的律令与根源将在此显现。', icon: Settings2 },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('vows')
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]
  const ActiveIcon = active.icon
  const reduceMotion = useReducedMotion()

  useEffect(() => { settingsService.get().then((settings) => applyTheme(settings.themeMode)).catch(() => undefined) }, [])

  return (
    <div className="app-frame">
      <header className="masthead">
        <div className="sigil" aria-hidden="true">V</div>
        <div><p className="overline">THE VEIL ARCHIVE</p><h1>帷幕档案</h1></div>
      </header>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div className="page-motion" key={activeTab} initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -3 }} transition={{ duration: reduceMotion ? 0.01 : 0.18 }}>
          {activeTab === 'vows' ? <VowsPage /> : activeTab === 'givings' ? <GivingsPage /> : activeTab === 'log' ? <LogPage /> : activeTab === 'codex' ? <CodexPage /> : <main className="content">
            <p className="section-mark">{active.eyebrow}</p><h2>{active.title}</h2><section className="empty-card"><span className="icon-well"><ActiveIcon size={26} strokeWidth={1.4} /></span><p>{active.description}</p><small>档案正在静候第一道残响</small></section>
          </main>}
        </motion.div>
      </AnimatePresence>
      <PwaUpdatePrompt />
      <nav className="tab-bar" aria-label="主要导航">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const selected = tab.id === activeTab
          return (
            <button className={selected ? 'tab active' : 'tab'} type="button" aria-current={selected ? 'page' : undefined} onClick={() => setActiveTab(tab.id)} key={tab.id}>
              <Icon size={20} strokeWidth={selected ? 1.8 : 1.4} /><span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
