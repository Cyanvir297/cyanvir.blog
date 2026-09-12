// 页脚配置（菜单 / 格言 / 徽章 / 仪表盘）
export const footerConfig = {
  menus: [] as { id: string; label: string; href: string; sortOrder: number; icon: string }[],
  showMotto: false,
  mottoTitle: '',
  mottoText: '',
  mottoCtaText: '',
  mottoCtaUrl: '',
  mottoCtaTarget: '_blank',
  footerBadges: JSON.stringify([
    { title: '博客框架为Astro', href: 'https://astro.build', img: 'https://img.shields.io/badge/Astro-BC52EE?style=flat&logo=astro&logoColor=fff' },
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
