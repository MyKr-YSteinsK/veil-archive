import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, BookMarked, ChevronRight, Clock3, Download, ExternalLink, Flame,
  History, Info, MoonStar, Palette, ScrollText, Sun, Upload, X,
} from 'lucide-react'
import {
  APP_VERSION,
  createArchiveBackup,
  CHANGELOG,
  clearAllData,
  createArchiveCsv,
  ledgerRecordService,
  parseArchiveBackup,
  rewardTemplateService,
  restoreArchiveBackup,
  settingsService,
  taskTemplateService,
  serializeArchiveBackup,
  summarizeArchiveBackup,
  type LedgerRecord,
  type ArchiveBackup,
  type BackupSummary,
  type RewardTemplate,
  type Settings,
  type TaskTemplate,
  type ThemeMode,
} from '../data'
import Toast from './ui/Toast'
import { IconGlyph } from './ui/iconRegistry'

type View = 'main' | 'tasks' | 'rewards'
type RestoreStep = 0 | 1 | 2
type PendingRestore = { backup: ArchiveBackup; summary: BackupSummary; fileName: string }
const REPOSITORY_URL = 'https://github.com/MyKr-YSteinsK/veil-archive'

export default function CodexPage() {
  const [settings, setSettings] = useState<Settings>(settingsService.defaults)
  const [tasks, setTasks] = useState<TaskTemplate[]>([])
  const [rewards, setRewards] = useState<RewardTemplate[]>([])
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [view, setView] = useState<View>('main')
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0)
  const [restoreStep, setRestoreStep] = useState<RestoreStep>(0)
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(null)
  const [restoreBusy, setRestoreBusy] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const [showChangelog, setShowChangelog] = useState(false)
  const [toast, setToast] = useState('')
  const restoreFileInput = useRef<HTMLInputElement>(null)

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

  function downloadText(content: string, fileName: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  function exportJson() {
    try {
      const backup = createArchiveBackup(tasks, rewards, records, settings)
      downloadText(serializeArchiveBackup(backup), `veil-archive-backup-${localDateKey(new Date())}.json`, 'application/json;charset=utf-8')
      setToast('完整档案抄本已生成')
    } catch (error) {
      setToast(`完整档案生成失败：${getErrorMessage(error)}`)
    }
  }

  function exportCsv() {
    const csv = createArchiveCsv(tasks, rewards, records)
    downloadText(`\uFEFF${csv}`, `veil-archive-export-${localDateKey(new Date())}.csv`, 'text/csv;charset=utf-8')
    setToast('帷录导出已生成')
  }

  function selectRestoreFile() {
    if (restoreBusy) return
    setRestoreError('')
    restoreFileInput.current?.click()
  }

  async function handleRestoreFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || restoreBusy) return
    setRestoreBusy(true)
    setRestoreError('')
    try {
      const backup = parseArchiveBackup(await file.text())
      setPendingRestore({ backup, summary: summarizeArchiveBackup(backup), fileName: file.name })
      setRestoreStep(1)
    } catch (error) {
      setToast(`备份校验失败：${getErrorMessage(error)}`)
    } finally {
      setRestoreBusy(false)
    }
  }

  function closeRestore() {
    if (restoreBusy) return
    setRestoreStep(0)
    setPendingRestore(null)
    setRestoreError('')
  }

  async function restoreCodex() {
    if (!pendingRestore || restoreBusy) return
    setRestoreBusy(true)
    setRestoreError('')
    try {
      try {
        await restoreArchiveBackup(pendingRestore.backup)
      } catch (error) {
        setRestoreError(`恢复失败，现有档案未改变：${getErrorMessage(error)}`)
        return
      }

      const restoredTheme = pendingRestore.backup.data.settings.themeMode
      setRestoreStep(0)
      setPendingRestore(null)
      await refresh()
      applyTheme(restoredTheme)
      setToast('完整档案已恢复')
    } catch {
      setToast('档案已替换，但界面刷新失败，请重新加载页面')
    } finally {
      setRestoreBusy(false)
    }
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
      <label className="setting-row"><span className="setting-icon"><Clock3 size={18} /></span><span><strong>昼夜分界</strong><small>仅影响今日统计的起算时间</small></span><input aria-label="昼夜分界" type="time" value={settings.dayStartTime} onChange={(event) => changeDayStart(event.target.value)} /></label>
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

    <section className="codex-section"><h3>抄本与恢复</h3><div className="codex-card">
      <CodexButton icon={<Download size={18} />} title="封存完整档案" meta="JSON" onClick={exportJson} />
      <CodexButton icon={<Upload size={18} />} title="恢复完整档案" meta="JSON" onClick={selectRestoreFile} />
      <CodexButton icon={<ScrollText size={18} />} title="导出帷录" meta="CSV" onClick={exportCsv} />
    </div></section>

    <section className="codex-section"><h3>焚毁</h3><div className="codex-card">
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
    <input ref={restoreFileInput} className="sr-only" type="file" accept="application/json,.json" aria-label="选择 JSON 备份文件" onChange={handleRestoreFile} />
    {restoreStep > 0 && pendingRestore && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeRestore()}>
      <section className="vow-modal restore-modal" role={restoreStep === 2 ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby="restore-title">
        <div className="modal-heading"><div><p className={`section-mark${restoreStep === 2 ? ' danger-mark' : ''}`}>{restoreStep === 1 ? 'RESTORE REVIEW' : 'REPLACE ALL'}</p><h3 id="restore-title">{restoreStep === 1 ? '检视封存抄本' : '最后确认恢复'}</h3></div><button className="icon-button" type="button" onClick={closeRestore} aria-label="关闭" disabled={restoreBusy}><X size={20} /></button></div>
        {restoreStep === 1 ? <>
          <div className="backup-summary">
            <div><span>抄本文件</span><strong>{pendingRestore.fileName}</strong></div>
            <div><span>来源版本</span><strong>v{pendingRestore.summary.appVersion}</strong></div>
            <div><span>导出时间</span><strong>{formatDateTime(pendingRestore.summary.exportedAt)}</strong></div>
            <div><span>誓约模板</span><strong>{formatTemplateSummary(pendingRestore.summary.taskTemplates)}</strong></div>
            <div><span>异赐模板</span><strong>{formatTemplateSummary(pendingRestore.summary.rewardTemplates)}</strong></div>
            <div><span>帷录条目</span><strong>{pendingRestore.summary.ledgerRecords} 条</strong></div>
          </div>
          <div className="restore-warning"><Upload size={22} /><p>恢复会替换本设备上的全部誓约、异赐、帷录和设置，包括软删除条目、排序与置顶状态。不会合并当前档案。</p></div>
          <button className="primary-button" type="button" onClick={() => setRestoreStep(2)}>核对无误，继续</button>
          <button className="secondary-button" type="button" onClick={closeRestore}>取消</button>
        </> : <>
          <div className="burn-warning"><Flame size={27} /><p>这是不可逆的全量替换。确认后，当前本地档案将由该 JSON 抄本取代。</p></div>
          {restoreError && <p className="form-error" role="alert">{restoreError}</p>}
          <p className="final-warning">请确认你已保留当前档案的必要副本。</p>
          <button className="danger-button solid" type="button" onClick={restoreCodex} disabled={restoreBusy}>{restoreBusy ? '正在恢复…' : '确认替换全部档案'}</button>
          <button className="secondary-button" type="button" onClick={closeRestore} disabled={restoreBusy}>保留当前档案</button>
        </>}
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
function formatTemplateSummary(summary: BackupSummary['taskTemplates']) { return `${summary.total} 条（${summary.active} 活跃，${summary.deleted} 已删除）` }
function getErrorMessage(error: unknown) { return error instanceof Error ? error.message : '未知错误' }
