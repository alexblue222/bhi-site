import { LogoMark } from "./LogoMark";
import { Connect } from "../ui/Connect";

const COLS = [
  {
    h: "Explore",
    links: [
      { label: "Feed", href: "/feed" },
      { label: "Games", href: "/games" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Artists", href: "/artists" },
    ],
  },
  {
    h: "Studio",
    links: [
      { label: "Services", href: "/studio" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-bh-ink px-6 pb-10 pt-20">
      {/* horizon glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(46,155,255,0.6), transparent)" }} />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          <div>
            <LogoMark />
            <p className="mt-5 max-w-xs font-display text-sm font-medium leading-relaxed text-slate-300">
              The future is not given to us. It is built.
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              An Irish studio building the games of the future — and the technology that renders them.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.h}>
              <h4 className="text-sm font-semibold text-slate-200">{col.h}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-slate-400 transition-colors hover:text-bh-cyan">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Connect</h4>
            <div className="mt-4">
              <Connect compact />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
          <span>© 2026 Blue Horizon Interactive. All rights reserved.</span>
          <span>bluehorizoninteractive.com</span>
        </div>
      </div>
    </footer>
  );
}
