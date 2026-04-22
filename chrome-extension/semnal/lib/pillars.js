// Pilon definitions + keyword heuristics. Shared across popup, content scripts, options.
// Mirrors .obsidian/plugins/semnal-capture/main.js defaults.
// Wrapped in IIFE so content scripts don't leak globals beyond `window.SemnalPillars`.

(function (global) {
  const DEFAULT_PILLARS = [
    {
      key: 'P1',
      label: 'AI-native craft',
      hints: ['claude', 'agent', 'skill', 'code', 'llm', 'prompt', 'mcp', 'tool', 'cli', 'workflow', 'devtool', 'ai ']
    },
    {
      key: 'P2',
      label: '51-year-old builder',
      hints: ['386', 'dos ', 'old', 'senior', 'career', 'young', '51', 'age', 'pitești', 'decada', 'ani de']
    },
    {
      key: 'P3',
      label: 'Unsexy problems',
      hints: ['imm', 'contabil', 'business', 'revenue', 'client', 'spital', 'hospital', 'public sector', 'b2b', 'factur', 'manager', 'teren']
    }
  ];

  function suggestPillar(text, pillars) {
    if (!text) return null;
    const list = pillars && pillars.length ? pillars : DEFAULT_PILLARS;
    const lower = String(text).toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const p of list) {
      let score = 0;
      for (const hint of (p.hints || [])) {
        if (lower.includes(hint)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return bestScore > 0 ? best : null;
  }

  global.SemnalPillars = {
    DEFAULT_PILLARS,
    suggestPillar
  };
})(typeof self !== 'undefined' ? self : this);
