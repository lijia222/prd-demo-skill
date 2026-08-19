# `prd-demo-skill`

一个与 Agent 无关的 PRD、静态 Demo、变更同步、一致性审计和功能标记 Skill。

## 默认安装

普通使用者只需要执行固定版本命令：

```bash
npx @cauthy/prd-demo-skill@1.0.0 install
```

安装器会探测可用的 Claude Code、Codex 和 VS Code + GitHub Copilot，并只写入带有 `prd-demo` 管理标记的目标文件。检测到多个环境时默认全部安装；可使用 `--agent` 选择单个环境。

## 默认使用方式

不需要每次显式指定 `prd-demo`。直接描述意图即可：

- “新建 PRD” → `prd`
- “根据这个 PRD 生成 Demo” → `demo`
- “同步修改已有 PRD 和 Demo” → `change-sync`
- “检查 PRD 和 Demo 是否一致” → `consistency-audit`
- “给这个 Demo 补充 data-feature-id” → marker 子流程

显式指定 `prd-demo` 或 Agent 原生命令只是强制调用方式，不会产生另一套规则。

## 支持的环境

- Claude Code：用户级 `~/.claude/skills/prd-demo/`
- Codex：优先 `$CODEX_HOME/skills/prd-demo/`，否则项目级 `.agents/skills/prd-demo/`
- VS Code + GitHub Copilot：项目级 `.github/copilot-instructions.md` 和 `.github/prompts/prd-demo.prompt.md`

Copilot 安装默认使用当前工作目录；当前目录不是目标项目时，请使用 `--project`，安装器不会自动修改未知工作区。

## 高级参数

```bash
npx @cauthy/prd-demo-skill@1.0.0 install --dry-run
npx @cauthy/prd-demo-skill@1.0.0 install --agent claude
npx @cauthy/prd-demo-skill@1.0.0 install --project "/path/to/project"
npx @cauthy/prd-demo-skill@1.0.0 update
npx @cauthy/prd-demo-skill@1.0.0 uninstall
```

`--dry-run` 不修改文件。更新和卸载只处理带有管理标记、且由本 Skill 写入的文件；不会删除或覆盖其他 Skill。

## 无 Node.js 时

仓库仍提供底层入口：

```bash
python3 installer/install.py --target auto
sh installer/install.sh --target auto
```

Windows PowerShell：

```powershell
.\installer\install.ps1 -Target auto
```

底层脚本和 `npx` 入口共享同一套安装逻辑。

## 核心工作流

核心内容位于 `core/`：

- `prd`：澄清、基线增量、形态选择、目录/术语冻结、七项写作门禁。
- `demo`：R/G/E 生成模式、D1/D2/D3 形态、页面地图、PRD 入口和 HTTP 预览。
- `change-sync`：Opinion/Apply/Dev-note、L1-L3、反向影响、diff、开发补充和 CHANGELOG。
- `consistency-audit`：6 项静态、6 项业务、5 项技术检查，以及开发补充的 #18/#19。
- marker：`data-*` 标记、唯一性、弹框 TRAP、配置同步和验证。

## 隐私与安全

安装器不读取、上传或收集用户项目内容，不执行项目脚本，不设置遥测，也不要求 `sudo`。路径参数会经过校验。请不要在 PRD、Demo、Issue、日志或安装参数中写入密钥、Token 或真实敏感数据。

安全问题请参阅 [`SECURITY.md`](./SECURITY.md)。

## 发布信息

- GitHub：<https://github.com/lijia222/prd-demo-skill>
- npm：<https://www.npmjs.com/package/@cauthy/prd-demo-skill>
- 当前版本：`1.0.0`
- 许可证：MIT

## 当前限制

第一版需要用户项目自行提供业务 PRD/Demo 规范；本包只提供通用方法论和适配规则，不包含任何组织内部文档、真实业务数据、截图、附件或业务代码。
