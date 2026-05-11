import path from 'path';
import { embedCover, embedTags, embedTagsAndCover } from '../libs/music';
import { readFileContent } from '../utils/file';

const MP3_PATH = path.resolve(__dirname, '../../music/mp3/在我心里从此有个你.mp3');
const MP3_LYRIC_PATH = path.resolve(__dirname, '../../music/mp3/在我心里从此有个你.lrc');
const MP3_COVER_PATH = path.resolve(__dirname, '../../music/mp3/test.png');
const MP3_OUTPUT_PATH = path.resolve(__dirname, '../../music/output/在我心里从此有个你.mp3');

const FLAC_PATH = path.resolve(__dirname, '../../music/flac/暗号.flac');
const FLAC_LYRIC_PATH = path.resolve(__dirname, '../../music/flac/暗号.lrc');
const FLAC_COVER_PATH = path.resolve(__dirname, '../../music/flac/八度空间.jpg');
const FLAC_OUTPUT_PATH = path.resolve(__dirname, '../../music/output/暗号.flac');

const runEmbedTags = async () => {
  await embedTags(
    MP3_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(MP3_LYRIC_PATH) },
    MP3_OUTPUT_PATH
  );

  await embedTags(
    FLAC_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(FLAC_LYRIC_PATH) },
    FLAC_OUTPUT_PATH
  );
};

const runEmbedCover = async () => {
  await embedCover(MP3_PATH, MP3_COVER_PATH, MP3_OUTPUT_PATH);
  await embedCover(FLAC_PATH, FLAC_COVER_PATH, FLAC_OUTPUT_PATH);
};

const runEmbedTagsAndCover = async () => {
  await embedTagsAndCover(
    MP3_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(MP3_LYRIC_PATH) },
    MP3_COVER_PATH,
    MP3_OUTPUT_PATH
  );
  await embedTagsAndCover(
    FLAC_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(FLAC_LYRIC_PATH) },
    FLAC_COVER_PATH,
    FLAC_OUTPUT_PATH
  );
};

// runEmbedTags();
// runEmbedCover();
runEmbedTagsAndCover();

// 测试本地替换
const MP3_LOCAL_PATH = path.resolve(__dirname, '../../music/inPlace/mp3/在我心里从此有个你.mp3');
const FLAC_LOCAL_PATH = path.resolve(__dirname, '../../music/inPlace/flac/暗号.flac');

const runEmbedTagsInPlace = async () => {
  await embedTags(
    MP3_LOCAL_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(MP3_LYRIC_PATH) },
    MP3_LOCAL_PATH
  );
  await embedTags(
    FLAC_LOCAL_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(FLAC_LYRIC_PATH) },
    FLAC_LOCAL_PATH
  );
};

const runEmbedCoverInPlace = async () => {
  await embedCover(MP3_LOCAL_PATH, MP3_COVER_PATH, MP3_LOCAL_PATH);
  await embedCover(FLAC_LOCAL_PATH, FLAC_COVER_PATH, FLAC_LOCAL_PATH);
};

const runEmbedTagsAndCoverInPlace = async () => {
  await embedTagsAndCover(
    MP3_LOCAL_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(MP3_LYRIC_PATH) },
    MP3_COVER_PATH,
    MP3_LOCAL_PATH
  );
  await embedTagsAndCover(
    FLAC_LOCAL_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(FLAC_LYRIC_PATH) },
    FLAC_COVER_PATH,
    FLAC_LOCAL_PATH
  );
};

// runEmbedTagsInPlace();
// runEmbedCoverInPlace();
runEmbedTagsAndCoverInPlace();
