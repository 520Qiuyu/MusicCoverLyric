const path = require('path');
const { traverseDir, getFileType, getFiles } = require('../utils/file');
const fs = require('fs');

// 音乐文件夹路径
const musicPath = path.resolve(__dirname, 'D:/Musics/周杰伦');
// 输出文件夹路径
const outputPath = path.resolve(__dirname, 'D:/Musics/周杰伦/output');
// 移动文件类型
const moveTypes = ['.flac', '.mp3', '.ogg'];

// 检测输出文件夹是否存在
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

let index = 1;
traverseDir(musicPath, (filePath, dirPath) => {
  console.log('当前遍历:' + index++, '\n原文件路径：', filePath, '\n\t新文件路径：', dirPath);
  const fileType = getFileType(filePath);
  if (moveTypes.includes(fileType)) {
    const fileName = path.basename(filePath);
    const newFilePath = path.join(outputPath, fileName);
    console.log('\t\t移动中：', filePath, newFilePath);

    // 使用文件流将源文件移动到新位置
    fs.copyFileSync(filePath, newFilePath);
    console.log('\t\t移动完成');
  }
});
