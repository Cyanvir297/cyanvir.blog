#!/usr/bin/env node

/**
 * Git 自动推送监听脚本
 * 监听文件改动，防抖 3 分钟后自动 commit + push
 *
 * 用法：
 *   node scripts/git-auto-push-watch.js              # 开始监听（阻塞运行）
 *   node scripts/git-auto-push-watch.js now          # 立即执行一次然后退出
 *   node scripts/git-auto-push-watch.js --root <dir> # 指定别的仓库
 *
 * 环境变量：
 *   BLOG_ROOT   项目根目录（优先级低于 --root）
 *   GIT_PUSH    false 则只 commit 不 push
 *   GIT_BRANCH  分支名（默认自动取当前分支）
 *
 * 与参考模板 mccsjs-blog 同名脚本的差异：
 *  1. 根目录不再硬编码 D:\codex\mccsjsblog，改为 --root / BLOG_ROOT / 脚本所在目录
 *     的上一级三级回退，换机器直接用
 *  2. 分支不再硬编码 main，自动取当前分支（GIT_BRANCH 可覆盖）
 *  3. git 命令走 execFileSync 传数组，不经 shell，commit message 里的引号不会被解释
 *  4. 删掉 chokidar 缺失时的 `npm install` 自装：本仓库用 pnpm，npm install 会重新
 *     生成 package-lock.json（已删并加入 .gitignore），这里改为直接报错退出
 *  5. ESM 写法：package.json 是 "type": "module"，.js 里用 require 会直接崩
 */

import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { now: false, root: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === 'now') args.now = true;
    else if (argv[i] === '--root' && argv[i + 1]) args.root = argv[++i];
  }
  return args;
}

const ARGS = parseArgs(process.argv.slice(2));

// 根目录三级回退：--root > BLOG_ROOT > 脚本上一级目录
const ROOT = ARGS.root
  ? path.resolve(ARGS.root)
  : process.env.BLOG_ROOT
    ? path.resolve(process.env.BLOG_ROOT)
    : path.resolve(SCRIPT_DIR, '..');

// 日志写进仓库内 .backup/。⚠️ 本仓库 .gitignore 已忽略 .backup/；
// 若拿这个脚本看别的仓库，先确认 .backup/ 被忽略，否则 `git add .` 会把日志一起提交。
const LOG_PATH = path.join(ROOT, '.backup', 'git-auto-push.log');

// 是否推送到远程仓库：默认开启。GIT_PUSH=false 则只 commit 不 push
const PUSH_ENABLED = (process.env.GIT_PUSH || 'true').toLowerCase() !== 'false';

// 分支：GIT_BRANCH > 当前分支 > main
function currentBranch() {
  if (process.env.GIT_BRANCH) return process.env.GIT_BRANCH;
  try {
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], false);
    if (branch && branch !== 'HEAD') return branch;
  } catch {}
  return 'main';
}

const BRANCH = currentBranch();

// 跳过的目录（按本仓库的 .gitignore 对齐）
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.astro',
  'dist',
  'dist.old',
  '.backup',
  '.vercel',
  '.netlify',
  '.qoder',
  '.workbuddy',
  '.obsidian',
  '.wrangler',
  '.git.backup',
  '.wb-trash',
  'uploads',
  'backend',
]);

// 防抖延迟（ms）：3 分钟无改动才推送
const DEBOUNCE_DELAY = 3 * 60 * 1000;

let timer = null;

/**
 * 执行 git 命令。capture=false 时输出直接透传到终端，此时返回值是 null
 * （不能调 .trim()），调用方也不要读返回值。
 */
function git(args, capture = true) {
  const out = execFileSync('git', args, {
    cwd: ROOT,
    encoding: capture ? 'utf8' : undefined,
    stdio: capture ? 'pipe' : 'inherit',
  });
  return capture ? out.trim() : out;
}

function log(msg) {
  const entry = `[${new Date().toLocaleString('zh-CN')}] ${msg}\n`;
  try {
    mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    appendFileSync(LOG_PATH, entry, 'utf8');
  } catch (e) {
    console.error(`⚠️ 写日志失败: ${e.message}`);
  }
  console.log(msg);
}

function shouldWatch(filePath) {
  const parts = path.relative(ROOT, filePath).split(path.sep);
  return !parts.some((part) => IGNORE_DIRS.has(part));
}

