// @ts-check
import swup from "@swup/astro";
import react from "@astrojs/react";
import lenis from "astro-lenis";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/config/siteConfig.ts";

export default defineConfig({
  // 站点 URL：配置优先，其次 SITE_URL 环境变量，最后 localhost
  site: siteConfig.url || process.env.SITE_URL || "http://localhost:4321",
  // 增量构建
  experimental: {
    incrementalBuild: true,
  },
  // Sätteri 为 Astro 7 默认 Markdown 管线；此处显式启用 Shiki 双主题高亮
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  },
  // GitHub Pages 子路径部署时通过 ASTRO_BASE 环境变量指定
  base: process.env.ASTRO_BASE || "/",
  // 顶层 server.host 控制 Astro 开发服务器的监听地址（vite.server.host 只管 vite 中间件，
  // 管不到 Astro 自己的 HTTP 监听）。设 true 绑定 0.0.0.0，确保 IPv4 的 127.0.0.1 也能访问，
  // 否则新版 Node 把 localhost 优先解析成 IPv6 ::1，浏览器走 IPv4 会连不上。
  server: {
    host: true,
  },
  integrations: [
    swup({
      theme: false,
      animationClass: "transition-swup-",
      containers: ["#swup-container"],
      smoothScrolling: false,
      preload: { hover: true, visible: false },
      accessibility: true,
      updateHead: { persistAssets: true },
      updateBodyClass: false,
      globalInstance: true,
      // 下面是两处 @swup/astro 上游类型缺陷，运行时行为都正确，故用 @ts-expect-error 压掉：
      // 1. reloadScripts 被误标为 boolean，实际透传给 @swup/scripts-plugin，
      //    支持 { head, body, optin } 对象形式（默认值 {head:true,body:true,optin:false}）。
      // 2. resolveUrl 是 swup 的合法选项，但 Options 类型里漏掉了它。
      //    保持恒等映射很重要：设了 ASTRO_BASE 子路径时不能让它走 swup 默认的 base 解析。
      // @ts-expect-error @swup/astro 上游类型缺陷（1）
      reloadScripts: { optin: true },
      // @ts-expect-error @swup/astro 上游类型缺陷（2）
      resolveUrl: (url) => url,
      animateHistoryBrowsing: false,
      // 留言板是重 React 应用，Swup 切页时 Astro island 不会重新 hydrate（reloadScripts optin
      // 不重载 astro-island 定义脚本，customElements 未注册 → 永远停在骨架）。走整页导航。
      ignore: ["/comments"],
    }),
    react(),
    lenis(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['localhost', '127.0.0.1'],
    },
  },
});
