// Semnal capture overlay — injected on every page.
// Shows a modal for: selection / thought / pilon. Sends the entry to the
// service worker (which persists + notifies). Falls back to clipboard on failure.

(function () {
  if (window.__semnalOverlayLoaded) return;
  window.__semnalOverlayLoaded = true;

  const { suggestPillar, DEFAULT_PILLARS } = (window.SemnalPillars || {});
  const { nowStamp, formatEntry } = (window.SemnalFormatter || {});

  let currentPanel = null;

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== 'semnal:open-capture-overlay') return;
    const selection = msg.selection || String(window.getSelection() || '');
    openOverlay(selection);
    sendResponse({ ok: true });
  });

  function openOverlay(initialSelection) {
    if (currentPanel) {
      close();
    }
    const pillars = DEFAULT_PILLARS; // sync default; options page is source of truth for persistence
    chrome.runtime.sendMessage({ type: 'semnal:get-pillars' }, (resp) => {
      const list = (resp && resp.ok && resp.pillars) ? resp.pillars : pillars;
      render(initialSelection, list);
    });
  }

  function render(initialSelection, pillars) {
    const root = document.createElement('div');
    root.className = 'semnal-overlay-root';
    root.setAttribute('data-semnal-overlay', 'true');

    const backdrop = document.createElement('div');
    backdrop.className = 'semnal-overlay-backdrop';
    backdrop.addEventListener('click', close);

    const panel = document.createElement('div');
    panel.className = 'semnal-overlay-panel';
    panel.addEventListener('click', (e) => e.stopPropagation());

    const header = document.createElement('div');
    header.className = 'semnal-overlay-header';
    const h3 = document.createElement('h3');
    h3.textContent = 'Semnal — capture';
    const meta = document.createElement('span');
    meta.className = 'semnal-meta';
    meta.textContent = `${hostOf(location.href)} · ${nowStamp()}`;
    header.appendChild(h3);
    header.appendChild(meta);

    const selLabel = document.createElement('div');
    selLabel.className = 'semnal-label';
    selLabel.textContent = 'Selection / quote';
    const selArea = document.createElement('textarea');
    selArea.rows = 4;
    selArea.placeholder = 'Quote pe care vrei să-l capturezi (opțional)…';
    selArea.value = initialSelection || '';

    const thLabel = document.createElement('div');
    thLabel.className = 'semnal-label';
    thLabel.textContent = 'Gândul tău (RO / EN / mix)';
    const thArea = document.createElement('textarea');
    thArea.rows = 3;
    thArea.placeholder = 'De ce contează asta? Ce riff ai? (opțional, dar util la draft)';

    const suggested = suggestPillar ? suggestPillar(initialSelection, pillars) : null;
    const suggestion = document.createElement('p');
    suggestion.className = 'semnal-suggestion-note' + (suggested ? '' : ' semnal-muted');
    suggestion.textContent = suggested
      ? `Suggested pilon: ${suggested.key} — ${suggested.label} · (Alt+${indexOfPillar(pillars, suggested) + 1})`
      : 'Alege un pilon (sau Alt+0 pentru unassigned).';

    const pillarRow = document.createElement('div');
    pillarRow.className = 'semnal-pillar-row';
    const pillarOptions = [...pillars, { key: null, label: 'unassigned' }];
    pillarOptions.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'semnal-pillar-btn';
      if (suggested && p.key === suggested.key) btn.classList.add('semnal-suggested');
      const prefix = p.key
        ? `<span class="semnal-pillar-key">${p.key}</span>${escapeHtml(p.label)}`
        : `<span class="semnal-pillar-key">—</span>unassigned`;
      const shortcut = i < 3 ? `Alt+${i + 1}` : 'Alt+0';
      btn.innerHTML = `${prefix}<span class="semnal-shortcut">${shortcut}</span>`;
      btn.addEventListener('click', () => submit(p, selArea.value, thArea.value));
      pillarRow.appendChild(btn);
    });

    const footer = document.createElement('div');
    footer.className = 'semnal-footer';
    const hint = document.createElement('span');
    hint.className = 'semnal-hint';
    hint.textContent = 'Esc pentru cancel · Alt+1/2/3 pentru pilon · Alt+0 pentru unassigned';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', close);
    footer.appendChild(hint);
    footer.appendChild(cancelBtn);

    panel.appendChild(header);
    panel.appendChild(selLabel);
    panel.appendChild(selArea);
    panel.appendChild(thLabel);
    panel.appendChild(thArea);
    panel.appendChild(suggestion);
    panel.appendChild(pillarRow);
    panel.appendChild(footer);

    root.appendChild(backdrop);
    root.appendChild(panel);
    document.documentElement.appendChild(root);

    currentPanel = { root, selArea, thArea, pillars: pillarOptions };

    const focusTarget = initialSelection ? thArea : selArea;
    setTimeout(() => focusTarget.focus(), 20);

    document.addEventListener('keydown', onKeyDown, true);
  }

  function onKeyDown(e) {
    if (!currentPanel) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.altKey && !e.metaKey && !e.ctrlKey) {
      const map = { '1': 0, '2': 1, '3': 2, '0': 3 };
      if (e.key in map) {
        e.preventDefault();
        e.stopPropagation();
        const pillar = currentPanel.pillars[map[e.key]];
        if (pillar) submit(pillar, currentPanel.selArea.value, currentPanel.thArea.value);
      }
    }
  }

  function submit(pillar, selection, thought) {
    if (!selection.trim() && !thought.trim()) {
      toast('Nimic de capturat (scrie quote sau gând).');
      return;
    }
    const entry = {
      ts: nowStamp(),
      url: location.href,
      title: document.title || '',
      host: hostOf(location.href),
      pillar: pillar && pillar.key ? { key: pillar.key, label: pillar.label } : null,
      selection: selection.trim(),
      thought: thought.trim()
    };
    chrome.runtime.sendMessage({ type: 'semnal:capture', entry }, (resp) => {
      const ok = resp && resp.ok;
      // Always copy markdown to clipboard for fast paste into inbox.md.
      const md = formatEntry ? formatEntry(entry) : JSON.stringify(entry, null, 2);
      copyToClipboard(md);
      close();
      if (ok) {
        toast(`✓ captured (${resp.total} in buffer) · copied markdown to clipboard`);
      } else {
        toast(`⚠ stored locally failed (${resp && resp.error || 'unknown'}) · markdown in clipboard`);
      }
    });
  }

  function close() {
    document.removeEventListener('keydown', onKeyDown, true);
    if (currentPanel) {
      currentPanel.root.remove();
      currentPanel = null;
    }
  }

  function toast(message) {
    const t = document.createElement('div');
    t.className = 'semnal-toast';
    t.textContent = message;
    document.documentElement.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  function copyToClipboard(text) {
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

  function indexOfPillar(list, p) {
    for (let i = 0; i < list.length; i++) if (list[i].key === p.key) return i;
    return -1;
  }

  function hostOf(u) {
    try { return new URL(u).host; } catch (_) { return u; }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
