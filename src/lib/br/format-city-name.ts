/** Title-cases city names returned in uppercase from Brasil API DDD data. */
export function formatCityName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      const parts = word.split("-");
      return parts
        .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
        .join("-");
    })
    .join(" ");
}
