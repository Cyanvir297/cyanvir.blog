import type { APIRoute } from 'astro';
import { base as astroBase } from 'astro:config/server';

const getRobotsTxt = (sitemapURL: URL) =>
  `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ url }) => {
  // url.origin 不含 base 前缀，同 sitemap.xml.ts；astroBase 恒以 '/' 开头
  const sitemapURL = new URL(astroBase + 'sitemap.xml', url.origin);
  // 裸 new Response(text) 会让响应体没有 Content-Type，靠客户端猜；RFC 9309 规定 robots.txt 是 text/plain。
  return new Response(getRobotsTxt(sitemapURL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
