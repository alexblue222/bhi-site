// Section eyebrow + heading — the one heading pattern used across the whole hub.
// accent="amber" is the human-element variant (artists, community).
export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
  accent = "cyan",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  accent?: "cyan" | "amber";
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "text-left";
  const accentCls = accent === "amber" ? "text-bh-amber" : "text-bh-cyan";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${accentCls}`}>{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-slate-400">{sub}</p>}
    </div>
  );
}
