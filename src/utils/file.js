const path = require("path");
const fs = require("fs");

/** 获取文件路径 */
function getFilePath(filePath) {
  console.log("__dirname", __dirname);
  console.log("__filename", __filename);
  return path.resolve(__dirname, filePath);
}

/**
 * 递归遍历文件夹下的所有文件和文件夹
 * @param {string} dirPath 要遍历的目录路径
 * @param {function} callback 每遍历到一个文件时调用，参数为文件的绝对路径
 */
function traverseDir(dirPath, callback) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      callback(filePath, dirPath, stats);
    } else if (stats.isDirectory()) {
      traverseDir(filePath, callback);
    }
  });
}

module.exports = {
  getFilePath,
  traverseDir,
};
