import { readJsonArray, normalizeCases, summarizeCases, xmlEscape, writeZip } from './common.mjs';

function paragraph(text, style = 'normal') {
  const escaped = xmlEscape(text ?? '');
  if (style === 'heading1') return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
  if (style === 'heading2') return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
  return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
}

function table(rows) {
  const rowXml = rows.map((row) => `<w:tr>${row.map((cell) => `<w:tc><w:p><w:r><w:t xml:space="preserve">${xmlEscape(cell ?? '')}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>${rowXml}</w:tbl>`;
}

const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');
const titleIndex = args.indexOf('--title');
if (inputIndex === -1 || outputIndex === -1) {
  throw new Error('Usage: node generate-docx.mjs --input <cases.json> --output <file.docx> [--title <title>]');
}
const inputPath = args[inputIndex + 1];
const outputPath = args[outputIndex + 1];
const title = titleIndex === -1 ? 'QA Test Cases' : args[titleIndex + 1];

const rawCases = await readJsonArray(inputPath);
const cases = normalizeCases(rawCases);
const summary = summarizeCases(cases);

let body = '';
body += paragraph(title, 'heading1');
body += paragraph(`总用例数：${summary.totalCases}`);
body += paragraph(`需求数：${summary.requirementGroups.length}`);
body += paragraph(`模块数：${summary.moduleGroups.length}`);
body += paragraph(`优先级分布：P0=${summary.priorityCounts.P0}, P1=${summary.priorityCounts.P1}, P2=${summary.priorityCounts.P2}, P3=${summary.priorityCounts.P3}`);

for (const [moduleName, groupedCases] of summary.moduleGroups) {
  body += paragraph(moduleName || 'Uncategorized', 'heading2');
  const rows = [[ 'Case ID', 'Requirement ID', 'Title', 'Preconditions', 'Steps', 'Expected Results', 'Priority', 'Type', 'Tags' ]];
  for (const item of groupedCases) {
    rows.push([item.caseId, item.requirementId, item.title, item.preconditions, item.stepsText, item.expectedText, item.priority, item.testType, item.tags]);
  }
  body += table(rows);
}

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style></w:styles>`;

await writeZip({
  '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
  '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  'word/document.xml': documentXml,
  'word/styles.xml': stylesXml,
}, outputPath);

console.log(`Generated DOCX: ${outputPath}`);
