import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

function normalizeText(text) {
  if (!text) return '';
  const noBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  return noBom
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function htmlToText(html) {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '\n');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '\n');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(p|div|section|article|li|tr|h[1-6]|table|ul|ol)>/gi, '\n');
  text = text.replace(/<(td|th)[^>]*>/gi, '\t');
  text = text.replace(/<[^>]+>/g, ' ');
  text = decodeHtmlEntities(text);
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/ *\n */g, '\n');
  return normalizeText(text);
}

async function readPlainText(inputPath) {
  return normalizeText(await fs.readFile(inputPath, 'utf8'));
}

async function readHtml(inputPath) {
  const html = await fs.readFile(inputPath, 'utf8');
  return htmlToText(html);
}

function decodeQuotedPrintable(text) {
  const softLineBreaksRemoved = text.replace(/=\r?\n/g, '');
  const binary = softLineBreaksRemoved.replace(/=([0-9A-F]{2})/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  return Buffer.from(binary, 'binary').toString('utf8');
}

function splitHeadersAndBody(part) {
  const separator = part.search(/\r?\n\r?\n/);
  if (separator === -1) {
    return { headers: '', body: part };
  }
  const match = part.slice(separator).match(/^\r?\n\r?\n/);
  const bodyStart = separator + (match ? match[0].length : 0);
  return {
    headers: part.slice(0, separator),
    body: part.slice(bodyStart),
  };
}

function getMimeHeader(headers, name) {
  const unfolded = headers.replace(/\r?\n[ \t]+/g, ' ');
  const pattern = new RegExp(`^${name}:\\s*(.+)$`, 'im');
  const match = unfolded.match(pattern);
  return match ? match[1].trim() : '';
}

function getMimeBoundary(headers) {
  const contentType = getMimeHeader(headers, 'Content-Type');
  const quoted = contentType.match(/boundary="([^"]+)"/i);
  if (quoted) return quoted[1];
  const unquoted = contentType.match(/boundary=([^;\s]+)/i);
  return unquoted ? unquoted[1] : '';
}

function decodeMimeBody(headers, body) {
  const encoding = getMimeHeader(headers, 'Content-Transfer-Encoding').toLowerCase();
  if (encoding.includes('quoted-printable')) {
    return decodeQuotedPrintable(body);
  }
  if (encoding.includes('base64')) {
    return Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf8');
  }
  return body;
}

function mhtmlToText(raw) {
  const { headers, body } = splitHeadersAndBody(raw);
  const boundary = getMimeBoundary(headers);

  if (!boundary) {
    return htmlToText(raw);
  }

  const marker = `--${boundary}`;
  const parts = body
    .split(marker)
    .map((part) => part.trim())
    .filter((part) => part && part !== '--');

  for (const part of parts) {
    const parsed = splitHeadersAndBody(part);
    const contentType = getMimeHeader(parsed.headers, 'Content-Type').toLowerCase();
    if (contentType.includes('text/html') || contentType.includes('application/msword')) {
      return htmlToText(decodeMimeBody(parsed.headers, parsed.body));
    }
  }

  return htmlToText(raw);
}

async function readMhtml(inputPath) {
  const raw = await fs.readFile(inputPath, 'utf8');
  return mhtmlToText(raw);
}

async function detectContainerType(inputPath) {
  const handle = await fs.open(inputPath, 'r');
  try {
    const buffer = Buffer.alloc(8192);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const sample = buffer.subarray(0, bytesRead).toString('latin1').toLowerCase();

    if (
      sample.includes('mime-version:') &&
      sample.includes('content-type:') &&
      (sample.includes('multipart/related') || sample.includes('text/html'))
    ) {
      return 'mhtml';
    }

    if (sample.includes('<html') || sample.includes('<!doctype html')) {
      return 'html';
    }

    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'pdf';
    }

    if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
      return 'zip-office';
    }

    if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) {
      return 'ole-office';
    }

    return 'unknown';
  } finally {
    await handle.close();
  }
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || result.stdout || '').trim();
    throw new Error(stderr || `${command} exited with code ${result.status}`);
  }
  return normalizeText(result.stdout || '');
}

function tryCommands(candidates) {
  const errors = [];
  for (const candidate of candidates) {
    try {
      return candidate();
    } catch (error) {
      errors.push(error.message || String(error));
    }
  }
  throw new Error(errors.join(' | '));
}

function readViaWindowsHelper(inputPath) {
  const currentFile = fileURLToPath(import.meta.url);
  const helper = path.resolve(path.dirname(currentFile), 'read-document-win.ps1');
  const powershellPath = process.env.SystemRoot
    ? path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    : 'powershell.exe';
  return runCommand(powershellPath, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', helper, '-InputPath', inputPath]);
}

function readViaTextutil(inputPath) {
  return runCommand('textutil', ['-convert', 'txt', '-stdout', inputPath]);
}

function readPdfViaCommonTools(inputPath) {
  return tryCommands([
    () => runCommand('pdftotext', ['-layout', inputPath, '-']),
    () => runCommand('mutool', ['draw', '-F', 'txt', '-o', '-', inputPath]),
  ]);
}

async function readDocument(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const platform = os.platform();
  const containerType = await detectContainerType(inputPath);

  if (['.txt', '.md', '.csv', '.json', '.yaml', '.yml'].includes(ext)) {
    return readPlainText(inputPath);
  }

  if (containerType === 'mhtml') {
    return readMhtml(inputPath);
  }

  if (containerType === 'html' || ['.html', '.htm'].includes(ext)) {
    if (platform === 'darwin') {
      try {
        return readViaTextutil(inputPath);
      } catch {
        return readHtml(inputPath);
      }
    }
    return readHtml(inputPath);
  }

  if (['.doc', '.docx', '.pdf', '.rtf'].includes(ext)) {
    if (platform === 'win32') {
      return readViaWindowsHelper(inputPath);
    }

    if (platform === 'darwin') {
      if (['.doc', '.docx', '.rtf'].includes(ext)) {
        return readViaTextutil(inputPath);
      }
      if (ext === '.pdf') {
        return readPdfViaCommonTools(inputPath);
      }
    }

    if (platform === 'linux') {
      if (ext === '.pdf') {
        return readPdfViaCommonTools(inputPath);
      }
    }
  }

  throw new Error(`Unsupported or unavailable document-reading path for extension: ${ext}. Consider converting the file to txt/html first.`);
}

const args = parseArgs(process.argv.slice(2));
if (!args.input) {
  console.error('Usage: node scripts/read-document.mjs --input <file> [--output <text-file>] [--stdout]');
  process.exit(1);
}

const inputPath = path.resolve(args.input);
const outputPath = args.output ? path.resolve(args.output) : null;
const text = await readDocument(inputPath);

if (outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, text, 'utf8');
  console.log(`Extracted text written to: ${outputPath}`);
}

if (!outputPath || args.stdout) {
  process.stdout.write(text);
}


