const fs = require("fs");
const path = require("path");
const { traverseDir, getFileType, getFiles } = require("../utils/file");
const Metaflac = require("metaflac-js");
const { embedFlacLyric, embedCover } = require("../utils/music");

// 音乐文件夹路径
const musicPath = path.resolve(__dirname, "../../music");

// 封面类型
const coverTypes = [".png", ".jpeg", ".jpg"];
// 封面映射
const coverMap = {};

// 递归遍历音乐文件夹中的文件
traverseDir(musicPath, (filePath, dirPath) => {
  console.log(filePath, dirPath);
  const fileType = getFileType(filePath);
  console.log(fileType);
  switch (fileType) {
    case ".flac":
      // 嵌入歌词
      embedFlacLyric(filePath, filePath.replace(".flac", ".lrc"));
      // 嵌入封面
      const coverPath = coverMap[dirPath];
      console.log("coverPath", coverPath);
      if (coverPath) {
        embedCover(filePath, coverPath);
      } else {
        const files = getFiles(dirPath);
        console.log("files", files);
        const cover = files.find((file) =>
          coverTypes.some((ext) => file.endsWith(ext))
        );
        console.log("cover", cover);
        const coverPath = cover ? path.join(dirPath, cover) : null;
        coverMap[dirPath] = coverPath;
        if (coverPath) {
          embedCover(filePath, coverPath);
        }
      }
      break;
    case ".png":
    case ".jpeg":
    case ".jpg":
      if (!coverMap[dirPath]) {
        coverMap[dirPath] = filePath;
      }
      break;
  }
});
