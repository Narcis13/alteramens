// Semnal Reply Radar — X.com timeline scanner.
// Highlights posts from sweet-spot targets with pilon badge + "Draft reply" button.
// Human-in-loop: the button opens a drawer; nothing posts automatically.

(function () {
  if (window.__semnalRadarLoaded) return;
  window.__semnalRadarLoaded = true;

  // ─── state ─────────────────────────────────────────────────────────────
  let enabled = true;
  let targetsByHandle = new Map(); // lowercase handle -> { pillar, angle }
  let observer = null;
  let hud = null;

  // ─── boot ──────────────────────────────────────────────────────────────
  init();

  async function init() {
    const [targets, radarState] = await Promise.all([
      messageBg({ type: 'semnal:get-targets' }),
      messageBg({ type: 'semnal:radar-enabled' })
    ]);

    if (targets && targets.ok) {
      for (const t of targets.targets) {
        targetsByHandle.set(String(t.handle).toLowerCase(), t);
      }
    }
    enabled = radarState && radarState.ok ? !!radarState.enabled : true;

    installHud();
    if (enabled) startObserving();
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== 'semnal:radar-toggle') return;
    enabled = !!msg.enabled;
    hud && hud.setAttribute('data-enabled', enabled ? 'true' : 'false');
    if (enabled) {
      startObserving();
      scanAll();
    } else {
      stopObserving();
      clearHighlights();
    }
  });

  // ─── HUD toggle ────────────────────────────────────────────────────────
  function installHud() {
    hud = document.createElement('div');
    hud.className = 'semnal-radar-hud';
    hud.setAttribute('data-enabled', enabled ? 'true' : 'false');
    hud.title = 'Click to toggle Reply Radar (Alt+Shift+R)';
    updateHudText();
    hud.addEventListener('click', async () => {
      enabled = !enabled;
      hud.setAttribute('data-enabled', enabled ? 'true' : 'false');
      if (enabled) { startObserving(); scanAll(); }
      else { stopObserving(); clearHighlights(); }
      updateHudText();
    });
    document.documentElement.appendChild(hud);
  }

  function updateHudText() {
    if (!hud) return;
    const n = document.querySelectorAll('article[data-semnal-radar]').length;
    hud.textContent = enabled ? `⦿ Radar · ${n} hit${n === 1 ? '' : 's'}` : '⦾ Radar off';
  }

  // ─── observer ──────────────────────────────────────────────────────────
  function startObserving() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches && node.matches('article[data-testid="tweet"]')) {
            processArticle(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('article[data-testid="tweet"]').forEach(processArticle);
          }
        }
      }
      updateHudText();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    scanAll();
  }

  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function scanAll() {
    document.querySelectorAll('article[data-testid="tweet"]').forEach(processArticle);
    updateHudText();
  }

  function clearHighlights() {
    document.querySelectorAll('article[data-semnal-radar]').forEach((a) => {
      a.removeAttribute('data-semnal-radar');
      a.querySelectorAll('.semnal-radar-badge, .semnal-draft-btn').forEach((el) => el.remove());
    });
    updateHudText();
  }

  // ─── per-article processing ───────────────────────────────────────────
  function processArticle(article) {
    if (!article || article.dataset.semnalProcessed === '1') return;

    const info = extractTweet(article);
    if (!info || !info.handle) return;

    const target = targetsByHandle.get(info.handle.toLowerCase());
    if (!target) {
      article.dataset.semnalProcessed = '1';
      return;
    }

    article.setAttribute('data-semnal-radar', target.pillar || 'P1');
    article.dataset.semnalProcessed = '1';

    addBadge(article, target, info);
    addDraftButton(article, target, info);
  }

  function addBadge(article, target, info) {
    if (article.querySelector('.semnal-radar-badge')) return;
    const badge = document.createElement('span');
    badge.className = 'semnal-radar-badge';
    badge.setAttribute('data-pillar', target.pillar || 'P1');
    const hotness = scoreHotness(info);
    const hotTag = hotness ? `<span class="semnal-hot">${hotness}</span>` : '';
    badge.innerHTML = `${target.pillar || '—'} · ${escapeHtml(target.angle || '')} ${hotTag}`;
    article.appendChild(badge);
  }

  function addDraftButton(article, target, info) {
    if (article.querySelector('.semnal-draft-btn')) return;
    const actionBar = article.querySelector('[role="group"]');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'semnal-draft-btn';
    btn.textContent = '✎ Draft reply';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDrawer(info, target);
    });
    const container = actionBar && actionBar.parentElement ? actionBar.parentElement : article;
    container.appendChild(btn);
  }

  // ─── DOM extraction ────────────────────────────────────────────────────
  function extractTweet(article) {
    try {
      const userNameEl = article.querySelector('[data-testid="User-Name"]');
      let handle = null;
      if (userNameEl) {
        const anchors = userNameEl.querySelectorAll('a[href^="/"]');
        for (const a of anchors) {
          const href = a.getAttribute('href') || '';
          const m = href.match(/^\/([^\/?#]+)(?:\/?.*)?$/);
          if (m && !['home', 'explore', 'notifications', 'messages', 'i'].includes(m[1])) {
            handle = m[1];
            break;
          }
        }
      }

      let permalink = null;
      const timeAnchor = article.querySelector('a[href*="/status/"]');
      if (timeAnchor) {
        const href = timeAnchor.getAttribute('href');
        if (href) permalink = href.startsWith('http') ? href : `https://x.com${href}`;
      }

      let text = '';
      const textEl = article.querySelector('[data-testid="tweetText"]');
      if (textEl) text = textEl.innerText || textEl.textContent || '';

      const replies = parseMetric(article.querySelector('[data-testid="reply"]'));
      const likes   = parseMetric(article.querySelector('[data-testid="like"]'));
      const reposts = parseMetric(article.querySelector('[data-testid="retweet"]'));

      const timeEl = article.querySelector('time[datetime]');
      const datetime = timeEl ? timeEl.getAttribute('datetime') : null;
      const ageMinutes = datetime ? Math.max(0, (Date.now() - new Date(datetime).getTime()) / 60000) : null;

      return { handle, permalink, text: text.trim(), replies, likes, reposts, ageMinutes };
    } catch (err) {
      console.warn('[semnal radar] extract failed', err);
      return null;
    }
  }

  function parseMetric(el) {
    if (!el) return 0;
    const t = (el.innerText || el.textContent || '').trim();
    if (!t) return 0;
    // Matches "1,234", "1.2K", "2M", "47"
    const m = t.match(/([\d,.]+)\s*([KMB])?/i);
    if (!m) return 0;
    let n = parseFloat(m[1].replace(/,/g, ''));
    if (!isFinite(n)) return 0;
    const suffix = (m[2] || '').toUpperCase();
    if (suffix === 'K') n *= 1e3;
    else if (suffix === 'M') n *= 1e6;
    else if (suffix === 'B') n *= 1e9;
    return Math.round(n);
  }

  function scoreHotness({ replies, likes, ageMinutes }) {
    // Sweet spot per growth doc §5.4:
    //   HOT  = first hour AND >100 likes AND <50 replies (algo-priming window)
    //   WARM = <3h AND >50 likes AND <100 replies
    if (ageMinutes == null) return '';
    if (ageMinutes <= 60 && likes > 100 && replies < 50) return 'HOT';
    if (ageMinutes <= 180 && likes > 50 && replies < 100) return 'WARM';
    return '';
  }

  // ─── drawer UI (draft reply) ───────────────────────────────────────────
  let drawer = null;

  function openDrawer(info, target) {
    ensureDrawer();
    const root = drawer.root;
    root.setAttribute('data-open', 'true');
    drawer.targetInfo.setAttribute('data-pillar', target.pillar || 'P1');
    drawer.targetInfo.textContent =
      `@${info.handle} · pilon ${target.pillar} — "${target.angle || 'no angle registered'}"`;
    drawer.quoted.textContent = info.text || '(post text unavailable — fetch from the URL below)';
    drawer.meta.textContent = formatMeta(info);
    drawer.url.textContent = info.permalink || '(no URL)';
    drawer.url.href = info.permalink || '#';
    drawer.thought.value = '';
    drawer.preview.textContent = buildCommand(info.permalink, '');
    drawer.thought.oninput = () => {
      drawer.preview.textContent = buildCommand(info.permalink, drawer.thought.value);
    };
    drawer.copyBtn.onclick = () => {
      const cmd = buildCommand(info.permalink, drawer.thought.value);
      copy(cmd);
      showToast('Copied /semnal-reply command → paste în Claude Code');
    };
    drawer.copyThoughtBtn.onclick = () => {
      copy(drawer.thought.value || '');
      showToast('Copied thought to clipboard');
    };
    drawer.openXBtn.onclick = () => {
      if (info.permalink) window.open(info.permalink, '_blank', 'noopener');
    };
    setTimeout(() => drawer.thought.focus(), 60);
  }

  function ensureDrawer() {
    if (drawer) return;
    const root = document.createElement('div');
    root.id = 'semnal-drawer-root';
    root.setAttribute('data-open', 'false');

    const backdrop = document.createElement('div');
    backdrop.className = 'semnal-drawer-backdrop';
    backdrop.addEventListener('click', closeDrawer);

    const panel = document.createElement('div');
    panel.className = 'semnal-drawer';

    const dismiss = document.createElement('button');
    dismiss.className = 'semnal-dismiss';
    dismiss.innerHTML = '×';
    dismiss.addEventListener('click', closeDrawer);

    const h3 = document.createElement('h3');
    h3.textContent = 'Draft reply';

    const targetInfo = document.createElement('div');
    targetInfo.className = 'semnal-target-info';

    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'Post URL';
    const url = document.createElement('a');
    url.target = '_blank';
    url.rel = 'noopener';
    url.style.fontSize = '12px';
    url.style.wordBreak = 'break-all';
    url.style.color = '#4f46e5';

    const metaLabel = document.createElement('label');
    metaLabel.textContent = 'Signals';
    const meta = document.createElement('div');
    meta.style.fontSize = '12px';
    meta.style.color = '#444';

    const qLabel = document.createElement('label');
    qLabel.textContent = 'Original post';
    const quoted = document.createElement('div');
    quoted.className = 'semnal-quoted';

    const tLabel = document.createElement('label');
    tLabel.textContent = 'Gândul tău (RO, brut — skill-ul traduce)';
    const thought = document.createElement('textarea');
    thought.placeholder = 'ex: asta mă duce cu gândul la cum folosesc skills în spital; unghi de senior 386→Claude';

    const pLabel = document.createElement('label');
    pLabel.textContent = 'Claude Code command (auto-updates)';
    const preview = document.createElement('div');
    preview.className = 'semnal-preview';

    const actions = document.createElement('div');
    actions.className = 'semnal-actions';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'semnal-primary';
    copyBtn.textContent = 'Copy /semnal-reply';
    const copyThoughtBtn = document.createElement('button');
    copyThoughtBtn.textContent = 'Copy thought only';
    const openXBtn = document.createElement('button');
    openXBtn.textContent = 'Open post on X';
    actions.appendChild(copyBtn);
    actions.appendChild(copyThoughtBtn);
    actions.appendChild(openXBtn);

    const toast = document.createElement('div');
    toast.className = 'semnal-toast';

    panel.appendChild(dismiss);
    panel.appendChild(h3);
    panel.appendChild(targetInfo);
    panel.appendChild(urlLabel); panel.appendChild(url);
    panel.appendChild(metaLabel); panel.appendChild(meta);
    panel.appendChild(qLabel); panel.appendChild(quoted);
    panel.appendChild(tLabel); panel.appendChild(thought);
    panel.appendChild(pLabel); panel.appendChild(preview);
    panel.appendChild(actions);
    panel.appendChild(toast);

    root.appendChild(backdrop);
    root.appendChild(panel);
    document.documentElement.appendChild(root);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.getAttribute('data-open') === 'true') {
        closeDrawer();
      }
    });

    drawer = { root, targetInfo, quoted, meta, url, thought, preview, copyBtn, copyThoughtBtn, openXBtn, toast };
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.root.setAttribute('data-open', 'false');
  }

  function showToast(msg) {
    if (!drawer) return;
    drawer.toast.textContent = msg;
    drawer.toast.classList.add('semnal-show');
    setTimeout(() => drawer.toast.classList.remove('semnal-show'), 1600);
  }

  function buildCommand(url, thought) {
    const u = url || '<url>';
    const t = (thought || '').trim() || '<gândul tău aici>';
    return `/semnal-reply ${u} ${t}`;
  }

  function formatMeta(info) {
    const bits = [];
    if (info.ageMinutes != null) {
      bits.push(info.ageMinutes < 60
        ? `${Math.round(info.ageMinutes)}m ago`
        : info.ageMinutes < 1440
          ? `${Math.round(info.ageMinutes / 60)}h ago`
          : `${Math.round(info.ageMinutes / 1440)}d ago`);
    }
    bits.push(`♥ ${info.likes || 0}`);
    bits.push(`💬 ${info.replies || 0}`);
    if (info.reposts) bits.push(`↻ ${info.reposts}`);
    return bits.join(' · ');
  }

  // ─── utils ─────────────────────────────────────────────────────────────
  function messageBg(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (resp) => resolve(resp));
    });
  }

  function copy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch (_) {
      navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
