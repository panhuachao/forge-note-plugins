# AI 翻译（ai-translate）

AI 翻译示例插件：为智能管家注册一个「翻译」技能（`ai:skill`）和一个可被其它技能编排调用的「翻译工具」（`ai:tool`）。

## 演示的插件能力

- `api.ai.registerSkill(skillDef)`：注册技能，`run(ctx)` 中 `ctx.input.text` 为用户输入，`ctx.kbId` 为当前知识库；返回 `AIResponse`（`{ kind:'text', text }`）
- `api.ai.registerTool(toolDef, handler)`：注册工具，`handler(args, ctx)` 接收结构化参数；返回对象会被序列化
- `api.ai.run({ kbId, input })`：复用统一 AI 入口发起一次翻译补全

## 技能定义

```js
api.ai.registerSkill({
  id: 'translate',
  title: '翻译',
  description: '将文本翻译为目标语言',
  run: async (ctx) => {
    const text = ctx.input.text;
    const resp = await api.ai.run({ kbId: ctx.kbId, input: { text: `翻译成英文：${text}` } });
    return { kind: 'text', text: resp.text };
  }
});
```

## 工具定义

```js
api.ai.registerTool(
  { name: 'translate_text', description: '...', input_schema: { /* JSON Schema */ } },
  async (args) => {
    const resp = await api.ai.run({ input: { text: `翻译成${args.target}：${args.text}` } });
    return { ok: true, translation: resp.text };
  }
);
```

## 文件结构

```
ai-translate/
├── manifest.json
├── main.js          # 主进程：注册技能 + 工具
└── README.md
```

## 权限

```json
"permissions": ["ai:skill", "ai:tool"]
```
