'use strict';

const obsidian = require('obsidian');

const DEFAULT_SETTINGS = {
  inboxPath: 'workshop/x-queue/inbox.md',
  sectionHeader: '## Raw captures (Obsidian)',
  sectionIntro: '> *Append-only from Obsidian hotkey (`Cmd+Shift+X`). Rafinate manual în secțiunile pe piloni de mai sus când ajungem la draft.*',
  pillars: [
    { key: 'P1', label: 'AI-native craft', hints: ['claude', 'agent', 'skill', 'code', 'llm', 'prompt', 'mcp', 'tool', 'cli', 'workflow', 'devtool', 'ai '] },
    { key: 'P2', label: '51-year-old builder', hints: ['386', 'dos ', 'old', 'senior', 'career', 'young', '51', 'age', 'pitești', 'decada', 'ani de'] },
    { key: 'P3', label: 'Unsexy problems', hints: ['imm', 'contabil', 'business', 'revenue', 'client', 'spital', 'hospital', 'public sector', 'b2b', 'factur', 'manager', 'teren'] },
  ],
};

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function suggestPillar(text, pillars) {
  if (!text) return null;
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of pillars) {
    let score = 0;
    for (const hint of p.hints || []) {
      if (lower.includes(hint)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore > 0 ? best : null;
}

function formatEntry({ ts, sourceLink, pillarLabel, text, note }) {
  const quoted = text.split('\n').map((l) => `> ${l}`).join('\n');
  const lines = [
    '',
    `### ${ts} — ${sourceLink} — pilon: ${pillarLabel}`,
    '',
    quoted,
  ];
  if (note && note.trim()) {
    lines.push('', `**Note:** ${note.trim()}`);
  }
  lines.push('');
  return lines.join('\n');
}

function hasSection(content, header) {
  return content.split('\n').some((line) => line === header);
}

class SemnalCapturePlugin extends obsidian.Plugin {
  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'semnal-capture-seed',
      name: 'Capture seed to x-queue inbox',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'X' }],
      callback: () => this.openCapture(),
    });

    this.addSettingTab(new SemnalSettingTab(this.app, this));
  }

  async loadSettings() {
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded || {});
    if (!Array.isArray(this.settings.pillars) || this.settings.pillars.length === 0) {
      this.settings.pillars = DEFAULT_SETTINGS.pillars;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  openCapture() {
    const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
    let initialText = '';
    let sourcePath = null;
    if (view) {
      sourcePath = view.file ? view.file.path : null;
      try {
        const editor = view.editor;
        if (editor) initialText = editor.getSelection() || '';
      } catch (_) {}
    }
    new CaptureModal(this.app, this, { initialText, sourcePath }).open();
  }

  async appendToInbox({ text, sourcePath, pillar, note }) {
    const vault = this.app.vault;
    const path = this.settings.inboxPath;

    let file = vault.getAbstractFileByPath(path);
    if (!file) {
      try {
        const stub = this.buildStubInbox();
        file = await vault.create(path, stub);
        new obsidian.Notice(`Semnal: created ${path}`);
      } catch (err) {
        new obsidian.Notice(`Semnal: cannot create ${path} — ${err.message}`);
        return;
      }
    }

    if (!(file instanceof obsidian.TFile)) {
      new obsidian.Notice(`Semnal: ${path} exists but is not a file`);
      return;
    }

    let content = await vault.read(file);

    if (!hasSection(content, this.settings.sectionHeader)) {
      if (!content.endsWith('\n')) content += '\n';
      content += `\n---\n\n${this.settings.sectionHeader}\n\n${this.settings.sectionIntro}\n`;
    }

    const ts = nowStamp();
    const pillarLabel = pillar && pillar.key
      ? `${pillar.key} — ${pillar.label}`
      : 'unassigned';
    const sourceLink = sourcePath
      ? `[[${sourcePath.replace(/\.md$/i, '')}]]`
      : 'external';

    const entry = formatEntry({ ts, sourceLink, pillarLabel, text, note });

    if (!content.endsWith('\n')) content += '\n';
    content += entry;

    await vault.modify(file, content);

    new obsidian.Notice(`Semnal: captured → ${path}`);
  }

  buildStubInbox() {
    const today = new Date().toISOString().slice(0, 10);
    return [
      '---',
      'type: seeds',
      'tags:',
      '  - x-growth',
      '  - semnal',
      '  - seeds',
      `date: ${today}`,
      'status: raw',
      '---',
      '',
      '# Seeds brute',
      '',
      '> *Inbox creat automat de plugin-ul `semnal-capture`. Captures below — rafinate manual în secțiuni pe piloni când ajungem la draft.*',
      '',
    ].join('\n');
  }
}

