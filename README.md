# Cyanvir'Blog

## 目录结构

```text
/
├── public/                 # 静态资源、全局脚本、表情包 owo.json
├── src/
│   ├── components/
│   │   ├── chat/           # 留言板（React 组件 + Twikoo 客户端 + 表情）
│   │   ├── comment/        # 评论区（TwikooComments.astro）
│   │   ├── common/         # 通用组件（ImageWrapper / CopyrightCard）
│   │   ├── layout/         # 页面骨架（Header / Footer / Breadcrumb / PostCard / FloatingBar …）
│   │   └── widget/         # 侧栏组件（SiteInfoCard / VisitorStats）
│   ├── config/             # 站点配置（见下）
│   ├── content/posts/      # 文章（Markdown）
│   ├── layouts/            # 页面布局（BaseLayout）
│   ├── pages/              # 路由页面（含 comments / link / fc 等）
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型
│   └── utils/              # 数据访问与工具（data.ts / coverLocalize.ts / markdown.ts）
├── astro.config.mjs
└── package.json
```

## 脚本

| 脚本 | 覆盖范围 | 用途 |
| --- | --- | --- |
| `pnpm check` | 全部 `.astro` + `.ts` + `.tsx` | **主力类型检查**。`tsc` 不支持 `.astro` 扩展名，所以 BaseLayout、各页面、大部分组件只能靠它查。会自动生成 `.astro/types.d.ts` 与 `.astro/content.d.ts`，不需要额外的 `astro sync` 步骤。CI 用的就是它。 |
| `pnpm typecheck` | 仅 `.ts` + `.tsx` | `.astro` 不在 `tsc` 支持列表里会被**静默跳过**，所以它查不到任何 `.astro` 文件的错误。保留它作为纯 TS 的快速检查（数据层、配置层），但**不能**把它通过当作全站类型安全的依据。 |

## 来源与致谢

本站基于 [mccsjs-blog](https://github.com/mccsjs/mccsjs-blog)（MIT 许可）二次开发，在此致谢原作者。
仓库内保留的模板代码遵循其 MIT 条款；本站原创文章内容采用 CC BY-NC-SA 4.0，见站点「关于」页声明。

