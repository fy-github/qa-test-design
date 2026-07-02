import fs from 'node:fs/promises';
import path from 'node:path';
import { readJsonArray, normalizeCases, writeZip } from './common.mjs';
import { buildQaWorkbookEntries } from './xlsx-workbook.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function toStructuredCase(item) {
  return {
    case_id: item.caseId,
    module: item.modulePath.length ? item.modulePath : (item.module ? [item.module] : []),
    feature: item.feature,
    requirement_id: item.requirementId,
    title: item.title,
    preconditions: item.preconditions,
    steps: item.steps.map((step) => ({ action: step.action, expected: step.expected })),
    priority: item.priority,
    test_type: item.testType,
    actor: item.actor,
    state: item.state,
    test_data: item.testData,
    design_method: item.designMethod,
    tags: item.tags,
    notes: item.notes,
  };
}

function defaultOutputDir(cwd) {
  const requirementDir = path.basename(cwd) === '功能需求'
    ? cwd
    : path.join(cwd, '功能需求');
  return path.join(requirementDir, '测试用例');
}

const args = parseArgs(process.argv.slice(2));
if (!args.input) {
  console.error('Usage: node scripts/generate-json-and-xlsx.mjs --input <raw-cases.json> [--output-dir <dir>] [--base-name <name>] [--title <title>]');
  process.exit(1);
}

const inputPath = path.resolve(args.input);
const outputDir = path.resolve(args['output-dir'] || defaultOutputDir(process.cwd()));
const baseName = args['base-name'] || 'qa-test-cases';
const title = args.title || baseName;

const rawCases = await readJsonArray(inputPath);
const normalized = normalizeCases(rawCases);
const structured = normalized.map(toStructuredCase);

await fs.mkdir(outputDir, { recursive: true });
const jsonPath = path.join(outputDir, `${baseName}.json`);
const xlsxPath = path.join(outputDir, `${baseName}.xlsx`);
await fs.writeFile(jsonPath, `${JSON.stringify(structured, null, 2)}\n`, 'utf8');

const entries = buildQaWorkbookEntries(normalized, title);
await writeZip(entries, xlsxPath);

console.log(`Generated JSON: ${jsonPath}`);
console.log(`Generated XLSX: ${xlsxPath}`);
