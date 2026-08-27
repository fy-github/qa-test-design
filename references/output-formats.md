# Output Formats

Default format is `xlsx`.

## XLSX

Use this by default for reusable case libraries.
### Default Workbook Structure

For bundled script output and normal deliverables, use an execution-ready workbook with stable tabs and formats. Do not reference local example files or template paths in the skill; encode the reusable workbook rules here so the skill remains portable.

Recommended tabs:

- 概览
- 全部用例
- 追溯矩阵
- 执行说明
- 评审建议

`评审建议` is mandatory for case-review deliverables. For newly generated case libraries with no review findings yet, include the sheet with only headers or leave it ready for later review entries.

`质量评分` is optional. Add it only when the user asks for quantified review, scoring, quality rating, or a case-quality portrait. It summarizes case quality and must trace low scores back to `评审建议`; it does not replace the review findings sheet.

Recommended `全部用例` columns and order:

| Column | Required | Notes |
|--------|----------|-------|
| 用例ID | 是 | 稳定唯一标识 |
| 一级模块 | 是 | 顶层业务或页面分组 |
| 二级模块 | 建议 | 二级业务分组；无二级时可留空 |
| 三级模块 | 建议 | 三级业务分组；无三级时可留空 |
| 功能/操作 | 是 | 动作或场景焦点 |
| 关联需求 | 是 | 需求追溯 |
| 优先级 | 是 | P0-P3 |
| 标题 | 是 | 简洁且可测 |
| 前置条件 | 是 | 明确准备条件 |
| 步骤 | 是 | 单元格内多行编号展示 |
| 预期结果 | 是 | 单元格内多行编号展示 |
| 测试标记 | 建议 | 冒烟 / 回归 / 权限 / 边界 / UI专项等执行标记 |
| 是否执行 | 建议 | 执行记录，仅填 `YES` 或 `NO` |
| 测试结果 | 建议 | 执行结果，仅填 `PASS`、`FAIL` 或 `NA` |
| 执行人 | 建议 | 实际执行人 |
| 执行时间 | 建议 | 实际执行日期或时间 |
| 缺陷ID | 建议 | 失败时关联缺陷 |
| 标签 | 可选 | 多标签用分号分隔 |
| 备注 | 可选 | 假设、环境差异、来源或待确认项 |

If existing JSON or source material only has a single `模块` field, split it into `一级模块 / 二级模块 / 三级模块` by path separators such as `/`, `>`, `->`, `::`, or `|`; keep missing levels blank.

Recommended `评审建议` columns and order:

| Column | Required | Notes |
|--------|----------|-------|
| 序号 | 是 | 从 1 递增 |
| 关联用例ID | 是 | 可填单个 ID、多个 ID，或范围如 `TC-001~TC-010` |
| 所属Sheet | 是 | 通常为 `全部用例`，也可填被评审的具体模块 sheet |
| 严重程度 | 是 | `高` / `中` / `低`；blocking=高，important=中，suggestion=低 |
| 评审类别 | 是 | 例如缺少需求追溯、步骤不可执行、预期不可验证、重复覆盖、缺少权限/状态/边界覆盖、AI产物风险 |
| 问题描述 | 是 | 描述实际问题和影响 |
| 修改建议 | 是 | 给出可执行修改建议 |
| 提出人 | 建议 | agent/model 或评审人 |
| 提出日期 | 建议 | 当前日期 |
| 状态 | 建议 | 默认 `待处理`；可用 `已采纳`、`延期处理`、`无需关注`、`待确认` |
| 处理人 | 可选 | 处理责任人 |
| 处理日期 | 可选 | 处理日期 |
| 处理备注 | 可选 | 处理结果或保留原因 |

Optional `质量评分` columns and order, only when scoring is enabled:

