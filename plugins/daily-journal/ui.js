// 每日笔记插件 · 渲染层入口（隔离上下文，无 Node 能力）
// 演示能力：侧栏面板（ui:sidebar），原生 DOM 渲染 + 调用预加载层运行主进程命令
'use strict';

module.exports = {
  onload(api) {
    api.ui.registerSidebarPanel({
      id: 'daily-journal-panel',
      title: '每日笔记',
      render(container) {
        container.innerHTML = `
          <div style="font-size:12px;color:#666;line-height:1.6">
            一键创建并打开今天的日记。
          </div>
          <button id="dj-open"
            style="margin-top:8px;width:100%;padding:7px;border:1px solid var(--border-soft,#ddd);border-radius:6px;cursor:pointer;background:var(--brand-soft,#eef)">
            打开今天的日记
          </button>`;
        const btn = container.querySelector('#dj-open');
        if (btn) {
          btn.onclick = () => {
            // 通过预加载层触发主进程命令（key 为 commands.register 时提供的 id）
            window.forge.plugin.runCommand('open-today').then(
              () => {}, // 成功提示由主进程 toast 转发
              (e) => api.ui.toast({ level: 'error', text: '创建失败：' + String(e) })
            );
          };
        }
      }
    });
  },

  onunload() {
    /* 侧栏由宿主自动移除 */
  }
};
