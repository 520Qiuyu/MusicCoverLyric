const fs = require("fs");
const path = require("path");
const { traverseDir } = require("../utils/file");

// 音乐文件夹路径
const musicPath = path.resolve(__dirname, "../../music");

// 递归遍历音乐文件夹中的文件
traverseDir(musicPath, (filePath, dirPath, stats) => {
  console.log(filePath, dirPath);
});
