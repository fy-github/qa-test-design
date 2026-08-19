import { excelColumnName, xmlEscape, summarizeCases } from './common.mjs';

const SHEET_DEFS = [
  { name: '概览', cols: [[1, 1, 22], [2, 2, 28]] },
  {
    name: '全部用例',
    cols: [[1, 1, 10], [2, 2, 13], [3, 3, 10], [4, 4, 14], [5, 5, 18], [6, 6, 10], [7, 7, 6], [8, 8, 34], [9, 9, 31], [10, 11, 52], [12, 12, 14], [13, 14, 10], [15, 15, 12], [16, 16, 18], [17, 17, 14], [18, 18, 20], [19, 19, 28]],
    validations: true,
  },
  { name: '追溯矩阵', cols: [[1, 1, 18], [2, 2, 10], [3, 3, 40], [4, 4, 42]] },
  { name: '执行说明', cols: [[1, 1, 18], [2, 2, 80]] },
  { name: '评审建议', cols: [[1, 1, 8], [2, 2, 24], [3, 3, 28], [4, 4, 10], [5, 5, 14], [6, 6, 48], [7, 7, 52], [8, 9, 14], [10, 10, 10], [11, 11, 12], [12, 12, 14], [13, 13, 22]] },
];

function sheetRef(rows) {
  const maxCols = Math.max(...rows.map((row) => row.length), 1);
  return `A1:${excelColumnName(maxCols)}${Math.max(rows.length, 1)}`;
}

function colsXml(cols = []) {
  if (!cols.length) return '';
  const body = cols
    .map(([min, max, width]) => `<col min="${min}" max="${max}" width="${width}" style="1" customWidth="1"/>`)
    .join('');
  return `<cols>${body}</cols>`;
}

