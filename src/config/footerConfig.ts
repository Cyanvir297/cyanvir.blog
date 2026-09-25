// 页脚配置（徽章 / 仪表盘）
// 已删：menus（页脚菜单，getMenus('FOOTER') 无调用方、Footer 也无渲染代码）
// 与 showMotto / motto* 六键（映射进 SiteSettings 后无任何读取方）。要恢复见 git 历史。
export const footerConfig = {
  footerBadges: JSON.stringify([
    {
      title: '博客框架为Astro',
      href: 'https://astro.build',
      img: 'https://img.shields.io/badge/Astro-BC52EE?style=flat&logo=astro&logoColor=fff',
    },
  ]),

  // ===== 仪表盘长条（脚页顶部）=====
  // 技术栈徽标：{ name, color } 数组
  dashboardBadges: [],
  // ICP 备案信息（仪表盘右侧可点击链接）
  icpConfig: {
    name: '萌ICP备20260297号',
    link: 'https://icp.gov.moe/?keyword=20260297',
  } as { name: string; link: string },
};
