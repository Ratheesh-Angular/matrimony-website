/** First visible grapheme for avatar fallbacks (Tamil-safe; NFC-normalized). */
export function getNameInitial(name: string): string {
  const trimmed = name.trim().normalize("NFC");
  if (!trimmed) return "?";

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segment = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    })
      .segment(trimmed)
      [Symbol.iterator]()
      .next().value;
    const g = segment?.segment?.trim();
    if (g) return g;
  }

  return Array.from(trimmed)[0] || "?";
}
