# Codex adapter

安装目标优先为 `$CODEX_HOME/skills/prd-demo/`；没有可用的 `CODEX_HOME` 时，使用当前项目的 `.agents/skills/prd-demo/`。

将统一核心安装为 `SKILL.md`，复制 `core/references/`。Codex 读取项目说明时，优先发现当前项目的 `AGENTS.md`、`CLAUDE.md` 或等价说明；不能假定存在某个产品目录。

自然语言关键词保持与统一入口一致：新建 PRD、生成 Demo、同步修改、检查一致性和功能标记。适配层不复制第二套业务规则。
