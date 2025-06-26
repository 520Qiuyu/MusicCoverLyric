const path = require("path");
const fs = require("fs");
const iconv = require("iconv-lite");

/** 获取文件路径 */
function getFilePath(filePath) {
  console.log("__dirname", __dirname);
  console.log("__filename", __filename);
  return path.resolve(__dirname, filePath);
}

/** 获取文件类型 */
function getFileType(filePath) {
  const extname = path.extname(filePath);
  return extname.toLowerCase();
}

/** 读取文件内容 指定编码 */
/**
 * 读取文件内容，自动检测编码，优先使用 utf8，失败时尝试 gbk
 * @param {string} filePath 文件路径
 * @param {string} [encoding] 指定编码，若不传则自动检测
 * @returns {string} 文件内容
 * @example
 * readFileContent('test.txt');
 * readFileContent('test.txt', 'gbk');
 */
function readFileContent(filePath, readEncoding = "utf-8") {
  return iconv.decode(fs.readFileSync(filePath), readEncoding);
}

/** 获取文件夹下的所有文件 */
function getFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  return files;
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
  getFileType,
  traverseDir,
  readFileContent,
  getFiles,
};
