// Semnal service worker — MV3 background.
// Responsibilities:
//   - On install: seed defaults, create context menu
//   - Handle global keyboard commands (capture / toggle-radar)
//   - Handle messages from content scripts (capture append, targets lookup)
//   - Export captures to a downloadable .md file

import {
  KEYS, DEFAULT_PILLARS, DEFAULT_TARGETS,
  get, set, getTargets, getPillars, addCapture, listCaptures, clearCaptures,
  isRadarEnabled
} from '../lib/storage.js';

// ─── install: seed defaults + context menu ────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  const existingPillars = await get(KEYS.PILLARS);
  if (!existingPillars) await set(KEYS.PILLARS, DEFAULT_PILLARS);

  const existingTargets = await get(KEYS.TARGETS);
  if (!existingTargets) await set(KEYS.TARGETS, DEFAULT_TARGETS);

  const radar = await get(KEYS.RADAR_ENABLED);
  if (radar === null || radar === undefined) await set(KEYS.RADAR_ENABLED, true);

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'semnal-capture-selection',
      title: 'Semnal: capture selection',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'semnal-capture-page',
      title: 'Semnal: capture this page',
      contexts: ['page']
    });
  });
});

// ─── context menu ─────────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  if (info.menuItemId === 'semnal-capture-selection' ||
      info.menuItemId === 'semnal-capture-page') {
    await openOverlay(tab.id, info.selectionText || '');
  }
});

// ─── commands (keyboard shortcuts) ────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (command === 'capture-selection') {
    const selection = await getSelectionFromTab(tab.id);
    await openOverlay(tab.id, selection);
  } else if (command === 'toggle-radar') {
    const current = await isRadarEnabled();
    await set(KEYS.RADAR_ENABLED, !current);
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'semnal:radar-toggle', enabled: !current });
    } catch (_) { /* content script may not be loaded on non-X tab */ }
    notify(`Reply Radar: ${!current ? 'ON' : 'OFF'}`);
  }
});

async function getSelectionFromTab(tabId) {
  try {
    const [{ result } = {}] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => (window.getSelection ? String(window.getSelection()) : '')
    });
    return result || '';
  } catch (_) {
    return '';
  }
}

async function openOverlay(tabId, selection) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'semnal:open-capture-overlay',
      selection
    });
  } catch (err) {
    // Overlay script not yet injected (e.g., chrome:// page). Fall back to popup.
    notify('Pagina aceasta nu permite capture inline. Deschide popup-ul din bara de extensii.');
  }
}

// ─── messages from content scripts / popup ────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || !msg.type) return sendResponse({ ok: false, error: 'no type' });

    try {
      switch (msg.type) {
        case 'semnal:get-targets': {
          const targets = await getTargets();
          return sendResponse({ ok: true, targets });
        }
        case 'semnal:get-pillars': {
          const pillars = await getPillars();
          return sendResponse({ ok: true, pillars });
        }
        case 'semnal:radar-enabled': {
          const enabled = await isRadarEnabled();
          return sendResponse({ ok: true, enabled });
        }
        case 'semnal:capture': {
          const total = await addCapture(msg.entry);
          notify(`✓ captured (${total} in buffer)`);
          return sendResponse({ ok: true, total });
        }
        case 'semnal:list-captures': {
          const list = await listCaptures();
          return sendResponse({ ok: true, captures: list });
        }
        case 'semnal:export-captures': {
          const { filename } = await exportCapturesAsFile();
          return sendResponse({ ok: true, filename });
        }
        case 'semnal:clear-captures': {
          await clearCaptures();
          return sendResponse({ ok: true });
        }
        default:
          return sendResponse({ ok: false, error: `unknown type: ${msg.type}` });
      }
    } catch (err) {
      console.error('[semnal bg]', err);
      return sendResponse({ ok: false, error: String(err && err.message || err) });
    }
  })();
  return true; // async response
});

// ─── export ──────────────────────────────────────────────────────────────
async function exportCapturesAsFile() {
  const list = await listCaptures();
  if (!list.length) throw new Error('no captures to export');

  const SECTION_HEADER = '## Raw captures (Browser)';
  const SECTION_INTRO =
    '> *Append-only from Chrome extension `Semnal`. Rafinate manual în secțiunile pe piloni când promovăm la draft.*';

  const quote = (text) => String(text || '').split('\n').map((l) => `> ${l}`).join('\n');
  const escapeMd = (s) => String(s).replace(/\]/g, '\\]').replace(/\n/g, ' ').trim();

  const body = list.map((e) => {
    const pillarLabel = e.pillar && e.pillar.key
      ? `${e.pillar.key} — ${e.pillar.label}`
      : 'unassigned';
    const source = e.title ? `[${escapeMd(e.title)}](${e.url})` : e.url;
    const parts = ['', `### ${e.ts} — ${source} — pilon: ${pillarLabel}`, ''];
    if (e.selection && e.selection.trim()) {
      parts.push(quote(e.selection.trim())); parts.push('');
    }
    if (e.thought && e.thought.trim()) {
      parts.push(`**Thought:** ${e.thought.trim()}`); parts.push('');
    }
    return parts.join('\n');
  }).join('\n');

  const content = `\n---\n\n${SECTION_HEADER}\n\n${SECTION_INTRO}\n${body}`;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = await blobToDataUrl(blob);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `semnal-captures-${date}.md`;

  await chrome.downloads.download({
    url,
    filename,
    conflictAction: 'uniquify',
    saveAs: false
  });

  await set(KEYS.LAST_EXPORT, new Date().toISOString());
  return { filename };
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// ─── notifications ────────────────────────────────────────────────────────
function notify(message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Semnal',
      message
    }, () => {
      // Ignore lastError — notifications are best-effort (no icon file in MVP).
      void chrome.runtime.lastError;
    });
  } catch (_) { /* ignore */ }
}
