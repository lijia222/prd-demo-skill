# Claude Code adapter

安装目标：`~/.claude/skills/prd-demo/`。

将 `core/SKILL.md` 安装为目标目录的 `SKILL.md`，并复制 `core/references/`。Claude Code 的自然语言关键词直接按统一入口路由；如需强制调用，可使用 `/prd-demo`，但命令只是入口，规则仍来自同一份核心文件。

适配层不得写死项目根目录。执行具体任务时，从当前工作目录发现项目说明、PRD/Demo 规范和目标文件。
