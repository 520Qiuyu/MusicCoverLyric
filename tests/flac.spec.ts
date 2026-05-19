/**
 * FLAC 格式测试
 *
 * 支持：元数据标签 + 封面嵌入（含 LRC 歌词解析）
 */

import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { parseFile } from 'music-metadata';
import { embedTags, embedCover, embedTagsAndCover } from '../src/index';
import { TEMP_DIR, COVER_PATH, TEST_TAGS, SAMPLE_LYRICS, LYRICS_TEXT, generateAudio, extractLyricsText } from './shared';

const DIR = path.join(TEMP_DIR, 'flac');

describe('FLAC - embedTags', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('flac', 'tags.flac');
  });

  it('标题、艺人、专辑写入正确', async () => {
    const outputPath = path.join(DIR, 'tags_out.flac');
    await embedTags(audioPath, TEST_TAGS, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('测试标题');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.album).toBe('测试专辑');
  });

  it('LRC 歌词写入且被正确解析', async () => {
    const outputPath = path.join(DIR, 'tags_lyrics.flac');
    await embedTags(audioPath, { lyrics: SAMPLE_LYRICS }, outputPath);

    const meta = await parseFile(outputPath);
    expect(extractLyricsText(meta)).toBe(LYRICS_TEXT);
  });
});

describe('FLAC - embedCover', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('flac', 'cover.flac');
  });

  it('封面图片存在且为 JPEG 格式', async () => {
    const outputPath = path.join(DIR, 'cover_out.flac');
    await embedCover(audioPath, COVER_PATH, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
    expect(meta.common.picture![0].format).toBe('image/jpeg');
    expect(meta.common.picture![0].data.length).toBeGreaterThan(0);
  });
});

describe('FLAC - embedTagsAndCover', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('flac', 'tc.flac');
  });

  it('标签与封面同时写入正确', async () => {
    const outputPath = path.join(DIR, 'tc_out.flac');
    await embedTagsAndCover(audioPath, TEST_TAGS, COVER_PATH, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('测试标题');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
    expect(meta.common.picture![0].format).toBe('image/jpeg');
  });
});
