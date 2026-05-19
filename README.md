# musiccoverlyric

面向 **Node.js** 的小型工具库，用于在 **MP3 / FLAC / OGG / Opus / M4A** 文件中嵌入 **元数据标签**、**封面图片** 与 **歌词文本**（LRC 等纯文本内容）。底层通过 **ffmpeg** 处理媒体，依赖包内自带的 **ffmpeg-static** 可执行文件，无需在系统 PATH 中单独安装 ffmpeg。

---

## 特性

- **格式**：`.mp3`、`.flac`、`.ogg`、`.opus`、`.m4a`（`.mp4`）。其中 `.ogg` / `.opus` 仅支持元数据写入，不支持封面嵌入（容器限制）。
- **标签**：标题、艺人、专辑、年份、流派、歌词、音轨号、注释及自定义键值；歌词字段会同时写入 `lyrics` 与 `UNSYNCED LYRICS`，以兼顾常见播放器对 USLT 的识别。
- **封面**：支持常见图片输入（如 JPEG、PNG）；MP3 使用 ID3v2.3 与 `attached_pic` 语义，输出写入**可 seek 的文件路径**（避免仅 stdout 管道时封面丢失的问题）。
- **类型**：提供 TypeScript 声明，便于在 TS 项目中获得完整类型提示。

---

## 环境要求

- **Node.js**：建议 **18+**（使用 `fs.promises`、`child_process` 等现代 API 时兼容性更好；未在 `package.json` 中强制声明 `engines`，请自行在业务侧约定）。
- **运行平台**：与 **ffmpeg-static** 支持的 Windows / macOS / Linux 一致；本库在 Windows 与常见 Linux 场景下验证过调用链。

---

## 安装

```bash
npm install musiccoverlyric
```

或使用 pnpm / yarn 等价安装命令。

---

## 快速开始

以下示例均使用 **绝对路径或已解析的路径**（推荐使用 `path.resolve`），并假设输出目录已存在或由库在写入前创建（`runFfmpegFile` 会为输出路径的父目录执行 `mkdirSync`）。

### 仅写入标签（含歌词文本）

```ts
import path from 'path';
import { embedTags } from 'musiccoverlyric';
import fs from 'fs';

const audio = path.resolve('music', 'song.mp3');
const out = path.resolve('music', 'output', 'song-tagged.mp3');

await embedTags(
  audio,
  {
    title: '示例标题',
    artist: '示例艺人',
    lyrics: fs.readFileSync(path.resolve('music', 'song.lrc'), 'utf8'),
  },
  out
);
```

### 仅嵌入封面

```ts
import path from 'path';
import { embedCover } from 'musiccoverlyric';

const audio = path.resolve('music', 'song.mp3');
const cover = path.resolve('music', 'cover.jpg');
const out = path.resolve('music', 'output', 'song-with-cover.mp3');

await embedCover(audio, cover, out);
```

### 标签与封面一次完成（推荐）

单次 ffmpeg 调用完成元数据与封面，适合批量任务。

```ts
import path from 'path';
import fs from 'fs';
import { embedTagsAndCover } from 'musiccoverlyric';

const audio = path.resolve('music', 'song.mp3');
const cover = path.resolve('music', 'cover.jpg');
const out = path.resolve('music', 'output', 'song-full.mp3');

await embedTagsAndCover(
  audio,
  {
    title: '示例标题',
    artist: '示例艺人',
    lyrics: fs.readFileSync(path.resolve('music', 'song.lrc'), 'utf8'),
  },
  cover,
  out
);
```

### CommonJS

```js
const path = require('path');
const { embedTags } = require('musiccoverlyric');

(async () => {
  await embedTags(
    path.resolve('music', 'song.mp3'),
    { title: '标题', artist: '艺人' },
    path.resolve('music', 'output', 'out.mp3')
  );
})();
```

---

## API 概览

### `embedTags(filePath, tags, targetPath?)`

| 参数 | 说明 |
|------|------|
| `filePath` | 输入音频路径（`.mp3` / `.flac` / `.ogg` / `.opus` / `.m4a`）。 |
| `tags` | 元数据对象，见下方 `MusicTags`。 |
| `targetPath` | 输出文件路径；**默认等于 `filePath`**（覆盖原文件）。 |

返回 `Promise<void>`；ffmpeg 非零退出时 Promise **reject**，错误信息中包含 stderr 摘要。

### `embedCover(filePath, coverPath, targetPath?)`

将封面作为视频流以 MJPEG + `attached_pic` 写入；MP3 会附带 `-id3v2_version 3`。参数含义同上，`targetPath` 默认覆盖 `filePath`。

### `embedTagsAndCover(filePath, tags, coverPath, targetPath?)`

合并标签与封面，一次调用完成。`targetPath` 默认覆盖 `filePath`。

### `MusicTags`

| 字段 | 说明 |
|------|------|
| `title` / `artist` / `album` / `genre` / `comment` | 常见文本标签。 |
| `year` | 写入 ffmpeg 的 `date` 元数据键。 |
| `trackNumber` | 写入 `track` 键。 |
| `lyrics` | 歌词全文；内部会映射为 `lyrics` 与 `UNSYNCED LYRICS`。 |
| `[key: string]` | 其它自定义字符串标签，按原键名传给 `-metadata`。 |

类型定义见源码 [`src/types/index.ts`](./src/types/index.ts)。

---

## 进阶：ffmpeg 工具导出

本包同时导出部分底层工具（见 [`src/utils/ffmpeg.ts`](./src/utils/ffmpeg.ts)），便于你在自有脚本中拼接或调试 ffmpeg 参数：

- `FFMPEG_PATH`：ffmpeg-static 解析出的可执行文件路径。
- `resolveFormat` / `FORMAT_MAP`：扩展名到 muxer 名称。
- `buildMetadataArgs` / `buildEmbedCoverArgs` / `buildEmbedTagsAndCoverArgs`：生成参数数组。
- `runFfmpegFile(args)`：带 `-y`、日志级别、输出目录创建、stderr 收集的封装调用。

**约定**：传入 `runFfmpegFile` 的 `args` 中，**最后一个元素须为输出文件路径**（与 `buildEmbedCoverArgs` 等返回值一致）。

---

## 行为与限制说明

- **歌词体积**：极长的 `lyrics` 会增大 ID3 / Vorbis comment 体积；若遇播放器或 ffmpeg 限制，需自行截断或分文件策略。
- **封面与 MP3**：实现上通过**写文件**完成 mux，以保证与 ID3 封面写入的兼容性；若你自行基于 `buildEmbedCoverArgs` 改为 `pipe:1`，在 MP3 上可能出现封面丢失，不建议对 MP3 使用纯管道输出。
- **错误处理**：生产环境请对 `await embed*` 使用 `try/catch`，并根据 stderr 内容记录日志或重试。

---

## 开发与仓库内文档

| 文档 | 内容 |
|------|------|
| 本文档（根目录 `README.md`） | 库介绍与使用说明 |
| [`doc/README.md`](./doc/README.md) | npm **打包与发布**流程、字段说明与常见问题 |

本地开发克隆仓库后可执行：

```bash
npm install
npm run build
npm run test   # 运行 src/demo/embed.ts，需自备 music 目录下示例文件
```

---

## 许可证

MIT — 详见 [`package.json`](./package.json) 中的 `license` 字段。
