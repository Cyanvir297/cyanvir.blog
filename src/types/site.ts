// 只声明 siteConfig / footerConfig / commentConfig 里真实存在的键。
// 以下字段在早期版本从上游 api /api/settings 读取，静态化后已删：
//   icp、footerText、fontCssUrl、fontFamily、backgroundImage、heroType、
//   heroVideo、friendCircleApi、adminName、adminEmail、adminBadge
// 要恢复：把键加回 src/config/siteConfig.ts（字体管线与 hero 视频分支的代码也需一并还原，
// 见 git 历史 3d6168b:src/layouts/BaseLayout.astro 与 src/pages/index.astro）。
export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteLogo: string;
  favicon: string;
  siteStartDate: string;
  postsPerPage: string;
  twikooEnvId: string;
  heroImage: string;
  linkMarkdown?: string;
  showMotto?: boolean;
  mottoTitle?: string;
  mottoText?: string;
  mottoCtaText?: string;
  mottoCtaUrl?: string;
  mottoCtaTarget?: string;
  footerBadges?: string;
  keywords?: string;
  generateOgImages?: boolean;
}
