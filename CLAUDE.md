# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 常用命令

- `pnpm run build` — 生产构建，使用 tsup 打包 + tsc 生成类型声明，自动去除 `console.log`
- `pnpm run build:dev` — 开发构建（tsup --watch 模式），保留 `console.log`
- `pnpm run test` — 运行集成测试（vitest），自动生成测试音频并验证标签/封面写入正确
- `pnpm run test:watch` — 监听模式运行测试
- `pnpm run test:demo` — 运行 `src/demo/embed.ts` 演示脚本（需准备 `music/` 目录下示例文件）
- `pnpm publish` — 发布前通过 `prepublishOnly` 钩子自动构建

## 项目概述

一个 Node.js TypeScript 工具库，用于在音频文件中嵌入元数据标签、封面图片和歌词文本。底层通过 `ffmpeg-static` 调用 ffmpeg，无需系统预装 ffmpeg。

**支持格式**：`.mp3`、`.flac`、`.ogg`、`.opus`、`.m4a`（`.mp4`）。其中 `.mp3`、`.flac`、`.m4a` 同时支持标签 + 封面嵌入；`.ogg` 和 `.opus` 仅支持标签嵌入（容器限制）。

## 架构

```
src/
  index.ts           — 统一导出 libs/music 和 utils/ffmpeg
  types/index.ts     — MusicTags 接口定义（title, artist, album, year, genre, lyrics, trackNumber, comment, 自定义键）
  libs/music.ts      — 三个公开 API：embedTags()、embedCover()、embedTagsAndCover()
  utils/ffmpeg.ts    — FFMPEG_PATH 解析、FORMAT_MAP、参数构建（buildMetadataArgs / buildEmbedCoverArgs / buildEmbedTagsAndCoverArgs）、runFfmpegFile()
  utils/file.ts      — 文件工具：readFileContent（iconv-lite 编码转换）、traverseDir、withTempFile（临时文件 + 原子重命名）、streamToFileInPlace
  demo/embed.ts      — 测试/演示脚本（通过 tsconfig 排除在构建之外）
  demo/move.ts       — 从目录中收集音频文件的工具脚本
```

### 关键设计决策

- **三个公开函数**：`embedTags(filePath, tags, targetPath?)`、`embedCover(filePath, coverPath, targetPath?)`、`embedTagsAndCover(filePath, tags, coverPath, targetPath?)` — 均返回 `Promise<void>`，`targetPath` 默认为 `filePath`（原地覆盖）。
- **原地修改安全**：当输入路径等于输出路径时，先写入临时文件再原子重命名（`utils/file.ts` 中的 `withTempFile`），避免 ffmpeg 不允许输入输出相同路径的限制。
- **歌词双写入**：歌词同时写入 `lyrics` 和 `UNSYNCED LYRICS` 两个元数据键，以获得更广泛的播放器兼容性。
- **MP3 封面兼容**：MP3 输出附加 `-id3v2_version 3` 参数，并使用文件路径输出（而非管道），确保 ID3v2 封面数据正确写入。
- **封面编码**：封面图片通过 ffmpeg 流映射编码为 MJPEG，标记为 `attached_pic`  disposition。
- **同步文件操作**：除 `fs.promises.rename` 外，统一使用 `readFileSync`、`mkdirSync` 等同步 API。
- **编码支持**：使用 `iconv-lite` 读取非 UTF-8 编码的文件（如 GBK）。
