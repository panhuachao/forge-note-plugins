# 每日笔记（daily-journal）

每日笔记示例插件：一键创建 `journal/YYYY-MM/YYYY-MM-DD.md` 日记并把命令注册到命令面板，侧栏提供快速入口。

## 演示的插件能力

- `api.commands.register`：注册 `open-today` 命令（可在命令面板 / 快捷键触发）
- `api.fs.writeNote` / `api.fs.listNotes`：在知识库内读写笔记
- `api.storage.get/set`：持久化上次访问时间
- `api.ui`（渲染层）：`registerSidebarPanel` 注册侧栏面板
- 渲染层 → 主进程：通过 `window.forge.plugin.runCommand('open-today')` 触发命令

## 文件结构

```
daily-journal/
├── manifest.json      # 插件元信息 + 权限声明
├── main.js            # 主进程入口（Node 上下文，有 fs/storage/ai 能力）
├── ui.js              # 渲染层入口（隔离上下文，只有 api.ui 与 window.forge.*）
└── README.md
```

## 权限（manifest）

```json
"permissions": ["fs:read", "fs:write", "ui:sidebar", "storage"]
```

## 使用

将本目录放入 `<知识库>/.forge/plugins/`，或开发期通过「设置 → 插件 → 添加本地插件」指向本目录，重启/启用即可。

侧栏出现「每日笔记」面板，点击「打开今天的日记」会自动创建并提示；命令面板（⌘/Ctrl+P）搜索「每日笔记」同样可用，默认快捷键 `Ctrl+Alt+D`。
