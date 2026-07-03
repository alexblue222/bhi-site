import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { MediaTile } from "../ui/MediaTile";
import { EmptyState } from "../ui/States";
import { formatPrice, getProduct } from "../../lib/data";

// ─── Shared cart state ────────────────────────────────────────────────────────
// Source of truth is localStorage["bhi-cart"]; islands sync via "bhi:cart-changed".
// BuyBox imports these helpers so both islands write the same shape.

export type CartItem = { slug: string; tier: string; qty: number };

const KEY = "bhi-cart";

export function readCart(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("bhi:cart-changed"));
}

export function addToCart(slug: string, tier: string) {
  const items = readCart();
  const hit = items.find((i) => i.slug === slug && i.tier === tier);
  if (hit) hit.qty += 1;
  else items.push({ slug, tier, qty: 1 });
  writeCart(items);
  window.dispatchEvent(new CustomEvent("bhi:cart-open"));
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readCart());
    const openDrawer = () => setOpen(true);
    sync();
    window.addEventListener("bhi:cart-changed", sync);
    window.addEventListener("bhi:cart-open", openDrawer);
    return () => {
      window.removeEventListener("bhi:cart-changed", sync);
      window.removeEventListener("bhi:cart-open", openDrawer);
    };
  }, []);

  // Resolve slugs against the catalogue; silently drop stale entries.
  const lines = items.flatMap((item) => {
    const product = getProduct(item.slug);
    const tier = product?.licenseTiers.find((t) => t.name === item.tier);
    return product && tier ? [{ ...item, product, tier }] : [];
  });
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.tier.price * l.qty, 0);

  const setQty = (slug: string, tier: string, qty: number) =>
    writeCart(
      qty <= 0
        ? items.filter((i) => !(i.slug === slug && i.tier === tier))
        : items.map((i) => (i.slug === slug && i.tier === tier ? { ...i, qty } : i)),
    );

  return (
    <>
      {/* Floating cart button */}
      <button
        type="button"
        aria-label={`Open cart (${count} item${count === 1 ? "" : "s"})`}
        onClick={() => window.dispatchEvent(new CustomEvent("bhi:cart-open"))}
        className="fixed bottom-6 right-6 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/10 bg-[#0b0f16]/90 text-slate-200 backdrop-blur-md transition-all hover:border-bh-blue/40 hover:shadow-[0_0_32px_-8px_rgba(46,155,255,0.5)]"
      >
        <ShoppingCart className="h-5 w-5" aria-hidden />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bh-cyan px-1 text-[10px] font-bold text-black">
            {count}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-over */}
      <aside
        role="dialog"
        aria-label="Cart"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#0b0f16] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-slate-100">Cart</h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {lines.length === 0 ? (
            <EmptyState title="Your cart is empty" hint="Tools you add from the marketplace will collect here." />
          ) : (
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={`${l.slug}-${l.tier.name}`}>
                  <GlassCard glow="none" className="flex items-center gap-4 p-4">
                    <MediaTile tint={l.product.thumbTint} aspect="square" className="h-14 w-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{l.product.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {l.tier.name} · {formatPrice(l.tier.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(l.slug, l.tier.name, l.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-white/25 hover:text-slate-100"
                        >
                          <Minus className="h-3 w-3" aria-hidden />
                        </button>
                        <span className="w-5 text-center text-sm text-slate-200">{l.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(l.slug, l.tier.name, l.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-white/25 hover:text-slate-100"
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQty(l.slug, l.tier.name, 0)}
                          className="ml-2 text-xs text-slate-500 underline-offset-2 transition-colors hover:text-slate-300 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-100">{formatPrice(l.tier.price * l.qty)}</span>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/5 px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Subtotal</span>
            <span className="text-lg font-semibold text-slate-100">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-full bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-slate-500"
          >
            Checkout — coming soon
          </button>
          <p className="mt-2.5 text-center text-xs leading-relaxed text-slate-500">
            Secure checkout via Lemon Squeezy is being wired up — nothing is charged yet.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/25 hover:text-slate-100"
          >
            Keep browsing
          </button>
        </div>
      </aside>
    </>
  );
}
