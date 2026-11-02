# dsh-chat-backdrop

> 给 DSH 的聊天界面换一张脸：一张壁纸铺在对话区背后，周边面板变成半透明玻璃，输入框上沿站着四只鲸鱼娘。

![壁纸](assets/backdrop.jpg)

![鲸鱼娘姿势](assets/pose-1.png)

一个纯客户端的 [DSH](https://github.com/deepseek-ai/deepseek-harness) 插件：不联网、不读本地文件、不加任何命令或工具，只做视觉。

## 它做了什么

| | |
|---|---|
| **壁纸** | 用 `body::before` 铺满视口，46 秒一轮缓慢漂移 + 轻微指针视差；叠一层噪点、顶部高光和暗角，避免照片直接平铺的廉价感 |
| **玻璃面板** | 侧栏、输入框卡片、设置页与弹窗改成半透明 + `backdrop-filter` 模糊，保证压在图上的文字仍然可读 |
| **鲸鱼娘** | 四张透明姿势图固定在输入框上沿右侧，随输入框尺寸变化重新定位；用 `MutationObserver` 跟随 composer 挂载，不会被 React 重渲染吃掉 |
| **明暗双主题** | token 同时提供 light / dark 两套取值，跟随 DSH 外观设置切换 |
| **入场动画** | 首次加载与切换会话时有一次约 1.4 秒的渐入；检测到 `prefers-reduced-motion` 时自动跳过 |
| **零请求** | 图片全部 base64 内联进 `client.js`，运行时没有任何网络请求 |

## 安装

```sh
dsh plugin --profile desktop add github:karlalt9/dsh-chat-backdrop
```

装完确认 profile 的 `package.json` 里 `dsh.profile.bundles` 包含 `dsh-chat-backdrop`（没自动加就手动补一行），然后重启 DSH。

## 自己换图

```sh
# 1. 换壁纸：直接覆盖 backdrop.jpg（建议 16:9，300KB 以内）
# 2. 换角色姿势：覆盖 assets/pose-1.png ~ pose-4.png（透明背景 PNG，高度 160px 左右最协调）
# 3. 重新内联生成 client.js
node gen-client.mjs
```

配色不在这两处，而在 `client.template.js` 的 `TOKENS` 表里——每个 token 都是 `{ light, dark }` 两个值。

## 兼容性

- 在 DSH 0.2.x（desktop profile）上验证过。
- 只依赖 `@deepseek-ai/dsh-client-ui-theme` 暴露的 token，不硬编码组件类名；composer 卡片是按「圆角 + 有背景色 + 内部有按钮」的形状识别出来的，所以 DSH 换肤后一般还能定位到。
- 如果某次 DSH 大改 composer 结构导致小人位置飘了，`client.template.js` 里的 `findComposerCard()` 是唯一需要调的地方。

## 目录结构

```
index.js              host 侧空实现（纯客户端插件）
client.js             构建产物：CSS + token + 内联图片，DSH 直接加载这个
client.template.js    源码（带占位符），改这个然后重新生成
gen-client.mjs        把 backdrop.jpg 与 assets/pose-*.png 内联进 client.js
cordis.patch.yml      bundle 声明
assets/               四张姿势图 + 两张 logo
locale/               中英文名称与描述
```

## 卸载

把 `dsh-chat-backdrop` 从 `dsh.profile.bundles` 里删掉并重启。样式节点和 token 覆盖都注册在 `ctx.effect` 的清理函数里，卸载即还原，不留残留。

## License

MIT，见 [LICENSE](LICENSE)。仓库内的图片素材（`backdrop.jpg`、`assets/*.png`）随代码以同一许可提供。
