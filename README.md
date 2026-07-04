# The Veil Archive｜帷幕档案

一款移动端优先、离线可用的私人誓约与残响档案。所有数据保存在浏览器本地 IndexedDB 中，无账号、无服务器、无云同步。

## 功能

- 刻录永续与终末誓约，以履约获得残响
- 录入恒常与独一异赐，以残响受领异赐
- 按年月日浏览、补录、修订和抹除帷录
- 自定义昼夜分界与深色/羊皮纸主题
- 导出包含模板和帷录的 CSV 抄本
- 安装为 iPhone 主屏幕 PWA，首次成功加载后可离线使用

## 本地开发

需要 Node.js 22 或更新版本。

```bash
npm ci
npm run dev
```

Vite 配置使用 GitHub Pages 子路径 `/veil-archive/`。开发服务器会在终端显示可访问地址。

## 构建与预览

```bash
npm run build
npm run preview
```

生产文件输出到 `dist/`。构建同时生成 Web App Manifest 与 Workbox service worker，并预缓存应用壳、脚本、样式和安装图标。

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

首次打开需要网络以缓存应用。完成一次成功加载后，可关闭网络重新打开，并离线履约、受赐、浏览或修订帷录。数据仅保存在当前浏览器与设备中；清除 Safari 网站数据会一并删除档案，请定期从源典导出 CSV 抄本。

## 技术栈

Vite、React、TypeScript、Tailwind CSS、Dexie.js、Framer Motion、lucide-react、vite-plugin-pwa。

## License

[MIT](./LICENSE)
