// 字数统计插件 · 主进程入口（CommonJS）
// 演示能力：storage 持久化阈值、fs 读取、命令注册（接收 kbId/notePath 上下文）、toast 转发
'use strict';

function countWords(text) {
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + latin;
}

module.exports = {
  async onload(api, ctx) {
    if ((await api.storage.get('threshold')) === undefined) {
      await api.storage.set('threshold', 300);
    }

    // 命令：统计当前笔记字数。命令面板触发时会自动注入 { kbId, notePath }。
    api.commands.register('word-count:current', {
      title: '字数统计：统计当前笔记',
      handler: async (cmdCtx) => {
        const kbId = cmdCtx && cmdCtx.kbId;
        const notePath = cmdCtx && cmdCtx.notePath;
        if (!kbId || !notePath) {
          api.ui.toast({ level: 'warn', text: '请通过命令面板（⌘/Ctrl+P）触发以统计当前打开的笔记' });
          return;
        }
        const note = await api.fs.readNote(kbId, notePath);
        const words = countWords(note.content || '');
        const threshold = (await api.storage.get('threshold')) || 0;
        const tip = threshold && words >= threshold ? `（已超阈值 ${threshold}）` : '';
        api.ui.toast({ level: 'info', text: `「${notePath}」共 ${words} 字 ${tip}` });
      }
    });

    // 命令：设置提醒阈值（演示 storage 写入；真实交互入口在 ui.js）
    api.commands.register('word-count:set-threshold', {
      title: '字数统计：设置提醒阈值',
      handler: async () => {
        const cur = (await api.storage.get('threshold')) || 0;
        api.ui.toast({ level: 'info', text: `当前阈值：${cur}` });
      }
    });

    ctx.log.info('字数统计插件已加载');
  },

  async onunload(api, ctx) {
    ctx?.log?.info('字数统计插件已卸载');
  }
};
