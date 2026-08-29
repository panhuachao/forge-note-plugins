// AI 翻译插件 · 主进程入口（CommonJS）
// 演示能力：注册 AI 技能（ai:skill）与可调用工具（ai:tool）
'use strict';

const LANG_MAP = {
  en: '英语',
  zh: '中文',
  ja: '日语',
  fr: '法语',
  de: '德语',
  ko: '韩语'
};

module.exports = {
  async onload(api, ctx) {
    // 1) 注册技能：用户说「翻译…」时，管家可路由到该技能
    api.ai.registerSkill({
      id: 'translate',
      title: '翻译',
      description: '将文本翻译为目标语言，例如「翻译成英文：<内容>」。',
      run: async (skillCtx) => {
        const text = (skillCtx.input && skillCtx.input.text) || '';
        const m = text.match(/翻译成?(\w+)[:：]?\s*([\s\S]+)/);
        const target = m ? m[1] : '英文';
        const source = m ? m[2] : text;
        const lang = Object.entries(LANG_MAP).find(([, v]) => target.includes(v))?.[0] || 'en';
        // 复用统一 AI 入口做翻译
        const resp = await api.ai.run({
          kbId: skillCtx.kbId,
          input: { text: `请将以下内容翻译成${LANG_MAP[lang] || '英文'}，只输出译文，不要解释：\n${source}` }
        });
        const out = resp && resp.text ? resp.text : String(resp || '');
        return { kind: 'text', text: out };
      }
    });

    // 2) 注册工具：管家在其它技能编排中可调用本工具做翻译
    api.ai.registerTool(
      {
        name: 'translate_text',
        description: '将给定文本翻译为目标语言（en/zh/ja/fr/de/ko），返回译文。',
        input_schema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: '待翻译文本' },
            target: { type: 'string', description: '目标语言代码：en/zh/ja/fr/de/ko', enum: Object.keys(LANG_MAP) }
          },
          required: ['text', 'target']
        }
      },
      async (args) => {
        const lang = LANG_MAP[args.target] || '英文';
        const resp = await api.ai.run({
          input: { text: `请将以下内容翻译成${lang}，只输出译文，不要解释：\n${args.text}` }
        });
        const out = resp && resp.text ? resp.text : String(resp || '');
        return { ok: true, translation: out };
      }
    );

    ctx.log.info('AI 翻译插件已加载');
  },

  async onunload(api, ctx) {
    ctx?.log?.info('AI 翻译插件已卸载');
  }
};
