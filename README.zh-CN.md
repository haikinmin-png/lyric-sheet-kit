# lyric-sheet-kit

**先按规格写词，再喂给机器唱。**

[English](README.md)

AI 音乐生成器（ACE-Step、Suno 等）你贴什么它唱什么，但成不成立取决于结构：
每段多少行、每行多少字（中文里字数≈音节数）、行尾押韵是否成组。
用固定格式写歌的人——比如短视频音乐里流行的 47 行短歌模板——
目前全靠手工数行、数字、对韵脚。

`lyric-sheet-kit` 把这件事交给机器：

- 📐 **解析**结构化词稿：`[Chorus]` 标签、`【副歌】`标题、Markdown 标题都能认
- ✅ **校验**模板：段落顺序、段行数、逐行字数、押韵分组（一行一个字母，如 `AAAABBCC`）
- 🔀 **转换** ACE-Step / Suno 标签格式，包括单行尾声需要的 `[Outro]`
- 🎛️ **风格提示词**拼装（曲风、情绪、人声、BPM）
- 🖥️ **CLI**：写词时随时自查

内置 **47 行短歌模板**（`templates/47-line-short-song.json`）：
副歌×3、主歌×2、过渡段、单行尾声。

## 快速上手

```bash
npx lyric-sheet check my-song.txt --template templates/47-line-short-song.json
npx lyric-sheet convert my-song.txt
```

押韵校验看行尾字（中文歌词的韵脚位置）：同字成组自动通过；
同韵母不同字的"近韵"会标出来留给人判断——唱出来顺不顺是判断题，不是字符串题。

## 路线图

拼音韵母级押韵校验、更多生成器格式、带实时校验的在线填词页、RunningHub 工作流说明。见 `docs/roadmap.md`。

## 许可证

MIT
