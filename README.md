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

## 来源与致谢

本站基于 [mccsjs-blog](https://github.com/mccsjs/mccsjs-blog)（MIT 许可）二次开发，在此致谢原作者。
仓库内保留的模板代码遵循其 MIT 条款；本站原创文章内容采用 CC BY-NC-SA 4.0，见站点「关于」页声明。