function getAheadCount() {
  try {
    return parseInt(git(['rev-list', '--count', `${BRANCH}..HEAD`], true), 10) || 0;
  } catch {
    return 0;
  }
}

function runGitPush() {
  try {
    const status = git(['status', '-s'], true);
    const ahead = getAheadCount();

    // 既无未提交改动、也无领先远程的提交 -> 跳过
    if (!status && ahead === 0) {
      log('✅ 没有未提交改动，跳过推送');
      return;
    }

    if (status) {
      log('📝 发现未提交改动，开始推送...');
      log(`改动文件：\n${status}`);

      git(['add', '.'], false);

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5);
      // 用数组传参，不走 shell，中文与引号都不需要转义
      git(['commit', '-m', `chore: 自动备份 ${dateStr} ${timeStr}`], false);
    } else {
      // 改动已提交但上次 push 失败，仅补推
      log('📝 存在已提交但未推送的改动，直接推送...');
    }

    if (!PUSH_ENABLED) {
      log('🔒 已按配置关闭远程推送（GIT_PUSH=false），仅保留本地 commit');
      log('✅ Git 自动备份（本地）完成！\n');
      return;
    }

    log('📥 拉取远程更新...');
    try {
      git(['pull', 'origin', BRANCH, '--no-edit'], false);
    } catch (e) {
      log(`⚠️ git pull 失败，继续推送：${e.message}`);
    }

    log('📤 推送到远程...');
    git(['push', 'origin', BRANCH], false);

    log('✅ Git 自动推送完成！\n');
  } catch (e) {
    log(`❌ Git 自动推送失败：${e.message}\n`);
  }
}

function schedulePush() {
  if (timer) clearTimeout(timer);
  log(`⏳ 检测到文件改动，${DEBOUNCE_DELAY / 60000} 分钟无新改动后自动推送...`);
  timer = setTimeout(() => {
    timer = null;
    runGitPush();
  }, DEBOUNCE_DELAY);
}

async function watch() {
  let chokidar;
  try {
    ({ default: chokidar } = await import('chokidar'));
  } catch {
    console.error('❌ 缺少 chokidar 依赖，无法监听文件改动');
    console.error('   请运行: pnpm add -D chokidar');
    console.error('   （不在此自动安装：本仓库用 pnpm，npm install 会重新生成 package-lock.json）');
    process.exit(1);
  }

  console.log('\n👀 Git 自动推送监听已启动');
  console.log(`   项目目录: ${ROOT}`);
  console.log(`   分支:     ${BRANCH}`);
  console.log(`   防抖延迟: ${DEBOUNCE_DELAY / 60000} 分钟`);
  console.log(`   远程推送: ${PUSH_ENABLED ? '开启' : '关闭（仅本地 commit）'}`);
  console.log(`   日志文件: ${LOG_PATH}`);
  console.log('   Ctrl+C 停止\n');

  log('✅ Git 自动推送监听已启动');

  const watcher = chokidar.watch('.', {
    cwd: ROOT,
    ignored: (p) => {
      const parts = path.relative(ROOT, p).split(path.sep);
      return parts.some((part) => IGNORE_DIRS.has(part));
    },
    ignoreInitial: true,
    persistent: true,
    // Windows 下编辑器常分多次写入，等文件稳定后再触发，避免连发
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    depth: 99,
  });

  watcher
    .on('ready', () => {
      log('👀 文件监听已就绪');
      // 启动兜底：若有已提交但未推送的提交（如上次 push 失败），直接补推
      let statusClean = true;
      try {
        statusClean = git(['status', '-s'], true) === '';
      } catch {}
      if (statusClean && getAheadCount() > 0) {
        if (PUSH_ENABLED) {
          log('🔄 启动兜底：检测到本地有未推送提交，补推中...');
          runGitPush();
        } else {
          log('🔒 远程推送已关闭，本地存在未推送提交，已跳过');
        }
      }
    })
    .on('add', (filePath) => {
      if (shouldWatch(path.join(ROOT, filePath))) schedulePush();
    })
    .on('change', (filePath) => {
      if (shouldWatch(path.join(ROOT, filePath))) schedulePush();
    })
    .on('unlink', () => schedulePush())
    .on('error', (err) => log(`❌ 监听错误: ${err.message || err}`));

  process.on('SIGINT', () => {
    log('🛑 停止监听');
    watcher.close();
    if (timer) clearTimeout(timer);
    process.exit(0);
  });
}

if (ARGS.now) {
  runGitPush();
  process.exit(0);
}

watch();
