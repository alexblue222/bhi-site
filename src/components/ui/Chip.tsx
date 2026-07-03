// Filter chip — feed filters, marketplace categories, portfolio media.
export function Chip({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-bh-blue/60 bg-bh-blue/15 text-[#bfe0ff]"
          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
