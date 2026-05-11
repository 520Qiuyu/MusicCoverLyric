# npm 打包与发布说明

本文档说明如何将 **musiccoverlyric** 编译为可发布的 npm 包，以及发布到 npm 的流程与注意事项。

---

## 构建方式说明

本库使用 **TypeScript 编译器（`tsc`）** 输出到 `dist/`，**不强制使用 Rollup / webpack** 等打包工具。

- 运行时依赖（如 `ffmpeg-static`、`iconv-lite`）保留在 `dependencies` 中，由使用者安装时解析，避免把二进制与路径解析打进单 bundle 带来的问题。
- `src/demo/` 已从编译范围排除（见根目录 `tsconfig.json` 的 `exclude`），发布的包里不包含示例脚本。

---

## `package.json` 中与发布相关的字段

| 字段 | 含义 |
|------|------|
| `main` | CommonJS 入口：`./dist/index.js` |
| `types` | TypeScript 类型入口：`./dist/index.d.ts` |
| `exports` | 现代解析器的入口映射（含 `types` 条件） |
| `files` | **仅**将 `dist` 目录打入 npm 包（源码默认不进包） |
| `prepublishOnly` | 执行 `npm publish` 前自动运行 `npm run build` |

---

## 本地脚本

| 命令 | 作用 |
|------|------|
| `npm run clean` | 删除 `dist` 目录 |
| `npm run build` | `clean` 后执行 `tsc`，生成 JS + `.d.ts` |
| `npm publish` | 会先触发 `prepublishOnly`，即自动构建 |

日常开发可先手动执行 `npm run build`，确认无报错后再发布。

---

## 发布前自检清单

1. **`package.json`**
   - `name`：未被占用；若冲突可改为 scoped，例如 `@你的用户名/musiccoverlyric`。
   - `version`：遵循 [semver](https://semver.org/lang/zh-CN/)；**同一版本不能重复发布**。
   - `dependencies`：运行时需要的包必须在 `dependencies`，勿误放在 `devDependencies`。
2. **构建产物**
   - 执行 `npm run build` 后，`dist/` 下应有 `index.js`、`index.d.ts` 及被引用的子模块编译结果。
3. **打包内容预览（推荐）**
   - `npm pack --dry-run`：查看即将打进 tarball 的文件列表。
   - 或 `npm pack` 生成 `.tgz` 后解压，确认只有预期文件（主要为 `dist/`）。

---

## 发布流程

### 1. 登录 npm

```bash
npm login
```

按提示输入账号、密码、邮箱及二次验证（若已开启）。

### 2. 发布

**普通公开包：**

```bash
npm publish
```

**scoped 包（`@scope/name`）且需要公开访问：**

```bash
npm publish --access public
```

**预发布 / 测试标签（可选）：**

```bash
npm publish --tag beta
```

### 3. 发布后验证

```bash
npm view musiccoverlyric version
# 或在其它目录
npm install musiccoverlyric
```

---

## 版本迭代

下次发布前需**升高版本号**，可用：

```bash
npm version patch   # 修订号 +1，如 1.0.0 → 1.0.1
npm version minor   # 次版本 +1
npm version major   # 主版本 +1
```

然后在干净提交基础上执行 `npm publish`。若在 git 仓库中，`npm version` 通常会创建对应 tag。

---

## 为何不默认使用 Rollup

本库依赖 Node 内置模块、`child_process` 调用 ffmpeg，以及 `ffmpeg-static` 提供的二进制路径。**用 `tsc` 多文件输出**更简单、调试更方便；若将来需要「单文件 + 双格式 ESM/CJS」，再考虑 **tsup / Rollup**，且需将所有运行时依赖与 Node 内置模块配置为 **external**。

---

## 常见问题

| 现象 | 处理 |
|------|------|
| `403` / 包名已被占用 | 修改 `name` 或使用 scoped 名称 |
| `You cannot publish over the previously published versions` | 执行 `npm version patch` 后再发布 |
| 安装后缺少类型 | 检查是否包含 `dist/**/*.d.ts`，以及 `types` / `exports.types` 是否正确 |
| tarball 里多了不该有的文件 | 检查 `files` 字段；不要用 `.npmignore` 误包含大目录 |

---

## 相关文件

- 根目录 `package.json`：入口、`files`、`scripts`
- 根目录 `tsconfig.json`：`outDir`、`declaration`、`include` / `exclude`
