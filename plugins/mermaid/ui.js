// Mermaid 预览渲染插件（渲染层，隔离上下文）
//
// 设计要点：宿主只提供「预览代码块渲染扩展点」，不绑定任何绘图库。
// 本插件自带 mermaid（vendor/mermaid.min.js），在隔离上下文里动态加载并渲染，
// 完全自包含——后续若有 plantuml 等插件，同样自带库、各自注册即可，无需改宿主。
//
// 渲染层无 Node 能力，资源通过 window.forge.plugin.getResourceUrl 取得绝对 URL。
(function () {
  let mermaid = null;
  let loading = null;
  let initialized = false;

  // 加载插件自带的 mermaid UMD 包（随插件文件一起分发，离线可用）
  function ensureMermaid() {
    if (mermaid) return Promise.resolve(mermaid);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      // 取得插件目录下 vendor/mermaid.min.js 的绝对地址
      const url = window.forge.plugin.getResourceUrl('mermaid', 'vendor/mermaid.min.js');
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        // UMD 暴露到全局 window.mermaid
        mermaid = window.mermaid;
        if (!mermaid) {
          reject(new Error('mermaid 加载失败：全局未找到 mermaid'));
          return;
        }
        if (!initialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
          });
          initialized = true;
        }
        resolve(mermaid);
      };
      script.onerror = () => reject(new Error('mermaid 脚本加载失败：' + url));
      document.head.appendChild(script);
    });
    return loading;
  }

  function render(container, code) {
    return ensureMermaid().then((m) => {
      const id = 'mermaid-' + Math.random().toString(36).slice(2);
      return m.render(id, code);
    }).then(({ svg }) => {
      container.innerHTML = svg;
      container.classList.add('mermaid-rendered');
    }).catch((err) => {
      // 渲染失败时在容器内展示错误，便于排查语法问题
      container.innerHTML = '';
      const pre = document.createElement('pre');
      pre.className = 'mermaid-error';
      pre.textContent = 'Mermaid 渲染失败：\n' + String(err && err.message ? err.message : err);
      container.appendChild(pre);
    });
  }

  module.exports = {
    onload(api) {
      api.ui.registerCodeBlockRenderer({ lang: 'mermaid', render });
    },
    onunload() {
      // 渲染器由运行时在插件卸载时自动反注册，这里无需手动清理
    }
  };
})();
