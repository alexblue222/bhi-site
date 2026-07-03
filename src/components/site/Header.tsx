import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { Connect } from "../ui/Connect";

// Hub IA: the feed is the centerpiece, commerce and people are first-class.
const NAV = [
  { label: "Feed", href: "/feed" },
  { label: "Games", href: "/games" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Artists", href: "/artists" },
  { label: "Studio", href: "/studio" },
];

export function Header({ hero = false }: { hero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // On the hero page the corner logo stays hidden until the hero mark docks into it (the hand-off).
  const [heroP, setHeroP] = useState<number | null>(hero ? 0 : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onHero = (e: Event) => setHeroP((e as CustomEvent<number>).detail);
    window.addEventListener("bhi:hero-progress", onHero);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("bhi:hero-progress", onHero);
    };
  }, []);

  const logoVisible = open || heroP === null || heroP >= 0.96;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-[#01030a]/70 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <a
          href="/"
          className="shrink-0 transition-opacity duration-300"
          style={{ opacity: logoVisible ? 1 : 0, pointerEvents: logoVisible ? "auto" : "none" }}
        >
          <LogoMark />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-slate-300 transition-colors hover:text-bh-cyan">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/contact"
            className="hidden rounded-full border border-bh-blue/40 bg-bh-blue/10 px-4 py-1.5 text-sm font-medium text-[#bfe0ff] transition-colors hover:bg-bh-blue/20 sm:block"
          >
            Get in touch
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition-colors hover:border-bh-blue/40 hover:text-bh-cyan md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-white/5 bg-[#01030a]/95 px-8 pb-10 pt-6 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 font-display text-lg font-semibold text-slate-200 transition-colors hover:bg-white/[0.04] hover:text-bh-cyan"
              >
                {item.label}
              </a>
            ))}
            <a href="/contact" className="rounded-xl px-3 py-3 font-display text-lg font-semibold text-bh-cyan">
              Get in touch
            </a>
          </nav>
          <div className="mt-6 border-t border-white/5 pt-6">
            <Connect compact />
          </div>
        </div>
      )}
    </header>
  );
}
