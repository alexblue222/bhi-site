// ─── hub Worker client — safe to import in browser islands ────────────────────
// 🔒 hub. is the ONLY backend this site talks to. Never lab. / api.
import type { FeedItem } from "./data";

export const HUB_API = "https://hub.bluehorizoninteractive.com";

/** Live feed from the hub Worker. Any failure (offline, timeout, Worker not
 *  deployed yet, bad payload) resolves to [] so the feed renders from git content. */
export async function fetchLiveFeed(): Promise<FeedItem[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(`${HUB_API}/feed`, { signal: ctrl.signal });
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: FeedItem[] };
    return Array.isArray(json?.items) ? json.items : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