| Column | Required | Notes |
|--------|----------|-------|
| 用例ID | 是 | 与被评分用例对齐 |
| 所属Sheet | 是 | 通常为 `全部用例` 或被评审的具体模块 sheet |
| 总分 | 是 | 0-100 |
| 质量等级 | 是 | `可执行` / `需修订` / `不建议执行` / `需重写` |
| 逻辑完整性 | 是 | 默认满分 25 |
| 预期明确性 | 是 | 默认满分 20 |
| 前置条件 | 是 | 默认满分 15 |
| PRD覆盖度 | 是 | 默认满分 25 |
| 边界异常覆盖 | 是 | 默认满分 15 |
| 主要扣分原因 | 是 | 汇总关键扣分点 |
| 关联评审建议序号 | 是 | 对应 `评审建议.序号`，多个用分号分隔 |
| 处理建议 | 是 | `可执行` / `需修订` / `不建议执行` / `需重写` |
| 复评状态 | 建议 | `未复评` / `已复评` / `待确认` |

Recommended `追溯矩阵` columns:

| Column | Required | Notes |
|--------|----------|-------|
| 需求ID | 是 | 与 `全部用例.关联需求` 对齐 |
| 用例数 | 是 | 该需求关联用例数 |
| 用例ID列表 | 是 | 分号分隔 |
| 覆盖模块 | 是 | 模块路径或关键覆盖点 |

Recommended `执行说明` rows:

| 执行项 | 说明 |
|--------|------|
| 用例范围 | 本工作簿覆盖的业务范围 |
| 模块边界 | 明确不覆盖或只作前置的范围 |
| 执行顺序 | 例如先执行 P0，再执行 P1/P2/P3 |
| 结果填写 | 是否执行仅填 YES/NO；测试结果仅填 PASS/FAIL/NA |
| 失败处理 | 失败时填写缺陷ID，并在备注补充真实结果 |

Legacy compact workbooks may still use `测试用例` instead of `全部用例`, but new xlsx outputs should use `全部用例`.

Deprecated compact `测试用例` columns, only for backward compatibility:

| Column | Required | Notes |
|--------|----------|-------|
| 用例ID | 是 | 稳定唯一标识 |
| 模块 | 是 | 功能分组，允许多级路径用分隔符串联 |
| 功能/操作 | 是 | 动作或场景焦点 |
| 关联需求 | 是 | 需求追溯 |
| 标题 | 是 | 简洁且可测 |
| 前置条件 | 是 | 明确准备条件 |
| 步骤 | 是 | 单元格内多行编号展示 |
| 预期结果 | 是 | 单元格内多行编号展示 |
| 优先级 | 是 | P0-P3 |
| 测试类型 | 是 | 功能 / 异常 / 边界 / 权限 / 回归等 |
| 执行角色 | 建议 | 尤其适用于权限系统 |
| 状态 | 建议 | 来源或目标状态 |
| 测试数据 | 建议 | 关键数据值 |
| 设计方法 | 建议 | EP / BVA / ST / EG |
| 标签 | 可选 | 渠道、设备、套件等 |
| 备注 | 可选 | 假设、环境差异或待确认项等 |

Recommended visual rules:

- keep sheet naming and column order stable unless the user explicitly asks for another structure
- freeze the header row on every sheet
- enable autofilter for every populated sheet range
- use wrap text for all body cells; long text columns must be top-aligned
- keep numbered multi-line text for 步骤 / 预期结果
- treat 概览 as a summary sheet, not a separate reporting template
- use a dark blue header fill with bold white centered text
- use thin borders on all populated cells
- use a Chinese-readable font such as Microsoft YaHei or an available equivalent at 10-11 pt
- use white body fill, left horizontal alignment for text-heavy cells, center alignment for short status/priority/date/count columns
- set row heights high enough to avoid clipping; header rows around 16-24 pt, normal wrapped body rows around 31-46 pt, and very long rows may expand

Recommended column widths:

- `概览`: A=22, B=28
- `全部用例`: A=10, B=13, C=10, D=14, E=18, F=10, G=6, H=34, I=31, J=52, K=52, L=14, M=10, N=10, O=12, P=18, Q=14, R=20, S=28
- `追溯矩阵`: A=18, B=10, C=40, D=42
- `执行说明`: A=18, B=80
- `评审建议`: A=8, B=24, C=28, D=10, E=14, F=48, G=52, H=14, I=14, J=10, K=12, L=14, M=22
- `质量评分`: A=14, B=18, C=10, D=14, E=12, F=12, G=12, H=12, I=14, J=48, K=22, L=16, M=12

