/**
 * OGG（Vorbis）格式测试
 *
 * 注意：OGG 容器不支持视频流方式嵌入封面，仅测试元数据标签
 */

import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { parseFile } from 'music-metadata';
import { embedTags } from '../src/index';
import { TEMP_DIR, generateAudio } from './shared';

const DIR = path.join(TEMP_DIR, 'ogg');

describe('OGG - embedTags', () => {
  let audioPath: string;

  beforeAll(async () => {
    audioPath = await generateAudio('ogg', 'tags.ogg');
  });

  it('标题、艺人、专辑写入正确', async () => {
    const outputPath = path.join(DIR, 'tags_out.ogg');
    await embedTags(audioPath, { title: 'OGG测试', artist: '测试艺人', album: '测试专辑' }, outputPath);

    const meta = await parseFile(outputPath);
    expect(meta.common.title).toBe('OGG测试');
    expect(meta.common.artist).toBe('测试艺人');
    expect(meta.common.album).toBe('测试专辑');
  });
});
