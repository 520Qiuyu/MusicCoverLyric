import path from 'path';
import type { MusicTags } from '../types';
import { withTempFile } from '../utils/file';
import {
  buildEmbedCoverArgs,
  buildEmbedTagsAndCoverArgs,
  buildMetadataArgs,
  resolveFormat,
  runFfmpegFile,
} from '../utils/ffmpeg';

/** 是否为同一文件路径（ffmpeg 不允许输入与输出为同一路径） */
const isSamePath = (a: string, b: string): boolean => path.resolve(a) === path.resolve(b);

/**
 * 给 MP3/FLAC 文件内嵌元数据标签，写入 `targetPath`（默认覆盖 `filePath`）。
 * 当输出与输入为同一路径时，先写入临时文件再替换，避免 ffmpeg 报错。
 *
 * @example
 * await embedTags('./music.mp3', { title: '歌曲名', artist: '歌手' });
 * await embedTags('./in.mp3', { title: 'x' }, './out.mp3');
 */
export const embedTags = (
  filePath: string,
  tags: MusicTags,
  targetPath: string = filePath
): Promise<void> => {
  const format = resolveFormat(filePath);

  const args = (outPath: string) => [
    '-i',
    filePath,
    ...buildMetadataArgs(tags),
    '-c',
    'copy',
    '-f',
    format,
    outPath,
  ];

  if (isSamePath(filePath, targetPath)) {
    return withTempFile(targetPath, (tmp) => runFfmpegFile(args(tmp)));
  }
  return runFfmpegFile(args(targetPath));
};

/**
 * 给 MP3/FLAC 文件内嵌封面图片，写入 `targetPath`（默认覆盖 `filePath`）。
 * 当输出与输入为同一路径时，先写入临时文件再替换。
 *
 * @example
 * await embedCover('./music.mp3', './cover.jpg');
 * await embedCover('./in.mp3', './c.jpg', './out.mp3');
 */
export const embedCover = (
  filePath: string,
  coverPath: string,
  targetPath: string = filePath
): Promise<void> => {
  if (isSamePath(filePath, targetPath)) {
    return withTempFile(targetPath, (tmp) =>
      runFfmpegFile(buildEmbedCoverArgs(filePath, coverPath, tmp))
    );
  }
  return runFfmpegFile(buildEmbedCoverArgs(filePath, coverPath, targetPath));
};

/**
 * 给 MP3/FLAC 文件同时内嵌元数据标签和封面图片，写入 `targetPath`（默认覆盖 `filePath`）。
 * 合并为单次 ffmpeg 调用；当输出与输入为同一路径时，先写入临时文件再替换。
 *
 * @example
 * await embedTagsAndCover('./music.mp3', { title: '歌曲名' }, './cover.jpg');
 */
export const embedTagsAndCover = (
  filePath: string,
  tags: MusicTags,
  coverPath: string,
  targetPath: string = filePath
): Promise<void> => {
  if (isSamePath(filePath, targetPath)) {
    return withTempFile(targetPath, (tmp) =>
      runFfmpegFile(buildEmbedTagsAndCoverArgs(filePath, tags, coverPath, tmp))
    );
  }
  return runFfmpegFile(buildEmbedTagsAndCoverArgs(filePath, tags, coverPath, targetPath));
};
