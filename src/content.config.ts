import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

// 非法日期不能让构建通过：否则会变成 "Invalid Date" 一路流进 RSS 的 pubDate、
// sitemap 的 lastmod、JSON-LD 和 OG 分享图，污染搜索引擎直接读取的字段。
// refine 必须排在 optional() 前面，否则 undefined 也会进 refine。
const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: '必须是合法日期，例如 2026-09-03 或 2026-09-03T00:00:00+08:00',
});

// .strict()：frontmatter 出现任何未声明的键时构建直接失败，而不是静默丢弃。
// 不加的话「键名写错」是假阴性 —— 从 git 历史恢复旧文章时（历史 52 篇用过 fl、
// 13 篇 zy、2 篇 cg、1 篇 zz），旧的 fl: "教程" 会被丢弃、文章分类静默变空，
// build 与 check 都照常通过，只在分类页表现为「少一篇文章」。
// 恢复历史文章前先把 fl→category、zy→excerpt、cg→draft、zz→author 改好。
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z
    .object({
      title: z.string(),
      slug: z.string().optional(),
      date: dateString,
      updated: dateString.optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      excerpt: z.string().default(''),
      coverImage: z.string().default(''),
      author: z.string().default(''),
      draft: z.boolean().default(false),
      hide: z.boolean().default(false),
    })
    .strict(),
});

export const collections = { posts };
