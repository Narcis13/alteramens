// Options page — edit pillars, targets, radar state. Module script so we can
// import the shared storage helpers directly.

import {
  KEYS, DEFAULT_PILLARS, DEFAULT_TARGETS,
  get, set, getPillars, getTargets, listCaptures, clearCaptures, isRadarEnabled
} from '../lib/storage.js';

const $ = (id) => document.getElementById(id);

const els = {
  pillarsList: $('pillars-list'),
  targetsList: $('targets-list'),
  addPillar: $('add-pillar'),
  resetPillars: $('reset-pillars'),
  addTarget: $('add-target'),
  resetTargets: $('reset-targets'),
  importTargets: $('import-targets'),
  importArea: $('import-area'),
  importRow: $('import-row'),
  importApply: $('import-apply'),
  importCancel: $('import-cancel'),
  radarEnabled: $('radar-enabled'),
  bufferCount: $('buffer-count'),
  exportAll: $('export-all'),
  clearAll: $('clear-all'),
  toast: $('toast')
};

let pillars = [];
let targets = [];

init();

async function init() {
  pillars = await getPillars();
  targets = await getTargets();
  renderPillars();
  renderTargets();
  els.radarEnabled.checked = await isRadarEnabled();
  await refreshBufferCount();

  els.addPillar.addEventListener('click', () => {
    pillars.push({ key: `P${pillars.length + 1}`, label: 'New pillar', hints: [] });
    savePillars();
  });
  els.resetPillars.addEventListener('click', async () => {
    if (!confirm('Reset pillars la defaults?')) return;
    pillars = structuredClone(DEFAULT_PILLARS);
    await savePillars();
  });

  els.addTarget.addEventListener('click', () => {
    targets.push({ handle: '', pillar: 'P1', angle: '' });
    saveTargets();
  });
  els.resetTargets.addEventListener('click', async () => {
    if (!confirm('Reset targets la defaults?')) return;
    targets = structuredClone(DEFAULT_TARGETS);
    await saveTargets();
  });

  els.importTargets.addEventListener('click', () => {
    els.importArea.hidden = false;
    els.importRow.hidden = false;
    els.importArea.focus();
  });
  els.importCancel.addEventListener('click', () => {
    els.importArea.value = '';
    els.importArea.hidden = true;
    els.importRow.hidden = true;
  });
  els.importApply.addEventListener('click', async () => {
    const parsed = parseTargetsMarkdown(els.importArea.value);
    if (!parsed.length) {
      toast('Nu am găsit nimic parsabil (handle + pilon).');
      return;
    }
    targets = mergeTargets(targets, parsed);
    await saveTargets();
    els.importArea.value = '';
    els.importArea.hidden = true;
    els.importRow.hidden = true;
    toast(`✓ imported ${parsed.length} targets`);
  });

  els.radarEnabled.addEventListener('change', async (e) => {
    await set(KEYS.RADAR_ENABLED, e.target.checked);
    toast(`Radar ${e.target.checked ? 'ON' : 'OFF'}`);
  });

  els.exportAll.addEventListener('click', async () => {
    const resp = await send({ type: 'semnal:export-captures' });
    if (resp && resp.ok) toast(`✓ exported ${resp.filename}`);
    else toast(`⚠ ${resp && resp.error || 'export failed'}`);
    await refreshBufferCount();
  });

  els.clearAll.addEventListener('click', async () => {
    if (!confirm('Clear toate capture-urile din buffer?')) return;
    await clearCaptures();
    await refreshBufferCount();
    toast('Buffer cleared.');
  });
}

// ─── pillar rows ────────────────────────────────────────────────────────
function renderPillars() {
  els.pillarsList.innerHTML = '';
  if (!pillars.length) {
    const p = document.createElement('p');
    p.className = 'dim';
    p.textContent = 'No pillars yet — click "+ Add pillar".';
    els.pillarsList.appendChild(p);
    return;
  }
  pillars.forEach((pil, idx) => {
    const row = document.createElement('div');
    row.className = 'pillar-row';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.value = pil.key || '';
    keyInput.placeholder = 'P1';
    keyInput.addEventListener('change', () => { pil.key = keyInput.value.trim(); savePillars(); });

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.value = pil.label || '';
    labelInput.placeholder = 'AI-native craft';
    labelInput.addEventListener('change', () => { pil.label = labelInput.value.trim(); savePillars(); });

    const hintsInput = document.createElement('input');
    hintsInput.type = 'text';
    hintsInput.className = 'hints';
    hintsInput.value = (pil.hints || []).join(', ');
    hintsInput.placeholder = 'keywords, comma, separated';
    hintsInput.addEventListener('change', () => {
      pil.hints = hintsInput.value.split(',').map((s) => s.trim()).filter(Boolean);
      savePillars();
    });

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×';
    del.title = 'Delete pillar';
    del.addEventListener('click', () => {
      if (!confirm(`Șterge pilonul ${pil.key}?`)) return;
      pillars.splice(idx, 1);
      savePillars();
    });

    row.appendChild(keyInput);
    row.appendChild(labelInput);
    row.appendChild(hintsInput);
    row.appendChild(del);
    els.pillarsList.appendChild(row);
  });
}

