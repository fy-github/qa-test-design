import fs from 'node:fs/promises';
import path from 'node:path';

export async function readJsonArray(inputPath) {
  const raw = await fs.readFile(inputPath, 'utf8');
  const normalized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const parsed = JSON.parse(normalized);
  if (!Array.isArray(parsed)) {
    throw new Error('Input JSON must be an array of cases.');
  }
  return parsed;
}

function getValue(item, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }
  return null;
}

function toFlatText(value, separator = '; ') {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value.map((item) => toFlatText(item, separator)).filter(Boolean).join(separator).trim();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value).trim();
}

function toModulePath(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map((item) => toFlatText(item)).filter(Boolean);
  const text = toFlatText(value);
  if (!text) return [];
  return text.split(/\s*(?:::|->|>|\/|\\|\|)\s*/).filter(Boolean);
}

function toSteps(item) {
  const stepValue = getValue(item, ['steps', 'step_list', '步骤', '测试步骤']);
  const expectedValue = getValue(item, ['expected_results', 'expected', '预期结果', 'expected_result']);

  const steps = [];
  if (Array.isArray(stepValue)) {
    for (const step of stepValue) {
      if (typeof step === 'string') {
        steps.push({ action: step.trim(), expected: '' });
        continue;
      }
      const action = toFlatText(getValue(step, ['action', '操作', 'step', '步骤']));
      const expected = toFlatText(getValue(step, ['expected', '预期', 'expected_result', '预期结果']));
      if (action || expected) {
        steps.push({ action, expected });
      }
    }
  } else if (stepValue) {
    const actions = toFlatText(stepValue, '\n').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const expecteds = toFlatText(expectedValue, '\n').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    actions.forEach((action, index) => {
      steps.push({ action, expected: expecteds[index] ?? '' });
    });
  }

  if (!steps.length && expectedValue) {
    steps.push({ action: '', expected: toFlatText(expectedValue, '\n') });
  }
  return steps;
}

function stripLeadingOrdinal(text) {
  return String(text ?? '').replace(/^\s*\d+[.)、．]\s*/, '').trim();
}

function toNumberedLines(values) {
  return values
    .map((value) => stripLeadingOrdinal(value))
    .filter(Boolean)
    .map((value, index) => `${index + 1}. ${value}`)
    .join('\n');
}

export function normalizeCases(rawCases) {
  return rawCases.map((item, index) => {
    const modulePath = toModulePath(getValue(item, ['module_path', 'module', 'modules', '模块', '模块路径']));
    const steps = toSteps(item);
    return {
      caseId: toFlatText(getValue(item, ['case_id', 'id', '用例ID', 'Case ID'])) || `TC-${String(index + 1).padStart(4, '0')}`,
      modulePath,
      module: modulePath.join(' / '),
      feature: toFlatText(getValue(item, ['feature', 'operation', '功能', '操作'])),
      requirementId: toFlatText(getValue(item, ['requirement_id', 'req_id', '关联需求', '需求ID'])),
      title: toFlatText(getValue(item, ['title', '用例标题', '标题'])),
      preconditions: toFlatText(getValue(item, ['preconditions', 'precondition', '前置条件'])),
      steps,
      stepsText: toNumberedLines(steps.map((step) => step.action)),
      expectedText: toNumberedLines(steps.map((step) => step.expected)),
      priority: toFlatText(getValue(item, ['priority', '优先级'])).toUpperCase(),
      testType: toFlatText(getValue(item, ['test_type', '类型', '测试类型'])),
      actor: toFlatText(getValue(item, ['actor', 'role', '角色', '执行角色'])),
      state: toFlatText(getValue(item, ['state', '状态', '前置状态'])),
      testData: toFlatText(getValue(item, ['test_data', '测试数据', 'data'])),
      designMethod: toFlatText(getValue(item, ['design_method', 'method', '设计方法'])),
      tags: toFlatText(getValue(item, ['tags', 'tag', '标签'])),
      notes: toFlatText(getValue(item, ['notes', 'remark', '备注', '说明'])),
    };
  });
}

export function summarizeCases(cases) {
  const priorityCounts = { P0: 0, P1: 0, P2: 0, P3: 0 };
  const requirementMap = new Map();
  const moduleMap = new Map();

  for (const item of cases) {
    if (priorityCounts[item.priority] !== undefined) {
      priorityCounts[item.priority] += 1;
    }
    if (item.requirementId) {
      if (!requirementMap.has(item.requirementId)) requirementMap.set(item.requirementId, []);
      requirementMap.get(item.requirementId).push(item);
    }
    if (item.module) {
      if (!moduleMap.has(item.module)) moduleMap.set(item.module, []);
      moduleMap.get(item.module).push(item);
    }
  }

  return {
    totalCases: cases.length,
    requirementGroups: [...requirementMap.entries()],
    moduleGroups: [...moduleMap.entries()],
    priorityCounts,
  };
}

export function xmlEscape(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getSeconds() >> 1) | (date.getMinutes() << 5) | (date.getHours() << 11);
  const dosDate = date.getDate() | ((date.getMonth() + 1) << 5) | ((year - 1980) << 9);
  return { dosTime, dosDate };
}

export async function writeZip(entries, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const localChunks = [];
  const centralChunks = [];
  let offset = 0;
  const { dosTime, dosDate } = getDosDateTime();

  for (const [entryName, content] of Object.entries(entries)) {
    const nameBuffer = Buffer.from(entryName.replace(/\\/g, '/'), 'utf8');
    const dataBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const crc = crc32(dataBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const localRecord = Buffer.concat([localHeader, nameBuffer, dataBuffer]);
    localChunks.push(localRecord);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    const centralRecord = Buffer.concat([centralHeader, nameBuffer]);
    centralChunks.push(centralRecord);
    offset += localRecord.length;
  }

  const centralDirectory = Buffer.concat(centralChunks);
  const centralOffset = offset;
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(centralChunks.length, 8);
  endRecord.writeUInt16LE(centralChunks.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(centralOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  const finalBuffer = Buffer.concat([...localChunks, centralDirectory, endRecord]);
  await fs.writeFile(outputPath, finalBuffer);
}

export function excelColumnName(index) {
  let value = index;
  let result = '';
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}




