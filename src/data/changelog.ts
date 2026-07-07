export const APP_VERSION = '1.2.0'

export type ChangelogEntry = {
  version: string
  date: string
  title: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2026-07-07',
    title: '日常图标系统',
    items: [
      '移除誓约、异赐与帷录中的彩色 emoji 图标。',
      '新增统一的单色线性图标库。',
      '将图标语义调整为学习、代码、饮食、娱乐、休息与放松等日常行为。',
      '优化图标选择器、模板卡片与历史记录图标显示。',
      '兼容旧数据中的 emoji 图标并自动映射为新图标。',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-07-07',
    title: '界面与更新机制打磨',
    items: [
      '新增 PWA 新版本提示。',
      '新增源典内更新日志。',
      '重做誓约与异赐页面的残响总览。',
      '优化浅色主题下的边框、分割线与卡片观感。',
      '将誓约/异赐类型选择从下拉框改为分段切换。',
      '压缩模板卡片信息密度并优化移动端触感。',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-07-04',
    title: '初版密典',
    items: [
      '完成誓约、异赐、帷录与源典基础功能。',
      '支持本地 IndexedDB 存储、CSV 抄本导出与 GitHub Pages PWA 部署。',
    ],
  },
]
