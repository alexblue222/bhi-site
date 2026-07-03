import { Inbox, TriangleAlert } from "lucide-react";

// Shared list/grid states — every surface uses these so loading/empty/error feel like one system.

export function SkeletonCard({ media = true }: { media?: boolean }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      {media && <div className="mb-4 aspect-video rounded-xl bg-white/[0.05]" />}
      <div className="h-3 w-24 rounded bg-white/[0.06]" />
      <div className="mt-3 h-4 w-3/4 rounded bg-white/[0.08]" />
      <div className="mt-2 h-3 w-full rounded bg-white/[0.05]" />
      <div className="mt-1.5 h-3 w-2/3 rounded bg-white/[0.05]" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      <Inbox className="h-7 w-7 text-slate-600" aria-hidden />
      <p className="mt-4 font-medium text-slate-300">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({ title = "Couldn't load this source", hint }: { title?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-red-400/20 bg-red-500/[0.03] px-6 py-16 text-center">
      <TriangleAlert className="h-7 w-7 text-red-400/60" aria-hidden />
      <p className="mt-4 font-medium text-slate-300">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
