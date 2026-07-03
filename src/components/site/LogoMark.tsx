// The site logo — the real beacon symbol (cropped from the master logo) + the wordmark in
// Michroma, the wide geometric tech sans that matches the logo's own lettering. The hero's
// scroll animation docks the full logo into this corner and hands off to this crisp mark.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/brand/logo-symbol.webp"
        alt="Blue Horizon Interactive"
        className="h-12 w-auto select-none"
        draggable={false}
      />
      <span className="flex flex-col leading-none" style={{ fontFamily: "Michroma, sans-serif" }}>
        <span className="text-[14px] tracking-[0.14em] text-slate-100">BLUE HORIZON</span>
        <span className="mt-[6px] text-[8px] tracking-[0.52em] text-[#58d6ff]">INTERACTIVE</span>
      </span>
    </div>
  );
}
