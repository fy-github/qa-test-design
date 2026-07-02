import { readJsonArray, normalizeCases, xmlEscape, writeZip } from './common.mjs';

let topicCounter = 0;
function topicId() {
  topicCounter += 1;
  return `topic${topicCounter}`;
}

function topicXml(title, children = '') {
  const escaped = xmlEscape(title ?? '');
  const id = topicId();
  if (children) {
    return `<topic id="${id}"><title>${escaped}</title><children><topics type="attached">${children}</topics></children></topic>`;
  }
  return `<topic id="${id}"><title>${escaped}</title></topic>`;
}

function caseXml(item) {
  const children = [];
  if (item.requirementId) children.push(topicXml(`req: ${item.requirementId}`));
  if (item.priority) children.push(topicXml(`priority: ${item.priority}`));
  if (item.testType) children.push(topicXml(`type: ${item.testType}`));
  if (item.preconditions) children.push(topicXml(`pc: ${item.preconditions}`));
  if (item.tags) children.push(topicXml(`tag: ${item.tags}`));
  for (const step of item.steps) {
    const grandchildren = step.expected ? topicXml(step.expected) : '';
    children.push(topicXml(step.action || '[No Action]', grandchildren));
  }
  if (item.notes) children.push(topicXml(`note: ${item.notes}`));
  const title = item.priority ? `tc-${item.priority.toLowerCase()}: ${item.title}` : `tc: ${item.title}`;
  return topicXml(title, children.join(''));
}

function moduleTree(items, level = 0) {
  if (!items.length) return '';
  const uncategorized = items.filter((item) => item.modulePath.length <= level);
  const groupMap = new Map();
  for (const item of items.filter((entry) => entry.modulePath.length > level)) {
    const key = item.modulePath[level];
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(item);
  }

  const parts = [];
  for (const [name, grouped] of groupMap.entries()) {
    let children = moduleTree(grouped, level + 1);
    for (const item of grouped.filter((entry) => entry.modulePath.length === level + 1)) {
      children += caseXml(item);
    }
    parts.push(topicXml(name, children));
  }
  for (const item of uncategorized) {
    parts.push(caseXml(item));
  }
  return parts.join('');
}

const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');
const titleIndex = args.indexOf('--title');
if (inputIndex === -1 || outputIndex === -1) {
  throw new Error('Usage: node generate-xmind.mjs --input <cases.json> --output <file.xmind> [--title <title>]');
}
const inputPath = args[inputIndex + 1];
const outputPath = args[outputIndex + 1];
const title = titleIndex === -1 ? 'QA Test Cases' : args[titleIndex + 1];

const rawCases = await readJsonArray(inputPath);
const cases = normalizeCases(rawCases);
const root = topicXml(title, moduleTree(cases));
const contentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xmap-content version="2.0" xmlns="urn:xmind:xmap:xmlns:content:2.0"><sheet id="sheet1"><title>Sheet 1</title>${root}</sheet></xmap-content>`;
const manifestXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0"><file-entry full-path="content.xml" media-type="text/xml"/><file-entry full-path="META-INF/" media-type=""/></manifest>`;
await writeZip({ 'content.xml': contentXml, 'META-INF/manifest.xml': manifestXml }, outputPath);
console.log(`Generated XMIND: ${outputPath}`);
