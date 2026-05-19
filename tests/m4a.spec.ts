/**
 * M4A（MP4 容器）格式测试
 *
 * 支持：元数据标签 + 封面嵌入
 */

import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { parseFile } from 'music-metadata';
import { embedTags, embedCover, embedTagsAndCover } from '../src/index';
import { TEMP_DIR, COVER_PATH, TEST_TAGS, generateAudio } from './shared';

const DIR = path.join(TEMP_DIR, 'm4a');

describe('M4A - embedTags', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('m4a', 'tags.m4a');
  });

  it('标题、艺人、专辑写入正确', async () => {
    const outputPath = path.join(DIR, 'tags_out.m4a');
    await embedTags(audioPath, TEST_TAGS, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('测试标题');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.album).toBe('测试专辑');
  });
});

describe('M4A - embedCover', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('m4a', 'cover.m4a');
  });

  it('封面图片存在且数据非空', async () => {
    const outputPath = path.join(DIR, 'cover_out.m4a');
    await embedCover(audioPath, COVER_PATH, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
    expect(meta.common.picture![0].data.length).toBeGreaterThan(0);
  });
});

describe('M4A - embedTagsAndCover', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('m4a', 'tc.m4a');
  });

  it('标签与封面同时写入正确', async () => {
    const outputPath = path.join(DIR, 'tc_out.m4a');
    await embedTagsAndCover(audioPath, TEST_TAGS, COVER_PATH, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('测试标题');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.picture).toBeDefined();
    expect(meta.common.picture!.length).toBe(1);
    expect(meta.common.picture![0].data.length).toBeGreaterThan(0);
  });
});
