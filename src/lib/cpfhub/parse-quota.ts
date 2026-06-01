const QUOTA_HEADER_NAMES = [
  "x-credits-remaining",
  "x-remaining-credits",
  "x-remaining-requests",
  "credits-remaining",
] as const;

function parseNonNegativeInt(value: string): number | null {
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function readNumericField(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string") {
    return parseNonNegativeInt(value);
  }
  return null;
}

/** Reads remaining plan credits when the API exposes them in headers or JSON. */
export function parseRemainingCredits(headers: Headers, body: unknown): number | null {
  for (const name of QUOTA_HEADER_NAMES) {
    const raw = headers.get(name);
    if (!raw) continue;
    const parsed = parseNonNegativeInt(raw);
    if (parsed !== null) return parsed;
  }

  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const meta =
    record.meta && typeof record.meta === "object"
      ? (record.meta as Record<string, unknown>)
      : null;
  const usage =
    record.usage && typeof record.usage === "object"
      ? (record.usage as Record<string, unknown>)
      : null;

  const candidates = [
    record.remainingCredits,
    record.remaining,
    record.creditsRemaining,
    meta?.remainingCredits,
    meta?.remaining,
    usage?.remainingCredits,
    usage?.remaining,
  ];

  for (const candidate of candidates) {
    const parsed = readNumericField(candidate);
    if (parsed !== null) return parsed;
  }

  return null;
}
