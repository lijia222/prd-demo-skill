---
mode: agent
---

# 使用 `prd-demo`

请按当前项目说明和 PRD/Demo 规范，使用统一 `prd-demo` Skill 处理本次任务。

## 路由

- 新建 PRD → `prd`
- 根据 PRD 生成 Demo → `demo`
- 修改已有 PRD/Demo → `change-sync`
- 检查一致性 → `consistency-audit`
- 补 Demo 功能标记 → marker 子流程

先确认目标文件、基线、意图和是否允许落盘。不要把 Opinion 写成文件；不要覆盖未由本 Skill 管理的文件；Frozen/Review 制品必须提供 diff。完成后报告修改范围、验证结果和未验证项。
