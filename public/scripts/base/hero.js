// 首页 hero 打字机：洗牌后逐句轮播，逐字打出 → 停留 → 逐字删掉 → 下一句。
// 由 entry.js 在「首页存在 #typewriter-text 时」按需 import；本文件用
// registerInit 注册，于是首屏和每次 Swup 切页后的 runInits() 都会调它。
//
// 文案入口：index.astro 在构建期把 heroSentences 序列化成 #typewriter-text 的
// data-sentences 属性，这里 JSON.parse 回来。原实现是经 define:vars 把整个数组
// 注进页面内联 <script is:inline> —— 那会让 astro check 把整段原生 JS 当
// TypeScript 解析，报出 100+ 个 Cannot find name / Unexpected token 误报。
// 挪到本文件后误报归零，且不再依赖 Swup 是否重新执行页面内联脚本（见 archive.js 头部注释）。
import { registerInit } from './registry.js';

(function () {
  'use strict';

  // 从 #typewriter-text 的 data-sentences 读文案。
  // index.astro 用 JSON.stringify 写入、Astro 会做 HTML 实体转义，浏览器读
  // dataset 时自动还原，所以这里 JSON.parse 拿到的就是原始数组。
  // 解析失败或不是数组一律返回 [] —— initHero 里的 FALLBACK_SENTENCES 会兜底，
  // 保证首页不会空白。
  function readSentences(el) {
    try {
      var parsed = JSON.parse(el.dataset.sentences || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function initHero() {
    // 代次机制：每次脚本运行时递增，旧实例的回调发现代次不匹配就自动退出
    window.__twGen = (window.__twGen || 0) + 1;
    var myGen = window.__twGen;

    var textEl = document.getElementById('typewriter-text');
    if (!textEl) return;

    var SENTENCES = readSentences(textEl);
    var TYPING_SPEED = 120;
    var DELETING_SPEED = 60;
    var PAUSE_AFTER_TYPE = 3000;
    var PAUSE_BEFORE_START = 600;

    var mainText = '';
    var sourceText = '';
    var mainLines = null;
    var displayMain = '';
    var displaySource = '';
    var phase = 'typing-main';

    function isStale() {
      return window.__twGen !== myGen;
    }

    // 兜底句：heroSentences 配置为空或用不了时用，避免首页空白
    var FALLBACK_SENTENCES = [
      { main: '活在珍贵的人间', source: '' },
      { main: '探索技术的边界', source: '' },
      { main: '记录生活的点滴', source: '' },
    ];

    // 播放队列：洗牌后依次取用，全部轮完才重新洗牌——避免删完立刻复读同一句
    var playQueue = [];
    var lastMain = typeof window.__twLastMain === 'string' ? window.__twLastMain : '';

    function nextSentence() {
      var pool = SENTENCES.length > 0 ? SENTENCES : FALLBACK_SENTENCES;
      if (playQueue.length === 0) {
        playQueue = pool.slice();
        for (var i = playQueue.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var swap = playQueue[i];
          playQueue[i] = playQueue[j];
          playQueue[j] = swap;
        }
      }
      var pick = playQueue.shift();
      // 队首正好是刚播完的那句（含软路由重跑时继承的上一句）时挪到队尾
      if (pool.length > 1 && pick.main === lastMain) {
        playQueue.push(pick);
        pick = playQueue.shift();
      }
      lastMain = pick.main;
      window.__twLastMain = pick.main;
      return pick;
    }

    // 按预设的 lines 方案分行：有 lines 时按配置换行，无 lines 时整句一行
    // text 是当前已打出的前缀，只在打到断点位置才插 <br>
    function appendPoem(parent, text, lines) {
      if (!lines || lines.length <= 1) {
        if (text) parent.appendChild(document.createTextNode(text));
        return;
      }
      var breakAt = {}, pos = 0, li;
      for (li = 0; li < lines.length - 1; li++) {
        pos += lines[li].length;
        breakAt[pos] = true; // 1-indexed：第 pos 个字之后换行
      }
      var buf = '';
      for (var i = 0; i < text.length; i++) {
        buf += text.charAt(i);
        if (breakAt[i + 1]) {
          parent.appendChild(document.createTextNode(buf));
          parent.appendChild(document.createElement('br'));
          buf = '';
        }
      }
      if (buf) parent.appendChild(document.createTextNode(buf));
    }

    function render() {
      textEl.textContent = '';
      var mainSpan = document.createElement('span');
      appendPoem(mainSpan, displayMain, mainLines);
      textEl.appendChild(mainSpan);
      if (sourceText && displaySource.length > 0) {
        textEl.appendChild(document.createElement('br'));
        var srcSpan = document.createElement('span');
        srcSpan.className = 'type-source';
        srcSpan.textContent = displaySource;
        textEl.appendChild(srcSpan);
      }
    }

    function tick() {
      if (isStale()) return;
      if (phase === 'typing-main') {
        if (displayMain.length < mainText.length) {
          displayMain = mainText.slice(0, displayMain.length + 1);
          render();
          window.__twTimer = setTimeout(tick, TYPING_SPEED);
        } else {
          phase = sourceText ? 'typing-source' : 'paused';
          window.__twTimer = setTimeout(tick, 400);
        }
      } else if (phase === 'typing-source') {
        if (displaySource.length < sourceText.length) {
          displaySource = sourceText.slice(0, displaySource.length + 1);
          render();
          window.__twTimer = setTimeout(tick, TYPING_SPEED);
        } else {
          phase = 'paused';
          window.__twTimer = setTimeout(tick, PAUSE_AFTER_TYPE);
        }
      } else if (phase === 'paused') {
        phase = 'deleting';
        window.__twTimer = setTimeout(tick, 0);
      } else if (phase === 'deleting') {
        if (displaySource.length > 0) {
          displaySource = displaySource.slice(0, -1);
          render();
          window.__twTimer = setTimeout(tick, DELETING_SPEED);
        } else if (displayMain.length > 0) {
          displayMain = displayMain.slice(0, -1);
          render();
          window.__twTimer = setTimeout(tick, DELETING_SPEED);
        } else {
          // 这一轮删完换下一句，而不是重复刚播过的那句
          var next = nextSentence();
          mainText = next.main;
          sourceText = next.source;
          mainLines = next.lines || null;
          displayMain = '';
          displaySource = '';
          phase = 'typing-main';
          window.__twTimer = setTimeout(tick, PAUSE_BEFORE_START);
        }
      }
    }

    function init() {
      var result = nextSentence();
      mainText = result.main;
      sourceText = result.source;
      mainLines = result.lines || null;
      displayMain = '';
      displaySource = '';
      phase = 'typing-main';
      tick();
    }

    // 清除旧实例的定时器
    if (window.__twTimer) clearTimeout(window.__twTimer);

    init();
  }

  registerInit('hero-typewriter', initHero);
}());
