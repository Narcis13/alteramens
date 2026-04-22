// Markdown formatter: produces entries for workshop/x-queue/inbox.md under
// ## Raw captures (Browser), complementary to the Obsidian plugin / CLI sections.

(function (global) {
  function pad(n) { return String(n).padStart(2, '0'); }

  function nowStamp(d) {
    d = d || new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function quote(text) {
    return String(text || '')
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n');
  }

  function formatEntry({ ts, url, title, pillar, selection, thought }) {
    const pillarLabel = pillar && pillar.key
      ? `${pillar.key} — ${pillar.label}`
      : 'unassigned';
    const source = title ? `[${escapeMd(title)}](${url})` : url;
    const out = [
      '',
      `### ${ts} — ${source} — pilon: ${pillarLabel}`,
      ''
    ];
    if (selection && selection.trim()) {
      out.push(quote(selection.trim()));
      out.push('');
    }
    if (thought && thought.trim()) {
      out.push(`**Thought:** ${thought.trim()}`);
      out.push('');
    }
    return out.join('\n');
  }

  // Section stub that the extension emits when dumping captures as a file.
  const SECTION_HEADER = '## Raw captures (Browser)';
  const SECTION_INTRO =
    '> *Append-only from Chrome extension `Semnal`. Rafinate manual în secțiunile pe piloni când promovăm la draft.*';

  function dumpSection(entries) {
    const body = entries.map((e) => formatEntry(e)).join('\n');
    return `\n---\n\n${SECTION_HEADER}\n\n${SECTION_INTRO}\n${body}`;
  }

  // Minimal markdown escaping for titles used inside `[title](url)` — only
  // break on `]` which would truncate the link. Parens in titles are rare
  // but we escape them defensively.
  function escapeMd(s) {
    return String(s).replace(/\]/g, '\\]').replace(/\n/g, ' ').trim();
  }

  global.SemnalFormatter = {
    nowStamp,
    formatEntry,
    dumpSection,
    SECTION_HEADER
  };
})(typeof self !== 'undefined' ? self : this);
