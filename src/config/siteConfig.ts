// 站点配置（原 api /api/settings 导出，纯静态化后在此维护）
import avatarImg from '../assets/img/ico.jpg';
import faviconImg from '../assets/img/fox.png';

export const siteConfig = {
  title: 'Cyanvir',
  // 站点正式域名，决定全站 canonical/og:url/sitemap/robots 的绝对地址。
  // 留空时回退 SITE_URL 环境变量，两者皆空为 localhost。
  url: 'http://localhost:4321',
  description: '一个使用 Astro构建的个人博客',
  // 站点图标（favicon/logo/OG 图共用）：src/assets 图片
  favicon: faviconImg,
  siteStartDate: '2026-08-30',
  postsPerPage: 9,
  // SEO：站点级 keywords（<meta name="keywords">，可留空）
	keywords: [
		"Cyanvir",
		"AI",
		"Astro",
		"博客",
		"hexo",
		"静态博客",
	],
  // SEO：每篇文章构建期生成 1200×630 OG 分享图（satori + sharp）
  generateOgImages: true,
  // 友链检测 / 朋友圈数据源（Friend-Circle-Lite）
  //friendCircleApi: 'https://fc.mccsjs.cn/',
  // 友链页 markdown 区块
linkMarkdown: `
## 添加友链前，确保您符合以下条件
* 已添加本博客的友情链接
* 网站内容积极向上正能量并符合中华人民共和国法律
* 网站可以在 1 分钟内加载完成首屏
***

添加本站：

\`\`\`yaml
name: 你的博客名
url: http://localhost:4321
description: 你的博客描述
avatar: 你的头像图片地址
screenshot: 你的截图地址
rss: 你的rss地址
\`\`\`

\`\`\`yaml
  站点名称：你的博客名
  站点地址：http://localhost:4321
  头像链接：你的头像图片地址
  站点描述：你的博客描述
  站点截图：你的截图地址
  RSS: 你的rss地址
\`\`\`
`,
  // hero（src/assets/images）
  heroImage: 'images/hero.webp',
  // 管理员（关于页标识）
  // 分类与标签：不再手写配置，由文章 frontmatter 自动聚合（见 utils/data.ts 的 getCategories/getTags）
  // 站长资料（首页侧栏资料卡）：avatar 留空则用名称首字母
  author: {
    name: 'Cyanvir',
    bio: '记录生活',
    avatar: avatarImg,
    // 侧栏资料卡社交图标：{ name, url, icon }
    // icon 支持：内置名 github/wechat/qq/bilibili/email/rss/twitter；
    // 或本地图片路径 /images/social/xxx.svg；或完整 URL
    socials: [
      { name: 'GitHub', url: 'https://github.com/Cyanvir297', icon: 'line-md:github-twotone' },
      { name: 'Bilibili', url: 'https://space.bilibili.com/2025605944', icon: 'thesvg-color:bilibili' },
    ],
  },
  // 首页 hero 社交图标栏：JSON 数组 [{icon, href}]，icon 为 simpleicons 名或完整 URL；留空则隐藏
  titleIcons: '',
  // 侧栏公告卡：域名信息（逐行展示，label 后接可点击域名）
  announcementLinks: [],
  // 侧栏公告卡附加正文（支持简单 HTML），可选；不填则不显示
  announcement: '',
} as const;
