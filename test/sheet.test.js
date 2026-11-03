import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseLyricSheet, charCount, rhymeChar, validateSheet, toAceStep, buildStylePrompt, countLines } from '../src/index.js';

const ZH_SHEET = `【副歌】
天青色等烟雨
而我在等你
【主歌】
炊烟袅袅升起
隔江千万里`;

test('parse: Chinese headers map to canonical section types', () => {
  const sheet = parseLyricSheet(ZH_SHEET);
  assert.equal(sheet.sections.length, 2);
  assert.equal(sheet.sections[0].type, 'chorus');
  assert.equal(sheet.sections[1].type, 'verse');
  assert.equal(sheet.sections[0].lines.length, 2);
});

test('parse: bracket tags and verse numbering normalize', () => {
  const sheet = parseLyricSheet('[Verse 2]\nline one\n[Chorus]\nline two');
  assert.deepEqual(sheet.sections.map((s) => s.type), ['verse', 'chorus']);
});

test('charCount ignores spaces; rhymeChar takes the last real character', () => {
  assert.equal(charCount('天青 色等烟雨'), 6);
  assert.equal(rhymeChar('而我在等你。'), '你');
});

function buildSheet47() {
  const plan = [
    ['chorus', 8, '光'], ['verse', 8, '光'], ['chorus', 8, '光'],
    ['verse', 8, '光'], ['bridge', 6, '光'], ['chorus', 8, '光'], ['outro', 1, '光'],
  ];
  const headers = { chorus: '[Chorus]', verse: '[Verse]', bridge: '[Bridge]', outro: '[Outro]' };
  const parts = [];
  for (const [type, n, end] of plan) {
    parts.push(headers[type]);
    for (let i = 0; i < n; i++) parts.push(`第${i + 1}行望${end}`);
  }
  return parts.join('\n');
}

test('47-line template: a conforming sheet validates clean and converts with an Outro', async () => {
  const template = JSON.parse(await readFile(new URL('../templates/47-line-short-song.json', import.meta.url), 'utf8'));
  const sheet = parseLyricSheet(buildSheet47());
  assert.equal(countLines(sheet), 47);
  const report = validateSheet(sheet, template);
  assert.equal(report.ok, true, report.issues.join('; '));
  const ace = toAceStep(sheet);
  assert.match(ace, /\[Outro\]/);
  assert.equal(ace.split('\n').filter((l) => l.startsWith('第')).length, 47);
});

test('validate: wrong line counts and mixed rhyme endings are reported', async () => {
  const template = JSON.parse(await readFile(new URL('../templates/47-line-short-song.json', import.meta.url), 'utf8'));
  const bad = parseLyricSheet('[Chorus]\n只有一行望天\n第二行看海');
  const report = validateSheet(bad, template);
  assert.equal(report.ok, false);
  assert.ok(report.issues.some((i) => /expected 8 lines/.test(i)));
  assert.ok(report.issues.some((i) => /rhyme group A/.test(i)));
});

test('validate: per-line char counts are enforced when the template sets them', () => {
  const sheet = parseLyricSheet('[Chorus]\n一二三四五六七');
  const template = { sections: [{ type: 'chorus', lines: 1, charCounts: [8] }] };
  const report = validateSheet(sheet, template);
  assert.equal(report.ok, false);
  assert.ok(report.issues.some((i) => /expected 8 chars, found 7/.test(i)));
});

test('style prompt assembles fields', () => {
  assert.equal(
    buildStylePrompt({ genre: 'mandopop', mood: 'upbeat', vocal: 'female vocal', bpm: 120 }),
    'mandopop, upbeat, female vocal, 120 bpm',
  );
});
