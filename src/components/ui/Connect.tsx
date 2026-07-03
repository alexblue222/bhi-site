import { ArrowRight } from "lucide-react";
import { SOCIAL_LINKS, PLATFORM_META } from "../../lib/data";
import { PlatformIcon } from "./PlatformBadge";

// The "follow everywhere" module — footer, feed interstitials, home outro.
// Static-render safe (no hydration needed): the updates CTA routes to /contact
// until the newsletter backend exists.
export function Connect({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center"}>
      {!compact && (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-bh-cyan">One signal, every platform</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">Follow the horizon</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Everything lands in this feed — but the journey happens everywhere. Pick your platform.
          </p>
        </>
      )}
      <div className={`flex flex-wrap items-center gap-2.5 ${compact ? "" : "mt-6 justify-center"}`}>
        {SOCIAL_LINKS.map(({ platform, href }) => (
          <a
            key={platform}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={PLATFORM_META[platform].label}
            aria-label={PLATFORM_META[platform].label}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-all hover:-translate-y-0.5 hover:border-bh-blue/40 hover:text-bh-cyan"
          >
            <PlatformIcon platform={platform} className="h-4.5 w-4.5" />
          </a>
        ))}
        <a
          href="/contact"
          className={`inline-flex items-center gap-1.5 rounded-xl border border-bh-blue/40 bg-bh-blue/10 px-4 text-sm font-medium text-[#bfe0ff] transition-colors hover:bg-bh-blue/20 ${compact ? "h-10" : "h-10"}`}
        >
          Get launch updates <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
