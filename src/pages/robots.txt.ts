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
  return new Response(getRobotsTxt(sitemapURL));
};
