const Metaflac = require("metaflac-js");
const fs = require("fs");
const { readFileContent } = require("./file");
const iconv = require("iconv-lite");

/** 给flac文件嵌入封面 */
function embedCover(filePath, coverPath) {
  const metaflac = new Metaflac(filePath);
  metaflac.importPictureFrom(coverPath);
  metaflac.save();
}

/** 给flac文件嵌入歌词 */
function embedFlacLyric(filePath, lyricPath, options = {}) {
  const {
    /** 优先使用原有歌词 */
    priorityLyric = true,
  } = options;
  const metaflac = new Metaflac(filePath);
  const allTags = metaflac.getAllTags();
  if (priorityLyric && allTags.some((tag) => tag?.includes("LYRICS"))) {
    return true;
  }
  if (!priorityLyric && allTags.some((tag) => tag?.includes("LYRICS"))) {
    metaflac.removeTag("LYRICS");
  }
  const lyricContent = readFileContent(lyricPath, "gbk");
  metaflac.setTag("LYRICS=" + lyricContent);
  metaflac.save();
  return true;
}

module.exports = {
  embedCover,
  embedFlacLyric,
};
