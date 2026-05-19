/**
 * 测试共享工具：常量、辅助函数、全局 setup
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { beforeAll } from 'vitest';
import type { IAudioMetadata } from 'music-metadata';
import { runFfmpegFile } from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== 常量 ===== */

export const TEMP_DIR = path.resolve(__dirname, '__temp__');
export const COVER_PATH = path.join(TEMP_DIR, 'cover.jpg');
export const SAMPLE_LYRICS = '[00:00.00]第一行歌词\n[00:05.00]第二行歌词';
export const LYRICS_TEXT = '第一行歌词\n第二行歌词';
export const TEST_TAGS = { title: '测试标题', artist: '测试艺人', album: '测试专辑', lyrics: SAMPLE_LYRICS };

/** 1x1 白色 PNG */
const COVER_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/* ===== 全局 setup（每个测试文件执行前运行） ===== */

beforeAll(() => {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  if (!fs.existsSync(COVER_PATH)) {
    fs.writeFileSync(COVER_PATH, Buffer.from(COVER_BASE64, 'base64'));
  }
});

/* ===== 辅助函数 ===== */

/**
 * 用 ffmpeg 生成指定格式的静音测试音频
 * @param subdir   __temp__ 下的子目录名（如 "mp3"）
 * @param filename 文件名（如 "test.mp3"）
 */
export async function generateAudio(subdir: string, filename: string): Promise<string> {
  const dir = path.join(TEMP_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const outputPath = path.join(dir, filename);
  await runFfmpegFile(['-f', 'lavfi', '-i', 'anullsrc', '-t', '1', outputPath]);
  return outputPath;
}

/**
 * 从 music-metadata 的 common.lyrics 中提取纯文本
 * music-metadata v11 对 LRC 格式的歌词会返回 ILyricsTag[]，
 * 其中 .text 为不含时间戳的纯文本
 */
export function extractLyricsText(meta: IAudioMetadata): string | undefined {
  const lyrics = meta.common.lyrics;
  if (!lyrics || lyrics.length === 0) return undefined;
  const first = lyrics[0];
  if (typeof first === 'object' && first !== null && 'text' in first) {
    return (first as { text: string }).text;
  }
  return String(first);
}
