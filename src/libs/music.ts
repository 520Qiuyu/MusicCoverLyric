import type { MusicTags } from '../types';
import {
  buildEmbedCoverArgs,
  buildEmbedTagsAndCoverArgs,
  buildMetadataArgs,
  resolveFormat,
  runFfmpegFile,
} from '../utils/ffmpeg';

/**
 * 给 MP3/FLAC 文件内嵌元数据标签，返回处理后的可读流。
 * @example
 * const stream = embedTags('./music.mp3', { title: '歌曲名', artist: '歌手' });
 * stream.pipe(fs.createWriteStream('./output.mp3'));
 */
export const embedTags = (
  filePath: string,
  tags: MusicTags,
  targetPath: string = filePath
): Promise<void> => {
  const format = resolveFormat(filePath);

  return runFfmpegFile([
    '-i',
    filePath,
    ...buildMetadataArgs(tags),
    '-c',
    'copy',
    '-f',
    format,
    targetPath,
  ]);
};

/**
 * 给 MP3/FLAC 文件内嵌封面图片，返回处理后的可读流。
 *
 * @example
 * const stream = embedCover('./music.mp3', './cover.jpg');
 * stream.pipe(fs.createWriteStream('./output.mp3'));
 */
export const embedCover = (
  filePath: string,
  coverPath: string,
  targetPath: string = filePath
): Promise<void> => runFfmpegFile(buildEmbedCoverArgs(filePath, coverPath, targetPath));

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
  coverPath: string,
  targetPath: string = filePath
): Promise<void> =>
  runFfmpegFile(buildEmbedTagsAndCoverArgs(filePath, tags, coverPath, targetPath));