class CaptureModal extends obsidian.Modal {
  constructor(app, plugin, { initialText, sourcePath }) {
    super(app);
    this.plugin = plugin;
    this.initialText = initialText || '';
    this.sourcePath = sourcePath || null;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('semnal-capture-modal');

    contentEl.createEl('h3', { text: 'Semnal — capture seed' });

    const meta = contentEl.createEl('p', { cls: 'setting-item-description' });
    meta.setText(
      this.sourcePath
        ? `Source: ${this.sourcePath}  ·  ${nowStamp()}`
        : `Source: external  ·  ${nowStamp()}`,
    );

    contentEl.createEl('label', { text: 'Seed text' });
    const textarea = contentEl.createEl('textarea', {
      attr: { rows: '6', placeholder: 'Seed brut (RO / EN / mix)...' },
    });
    textarea.value = this.initialText;
    textarea.style.width = '100%';
    textarea.style.fontFamily = 'var(--font-text)';
    textarea.style.fontSize = '14px';
    textarea.style.marginBottom = '10px';

    contentEl.createEl('label', { text: 'Note (optional)' });
    const noteInput = contentEl.createEl('input', {
      attr: { type: 'text', placeholder: 'unghi / pattern-tag / de ce contează' },
    });
    noteInput.style.width = '100%';
    noteInput.style.marginBottom = '12px';

    const suggested = suggestPillar(this.initialText, this.plugin.settings.pillars);
    const suggestion = contentEl.createEl('p', { cls: 'setting-item-description' });
    suggestion.setText(
      suggested
        ? `Suggested pilon: ${suggested.key} — ${suggested.label}  ·  (Alt+${this.pillarShortcutIndex(suggested) + 1} to confirm)`
        : 'No pilon suggestion — pick one below.',
    );

    contentEl.createEl('p', { text: 'Pick pilon to capture:', cls: 'setting-item-description' });
    const btnRow = contentEl.createDiv({ cls: 'semnal-pillar-row' });
    btnRow.style.display = 'flex';
    btnRow.style.flexDirection = 'column';
    btnRow.style.gap = '6px';

    const pillarOptions = [
      ...this.plugin.settings.pillars,
      { key: null, label: 'unassigned' },
    ];

    const submit = (pillar) => {
      const text = textarea.value.trim();
      if (!text) {
        new obsidian.Notice('Semnal: empty seed — nothing captured');
        return;
      }
      const note = noteInput.value.trim();
      this.close();
      this.plugin.appendToInbox({
        text,
        sourcePath: this.sourcePath,
        pillar,
        note,
      });
    };

    pillarOptions.forEach((p, i) => {
      const shortcut = i < 3 ? `Alt+${i + 1}` : 'Alt+0';
      const prefix = p.key ? `${p.key} — ${p.label}` : p.label;
      const btn = btnRow.createEl('button', { text: `${prefix}  ·  ${shortcut}` });
      btn.style.textAlign = 'left';
      if (suggested && p.key === suggested.key) btn.addClass('mod-cta');
      btn.addEventListener('click', () => submit(p));
    });

    if (this.initialText) noteInput.focus();
    else textarea.focus();

    const shortcuts = [
      { key: '1', idx: 0 },
      { key: '2', idx: 1 },
      { key: '3', idx: 2 },
      { key: '0', idx: 3 },
    ];
    shortcuts.forEach(({ key, idx }) => {
      this.scope.register(['Alt'], key, () => submit(pillarOptions[idx]));
    });
  }

  pillarShortcutIndex(pillar) {
    const arr = this.plugin.settings.pillars;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key === pillar.key) return i;
    }
    return 3;
  }

  onClose() {
    this.contentEl.empty();
  }
}

class SemnalSettingTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Semnal Capture' });

    new obsidian.Setting(containerEl)
      .setName('Inbox path')
      .setDesc('Vault-relative path for the x-queue inbox file (auto-created if missing).')
      .addText((text) => text
        .setPlaceholder(DEFAULT_SETTINGS.inboxPath)
        .setValue(this.plugin.settings.inboxPath)
        .onChange(async (value) => {
          this.plugin.settings.inboxPath = value.trim() || DEFAULT_SETTINGS.inboxPath;
          await this.plugin.saveSettings();
        }));

    new obsidian.Setting(containerEl)
      .setName('Section header')
      .setDesc('Markdown header (full line) under which captures are appended.')
      .addText((text) => text
        .setValue(this.plugin.settings.sectionHeader)
        .onChange(async (value) => {
          this.plugin.settings.sectionHeader = value.trim() || DEFAULT_SETTINGS.sectionHeader;
          await this.plugin.saveSettings();
        }));

    new obsidian.Setting(containerEl)
      .setName('Reset pillars to defaults')
      .setDesc('Pilon list is currently read from defaults. Use `data.json` in this plugin folder to customize; click to restore defaults.')
      .addButton((btn) => btn
        .setButtonText('Reset')
        .onClick(async () => {
          this.plugin.settings.pillars = DEFAULT_SETTINGS.pillars;
          await this.plugin.saveSettings();
          new obsidian.Notice('Semnal: pillars reset to defaults');
        }));
  }
}

module.exports = SemnalCapturePlugin;
