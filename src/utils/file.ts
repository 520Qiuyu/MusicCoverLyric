import fs from 'fs';
import iconv from 'iconv-lite';
import path from 'path';
import type { Readable } from 'stream';

/** 获取文件类型 */
export function getFileType(filePath: string) {
  const extname = path.extname(filePath);
  return extname.toLowerCase();
}

/**
 * 读取文件内容（可指定编码）
 * 如果未指定编码，默认使用 utf-8 读取
 * @example
 * readFileContent('test.txt');
 * readFileContent('test.txt', 'gbk');
 */
export function readFileContent(filePath: string, readEncoding = 'utf-8') {
  return iconv.decode(fs.readFileSync(filePath), readEncoding);
}

/**
 * 获取指定文件夹下的所有文件（不递归）
 * @example
 * getFiles('./data');
 */
export function getFiles(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  return files;
}

/**
 * 递归遍历文件夹下的所有文件和文件夹
 */
export function traverseDir(
  dirPath: string,
  callback: (filePath: string, dirPath: string, stats: fs.Stats) => void
) {
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

/**
 * 在目标目录创建临时文件，执行操作成功后原子性重命名为目标文件。
 * 操作失败时自动清理临时文件。
 *
 * 实现要点：
 * - 临时文件放在目标目录下，避免跨盘符 rename 失败（Windows 下 fs.rename 不支持跨设备）
 * - 自动创建目标目录，避免目录不存在导致的 ENOENT
 *
 * @example
 * await withTempFile('./output.mp3', async (tmpPath) => {
 *   await runFfmpegFile(['-i', 'input.mp3', tmpPath]);
 * });
 */
export const withTempFile = async (
  targetPath: string,
  action: (tmpPath: string) => Promise<void>
): Promise<void> => {
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });
  const tmpPath = path.join(targetDir, `.mcl_${Date.now()}_${path.basename(targetPath)}.tmp`);
  try {
    await action(tmpPath);
    await fs.promises.rename(tmpPath, targetPath);
  } catch (err) {
    fs.unlink(tmpPath, () => {});
    throw err;
  }
};

/**
 * 将可读流写入临时文件后替换目标文件，实现原子写入语义。
 * 操作失败时会自动清理临时文件。
 *
 * @example
 * const stream = embedTags('./music.mp3', { title: '歌曲名' });
 * await streamToFileInPlace(stream, './output.mp3');
 */
export const streamToFileInPlace = (stream: Readable, targetPath: string): Promise<void> =>
  withTempFile(targetPath, (tmpPath) =>
    new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(tmpPath);
      stream.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
      stream.on('error', reject);
    })
  );
