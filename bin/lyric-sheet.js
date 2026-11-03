#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { parseLyricSheet } from '../src/parse.js';
import { validateSheet } from '../src/validate.js';
import { toAceStep, countLines } from '../src/convert.js';

const [command, file, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

if (!command || !file) {
  console.log(`lyric-sheet — validate and convert structured lyric sheets

Usage:
  lyric-sheet check <file> --template <template.json>
  lyric-sheet convert <file> [--to ace-step|suno]`);
  process.exit(1);
}

const sheet = parseLyricSheet(await readFile(file, 'utf8'));

if (command === 'check') {
  const templatePath = flag('template');
  if (!templatePath) { console.error('--template is required'); process.exit(1); }
  const template = JSON.parse(await readFile(templatePath, 'utf8'));
  const report = validateSheet(sheet, template);
  console.log(`${sheet.sections.length} sections, ${countLines(sheet)} lines`);
  if (report.ok) console.log('OK: sheet matches the template');
  else { console.log('Issues:'); report.issues.forEach((i) => console.log(` - ${i}`)); }
  process.exit(report.ok ? 0 : 1);
} else if (command === 'convert') {
  process.stdout.write(toAceStep(sheet));
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