Recommended behavior rules:

- 步骤 and 预期结果 should be written as numbered multi-line text inside the cell
- `是否执行` should have a dropdown of `YES,NO`
- `测试结果` should have a dropdown of `PASS,FAIL,NA`
- apply conditional formatting where possible: `YES` and `PASS` -> light green fill; `NO` and `NA` -> light gray fill; `FAIL` -> light red fill
- when reviewing cases, append findings to `评审建议` rather than creating a standalone Markdown report by default
- when scoring is enabled, create `质量评分` as a summary sheet and keep concrete issues in `评审建议`
- if writing review findings into an existing workbook, create a reviewed copy unless the user explicitly asks to edit the source workbook in place

### Execution Ledger Extension

The default workbook already includes execution columns. If the user explicitly asks for per-module execution pages, you may extend the workbook into a richer structure such as:

- 概览
- 全部用例
- 按模块拆分的执行页
- 追溯矩阵
- 执行说明
- 评审建议

### WPS Compatibility Note

If the user requests an execution-ledger workbook in WPS and explicitly wants color feedback:

- prefer applying conditional formatting through local WPS native automation after workbook generation when possible.
- target columns: 是否执行, 测试结果
- YES -> light green background
- NO / NA -> light gray background
- PASS -> light green background
- FAIL -> light red background

This is more reliable in WPS than relying only on lightweight handcrafted OOXML conditional-formatting rules.

### When The User Asks For XLSX

Prefer a real `.xlsx` file if tooling exists.

Preferred workflow:

1. generate or normalize structured case JSON
2. ensure `<current requirement folder>/测试用例/` exists when the user does not specify another location
3. write the normalized JSON into the final output directory
4. export `.xlsx` from the JSON into the same directory

Bundled scripts:

- `node scripts/generate-json-and-xlsx.mjs --input <raw-cases.json> [--output-dir <dir>] [--base-name <name>] [--title <title>]`
- `node scripts/generate-xlsx.mjs --input <cases.json> --output <output.xlsx> --title <title>`

## XMIND

Use when the user wants hierarchy, workshop review, or test tree exploration.

### Recommended Structure

- Module
  - Feature / Operation
    - Priority bucket or scenario
      - Case title
        - Preconditions
        - Steps
        - Expected results
        - Requirement ID

Use xmind mainly for:

- feature tree review
- broad coverage communication
- workshop alignment

Bundled script:

- `node scripts/generate-xmind.mjs --input <cases.json> --output <output.xmind> --title <title>`

## DOCX

Use when the user wants a formal handoff or document-based review.

### Recommended Structure

1. Scope
2. Testability issues
3. Coverage strategy
4. Detailed cases by module
5. Traceability matrix
6. Risk summary

For detailed cases, prefer tables per module instead of long free-form prose.

Bundled script:

- `node scripts/generate-docx.mjs --input <cases.json> --output <output.docx> --title <title>`

### 正式测试报告（docx）排版规则

生成正式测试报告 docx（如《Cloud V4 v4.0.xxx 测试报告》）时必须遵守既有格式，参考报告：`v4.0.004 测试报告-20260814.docx`。

1. **标题必须用真实 Word 标题样式，不能只加粗正文。**
   - 用 `doc.add_paragraph(style=...)` 应用 `Title` / `Heading 1` / `Heading 2` / `Heading 3` 段落样式；
   - 禁止用 `doc.add_paragraph()` + 手动设置 run 加粗/颜色来冒充标题——那样 Word 全部按正文渲染，大纲与导航无法识别；
   - 标题层级：`Title`（报告大标题）→ `Heading 1`（"1. 测试内容"…"6. 测试总结"、"附录"）→ `Heading 2`（"1.1/2.1/6.3"等二级）→ `Heading 3`（"1.2.1 功能测试"等 x.x.x 三级）。

