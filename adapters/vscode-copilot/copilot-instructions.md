# `prd-demo` for VS Code + GitHub Copilot

当用户在项目工作区直接描述以下意图时，按统一核心路由：

- 新建 PRD、写 PRD、需求澄清 → `prd`
- 根据 PRD 生成或重建 Demo → `demo`
- 修改已有 PRD/Demo、同步 Frozen 变更 → `change-sync`
- 检查 PRD 与 Demo 一致性 → `consistency-audit`
- 给 Demo 补 `data-feature-id` → marker 子流程

执行前读取当前工作区提供的项目说明和 PRD/Demo 规范；不要假设内部路径、业务系统或固定文件名。Opinion 不落盘，Frozen 修改保留 diff，有规则或交互变化执行相应审计。

核心规则位于本包安装的 `prd-demo/core/` 内容；本文件只做触发和路由说明，不复制另一套规则。
