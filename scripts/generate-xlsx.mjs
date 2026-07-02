import { readJsonArray, normalizeCases, writeZip } from './common.mjs';
import { buildQaWorkbookEntries } from './xlsx-workbook.mjs';

const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');
const titleIndex = args.indexOf('--title');
if (inputIndex === -1 || outputIndex === -1) {
  throw new Error('Usage: node generate-xlsx.mjs --input <cases.json> --output <file.xlsx> [--title <title>]');
}

const inputPath = args[inputIndex + 1];
const outputPath = args[outputIndex + 1];
const title = titleIndex === -1 ? 'QA Test Cases' : args[titleIndex + 1];

const rawCases = await readJsonArray(inputPath);
const cases = normalizeCases(rawCases);
const entries = buildQaWorkbookEntries(cases, title);

await writeZip(entries, outputPath);
console.log(`Generated XLSX: ${outputPath}`);