function worksheetXml(rows, options = {}) {
  const ref = sheetRef(rows);
  const cells = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const styleId = rowIndex === 0 ? 2 : 1;
    const height = rowIndex === 0 ? 24 : (row.some((value) => String(value ?? '').length > 80) ? 46 : 31);
    const columns = row.map((value, colIndex) => {
      const cellRef = `${excelColumnName(colIndex + 1)}${rowNumber}`;
      const text = xmlEscape(value ?? '');
      return `<c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
    }).join('');
    return `<row r="${rowNumber}" ht="${height}" customHeight="1">${columns}</row>`;
  }).join('');

  const dataValidations = options.validations
    ? `<dataValidations count="2"><dataValidation type="list" allowBlank="1" sqref="M2:M1048576"><formula1>"YES,NO"</formula1></dataValidation><dataValidation type="list" allowBlank="1" sqref="N2:N1048576"><formula1>"PASS,FAIL,NA"</formula1></dataValidation></dataValidations>`
    : '';
  const conditionalFormatting = options.validations
    ? `<conditionalFormatting sqref="M2:M1048576"><cfRule type="expression" dxfId="0" priority="1"><formula>EXACT(M2,"YES")</formula></cfRule><cfRule type="expression" dxfId="1" priority="2"><formula>EXACT(M2,"NO")</formula></cfRule></conditionalFormatting><conditionalFormatting sqref="N2:N1048576"><cfRule type="expression" dxfId="0" priority="3"><formula>EXACT(N2,"PASS")</formula></cfRule><cfRule type="expression" dxfId="2" priority="4"><formula>EXACT(N2,"FAIL")</formula></cfRule><cfRule type="expression" dxfId="1" priority="5"><formula>EXACT(N2,"NA")</formula></cfRule></conditionalFormatting>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${ref}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/></sheetView></sheetViews><sheetFormatPr defaultColWidth="9" defaultRowHeight="15.2"/>${colsXml(options.cols)}<sheetData>${cells}</sheetData><autoFilter ref="${ref}"/>${conditionalFormatting}${dataValidations}<pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.5" footer="0.5"/></worksheet>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Microsoft YaHei"/><charset val="134"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Microsoft YaHei"/><charset val="134"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF366092"/><bgColor rgb="FF366092"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFC6EFCE"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9DDE7"/></left><right style="thin"><color rgb="FFD9DDE7"/></right><top style="thin"><color rgb="FFD9DDE7"/></top><bottom style="thin"><color rgb="FFD9DDE7"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="3"><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFC6EFCE"/></patternFill></fill></dxf><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9"/></patternFill></fill></dxf><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/></patternFill></fill></dxf></dxfs><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>`;
}

function moduleLevels(item) {
  const levels = item.modulePath?.length
    ? item.modulePath
    : String(item.module || '').split(/\s*(?:::|->|>|\/|\\|\|)\s*/).filter(Boolean);
  return [levels[0] ?? '', levels[1] ?? '', levels.slice(2).join(' / ')];
}

export function buildQaWorkbookEntries(cases, title) {
  const summary = summarizeCases(cases);
  const summaryRows = [
    ['项目项', '值'],
    ['标题', title],
    ['总用例数', String(summary.totalCases)],
    ['需求数', String(summary.requirementGroups.length)],
    ['模块数', String(summary.moduleGroups.length)],
    ['P0', String(summary.priorityCounts.P0)],
    ['P1', String(summary.priorityCounts.P1)],
    ['P2', String(summary.priorityCounts.P2)],
    ['P3', String(summary.priorityCounts.P3)],
  ];

  const caseRows = [[
    '用例ID', '一级模块', '二级模块', '三级模块', '功能/操作', '关联需求', '优先级', '标题',
    '前置条件', '步骤', '预期结果', '测试标记', '是否执行', '测试结果', '执行人', '执行时间',
    '缺陷ID', '标签', '备注'
  ]];
  for (const item of cases) {
    const [level1, level2, level3] = moduleLevels(item);
    caseRows.push([
      item.caseId, level1, level2, level3, item.feature, item.requirementId, item.priority, item.title,
      item.preconditions, item.stepsText, item.expectedText, item.testType, '', '', '', '', '', item.tags, item.notes,
    ]);
  }

  const traceRows = [['需求ID', '用例数', '用例ID列表', '覆盖模块']];
  for (const [requirementId, groupedCases] of summary.requirementGroups) {
    const modules = [...new Set(groupedCases.map((item) => item.module).filter(Boolean))].join('; ');
    traceRows.push([
      requirementId,
      String(groupedCases.length),
      groupedCases.map((item) => item.caseId).join('; '),
      modules,
    ]);
  }

  const instructionRows = [
    ['执行项', '说明'],
    ['用例范围', title],
    ['模块边界', '按需求文档和用例备注执行；推断或待确认项需先确认口径。'],
    ['执行顺序', '建议先执行P0，再执行P1/P2/P3。'],
    ['结果填写', '是否执行仅填YES/NO；测试结果仅填PASS/FAIL/NA。'],
    ['失败处理', '失败时填写缺陷ID，并在备注补充真实结果。'],
  ];

  const reviewRows = [[
    '序号', '关联用例ID', '所属Sheet', '严重程度', '评审类别', '问题描述', '修改建议',
    '提出人', '提出日期', '状态', '处理人', '处理日期', '处理备注'
  ]];

  const rowsBySheet = [summaryRows, caseRows, traceRows, instructionRows, reviewRows];
  const workbookSheets = SHEET_DEFS.map((sheet, index) => `<sheet name="${sheet.name}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('');
  const workbookRels = [
    ...SHEET_DEFS.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`),
    `<Relationship Id="rId${SHEET_DEFS.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,
  ].join('');
  const contentOverrides = [
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>`,
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`,
    ...SHEET_DEFS.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`),
  ].join('');

  const entries = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${contentOverrides}</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRels}</Relationships>`,
    'xl/styles.xml': stylesXml(),
  };

  SHEET_DEFS.forEach((sheet, index) => {
    entries[`xl/worksheets/sheet${index + 1}.xml`] = worksheetXml(rowsBySheet[index], sheet);
  });

  return entries;
}
