// Parse a lyric sheet into sections. Headers can be bracket tags
// ([Chorus], [Verse 1]), Chinese brackets (【副歌】), or markdown (## 主歌).
const TYPE_ALIASES = new Map([
  ['chorus', 'chorus'], ['副歌', 'chorus'],
  ['verse', 'verse'], ['主歌', 'verse'],
  ['bridge', 'bridge'], ['过渡段', 'bridge'], ['桥段', 'bridge'], ['间奏', 'bridge'],
  ['outro', 'outro'], ['尾声', 'outro'], ['结尾', 'outro'],
  ['intro', 'intro'], ['前奏', 'intro'],
  ['pre-chorus', 'prechorus'], ['预副歌', 'prechorus'],
  ['hook', 'hook'],
]);

export function normalizeSectionType(rawName) {
  const base = rawName.trim().toLowerCase().replace(/[\s\d一二三四五六七八九十]+$/u, '').trim();
  return TYPE_ALIASES.get(base) ?? base;
}

const HEADER_PATTERNS = [
  /^\[(.+?)\]$/,
  /^【(.+?)】$/,
  /^#{1,6}\s*(.+)$/,
];

export function parseLyricSheet(text) {
  const sections = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    let header = null;
    for (const pattern of HEADER_PATTERNS) {
      const m = line.match(pattern);
      if (m) { header = m[1]; break; }
    }
    if (header !== null) {
      current = { type: normalizeSectionType(header), name: header.trim(), lines: [] };
      sections.push(current);
    } else {
      if (!current) {
        current = { type: 'untitled', name: '', lines: [] };
        sections.push(current);
      }
      current.lines.push(line);
    }
  }
  return { sections };
}

/** Singable length of a line: non-space characters (1 char ≈ 1 syllable in Chinese). */
export function charCount(line) {
  return [...line.replace(/\s+/g, '')].length;
}

/** Last character of a line — the rhyme position in Chinese songwriting. */
export function rhymeChar(line) {
  const chars = [...line.replace(/[\s，。！？、；：,.!?;:'"“”‘’]+$/u, '')];
  return chars.length ? chars[chars.length - 1] : '';
}
