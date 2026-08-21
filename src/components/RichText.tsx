/** Minimal markdown-ish renderer for page body (headings + paragraphs + lists). */
export function RichText({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="prose-site space-y-4 text-[var(--foreground)]/90">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{line.replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="font-display text-2xl font-semibold text-[var(--primary)]">
              {block.replace(/^## /, "")}
            </h2>
          );
        }
        if (block.startsWith("# ")) {
          return (
            <h1 key={i} className="font-display text-3xl font-semibold text-[var(--primary)]">
              {block.replace(/^# /, "")}
            </h1>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
