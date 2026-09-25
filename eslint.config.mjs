// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// ESLint 只覆盖 .ts .js .mjs .tsx（src、scripts、astro.config.mjs）。
//
// 排除项与理由：
//   .astro/**      — Astro 生成的类型缓存目录，非源码
//   dist/**        — 构建产物
//   public/**      — 静态产物。header.js 是浏览器全局 var 风格（无模块系统、
//                    用 window/document 全局），与 src 的 ESM 风格不同，检查会产生
//                    大量 no-var / no-undef 误报。格式由人工维护，不纳入
//   src/content/** — markdown 文章内容，格式化会改变渲染语义
//
// .astro 文件的模板部分 ESLint 支持有限，不做 lint；类型交给 astro check，
// 格式交给 Prettier —— 但 Prettier 3.9.9 无 .astro parser（实测 No parser could
// be inferred），所以 .astro 目前只有 astro check 覆盖。
//
// globals：src 下代码横跨构建期（Node：process、Buffer）与客户端（browser：
// window、document），合并两套全局变量，避免 no-undef 误报。
//
// react-hooks 只对 .tsx/.jsx 生效：ChatRoom.tsx 里有 eslint-disable 注释引用
// react-hooks/exhaustive-deps，不装这个插件会报"规则找不到"。
//
// eslint-config-prettier 必须放最后：关掉所有与 Prettier 冲突的格式规则（缩进、
// 空格、引号），让 Prettier 独占格式，ESLint 只管语义规则。
export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'public/**', 'src/content/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.es2022 },
    },
  },
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  eslintConfigPrettier,
];
