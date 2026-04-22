// Popup UI — toolbar icon. Same capture flow as the overlay, for pages where
// the overlay can't inject (chrome://, Web Store, etc.) or when user prefers
// to use the toolbar. Also shows buffer stats + export/copy-all/clear.

(function () {
  const { suggestPillar, DEFAULT_PILLARS } = window.SemnalPillars;
  const { nowStamp, formatEntry } = window.SemnalFormatter;

  const $ = (id) => document.getElementById(id);
  const els = {
    meta: $('page-meta'),
    selection: $('selection'),
    thought: $('thought'),
    pillarsRow: $('pillars-row'),
    suggest: $('suggest'),
    radarToggle: $('radar-toggle'),
    bufferCount: $('buffer-count'),
    exportBtn: $('export-btn'),
    copyAllBtn: $('copy-all-btn'),
    clearBtn: $('clear-btn'),
    openOptions: $('open-options'),
    toast: $('toast')
  };

  let pillars = DEFAULT_PILLARS;
  let currentTab = null;

  init();

  async function init() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    const hostUrl = tab && tab.url ? tab.url : '(no active tab)';
    const title = tab && tab.title ? tab.title : '';
    els.meta.textContent = `${trim(title, 60)}\n${hostUrl}`;

    // Load pillars
    const resp = await sendBg({ type: 'semnal:get-pillars' });
    if (resp && resp.ok) pillars = resp.pillars;

    // Radar toggle state
    const rs = await sendBg({ type: 'semnal:radar-enabled' });
    els.radarToggle.checked = !!(rs && rs.ok && rs.enabled);
    els.radarToggle.addEventListener('change', onToggleRadar);

    // Try to prefill with current selection from active tab
    if (tab && tab.id) {
      try {
        const [{ result } = {}] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => (window.getSelection ? String(window.getSelection()) : '')
        });
        if (result) els.selection.value = result;
      } catch (_) { /* chrome:// pages etc. */ }
    }

    renderPillars();
    els.selection.addEventListener('input', renderPillars);

    els.exportBtn.addEventListener('click', onExport);
    els.copyAllBtn.addEventListener('click', onCopyAll);
    els.clearBtn.addEventListener('click', onClear);
    els.openOptions.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });

    document.addEventListener('keydown', onKeyDown);
    await refreshBufferCount();

    (els.selection.value ? els.thought : els.selection).focus();
  }

  function renderPillars() {
    const suggested = suggestPillar(els.selection.value + '\n' + els.thought.value, pillars);
    els.suggest.className = 'suggest' + (suggested ? '' : ' muted');
    els.suggest.textContent = suggested
      ? `Suggested: ${suggested.key} — ${suggested.label} (Alt+${indexOfKey(pillars, suggested.key) + 1})`
      : 'Alege un pilon sau Alt+0 pentru unassigned.';

    els.pillarsRow.innerHTML = '';
    const options = [...pillars, { key: null, label: 'unassigned' }];
    options.forEach((p, i) => {
      const btn = document.createElement('button');
      if (suggested && p.key === suggested.key) btn.classList.add('suggested');
      const shortcut = i < 3 ? `Alt+${i + 1}` : 'Alt+0';
      btn.innerHTML = `<span class="k">${p.key || '—'}</span>${escapeHtml(p.label)}<span class="s">${shortcut}</span>`;
      btn.addEventListener('click', () => submit(p));
      els.pillarsRow.appendChild(btn);
    });
  }

  async function submit(pillar) {
    const selection = els.selection.value.trim();
    const thought = els.thought.value.trim();
    if (!selection && !thought) {
      showToast('Nimic de capturat.');
      return;
    }
    const entry = {
      ts: nowStamp(),
      url: currentTab ? currentTab.url : '',
      title: currentTab ? currentTab.title : '',
      host: currentTab && currentTab.url ? safeHost(currentTab.url) : '',
      pillar: pillar && pillar.key ? { key: pillar.key, label: pillar.label } : null,
      selection,
      thought
    };
    const resp = await sendBg({ type: 'semnal:capture', entry });
    await navigator.clipboard.writeText(formatEntry(entry)).catch(() => {});
    if (resp && resp.ok) {
      showToast(`✓ captured · markdown in clipboard`);
      els.selection.value = '';
      els.thought.value = '';
      renderPillars();
      await refreshBufferCount();
    } else {
      showToast(`⚠ failed: ${resp && resp.error || 'unknown'}`);
    }
  }

  async function onExport() {
    const resp = await sendBg({ type: 'semnal:export-captures' });
    if (resp && resp.ok) {
      showToast(`✓ exported ${resp.filename}`);
      await refreshBufferCount();
    } else {
      showToast(`⚠ ${resp && resp.error || 'export failed'}`);
    }
  }

  async function onCopyAll() {
    const resp = await sendBg({ type: 'semnal:list-captures' });
    if (!resp || !resp.ok || !resp.captures.length) {
      showToast('Buffer gol.');
      return;
    }
    const md = resp.captures.map((e) => formatEntry(e)).join('\n');
    await navigator.clipboard.writeText(md).catch(() => {});
    showToast(`✓ copied ${resp.captures.length} entries to clipboard`);
  }

  async function onClear() {
    if (!confirm('Clear toate capture-urile din buffer?')) return;
    await sendBg({ type: 'semnal:clear-captures' });
    await refreshBufferCount();
    showToast('Buffer cleared.');
  }

  async function onToggleRadar(e) {
    const enabled = e.target.checked;
    await chrome.storage.local.set({ radarEnabled: enabled });
    if (currentTab && currentTab.id) {
      try {
        await chrome.tabs.sendMessage(currentTab.id, {
          type: 'semnal:radar-toggle', enabled
        });
      } catch (_) { /* not an X tab */ }
    }
    showToast(`Radar ${enabled ? 'ON' : 'OFF'}`);
  }

  function onKeyDown(e) {
    if (e.altKey && !e.metaKey && !e.ctrlKey) {
      const map = { '1': 0, '2': 1, '3': 2, '0': 3 };
      if (e.key in map) {
        e.preventDefault();
        const options = [...pillars, { key: null, label: 'unassigned' }];
        const p = options[map[e.key]];
        if (p) submit(p);
      }
    }
  }

  async function refreshBufferCount() {
    const resp = await sendBg({ type: 'semnal:list-captures' });
    const n = resp && resp.ok ? resp.captures.length : 0;
    els.bufferCount.textContent = `${n} capture${n === 1 ? '' : 's'} in buffer`;
  }

  function sendBg(msg) {
    return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
  }

  function indexOfKey(list, key) {
    for (let i = 0; i < list.length; i++) if (list[i].key === key) return i;
    return -1;
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { els.toast.hidden = true; }, 1800);
  }

  function trim(s, max) {
    s = String(s || '');
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function safeHost(u) { try { return new URL(u).host; } catch (_) { return ''; } }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
