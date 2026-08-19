# Demo marker：`data-*` 功能标记规则

## 边界

marker 只处理已有 Demo 的功能标记，不修改业务逻辑、数据契约或页面结构。Demo 生成负责结构/交互/数据，`change-sync` 负责变更同步。

## 工作模式

- PRD/CHANGELOG 驱动：提取新增字段、交互、状态和删除项，再定位 Demo 元素。
- 直接描述驱动：把用户描述整理为结构化变更清单；元素类型、变更类型或 PRD 锚点不清时先询问。
- 若项目有配置文件（例如 `shared/feature-marker.js`），同时同步 HTML 标记、CONFIG 和分组；否则只写 HTML `data-*`。

## 标记属性

每个标记至少包含：`data-new-feature`（`new`/`iteration`/`warning`）、`data-feature-type`、`data-module`、`data-feature-id`、`data-feature-title`、`data-feature-desc`。`data-feature-prd` 可选但推荐使用 `change-<keyword>` 锚点；位置可选，默认 `top-right`。

类型映射：表格列 `column`，字段 `field`，筛选 `filter`，按钮 `action`，抽屉入口 `drawer`，菜单/模块 `module`，子表 `subtable`。

## 定位和安全门

- 不直接标记不可渲染的抽象组件或模板容器；选择可见子元素。
- `v-for` 渲染项改数据定义或独立模板，不把标记写在循环抽象节点上。
- `.js` 模板、抽屉和弹框必须做 TRAP 检查。弹框内变更若有外部触发器，必须同时标记触发入口和弹框内部；两者共享 `groupId`，但 `feature-id` 不同。弹框内部标记必须有 `dialogTrigger` 和 `autoOpen: true`。
- 每次编辑前用精确上下文确认目标只匹配 1 处；匹配 0 处或多处都暂停。
- 不重复标记已有 `data-new-feature` 的元素；feature-id 在目标范围内必须唯一。

## 应用后验证

1. 新增标记数量等于用户确认数量。
2. `feature-id` 无重复，必填属性齐全，类型值合法。
3. HTML/Vue 元素和指令数量与修改前一致。
4. 配置驱动模式下 HTML id 集合与 CONFIG id 集合一致，分组均有定义。
5. PRD 锚点存在；找不到时标记警告，不伪造锚点。
6. 浏览器中检查圆点可见、不出界、不遮挡，弹框内标记能自动打开并定位。

## 统一路由

用户只说“给 Demo 补标记”时由 `prd-demo` 路由到本模块。标记完成后不自动修改其他文件；若本次伴随规则或交互变化，建议运行 `consistency-audit`。
