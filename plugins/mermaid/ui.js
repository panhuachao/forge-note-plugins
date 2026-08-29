// Mermaid 预览渲染插件（渲染层，隔离上下文）
//
// 设计要点：宿主只提供「预览代码块渲染扩展点」与「加载并执行自带 vendor 库」能力；
// 本插件自带 mermaid（vendor/mermaid.min.js），随插件文件一起分发，完全自包含、离线可用。
// 后续若有 plantuml 等插件，同样自带库、注册相同扩展点即可，无需改动宿主。
(function () {
  let mermaid = null;
  let loading = null;
  let initialized = false;

  // 加载插件自带的 mermaid UMD 包并在当前上下文执行（暴露 window.mermaid）
  function ensureMermaid(api) {
    if (mermaid) return Promise.resolve(mermaid);
    if (loading) return loading;
    loading = api.ui.loadVendor('vendor/mermaid.min.js').then(() => {
      mermaid = window.mermaid;
      if (!mermaid) throw new Error('vendor 执行后未找到全局 mermaid');
      if (!initialized) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
        });
        initialized = true;
      }
      return mermaid;
    });
    return loading;
  }

  function render(api, container, code) {
    return ensureMermaid(api)
      .then((m) => {
        const id = 'mermaid-' + Math.random().toString(36).slice(2);
        return m.render(id, code);
      })
      .then(({ svg }) => {
        container.innerHTML = svg;
        container.classList.add('mermaid-rendered');
      })
      .catch((err) => {
        container.innerHTML = '';
        const pre = document.createElement('pre');
        pre.className = 'mermaid-error';
        pre.textContent = 'Mermaid 渲染失败：\n' + String(err && err.message ? err.message : err);
        container.appendChild(pre);
      });
  }

  module.exports = {
    onload(api) {
      api.ui.registerCodeBlockRenderer({
        lang: 'mermaid',
        render: (container, code) => render(api, container, code)
      });
    },
    onunload() {
      // 渲染器由运行时在插件卸载时自动反注册，这里无需手动清理
    }
  };
})();
