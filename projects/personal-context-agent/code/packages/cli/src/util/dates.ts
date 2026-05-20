// Lightweight CLI date parsing for --since / --until tokens.
//
// Accepts:
//   • relative: `7d`, `2h`, `30m`, `45s` — offset from now (past).
//   • absolute: `2026-05-01` or any ISO 8601 string Date.parse accepts.

export class DateParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "DateParseError";
  }
}

const RELATIVE = /^(\d+)([smhd])$/;

const UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDateToken(input: string, now: Date = new Date()): string {
  const token = input.trim();
  if (token.length === 0) {
    throw new DateParseError("empty date token");
  }

  const rel = RELATIVE.exec(token);
  if (rel) {
    const n = Number(rel[1]);
    const unit = rel[2]!;
    const ms = UNIT_MS[unit]!;
    return new Date(now.getTime() - n * ms).toISOString();
  }

  const ts = Date.parse(token);
  if (!Number.isNaN(ts)) {
    return new Date(ts).toISOString();
  }

  throw new DateParseError(
    `cannot parse date "${input}" — use a relative token like 7d/2h/30m or an ISO date`,
  );
}
