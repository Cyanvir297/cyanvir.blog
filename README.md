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

## 环境变量

模板见 `.env.example`（提交进仓库），真实值写在 `.env`（已被 `.gitignore` 忽略）。

| 变量 | 读取位置 | 缺失时的行为 |
| --- | --- | --- |
| `PUBLIC_MAP_KEY` | `src/components/widget/AnnouncementCard.astro` | 不发起 IP 定位请求，公告卡直接显示欢迎语兜底，**不报错** |

- **为什么必须带 `PUBLIC_` 前缀**：Astro/Vite 只把 `PUBLIC_` 开头的变量注入客户端构建。不加前缀，首页会渲染出空的 `data-map-key`，定位功能静默失效。
- **为什么不在 `src/config/siteConfig.ts` 里读**：该文件被 `astro.config.mjs` 引入，而 Astro 对 `.mjs` 配置先用原生 Node `import()` 加载，那个环境里没有 `import.meta.env`。所以 env 读取点放在 `.astro` 组件里。
- **本地开发**：`cp .env.example .env`，填入腾讯位置服务的 key。不填也能正常构建和预览，只是公告卡不显示定位。
- **线上**：在 Vercel 的 Project → Settings → Environment Variables 配置，选 Production。改动会自动触发重新部署；静态构建在 build 那一刻把值固化进产物。Vercel 会提示 `PUBLIC_` 变量会暴露到客户端，这是预期行为。
- **GitHub Actions 用的 `SITE_URL` / `ASTRO_BASE` 是 GitHub Variables**，在 `.github/workflows/deploy.yml` 里以 `${{ vars.* }}` 读取，和 Vercel 的 Environment Variables 是两套系统，互不影响。

## 来源与致谢

本站基于 [mccsjs-blog](https://github.com/mccsjs/mccsjs-blog)（MIT 许可）二次开发，在此致谢原作者。
仓库内保留的模板代码遵循其 MIT 条款；本站原创文章内容采用 CC BY-NC-SA 4.0，见站点「关于」页声明。

