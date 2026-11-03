import { charCount, rhymeChar } from './parse.js';

/**
 * Validate a parsed sheet against a template:
 * { sections: [{ type, lines, charCounts?: number|number[], rhymeGroups?: string }] }
 * rhymeGroups is one letter per line ("AAAABBCC"): lines sharing a letter are
 * expected to end on the same rhyme character. The kit reports mismatches;
 * near-rhymes (same pinyin final, different character) are a human call.
 */
export function validateSheet(sheet, template) {
  const issues = [];
  const report = { ok: true, sections: [], issues };

  template.sections.forEach((spec, i) => {
    const section = sheet.sections[i];
    const entry = { index: i, type: spec.type, ok: true, lineReports: [] };
    if (!section) {
      entry.ok = false;
      issues.push(`Missing section ${i + 1} (${spec.type})`);
      report.sections.push(entry);
      return;
    }
    if (section.type !== spec.type) {
      entry.ok = false;
      issues.push(`Section ${i + 1}: expected ${spec.type}, found ${section.type}`);
    }
    if (section.lines.length !== spec.lines) {
      entry.ok = false;
      issues.push(`Section ${i + 1} (${spec.type}): expected ${spec.lines} lines, found ${section.lines.length}`);
    }
    section.lines.forEach((line, j) => {
      const expected = Array.isArray(spec.charCounts) ? spec.charCounts[j] : spec.charCounts;
      const actual = charCount(line);
      const lineReport = { line: j + 1, chars: actual, expected: expected ?? null, ok: true };
      if (expected != null && actual !== expected) {
        lineReport.ok = false;
        entry.ok = false;
        issues.push(`Section ${i + 1} line ${j + 1}: expected ${expected} chars, found ${actual}`);
      }
      entry.lineReports.push(lineReport);
    });
    if (spec.rhymeGroups) {
      const groups = new Map();
      [...spec.rhymeGroups].forEach((letter, j) => {
        if (!section.lines[j]) return;
        const ch = rhymeChar(section.lines[j]);
        if (!groups.has(letter)) groups.set(letter, new Set());
        groups.get(letter).add(ch);
      });
      for (const [letter, chars] of groups) {
        if (chars.size > 1) {
          entry.ok = false;
          issues.push(`Section ${i + 1} rhyme group ${letter}: mixed line endings ${[...chars].join(' / ')}`);
        }
      }
    }
    report.sections.push(entry);
  });

  if (sheet.sections.length > template.sections.length) {
    issues.push(`Sheet has ${sheet.sections.length} sections, template expects ${template.sections.length}`);
  }
  report.ok = issues.length === 0;
  return report;
}
