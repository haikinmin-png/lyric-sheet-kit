// Convert a parsed sheet to the tag formats AI music generators expect.
const ACE_TAGS = {
  chorus: 'Chorus', verse: 'Verse', bridge: 'Bridge',
  outro: 'Outro', intro: 'Intro', prechorus: 'Pre-Chorus', hook: 'Hook',
};

export function toAceStep(sheet) {
  const out = [];
  for (const section of sheet.sections) {
    const tag = ACE_TAGS[section.type] ?? 'Verse';
    out.push(`[${tag}]`, ...section.lines, '');
  }
  return out.join('\n').trimEnd() + '\n';
}

export function toSuno(sheet) {
  // Suno accepts the same bracket style; keep structure identical so one
  // sheet can target both engines.
  return toAceStep(sheet);
}

/** Assemble a style prompt line from structured fields. */
export function buildStylePrompt({ genre, mood, vocal, instruments, bpm } = {}) {
  const parts = [genre, mood, vocal, instruments, bpm ? `${bpm} bpm` : null]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean);
  return parts.join(', ');
}

/** Total lyric line count across sections. */
export function countLines(sheet) {
  return sheet.sections.reduce((sum, s) => sum + s.lines.length, 0);
}
