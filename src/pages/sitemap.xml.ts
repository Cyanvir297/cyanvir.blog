import type { APIRoute } from 'astro';
import { base as astroBase } from 'astro:config/server';
import { getAllPosts, getCategories, getTags } from '../utils/data';

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'posts', priority: '0.9', changefreq: 'daily' },
  { path: 'archive', priority: '0.8', changefreq: 'weekly' },
  { path: 'categories', priority: '0.7', changefreq: 'weekly' },
  { path: 'tags', priority: '0.7', changefreq: 'weekly' },
  { path: 'link', priority: '0.6', changefreq: 'weekly' },
  { path: 'about', priority: '0.7', changefreq: 'weekly' },
  { path: 'contact', priority: '0.7', changefreq: 'weekly' },
  { path: 'privacy', priority: '0.4', changefreq: 'monthly' },
  { path: 'comments', priority: '0.3', changefreq: 'monthly' },
  { path: 'fc', priority: '0.3', changefreq: 'monthly' },
  { path: 'atom.xml', priority: '0.2', changefreq: 'daily' },
  { path: 'llms.txt', priority: '0.2', changefreq: 'monthly' },
  { path: 'friend.json', priority: '0.2', changefreq: 'weekly' },
];

export const GET: APIRoute = async ({ url }) => {
  // url.origin 不含 base 前缀：设了 ASTRO_BASE 子路径部署时，直接用它拼 loc 会丢掉前缀，
  // 搜索引擎按 sitemap 爬到的全是 404。
  const base = new URL(astroBase, url.origin).href.replace(/\/$/, '');

  // 动态文章页面
  const posts = await getAllPosts();
  const postUrls: { path: string; lastmod: string }[] = posts.map((p) => ({
    path: `posts/${p.slug}`,
    lastmod: new Date(+p.updatedAt * 1000).toISOString(),
  }));

  // 动态分类页面
  const categoryUrls = (await getCategories()).map((c) => ({ path: `categories/${c.slug}` }));

  // 动态标签页面
  const tagUrls = (await getTags()).map((t) => ({ path: `tags/${t.slug}` }));

  // 四个来源字段各不相同，不加显式类型时字面量会被推成 3 个互斥对象类型的联合，
  // 后面读 u.lastmod / u.changefreq 就报 ts(2339)。
  const urls: { loc: string; priority: string; lastmod?: string; changefreq?: string }[] = [
    ...STATIC_PAGES.map((p) => ({
      loc: `${base}/${p.path}`.replace(/\/$/, '') || base,
      priority: p.priority,
      changefreq: p.changefreq,
    })),
    ...postUrls.map((p) => ({
      loc: `${base}/${p.path}`,
      priority: '0.6',
      lastmod: p.lastmod,
    })),
    ...categoryUrls.map((c) => ({
      loc: `${base}/${c.path}`,
      priority: '0.5',
    })),
    ...tagUrls.map((t) => ({
      loc: `${base}/${t.path}`,
      priority: '0.5',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
