// 字数统计插件 · 渲染层入口（隔离上下文）
// 演示能力：状态栏条目（ui:statusbar）+ 点击触发主进程命令
// 注意：渲染层 UI API 只有 window.forge.* 与 api.ui.*，无 storage/require 能力。
'use strict';

module.exports = {
  onload(api) {
    api.ui.registerStatusBar({
      id: 'word-count-item',
      render(el) {
        el.textContent = '字数统计';
        el.style.cursor = 'pointer';
        el.title = '点击查看设置 / 统计当前笔记说明';
        el.onclick = () => {
          // 进入阈值设置（由主进程读写 storage 并回显）
          window.forge.plugin.runCommand('word-count:set-threshold').catch((e) =>
            api.ui.toast({ level: 'error', text: '操作失败：' + String(e) })
          );
        };
      }
    });
  },

  onunload() {}
};
