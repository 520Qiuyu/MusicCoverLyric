import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import type { MusicTags } from '../types';

// 轻量颜色工具，仅在开发调试时使用（生产构建会被 strip）
const pc = {
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

export const FFMPEG_PATH = ffmpegStatic as string;

/** 支持的文件扩展名 → ffmpeg 格式名映射 */
export const FORMAT_MAP: Record<string, string> = {
  '.mp3': 'mp3',
  '.flac': 'flac',
  '.ogg': 'ogg',
  '.oga': 'ogg',
  '.opus': 'opus',
  '.m4a': 'mp4',
  '.mp4': 'mp4',
};

/**
 * 获取文件对应的 ffmpeg 输出格式，不支持则抛出错误
 */
export const resolveFormat = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const format = FORMAT_MAP[ext];
  if (!format) throw new Error(`不支持的音频格式: ${ext}，仅支持 mp3 / flac / ogg / opus / m4a`);
  return format;
};

/**
 * 将 MusicTags 对象转换为 ffmpeg 的 -metadata key=value 参数数组
 *
 * MP3 和 FLAC 的 metadata key 在 ffmpeg 中通用（ffmpeg 会自动映射到对应容器标签）
 */
export const buildMetadataArgs = (tags: MusicTags): string[] => {
  /** 字段名 → ffmpeg metadata key 映射 */
  const KEY_MAP: Record<string, string> = {
    year: 'date',
    trackNumber: 'track',
    lyrics: 'lyrics',
  };

  return Object.entries(tags).flatMap(([key, value]) => {
    if (value === undefined) return [];
    const ffmpegKey = KEY_MAP[key] ?? key;
    if (ffmpegKey === 'lyrics') {
      return ['-metadata', `${ffmpegKey}=${value}`, '-metadata', `UNSYNCED LYRICS=${value}`];
    }
    return ['-metadata', `${ffmpegKey}=${value}`];
  });
};

/**
 * 构建内嵌封面的 ffmpeg 参数列表，output 为输出目标（ 或文件路径）
 */
export const buildEmbedCoverArgs = (
  filePath: string,
  coverPath: string,
  output: string
): string[] => {
  const format = resolveFormat(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // MP3 需额外指定 ID3v2 版本以确保封面兼容性
  const extraArgs = ext === '.mp3' ? ['-id3v2_version', '3'] : [];

  return [
    '-i',
    filePath,
    '-i',
    coverPath,
    '-map',
    '0:a',
    '-map',
    '1:v',
    '-c:a',
    'copy',
    '-c:v',
    'mjpeg',
    '-disposition:v:0',
    'attached_pic',
    ...extraArgs,
    '-metadata:s:v',
    'title=Album cover',
    '-metadata:s:v',
    'comment=Cover (front)',
    '-f',
    format,
    output,
  ];
};

/**
 * 构建同时内嵌元数据标签和封面的 ffmpeg 参数列表，output 为输出目标（ 或文件路径）
 */
export const buildEmbedTagsAndCoverArgs = (
  filePath: string,
  tags: MusicTags,
  coverPath: string,
  targetPath: string = filePath
): string[] => {
  const format = resolveFormat(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // MP3 需额外指定 ID3v2 版本以确保封面兼容性
  const extraArgs = ext === '.mp3' ? ['-id3v2_version', '3'] : [];

  return [
    '-i',
    filePath,
    '-i',
    coverPath,
    '-map',
    '0:a',
    '-map',
    '1:v',
    ...buildMetadataArgs(tags),
    '-c:a',
    'copy',
    '-c:v',
    'mjpeg',
    '-disposition:v:0',
    'attached_pic',
    ...extraArgs,
    '-metadata:s:v',
    'title=Album cover',
    '-metadata:s:v',
    'comment=Cover (front)',
    '-f',
    format,
    targetPath,
  ];
};

/**
 * 执行 ffmpeg 命令并将输出写入指定文件。
 * 适用于需要 seek 操作的场景（如 MP3 封面嵌入），避免 pipe 输出不支持 seek 的限制。
 * args 中最后一个元素应为输出文件路径，函数会自动在最前面插入 `-y` 以覆盖已有文件。
 *
 * @example
 * await runFfmpegFile(['-i', 'input.mp3', '-c', 'copy', '/tmp/output.mp3']);
 */
export const runFfmpegFile = (args: string[]): Promise<void> => {
  if (!FFMPEG_PATH)
    throw new Error('未找到 ffmpeg 可执行文件，请安装 ffmpeg-static 或配置系统 ffmpeg');

  console.log(pc.cyan('\n━━━ ffmpeg command ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  ${pc.dim('ffmpeg')}  ${FFMPEG_PATH}`);
  console.log(`  ${pc.dim('args')}\n${['-y', ...args].join('\n')}\n`);
  console.log(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  // 确保输出目录存在（约定：args 最后一个元素为输出文件路径）
  const outputPath = args[args.length - 1];
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_PATH, ['-y', '-loglevel', 'error', ...args], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';
    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg 进程退出，exit code: ${code}\n${stderr}`));
      } else {
        resolve();
      }
    });
  });
};
