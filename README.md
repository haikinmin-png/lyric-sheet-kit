# lyric-sheet-kit

**Write lyrics to a spec. Then feed them to the machine.**

[中文说明](README.zh-CN.md)

AI music generators (ACE-Step, Suno, …) sing whatever you paste — but
whether the result *works* is decided by structure: how many lines per
section, how many characters per line (in Chinese, characters ≈ syllables),
and whether line endings actually rhyme in groups. Songwriters who work
from fixed formats — like the 47-line short-song format used across Chinese
short-video music — currently check all of that by hand.

`lyric-sheet-kit` checks it by machine:

- 📐 **Parse** structured lyric sheets — `[Chorus]` tags, `【副歌】` headers,
  or markdown — into sections and lines
- ✅ **Validate** against a template: section order, line counts, per-line
  character counts, rhyme groups (one letter per line, `AAAABBCC`)
- 🔀 **Convert** to ACE-Step / Suno tag format, including the `[Outro]` tag
  that one-line endings need
- 🎛️ **Style prompt** assembly from structured fields (genre, mood, vocal, bpm)
- 🖥️ **CLI** for checking a sheet while you write it

Ships with the **47-line short-song template**
(`templates/47-line-short-song.json`): chorus ×3, verse ×2, bridge,
one-line outro.

## Quick start

```bash
npx lyric-sheet check my-song.txt --template templates/47-line-short-song.json
npx lyric-sheet convert my-song.txt
```

```js
import { parseLyricSheet, validateSheet, toAceStep } from 'lyric-sheet-kit';

const sheet = parseLyricSheet(text);
const report = validateSheet(sheet, template); // { ok, issues: [...] }
const aceStepText = toAceStep(sheet);           // paste into ACE-Step / RunningHub
```

Rhyme validation works on line-ending characters — the rhyme position in
Chinese songwriting. Same-character groups pass automatically; near-rhymes
(same pinyin final, different character) are flagged for a human decision,
because whether they sing well is a judgment call, not a string comparison.

## Why character counts?

Chinese lyrics are effectively syllabic: one character, one beat slot. A
line written to 9 characters that arrives with 13 will be rushed or split
by the generator. Templates with per-line `charCounts` catch that at the
writing desk instead of after generation credits are spent.

## Roadmap

Pinyin-final rhyme checking, more generator formats (Udio, Mureka),
a fill-in web editor with live validation, RunningHub workflow notes.
See `docs/roadmap.md`.

## License

MIT