async function savePillars() {
  await set(KEYS.PILLARS, pillars);
  renderPillars();
}

// ─── target rows ────────────────────────────────────────────────────────
function renderTargets() {
  els.targetsList.innerHTML = '';
  if (!targets.length) {
    const p = document.createElement('p');
    p.className = 'dim';
    p.textContent = 'No targets yet — click "+ Add target".';
    els.targetsList.appendChild(p);
    return;
  }
  targets.forEach((t, idx) => {
    const row = document.createElement('div');
    row.className = 'target-row';

    const handle = document.createElement('input');
    handle.type = 'text';
    handle.value = t.handle || '';
    handle.placeholder = 'handle (no @)';
    handle.addEventListener('change', () => { t.handle = handle.value.trim().replace(/^@/, ''); saveTargets(); });

    const pillarSelect = document.createElement('select');
    pillars.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.key;
      opt.textContent = `${p.key} — ${p.label}`;
      if (t.pillar === p.key) opt.selected = true;
      pillarSelect.appendChild(opt);
    });
    pillarSelect.addEventListener('change', () => { t.pillar = pillarSelect.value; saveTargets(); });

    const angle = document.createElement('input');
    angle.type = 'text';
    angle.className = 'angle';
    angle.value = t.angle || '';
    angle.placeholder = 'short angle / why relevant';
    angle.addEventListener('change', () => { t.angle = angle.value.trim(); saveTargets(); });

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×';
    del.title = 'Delete target';
    del.addEventListener('click', () => {
      if (!confirm(`Șterge targetul @${t.handle || '?'}?`)) return;
      targets.splice(idx, 1);
      saveTargets();
    });

    row.appendChild(handle);
    row.appendChild(pillarSelect);
    row.appendChild(angle);
    row.appendChild(del);
    els.targetsList.appendChild(row);
  });
}

async function saveTargets() {
  await set(KEYS.TARGETS, targets);
  renderTargets();
}

// ─── markdown import (best-effort) ──────────────────────────────────────
function parseTargetsMarkdown(md) {
  // Matches: | **@handle** | ... | ... | ... | with pillar hinted by a
  // preceding header like "## Pilon 1 —" OR handle emitted alone per line.
  const lines = md.split('\n');
  const results = [];
  let currentPillar = 'P1';
  for (const line of lines) {
    const pilMatch = line.match(/^#+\s*Pilon\s+(\d)/i);
    if (pilMatch) {
      currentPillar = `P${pilMatch[1]}`;
      continue;
    }
    const handleMatch = line.match(/@([a-zA-Z0-9_]+)/);
    if (!handleMatch) continue;
    const handle = handleMatch[1];
    // Angle: text after the second `|` in the row, stripped of markdown.
    let angle = '';
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length >= 4) {
      angle = cells[3].replace(/\*\*/g, '').replace(/\.$/, '').trim();
    }
    results.push({ handle, pillar: currentPillar, angle });
  }
  return results;
}

function mergeTargets(existing, incoming) {
  const map = new Map(existing.map((t) => [t.handle.toLowerCase(), t]));
  for (const n of incoming) {
    map.set(n.handle.toLowerCase(), { ...map.get(n.handle.toLowerCase()), ...n });
  }
  return Array.from(map.values());
}

// ─── buffer / export ────────────────────────────────────────────────────
async function refreshBufferCount() {
  const list = await listCaptures();
  els.bufferCount.textContent = `${list.length} capture${list.length === 1 ? '' : 's'}`;
}

// ─── utils ──────────────────────────────────────────────────────────────
function send(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { els.toast.hidden = true; }, 2000);
}
