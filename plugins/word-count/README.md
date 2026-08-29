# 字数统计（word-count）

字数统计示例插件：在状态栏显示入口，并注册命令统计「当前打开笔记」的中英文字数，支持设置提醒阈值（写入插件存储）。

## 演示的插件能力

- `api.storage.get/set`：插件级键值存储（需 `storage` 权限）
- `api.fs.readNote`：读取笔记内容（`{ content, frontmatter }`）
- `api.commands.register`：注册 `word-count:current`（统计当前笔记）与 `word-count:set-threshold`（设置阈值）
- `api.ui`（渲染层）：`registerStatusBar` 注册状态栏项
- 命令上下文注入：命令面板触发命令时会注入 `{ kbId, notePath }`

## 命令上下文

插件命令的 handler 签名为 `handler(cmdCtx)`，`cmdCtx` 在通过命令面板触发时包含：

```js
{ kbId: string, notePath: string }
```

> 注意：主进程没有直接获取「渲染层当前打开笔记」的 API，因此统计命令请通过命令面板（⌘/Ctrl+P）触发，由宿主注入上下文。

## 文件结构

```
word-count/
├── manifest.json
├── main.js          # 主进程：storage + 命令 + fs 读取
├── ui.js           # 渲染层：状态栏入口
└── README.md
```

## 权限

```json
"permissions": ["fs:read", "ui:statusbar", "storage"]
```
