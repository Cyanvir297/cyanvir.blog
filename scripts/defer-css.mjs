// 构建后把 render-blocking CSS 改成异步加载，消除 Lighthouse「渲染阻塞请求」警告。
// astro build 产出 HTML 后再跑，已接在 package.json 的 build 脚本里。
//
// 可重复执行：正常走 pnpm build 时 astro 每次都会重写 HTML，本脚本看到的是干净产物；
// 但单独连跑两次会把 <noscript> 里的兜底 link 也匹配上并嵌套异步标签。
// 所以先按 <noscript> 切段，只处理段外的部分——不引入任何占位符，也就没有
// 「占位符没还原干净」这类风险。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = join(process.cwd(), 'dist');

// 匹配 Astro 生成的 CSS <link>，例如
//   <link rel="stylesheet" href="/_astro/BaseLayout.XXXXXX.css">
// /g 是必须的：一页可能有多个 CSS（/comments 页除 BaseLayout 外还有 chat.css）。
// 参考模板 mccsjs-blog 的同名脚本正则不带 g，只替换第一个匹配，会漏掉第二个。
const CSS_LINK = /<link\s+rel="stylesheet"\s+href="(\/_astro\/[^"]+\.css)"\s*\/?>/g;
// 捕获组是必须的：String.split 遇到没有捕获组的正则会**把分隔符整个丢弃**，
// noscript 段就会消失。加了捕获组，split 才会把匹配到的段放进奇数项。
const NOSCRIPT = /(<noscript>[\s\S]*?<\/noscript>)/g;

// 递归遍历 dist 目录找所有 .html 文件
function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (extname(p) === '.html') files.push(p);
  }
  return files;
}

let fileCount = 0;
let tagCount = 0;

for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf-8');

  // split 后偶数项是「不含 noscript 的片段」，奇数项是 <noscript>...</noscript> 本身。
  // 只改偶数项，兜底 link 原样保留。
  const out = html
    .split(NOSCRIPT)
    .map((part, idx) =>
      idx % 2 === 1
        ? part
        : part.replace(CSS_LINK, (_fullTag, cssUrl) => {
            // 1. preload 提供提前下载线索，浏览器尽早开连
            // 2. media="print" 延迟样式应用，onload 时切回 all —— 样式照样被下载和解析，
            //    只是不再阻塞首屏渲染，这是标准做法不是跳过加载
            // 3. <noscript> 兜底：JS 被禁用时 media="print" 永不切回，必须正常加载
            tagCount++;
            return [
              `<link rel="preload" href="${cssUrl}" as="style">`,
              `<link rel="stylesheet" href="${cssUrl}" media="print" onload="this.media='all'">`,
              `<noscript><link rel="stylesheet" href="${cssUrl}"></noscript>`,
            ].join('\n');
          })
    )
    .join('');

  if (out !== html) {
    writeFileSync(file, out, 'utf-8');
    fileCount++;
  }
}

console.log(`✅ 已对 ${fileCount} 个 HTML 文件的 ${tagCount} 个 CSS 去渲染阻塞化`);
