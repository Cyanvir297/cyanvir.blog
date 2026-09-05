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

## 开发

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # 输出到 dist/
pnpm preview    # 本地预览构建产物
```

## 内容与配置

- **写文章**：在 `src/content/posts/` 新增 `.md` 文件。frontmatter 字段使用缩写约定：

  | 字段 | 含义 | 说明 |
  | --- | --- | --- |
  | `title` | 标题 | 必填 |
  | `slug` | 路径 | 可选，默认取文件名 |
  | `date` | 日期 | 必填 |
  | `updated` | 最后更新 | 可选，修改旧文章时用于 sitemap 和结构化数据 |
  | `fl` | 分类 | 可选，从文章自动聚合，无需手写配置 |
  | `tags` | 标签 | 数组，自动聚合 |
  | `zy` | 摘要 | 可选 |
  | `fm` | 封面 | 可选，远程图会本地化 |
  | `zz` | 作者 | 可选 |
  | `cg` | 草稿 | 可选，`true` 则不发布 |

  > 分类 / 标签不再手写配置，新增时只需在文章里写 `fl:` / `tags:`，即自动生成对应页面。

- **站点配置**：`src/config/` 下的 `siteConfig.ts`、`commentConfig.ts`、`friendsConfig.ts`、`navBarConfig.ts`、`footerConfig.ts`、`messageConfig.ts`、`fmImageConfig.ts`。
- **表情包**：`public/owo.json`（OwO 格式）。
- **字体子集**：完整母版保留在 `public/font/b.woff2`，前台使用 `public/font/b.subset.woff2`。新增或修改站点文案、文章后运行 `pnpm font:subset` 重新生成子集。
- **统一数据出口**：`src/utils/data.ts`（`getPosts` / `getFriends` / `getCategories` / `getTags` 等）。

## 部署（GitHub Pages）

推送 `main` 分支即自动构建部署（见 `.github/workflows/deploy.yml`）。子路径部署时在仓库 **Settings → Secrets and variables → Actions → Variables** 设置：

- `SITE_URL`：站点域名，如 `https://yourname.github.io`
- `ASTRO_BASE`：子路径，如仓库为 `yourname/mccsjsblog` 则填 `/mccsjsblog/`；根路径则留空

`astro.config.mjs` 的 `base` 读取 `ASTRO_BASE`，部署产物含 `.nojekyll`。
