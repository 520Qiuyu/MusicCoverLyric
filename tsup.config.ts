import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'cjs',
  target: 'es2016',
  dts: false,
  external: ['ffmpeg-static', 'iconv-lite'],
  clean: true,
  esbuildOptions(options) {
    // 构建时自动去除 console.log，生产包中不包含调试打印
    options.drop = ['console'];
  },
});
