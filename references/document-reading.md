# Document Reading

Use this reference when the task is driven by a source document file rather than plain pasted text.

## Purpose

The skill must support full-document reading before test design or review work starts.

Supported target file families:

- `html` / `htm`
- `doc` / `docx`
- `pdf`
- `rtf`
- plain text-like files such as `txt`, `md`, `json`, `csv`

## Mandatory Rule

If a concrete source file is provided, prefer the document-reading script over ad hoc manual extraction.

For `.doc` files, do not trust the extension alone. Some exported Word files are actually MHTML/HTML files with a `.doc` suffix. The reading flow must inspect the file header first, then choose the parser:

- MHTML/HTML disguised as `.doc`: parse directly as MHTML/HTML in Node.
- Real binary Word `.doc` / `.docx` / `.rtf`: use the Windows Word COM helper on Windows or `textutil` on macOS.
- PDF: use the PDF extraction path.

If the first path hangs or times out, immediately identify and report the detected container type before trying another method.

Do not rely on:

- title only
- table of contents only
- search hits only
- random excerpts
- screenshots when the source file itself is available

## Script Entry

Unified cross-platform entry:

```bash
node scripts/read-document.mjs --input <source-file> --output <text-file>
```

Optional stdout mode:

```bash
node scripts/read-document.mjs --input <source-file> --stdout
```

## Platform Behavior

### Windows

- `html/htm`: parsed directly in Node
- MHTML/HTML content with a `.doc` suffix: parsed directly in Node before Word COM is attempted
- real `doc/docx/pdf/rtf`: uses `scripts/read-document-win.ps1` and local Word COM extraction

### macOS

- `doc/docx/rtf/html`: prefers `textutil`
- `pdf`: tries `pdftotext`, then `mutool`

### Linux

- `pdf`: tries `pdftotext`, then `mutool`
- other office-like binary formats may require prior conversion

## Expected Workflow

1. run the reading script
2. verify extraction succeeded
3. read the extracted text fully
4. only then proceed to parsing, testability review, and case generation

## Failure Handling

If extraction fails:

- report the exact unsupported format or missing local capability
- do not claim complete document coverage
- ask for a converted format only if no supported local path exists
