import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

// 非法日期不能让构建通过：否则会变成 "Invalid Date" 一路流进 RSS 的 pubDate、
// sitemap 的 lastmod、JSON-LD 和 OG 分享图，污染搜索引擎直接读取的字段。
// refine 必须排在 optional() 前面，否则 undefined 也会进 refine。
const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: '必须是合法日期，例如 2026-09-03 或 2026-09-03T00:00:00+08:00',
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: dateString,
    updated: dateString.optional(),
    fl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    zy: z.string().default(''),
    fm: z.string().default(''),
    zz: z.string().default(''),
    cg: z.boolean().default(false),
    hide: z.boolean().default(false),
  }),
});

export const collections = { posts };
