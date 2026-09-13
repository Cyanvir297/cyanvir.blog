import type { APIContext } from 'astro';
import { getAllPosts, siteConfig } from '../utils/data';
import { renderMarkdown } from '../utils/markdown';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  const origin = context.url.origin;
  const authorName = siteConfig.author?.name || siteConfig.title;

  const entries: {
    url: string;
    title: string;
    summary: string;
    content: string;
    published: string;
    updated: string;
    tags: string[];
  }[] = [];

  for (const post of posts) {
    // 与 rss.xml.ts 同口径：正文渲染为 HTML，相对路径绝对化
    let content = '';
    try {
      const looksLikeHtml = /^\s*</.test(post.content) && /<\/[a-z]+>/i.test(post.content);
      const html = looksLikeHtml ? post.content : (await renderMarkdown(post.content)).html;
      content = html.replace(/(src|href)="\/(?!\/)/g, `$1="${origin}/`);
    } catch {
      content = '';
    }

    const url = `${origin}/posts/${post.slug}`;
    entries.push({
      url,
      title: post.title,
      summary: post.excerpt || '',
      content,
      published: toIso(post.createdAt, post.createdAt),
      updated: toIso(post.updatedAt, post.createdAt),
      tags: post.tags?.map((t) => t.name) || [],
    });
  }

  // feed 级 <updated> 取所有条目里最晚的更新时间。posts 按 createdAt 倒序，
  // 但「最新一篇」不一定「最近更新」，所以不能直接用 entries[0]。
  // ISO 8601 UTC 字符串可直接按字典序比较时间先后。
  const feedUpdated = entries.length > 0
    ? entries.reduce((max, e) => (e.updated > max ? e.updated : max), entries[0].updated)
    : new Date().toISOString();

  const entryXml = entries.map((e) => {
    const summary = e.summary ? `    <summary type="html">${escapeXml(e.summary)}</summary>\n` : '';
    const body = e.content ? `    <content type="html">${escapeXml(e.content)}</content>\n` : '';
    const cats = e.tags.map((t) => `    <category term="${escapeXml(t)}" />`).join('\n');
    return `  <entry>
    <title>${escapeXml(e.title)}</title>
    <link href="${escapeXml(e.url)}" />
    <id>${escapeXml(e.url)}</id>
    <published>${e.published}</published>
    <updated>${e.updated}</updated>
    <author><name>${escapeXml(authorName)}</name></author>
${summary}${body}${cats ? cats + '\n' : ''}  </entry>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.title)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <link rel="self" href="${escapeXml(`${origin}/atom.xml`)}" />
  <link href="${escapeXml(origin)}" />
  <id>${escapeXml(`${origin}/`)}</id>
  <updated>${feedUpdated}</updated>
  <author><name>${escapeXml(authorName)}</name></author>
${entryXml}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}

// Unix 秒 → RFC 3339。updatedAt 缺失/非法时回退 fallback（Atom 要求 RFC 3339，
// 不能输出 Invalid Date）。createdAt 已由 content.config.ts 的 zod refine 保证合法。
function toIso(ts: string, fallback: string): string {
  const n = Number(ts);
  const value = Number.isFinite(n) && n > 0 ? n : Number(fallback);
  return new Date(value * 1000).toISOString();
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
