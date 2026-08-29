// 每日笔记插件 · 主进程入口（CommonJS）
// 演示能力：命令面板命令、fs 读写、storage 持久化、事件订阅
'use strict';

function todayPath() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `journal/${y}-${m}/${y}-${m}-${day}.md`;
}

function dateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function frontmatter(ds) {
  return `---\ntitle: ${ds}\ndate: ${ds}\n---\n\n# ${ds}\n\n`;
}

/** 创建当日日记（若已存在则跳过）；返回笔记路径 */
async function ensureTodayNote(api) {
  const kbs = await api.kb.list();
  if (!kbs.length) {
    api.ui.toast({ level: 'warn', text: '请先打开一个知识库' });
    return null;
  }
  const kbId = kbs[0].id;
  const p = todayPath();
  const dir = p.split('/').slice(0, 2).join('/');
  const existing = await api.fs.listNotes(kbId, { dirPath: dir });
  const title = p.split('/').pop();
  if (existing.some((n) => n.path.endsWith(title))) {
    api.ui.toast({ level: 'info', text: `今天已存在：${p}` });
    return p;
  }
  await api.fs.writeNote(kbId, p, frontmatter(dateStr()));
  await api.storage.set('lastCreated', dateStr());
  api.ui.toast({ level: 'success', text: `已创建 ${p}` });
  return p;
}

module.exports = {
  async onload(api, ctx) {
    // 注册命令：命令面板可触发
    api.commands.register('open-today', {
      title: '每日笔记：打开今天的日记',
      hotkey: 'Ctrl+Alt+D',
      handler: async () => {
        await ensureTodayNote(api);
      }
    });

    // 监听文件变更，便于 ui.js 侧刷新统计
    ctx.events.onFsChange((e) => {
      if (e.path.startsWith('journal/')) {
        ctx.log.info('journal 目录有变更：', e.path);
      }
    });

    await api.storage.set('lastActive', Date.now());
    ctx.log.info('每日笔记插件已加载');
  },

  async onunload(api, ctx) {
    ctx?.log?.info('每日笔记插件已卸载');
  }
};
