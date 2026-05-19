/**
 * MP3 格式测试
 *
 * 支持：元数据标签 + 封面嵌入
 */

import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { parseFile } from 'music-metadata';
import { embedTags, embedCover, embedTagsAndCover } from '../src/index';
import { TEMP_DIR, COVER_PATH, TEST_TAGS, generateAudio } from './shared';

const DIR = path.join(TEMP_DIR, 'mp3');

describe('MP3 - embedTags', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('mp3', 'tags.mp3');
  });

  it('标题、艺人、专辑写入正确', async () => {
    const outputPath = path.join(DIR, 'tags_out.mp3');
    await embedTags(audioPath, TEST_TAGS, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('测试标题');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.album).toBe('测试专辑');
  });

  it('自定义 genre 标签写入正确', async () => {
    const outputPath = path.join(DIR, 'tags_genre.mp3');
    await embedTags(audioPath, { genre: '摇滚' }, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.genre).toContain('摇滚');
  });
});

describe('MP3 - embedCover', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('mp3', 'cover.mp3');
  });

  it('封面图片存在且为 JPEG 格式', async () => {
    const outputPath = path.join(DIR, 'cover_out.mp3');
    await embedCover(audioPath, COVER_PATH, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
    expect(meta.common.picture![0].format).toBe('image/jpeg');
    expect(meta.common.picture![0].data.length).toBeGreaterThan(0);
  });
});

describe('MP3 - embedTagsAndCover', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('mp3', 'tc.mp3');
  });

  it('标签与封面同时写入正确', async () => {
    const outputPath = path.join(DIR, 'tc_out.mp3');
    await embedTagsAndCover(audioPath, TEST_TAGS, COVER_PATH, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('测试标题');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
    expect(meta.common.picture![0].format).toBe('image/jpeg');
  });
});

describe('MP3 - 原地修改', () => {
  it('embedTags 原地覆盖后标签正确', async () => {
    const audioPath = await generateAudio('mp3', 'inplace_tags.mp3');
    await embedTags(audioPath, { title: '原地修改', artist: '测试' }, audioPath);

    const meta = await parseFile(audioPath);
    expect(meta.common.title).toBe('原地修改');
    expect(meta.common.artist).toBe('测试');
  });

  it('embedTagsAndCover 原地覆盖后标签与封面正确', async () => {
    const audioPath = await generateAudio('mp3', 'inplace_tc.mp3');
    await embedTagsAndCover(audioPath, { title: '原地+封面' }, COVER_PATH, audioPath);

    const meta = await parseFile(audioPath);
    expect(meta.common.title).toBe('原地+封面');
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
  });
});
