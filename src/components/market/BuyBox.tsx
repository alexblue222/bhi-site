import { useState } from "react";
import { Download, ExternalLink, ShoppingCart } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { formatPrice, type Product } from "../../lib/data";
import { addToCart } from "./CartDrawer";

// Detail-page purchase panel — tier selection + the one action that fits the product
// (direct cart, free download, external store link, or coming-soon hold).
export function BuyBox({ product }: { product: Product }) {
  const [tier, setTier] = useState(product.licenseTiers[0]);

  const primaryCls =
    "inline-flex w-full items-center justify-center gap-2 rounded-full bg-bh-blue px-6 py-3.5 text-sm font-semibold text-[#01030a] transition-colors hover:bg-bh-cyan";

  return (
    <GlassCard glow="none" className="p-6">
      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">License</legend>
        <div className="mt-3 space-y-2.5">
          {product.licenseTiers.map((t) => {
            const selected = t.name === tier.name;
            return (
              <label
                key={t.name}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  selected
                    ? "border-bh-blue/60 bg-bh-blue/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <input
                  type="radio"
                  name={`license-${product.slug}`}
                  className="sr-only"
                  checked={selected}
                  onChange={() => setTier(t)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-100">{t.name}</span>
                  {t.note && <span className="mt-0.5 block text-xs text-slate-500">{t.note}</span>}
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-100">{formatPrice(t.price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-slate-100">{formatPrice(tier.price)}</span>
        <span className="text-xs text-slate-500">{tier.name} license</span>
      </p>

      <div className="mt-5">
        {product.status === "coming-soon" ? (
          <>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-slate-500"
            >
              Coming soon
            </button>
            <a
              href="/feed"
              className="mt-3 block text-center text-xs text-bh-cyan underline-offset-2 transition-colors hover:text-slate-100 hover:underline"
            >
              Follow the feed for the drop
            </a>
          </>
        ) : product.buyMode === "external" ? (
          // Free + same-origin file → a real download; paid → link out to the store in a new tab.
          <a
            href={product.externalUrl}
            {...(tier.price === 0 ? { download: "" } : { target: "_blank", rel: "noopener noreferrer" })}
            className={primaryCls}
          >
            {product.externalLabel}
            {tier.price === 0 ? <Download className="h-4 w-4" aria-hidden /> : <ExternalLink className="h-4 w-4" aria-hidden />}
          </a>
        ) : (
          <button type="button" onClick={() => addToCart(product.slug, tier.name)} className={primaryCls}>
            {tier.price === 0 ? (
              <>
                <Download className="h-4 w-4" aria-hidden /> Download free
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden /> Add to cart
              </>
            )}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
