// Shared storage helpers. Runs in popup, options, background (as module).
// NOT loaded in content scripts (content scripts talk to background via messages).

export const KEYS = {
  PILLARS: 'pillars',
  TARGETS: 'targets',
  CAPTURES: 'captures',
  RADAR_ENABLED: 'radarEnabled',
  LAST_EXPORT: 'lastExportAt'
};

export const DEFAULT_PILLARS = [
  { key: 'P1', label: 'AI-native craft',
    hints: ['claude', 'agent', 'skill', 'code', 'llm', 'prompt', 'mcp', 'tool', 'cli', 'workflow', 'devtool', 'ai '] },
  { key: 'P2', label: '51-year-old builder',
    hints: ['386', 'dos ', 'old', 'senior', 'career', 'young', '51', 'age', 'pitești', 'decada', 'ani de'] },
  { key: 'P3', label: 'Unsexy problems',
    hints: ['imm', 'contabil', 'business', 'revenue', 'client', 'spital', 'hospital', 'public sector', 'b2b', 'factur', 'manager', 'teren'] }
];

// Default targets pulled from workshop/x-queue/targets.md. Handle stored WITHOUT @.
export const DEFAULT_TARGETS = [
  { handle: 'swyx', pillar: 'P1', angle: 'AI engineering / career arcs' },
  { handle: 'pietroschirano', pillar: 'P1', angle: 'Solo AI builder, agents' },
  { handle: 'mattshumer_', pillar: 'P1', angle: 'Agent fundamentals' },
  { handle: 'hrishioa', pillar: 'P1', angle: 'AI tooling micro-experiments' },
  { handle: 'shaoruu', pillar: 'P1', angle: 'Solo hacker / open-source agents' },
  { handle: 'yongfook', pillar: 'P2', angle: 'Solo founder mental state' },
  { handle: 'AndreyAzimov', pillar: 'P2', angle: 'Atypical bootstrapper' },
  { handle: 'anthilemoon', pillar: 'P2', angle: 'Anti-hustle introspective' },
  { handle: 'marc_louvion', pillar: 'P2', angle: 'Transparent revenue' },
  { handle: 'sidhvm', pillar: 'P2', angle: 'Durable micro-SaaS lifestyle' },
  { handle: 'tdinh_me', pillar: 'P3', angle: 'Micro-SaaS revenue breakdowns' },
  { handle: 'marckohlbrugge', pillar: 'P3', angle: 'Bootstrap patterns' },
  { handle: 'damengchen', pillar: 'P3', angle: 'Neglected niche discovery' },
  { handle: 'dagorenouf', pillar: 'P3', angle: 'SMB acquisition / pricing' },
  { handle: 'KevDoy', pillar: 'P3', angle: 'Indie SaaS unsexy verticals' }
];

export async function get(key, fallback = null) {
  const all = await chrome.storage.local.get(key);
  return key in all ? all[key] : fallback;
}

export async function set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

export async function getPillars() {
  const v = await get(KEYS.PILLARS);
  return Array.isArray(v) && v.length ? v : structuredClone(DEFAULT_PILLARS);
}

export async function getTargets() {
  const v = await get(KEYS.TARGETS);
  return Array.isArray(v) && v.length ? v : structuredClone(DEFAULT_TARGETS);
}

export async function isRadarEnabled() {
  const v = await get(KEYS.RADAR_ENABLED);
  return v !== false; // default on
}

export async function addCapture(entry) {
  const list = (await get(KEYS.CAPTURES)) || [];
  list.push(entry);
  await set(KEYS.CAPTURES, list);
  return list.length;
}

export async function listCaptures() {
  return (await get(KEYS.CAPTURES)) || [];
}

export async function clearCaptures() {
  await set(KEYS.CAPTURES, []);
}