2. **排版规范（与 v4.0.004 参考报告一致）：**
   - 全文字体 Arial Unicode MS，中文必须同时设置 `rFonts w:eastAsia`；
   - `Title`：22pt、不加粗、左对齐、下方蓝色细线（`#4F81BD`，`w:sz=8`）；
   - `Heading 1`：14pt 加粗 `#376092`；`Heading 2`：13pt 加粗 `#4F81BD`；`Heading 3`：加粗 `#4F81BD`；
   - 正文 / Normal：10.5pt（`w:sz=21`）、1.15 行距（`w:line=276`）；
   - 表格：单元格 9pt（`w:sz=18`）、表头加粗、各列等宽（总宽约 15.2cm，Letter 页左右边距 1.25"）；
   - 章节结构固定：1. 测试内容 / 2. 测试结果 / 3. 发布建议 / 4. 遗留问题 / 5. 缺陷分析 / 6. 测试总结 / 附录：测试用例执行情况统计。

3. **章节内布局（与 v4.0.004 参考报告一致）：**
   - 「遗留问题」的缺陷统计用表格，列：`关键字 / 概要 / 优先级 / 状态 / 经办人 / 遗留原因`；子分类标签（如"一、本次版本新增遗留缺陷"、"High优先级遗留缺陷"、"其他优先级缺陷分布"）用普通段落，不加粗、不用标题样式；High 优先级缺陷单列一张表，其余优先级用概括行（如`【Medium优先级】120个：……`）；
   - 「缺陷分析总结 / 测试完成情况 / 质量评估」等处的"标签：值"数据行用项目符号列表（style 16 = `List Bullet`），不加粗 key；子标签（如"测试执行概况"、"整体质量评估"）用普通段落，不加粗；
   - 「已解决故障汇总」的故障清单用表格，列：`关键字 / 概要 / 优先级 / 状态 / 修复人`。

4. **生成后必须验证：** 解包 `word/document.xml`，确认标题段落带 `<w:pStyle w:val="Title|Heading1|Heading2|Heading3"/>`，且 Heading 样式含 outline 级别；再用 `textutil -convert txt` 检查中文无乱码。

## Release Notes

Use when the user asks to organize `版本发布说明`, `上线说明`, `发布说明`, or release-facing summaries from requirements, test assets, screenshots, review notes, or a user-provided上线范围.

Default output is a plain-text Markdown file or direct chat text. Do not use a Markdown table unless the user explicitly asks for a table.

Recommended structure:

```text
ICC发布v{版本号}版本发布说明：
本次 v{版本号} 版本主要围绕 {主要模块概述} 进行更新，同时修复 {关键问题概述}。

主要更新
1.{模块或能力}
2.{模块或能力}
3.{模块或能力}

修复已知问题
1.{已修复问题}
2.{已修复问题}
3.{修复后的用户价值或结果}

优化内容
1.{优化项}
2.{优化项}
3.{优化项}
4.{优化项}

版本注意事项
1.{使用限制或兼容限制}
2.{异常场景说明}
3.{权益、状态、数据或兼容性注意事项}
4.{重新开通、回滚、恢复、补偿等重要规则}
```

Rules:

- Title format: `ICC发布v{版本号}版本发布说明：`
- Keep the opening paragraph to one concise sentence that summarizes the release scope and key fix.
- Section names must be: `主要更新`, `修复已知问题`, `优化内容`, `版本注意事项`.
- Numbered items use compact form, for example `1.SD-WAN 活动二期`.
- Prefer user-confirmed上线项 over guessing from file names.
- If some release modules have no local PRD, include the user-confirmed item but avoid inventing detailed rules.
- Keep terminology consistent with the product wording, such as `SD-WAN`, `OS v4.0`, `APP`, `GWID`.
- If Confluence/HTML paste text is requested, preserve spacing entities such as `&#x20;`; otherwise use normal plain text.

## Format Selection Rule

If the user gives no format:

- default to `xlsx`

If the user wants discussion and structure first:

- `xmind`

If the user wants circulation, signoff, or formal review:

- `docx`



