import path from 'path';
import type { Readable } from 'stream';
import type { MusicTags } from '../types';
import { buildMetadataArgs, resolveFormat, runFfmpegStream } from '../utils/ffmpeg';
import { streamToFileInPlace } from '../utils/file';

/**
 * 给 MP3/FLAC 文件内嵌元数据标签，返回处理后的可读流。
 *
 * @example
 * const stream = embedTags('./music.mp3', { title: '歌曲名', artist: '歌手' });
 * stream.pipe(fs.createWriteStream('./output.mp3'));
 */
export const embedTags = (filePath: string, tags: MusicTags): Readable => {
  const format = resolveFormat(filePath);

  return runFfmpegStream([
    '-i',
    filePath,
    ...buildMetadataArgs(tags),
    '-c',
    'copy',
    '-f',
    format,
    'pipe:1',
  ]);
};

/**
 * 给 MP3/FLAC 文件内嵌封面图片，返回处理后的可读流。
 *
 * @example
 * const stream = embedCover('./music.mp3', './cover.jpg');
 * stream.pipe(fs.createWriteStream('./output.mp3'));
 */
export const embedCover = (filePath: string, coverPath: string): Readable => {
  const format = resolveFormat(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const baseArgs = ['-i', filePath, '-i', coverPath, '-map', '0', '-map', '1', '-c', 'copy'];

  // MP3 需额外指定 ID3v2 版本以确保封面兼容性
  const extraArgs =
    ext === '.mp3'
      ? [
          '-id3v2_version',
          '3',
          '-metadata:s:v',
          'title=Album cover',
          '-metadata:s:v',
          'comment=Cover (front)',
        ]
      : [];

  return runFfmpegStream([...baseArgs, ...extraArgs, '-f', format, 'pipe:1']);
};

/**
 * 给 MP3/FLAC 文件同时内嵌元数据标签和封面图片，返回处理后的可读流。
 * 合并为单次 ffmpeg 调用，效率优于分开调用。
 *
 * @example
 * const stream = embedTagsAndCover('./music.mp3', { title: '歌曲名' }, './cover.jpg');
 * stream.pipe(fs.createWriteStream('./output.mp3'));
 */
export const embedTagsAndCover = (
  filePath: string,
  tags: MusicTags,
  coverPath: string
): Readable => {
  const format = resolveFormat(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const extraArgs =
    ext === '.mp3'
      ? [
          '-id3v2_version',
          '3',
          '-metadata:s:v',
          'title=Album cover',
          '-metadata:s:v',
          'comment=Cover (front)',
        ]
      : [];

  return runFfmpegStream([
    '-i',
    filePath,
    '-i',
    coverPath,
    '-map',
    '0',
    '-map',
    '1',
    ...buildMetadataArgs(tags),
    '-c',
    'copy',
    ...extraArgs,
    '-f',
    format,
    'pipe:1',
  ]);
};

/**
 * 给 MP3/FLAC 文件内嵌元数据标签，可指定存放目标路径，默认覆盖原文件
 *
 * @example
 * await embedTagsInPlace('./music.mp3', { title: '歌曲名', artist: '歌手' });
 */
export const embedTagsInPlace = (
  filePath: string,
  tags: MusicTags,
  options: {
    targetPath?: string;
  } = {
    targetPath: filePath,
  }
): Promise<void> => streamToFileInPlace(embedTags(filePath, tags), options.targetPath ?? filePath);

/**
 * 给 MP3/FLAC 文件内嵌封面图片，可指定存放目标路径，默认覆盖原文件
 *
 * @example
 * await embedCoverInPlace('./music.mp3', './cover.jpg');
 */
export const embedCoverInPlace = (
  filePath: string,
  coverPath: string,
  options: {
    targetPath?: string;
  } = {
    targetPath: filePath,
  }
): Promise<void> =>
  streamToFileInPlace(embedCover(filePath, coverPath), options.targetPath ?? filePath);

/**
 * 给 MP3/FLAC 文件同时内嵌元数据标签和封面图片，可指定存放目标路径，默认覆盖原文件
 *
 * @example
 * await embedTagsAndCoverInPlace('./music.mp3', { title: '歌曲名' }, './cover.jpg');
 */
export const embedTagsAndCoverInPlace = (
  filePath: string,
  tags: MusicTags,
  coverPath: string,
  options: {
    targetPath?: string;
  } = {
    targetPath: filePath,
  }
): Promise<void> =>
  streamToFileInPlace(embedTagsAndCover(filePath, tags, coverPath), options.targetPath ?? filePath);
