# The Veil Archive｜帷幕档案

一款移动端优先、离线可用的私人誓约与残响档案。所有数据保存在浏览器本地 IndexedDB 中，无账号、无服务器、无云同步。

## 功能

- 刻录永续与终末誓约，以履约获得残响
- 录入恒常与独一异赐，以残响受领异赐
- 按年月日浏览、补录、修订和抹除帷录
- 自定义昼夜分界与深色/羊皮纸主题
- 从源典导出完整 JSON 档案备份，或导出用于阅读的 CSV 抄本
- 安装为 iPhone 主屏幕 PWA，首次成功加载后可离线使用

## 本地开发

需要 Node.js 22 或更新版本。

```bash
npm ci
npm run dev
```

Vite 配置使用 GitHub Pages 子路径 `/veil-archive/`。开发服务器会在终端显示可访问地址。

## 新电脑恢复

仓库已经包含运行项目所需的源代码、锁定依赖元数据、测试、构建配置、PWA 资源和项目文档。当前版本不需要 `.env`、后端服务或数据库文件。

1. 安装 Git、Node.js 22 或更新版本。
2. 克隆仓库并进入项目目录：

   ```bash
   git clone https://github.com/MyKr-YSteinsK/veil-archive.git
   cd veil-archive
   ```

3. 安装锁定版本依赖并验证：

   ```bash
   npm ci
   npm test
   npm run build
   ```

4. 开始开发：

   ```bash
   npm run dev
   ```

   打开终端输出的地址，并访问 `/veil-archive/` 路径（通常为 `http://localhost:5173/veil-archive/`）。

如果受管控的 Windows 电脑在 `npm ci`、测试或构建时出现 `spawn UNKNOWN`，或提示应用控制策略阻止 `esbuild.exe` / `rollup.win32-x64-msvc.node`，通常是本机策略阻止了新下载的构建工具或原生模块。请让安全策略允许运行项目依赖中的 Node/npm 子进程和原生模块，或改用组织允许的开发目录后重新执行 `npm ci`；`npm ci --ignore-scripts` 只适合诊断，不能作为完整安装方案。

`node_modules/`、`dist/`、TypeScript 构建缓存和 IDE 设置均为本机可再生材料，不需要从旧电脑复制。

### 恢复本地档案数据

Git 不包含浏览器 IndexedDB。旧电脑上打开《帷幕档案》→ `源典` → `封存完整档案`，保存生成的 JSON 文件，并通过私密方式带到新电脑。新电脑启动本地项目后，进入 `源典` → `恢复完整档案`，选择 JSON，核对抄本摘要，再确认 `替换全部档案`。

恢复是全量替换，不会合并新旧档案；确认前应保留新电脑当前档案的副本。它会恢复誓约、异赐、帷录、设置、排序/置顶和软删除条目。CSV 只适合阅读和归档，不是完整恢复格式。

## 构建与预览

```bash
npm run build
npm run preview
```

生产文件输出到 `dist/`。构建同时生成 Web App Manifest 与 Workbox service worker，并预缓存应用壳、脚本、样式和安装图标。

## 项目文档

仓库协作信息按职责分开维护：

- [`AGENTS.md`](./AGENTS.md)：仓库专属边界与命令约束
- [`docs/project/PROJECT_BRIEF.md`](./docs/project/PROJECT_BRIEF.md)：稳定产品定义与长期边界
- [`docs/project/DECISIONS.md`](./docs/project/DECISIONS.md)：已接受的长期决策与理由
- [`docs/project/CURRENT_STATE.md`](./docs/project/CURRENT_STATE.md)：当前仓库事实、风险与验证缺口
- [`docs/project-map.md`](./docs/project-map.md)：详细目录与模块职责
- [`docs/patch-log.md`](./docs/patch-log.md)：历史开发记录；其中旧验证条目不是当前 CI 或生产证明

本地若存在 `docs/dev-plan.md`，它仅作为历史计划参考，不是当前执行权威。

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy.yml`。推送到 `main` 后，GitHub Actions 会执行 `npm ci`、生产构建并部署 `dist/`。

首次部署前，在 GitHub 仓库中打开：

1. `Settings → Pages`
2. 将 `Build and deployment → Source` 设为 `GitHub Actions`
3. 推送 `main`，等待 `Deploy to GitHub Pages` workflow 完成

部署地址：<https://mykr-ysteinsk.github.io/veil-archive/>

## 安装到 iPhone

1. 使用 Safari 打开部署地址并等待页面完整加载
2. 点击 Safari 的“分享”按钮
3. 选择“添加到主屏幕”
4. 从主屏幕打开“帷幕档案”

首次打开需要网络以缓存应用。完成一次成功加载后，可关闭网络重新打开，并离线履约、受赐、浏览或修订帷录。数据仅保存在当前浏览器与设备中；清除 Safari 网站数据会一并删除档案，请定期从源典导出完整 JSON 备份，并可另存 CSV 作为阅读抄本。

## 电脑之间切换

离开一台电脑前，先确认 `git status --short` 没有待处理的源代码修改，提交并推送已完成的代码；如果档案数据有变化，再生成一份 JSON 备份。换到另一台电脑后执行 `git pull --ff-only`（首次使用则重新 `git clone`）、`npm ci`，再运行 `npm test` 和 `npm run build`。不要手工复制 `.git`、`node_modules/` 或 `dist/`。

后续 Plan（例如 Plan11）开始前，先阅读 `AGENTS.md`、`README.md`、`docs/project/PROJECT_BRIEF.md`、`docs/project/DECISIONS.md` 和 `docs/project/CURRENT_STATE.md`，并以当前 `main`/`origin/main` 为事实起点。计划文件若只存在于仓库外，需要随计划一起安全复制或在新电脑重新附加；对话记录不能替代本地文件、Git 凭据或浏览器 IndexedDB。

## 技术栈

Vite、React、TypeScript、Tailwind CSS、Dexie.js、Framer Motion、lucide-react、vite-plugin-pwa。

## License

[MIT](./LICENSE)
