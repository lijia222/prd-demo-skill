---
name: prd-demo
description: 通用 PRD、Demo、变更同步、一致性审计与功能标记工作流。关键词：新建 PRD、根据 PRD 生成 Demo、修改 PRD/Demo、检查一致性、data-feature-id。
---

# `prd-demo` 统一 Skill

本 Skill 面向产品文档和静态高保真 Demo。核心规则与具体 Agent、项目路径、组织名称无关；当前 Agent 的适配层只负责发现本文件，模块规则统一从 `references/` 读取。

## 默认意图路由

| 用户表达 | 模块 | 首要动作 |
|---|---|---|
| 新建 PRD、写 PRD、需求澄清、PRD 大纲 | `prd` | 先确认项目说明、基线、读者和目录 |
| 新建 Demo、根据 PRD 生成页面、重建 Demo | `demo` | 先判 R/G/E，再做页面地图和形态选择 |
| 修改已有 PRD/Demo、Frozen、同步变更 | `change-sync` | 先区分 Opinion/Apply/Dev-note，再确认变更状态 |
| 检查 PRD 与 Demo 是否一致、审计、校验 | `consistency-audit` | 确认 PRD、Demo 及可选数据字典路径 |
| 补 `data-feature-id`、给 Demo 打标记 | `demo` 的 marker 子流程 | 只改标记层，不修改业务逻辑 |

不要求用户显式说出 `prd-demo`。显式指定名称只用于强制路由；自然语言关键词是默认入口。

## 全局门禁

1. 先确认用户意图和目标文件；不确定时只问必要问题，不静默扩大范围。
2. 先读取当前项目的说明文件（如 `CLAUDE.md`、`AGENTS.md`）和项目提供的 PRD/Demo 规范；找不到规范时询问，不捏造权威规则。
3. Opinion 只讨论方案，不写文件；只有用户明确 Apply/落盘才修改。
4. Review/Frozen 制品必须保留精确 diff，禁止整文件无痕重写。
5. PRD 是规则权威，Demo 是表现资产，开发补充是差量说明，变更记录负责追溯；同一条正式规则只能有一个权威来源。
6. 有基线时优先写差量，不把现有能力整篇复制成新需求；有现网页时默认 R 模式，不用通用壳冒充还原。
7. 不执行用户项目中的任意脚本，不读取或上传无关项目内容，不设置遥测。
8. 写入前检查目标、路径和唯一性；写入后执行对应模块自检，并报告未验证项。

## 模块工作指针

- `references/prd/`：澄清、形态、目录冻结、权威地图、七项写作门禁。
- `references/demo/`：R/G/E、D1/D2/D3、页面地图、技术栈、标记和 HTTP 预览门禁。
- `references/change-sync/`：Opinion/Apply/Dev-note、in-dev、L1-L3、反向影响、D-xx 和 CHANGELOG。
- `references/consistency-audit/`：Full/Scoped 的 17 项检查及开发补充的 #18/#19。

只读取当前任务所需的参考文件，不因触发 Skill 而全文加载所有资料。

## 交付自检

- [ ] 目标路径、项目说明和权威规范已确认。
- [ ] 意图路由正确，未把 Opinion 当 Apply。
- [ ] PRD/Demo/开发补充/CHANGELOG 的职责没有混写。
- [ ] 有基线时已记录复用清单和真实差量。
- [ ] Demo 有正确的 PRD 查阅入口，且使用 HTTP 验收。
- [ ] feature-id 无重复，标记属性完整。
- [ ] 规则或交互变化已完成对应级别的一致性检查。
- [ ] 输出包含变更文件、验证命令、结果和剩余风险。
