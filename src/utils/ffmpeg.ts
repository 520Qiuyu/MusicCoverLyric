import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import type { Readable } from 'stream';
import type { MusicTags } from '../types';

export const FFMPEG_PATH = ffmpegStatic as string;

/** 支持的文件扩展名 → ffmpeg 格式名映射 */
export const FORMAT_MAP: Record<string, string> = {
  '.mp3': 'mp3',
  '.flac': 'flac',
};

/**
 * 获取文件对应的 ffmpeg 输出格式，不支持则抛出错误
 */
export const resolveFormat = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const format = FORMAT_MAP[ext];
  if (!format) throw new Error(`不支持的音频格式: ${ext}，仅支持 mp3 / flac`);
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
    return ['-metadata', `${ffmpegKey}=${value}`];
  });
};

/**
 * 执行 ffmpeg 命令并返回 stdout 的可读流。
 * 若 ffmpeg 进程退出码非 0，流会触发 'error' 事件。
 */
export const runFfmpegStream = (args: string[]): Readable => {
  if (!FFMPEG_PATH)
    throw new Error('未找到 ffmpeg 可执行文件，请安装 ffmpeg-static 或配置系统 ffmpeg');

  const proc = spawn(FFMPEG_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.on('error', (err) => {
    (proc.stdout as Readable).destroy(err);
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      (proc.stdout as Readable).destroy(new Error(`ffmpeg 进程退出，exit code: ${code}`));
    }
  });

  return proc.stdout as Readable;
};
