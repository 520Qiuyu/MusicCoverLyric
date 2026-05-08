import path from 'path';
import { embedCoverInPlace, embedTagsAndCoverInPlace, embedTagsInPlace } from '../libs/music';
import { readFileContent } from '../utils/file';

const MP3_PATH = path.resolve(__dirname, '../../music/mp3/在我心里从此有个你.mp3');
const MP3_LYRIC_PATH = path.resolve(__dirname, '../../music/mp3/在我心里从此有个你.lrc');
const MP3_COVER_PATH = path.resolve(__dirname, '../../music/mp3/test.png');
const MP3_OUTPUT_PATH = path.resolve(__dirname, '../../music/output/在我心里从此有个你.mp3');

const FLAC_PATH = path.resolve(__dirname, '../../music/flac/暗号.flac');
const FLAC_LYRIC_PATH = path.resolve(__dirname, '../../music/flac/暗号.lrc');
const FLAC_COVER_PATH = path.resolve(__dirname, '../../music/flac/八度空间.jpg');
const FLAC_OUTPUT_PATH = path.resolve(__dirname, '../../music/output/暗号.flac');

const embedTags = async () => {
  await embedTagsInPlace(
    MP3_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(MP3_LYRIC_PATH) },
    {
      targetPath: MP3_OUTPUT_PATH,
    }
  );
  await embedTagsInPlace(
    FLAC_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(FLAC_LYRIC_PATH) },
    {
      targetPath: FLAC_OUTPUT_PATH,
    }
  );
};

const embedCover = async () => {
  await embedCoverInPlace(MP3_PATH, MP3_COVER_PATH, {
    targetPath: MP3_OUTPUT_PATH,
  });
  await embedCoverInPlace(FLAC_PATH, FLAC_COVER_PATH, {
    targetPath: FLAC_OUTPUT_PATH,
  });
};

const embedTagsAndCover = async () => {
  await embedTagsAndCoverInPlace(
    MP3_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(MP3_LYRIC_PATH) },
    MP3_COVER_PATH,
    {
      targetPath: MP3_OUTPUT_PATH,
    }
  );
  await embedTagsAndCoverInPlace(
    FLAC_PATH,
    { title: 'test', artist: 'qiuyu', lyrics: readFileContent(FLAC_LYRIC_PATH) },
    FLAC_COVER_PATH,
    {
      targetPath: FLAC_OUTPUT_PATH,
    }
  );
};

// embedTags();
embedCover();
// embedTagsAndCover();
