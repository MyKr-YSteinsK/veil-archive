import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, BookMarked, ChevronRight, Clock3, Download, ExternalLink, Flame,
  History, Info, MoonStar, Palette, ScrollText, Sun, X,
} from 'lucide-react'
import {
  APP_VERSION,
  CHANGELOG,
  clearAllData,
  createArchiveCsv,
  ledgerRecordService,
  rewardTemplateService,
  settingsService,
  taskTemplateService,
  type LedgerRecord,
  type RewardTemplate,
  type Settings,
  type TaskTemplate,
  type ThemeMode,
} from '../data'
import Toast from './ui/Toast'
import { IconGlyph } from './ui/iconRegistry'

type View = 'main' | 'tasks' | 'rewards'
const REPOSITORY_URL = 'https://github.com/MyKr-YSteinsK/veil-archive'

export default function CodexPage() {
  const [settings, setSettings] = useState<Settings>(settingsService.defaults)
  const [tasks, setTasks] = useState<TaskTemplate[]>([])
  const [rewards, setRewards] = useState<RewardTemplate[]>([])
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [view, setView] = useState<View>('main')
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0)
  const [showChangelog, setShowChangelog] = useState(false)
  const [toast, setToast] = useState('')

  const refresh = useCallback(async () => {
    const [nextSettings, nextTasks, nextRewards, nextRecords] = await Promise.all([
      settingsService.get(), taskTemplateService.list(true), rewardTemplateService.list(true), ledgerRecordService.list(),
    ])
    setSettings(nextSettings)
    setTasks(nextTasks)
    setRewards(nextRewards)
    setRecords(nextRecords)
  }, [])

  useEffect(() => { refresh().catch(() => setToast('源典读取失败，请稍后重试')) }, [refresh])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const archivedTasks = useMemo(() => records.filter((record) => record.kind === 'task' && record.templateType === 'oneTime'), [records])
  const archivedRewards = useMemo(() => records.filter((record) => record.kind === 'reward' && record.templateType === 'oneTime'), [records])

  async function changeDayStart(value: string) {
    try {
      const next = await settingsService.update({ dayStartTime: value })
      setSettings(next)
      setToast('昼夜分界已更新')
    } catch { setToast('昼夜分界保存失败') }
  }

  async function changeTheme(themeMode: ThemeMode) {
    try {
      const next = await settingsService.update({ themeMode })
      setSettings(next)
      applyTheme(themeMode)
      setToast('色相已更新')
    } catch { setToast('色相保存失败') }
  }

  function exportCsv() {
    const csv = createArchiveCsv(tasks, rewards, records)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `veil-archive-backup-${localDateKey(new Date())}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
    setToast('帷录抄本已生成')
  }

  async function burnCodex() {
    try {
      await clearAllData()
      setClearStep(0)
      setView('main')
      await refresh()
      applyTheme('system')
      setToast('源典已焚毁，档案归于寂静')
    } catch { setToast('焚毁失败，请稍后重试') }
  }

  if (view !== 'main') {
    const entries = view === 'tasks' ? archivedTasks : archivedRewards
    const title = view === 'tasks' ? '已履行的终末誓约' : '已受领的独一异赐'
    return <main className="content codex-page archive-page">
      <button className="back-button" type="button" onClick={() => setView('main')}><ArrowLeft size={17} />返回源典</button>
      <p className="section-mark">ARCHIVE</p><h2>{title}</h2>
      {entries.length === 0 ? <div className="codex-empty"><BookMarked size={24} /><span>尚无条目封存于此</span></div>
        : <div className="archive-list">{entries.map((record) => <article key={record.id}>
          <span className={`${record.kind}-icon`}><IconGlyph value={record.iconSnapshot} size={19} /></span><div><h3>{record.titleSnapshot}</h3><time>{formatDateTime(record.occurredAt)}</time></div>
          <strong className={record.pointsDelta > 0 ? 'positive' : 'negative'}>{record.pointsDelta > 0 ? '+' : ''}{record.pointsDelta} 残响</strong>
        </article>)}</div>}
      <Toast message={toast} />
    </main>
  }

  return <main className="content codex-page">
    <p className="section-mark">SOURCE CODEX</p><h2>源典</h2>

    <section className="codex-section"><h3>律令</h3><div className="codex-card">
      <label className="setting-row"><span className="setting-icon"><Clock3 size={18} /></span><span><strong>昼夜分界</strong><small>影响今日统计与终末归档</small></span><input aria-label="昼夜分界" type="time" value={settings.dayStartTime} onChange={(event) => changeDayStart(event.target.value)} /></label>
      <div className="setting-row theme-row"><span className="setting-icon"><Palette size={18} /></span><span><strong>色相</strong><small>选择档案呈现的光影</small></span></div>
      <div className="theme-options" aria-label="色相选择">
        {([['system', '跟随系统', Palette], ['light', '浅色', Sun], ['dark', '深色', MoonStar]] as const).map(([value, label, Icon]) =>
          <button className={settings.themeMode === value ? 'active' : ''} type="button" key={value} onClick={() => changeTheme(value)}><Icon size={15} />{label}</button>,
        )}
      </div>
    </div></section>

    <section className="codex-section"><h3>封存</h3><div className="codex-card">
      <CodexButton icon={<ScrollText size={18} />} title="已履行的终末誓约" meta={`${archivedTasks.length} 条`} onClick={() => setView('tasks')} />
      <CodexButton icon={<BookMarked size={18} />} title="已受领的独一异赐" meta={`${archivedRewards.length} 条`} onClick={() => setView('rewards')} />
    </div></section>

    <section className="codex-section"><h3>抄本与焚毁</h3><div className="codex-card">
      <CodexButton icon={<Download size={18} />} title="抄录帷录" meta="CSV" onClick={exportCsv} />
      <CodexButton icon={<Flame size={18} />} title="焚毁源典" danger onClick={() => setClearStep(1)} />
    </div></section>

    <section className="codex-section"><h3>关于</h3><div className="codex-card info-card">
      <div className="setting-row"><span className="setting-icon"><Info size={18} /></span><span><strong>密典版本</strong><small>{APP_VERSION}</small></span></div>
      <CodexButton icon={<History size={18} />} title="更新日志" meta={`v${APP_VERSION}`} onClick={() => setShowChangelog(true)} />
      <div className="info-line"><span>书写者</span><strong>MyKr-YSteinsK</strong></div>
      <a className="info-line" href={REPOSITORY_URL} target="_blank" rel="noreferrer"><span>源典入口</span><strong>GitHub <ExternalLink size={13} /></strong></a>
      <p className="project-note">《帷幕档案》是一部关于誓约、残响与异赐的私人档案。它不审判，只存录。</p>
    </div></section>

    {clearStep > 0 && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setClearStep(0)}>
      <section className="vow-modal burn-modal" role="alertdialog" aria-modal="true" aria-labelledby="burn-title">
        <div className="modal-heading"><div><p className="section-mark danger-mark">IRREVERSIBLE</p><h3 id="burn-title">{clearStep === 1 ? '焚毁源典？' : '最后确认'}</h3></div><button className="icon-button" type="button" onClick={() => setClearStep(0)} aria-label="关闭"><X size={20} /></button></div>
        <div className="burn-warning"><Flame size={27} /><p>焚毁源典后，所有誓约、异赐与帷录条目都将被抹除。此举不可逆。</p></div>
        {clearStep === 1 ? <button className="danger-button" type="button" onClick={() => setClearStep(2)}>我已知晓，继续</button>
          : <><p className="final-warning">这是最后一道门。确认后无法找回任何数据。</p><button className="danger-button solid" type="button" onClick={burnCodex}>确认焚毁</button></>}
        <button className="secondary-button" type="button" onClick={() => setClearStep(0)}>保留档案</button>
      </section>
    </div>}
    {showChangelog && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowChangelog(false)}>
      <section className="vow-modal changelog-modal" role="dialog" aria-modal="true" aria-labelledby="changelog-title">
        <div className="modal-heading"><div><p className="section-mark">REVISIONS</p><h3 id="changelog-title">更新日志</h3></div><button className="icon-button" type="button" onClick={() => setShowChangelog(false)} aria-label="关闭"><X size={20} /></button></div>
        <div className="changelog-list">{CHANGELOG.map((entry) => <article key={entry.version}>
          <header><span>v{entry.version}</span><time>{entry.date}</time></header>
          <h4>{entry.title}</h4>
          <ul>{entry.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>)}</div>
      </section>
    </div>}
    <Toast message={toast} />
  </main>
}

function CodexButton({ icon, title, meta, danger, onClick }: { icon: React.ReactNode; title: string; meta?: string; danger?: boolean; onClick: () => void }) {
  return <button className={`codex-button${danger ? ' danger' : ''}`} type="button" onClick={onClick}><span className="setting-icon">{icon}</span><strong>{title}</strong>{meta && <small>{meta}</small>}<ChevronRight size={17} /></button>
}

export function applyTheme(mode: ThemeMode) { document.documentElement.dataset.theme = mode }
function localDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function formatDateTime(value: string) { return new Date(value).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short', hour12: false }) }
