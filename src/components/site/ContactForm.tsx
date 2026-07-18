import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

// Real contact form. Submit target is env-driven:
//   PUBLIC_CONTACT_ENDPOINT set  → POST JSON there (a form service or a hub-Worker route)
//   unset (default today)        → open the visitor's mail client with the message prefilled
// so the form is genuinely useful now, with zero backend, and becomes a true async submit
// the moment Alex wires an endpoint. ponytail: mailto fallback until a provider is chosen.
const ENDPOINT = import.meta.env.PUBLIC_CONTACT_ENDPOINT as string | undefined;
const TO = "hello@bluehorizoninteractive.com";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function validate(f: { name: string; email: string; message: string }): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Tell us who you are.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "A valid email, so we can reply.";
  if (f.message.trim().length < 10) e.message = "A line or two more about the project.";
  return e;
}

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-100 placeholder:text-slate-500 transition-colors focus:border-bh-blue/50";
const label = "block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const subject = f.subject.trim() || `New enquiry from ${f.name.trim()}`;

    if (!ENDPOINT) {
      // Prefilled mailto — hands off to the visitor's mail app, no backend needed.
      const body = `${f.message.trim()}\n\n— ${f.name.trim()} (${f.email.trim()})`;
      window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setState("sent");
      return;
    }

    try {
      setState("sending");
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, subject }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-bh-cyan/25 bg-white/[0.02] p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-bh-cyan/40 bg-bh-cyan/10">
          <Check className="h-5 w-5 text-bh-cyan" aria-hidden />
        </span>
        <h3 className="mt-5 text-xl font-semibold text-slate-100">Message on its way</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          {ENDPOINT
            ? "Thanks — we've got it and will reply to your inbox soon."
            : "We've opened your email app with the message ready — just hit send."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="cf-name">Name</label>
          <input id="cf-name" className={`mt-2 ${field}`} value={f.name} onChange={set("name")}
            placeholder="Your name" aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1.5 text-xs text-bh-amber">{errors.name}</p>}
        </div>
        <div>
          <label className={label} htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" className={`mt-2 ${field}`} value={f.email} onChange={set("email")}
            placeholder="you@studio.com" aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1.5 text-xs text-bh-amber">{errors.email}</p>}
        </div>
      </div>
      <div className="mt-5">
        <label className={label} htmlFor="cf-subject">Subject <span className="normal-case tracking-normal text-slate-600">— optional</span></label>
        <input id="cf-subject" className={`mt-2 ${field}`} value={f.subject} onChange={set("subject")}
          placeholder="Trailer, prototype, tool…" />
      </div>
      <div className="mt-5">
        <label className={label} htmlFor="cf-message">Message</label>
        <textarea id="cf-message" rows={5} className={`mt-2 resize-y ${field}`} value={f.message} onChange={set("message")}
          placeholder="What are you building, and how can we help?" aria-invalid={!!errors.message} />
        {errors.message && <p className="mt-1.5 text-xs text-bh-amber">{errors.message}</p>}
      </div>

      {state === "error" && (
        <p className="mt-4 text-sm text-bh-amber">
          Something went wrong sending that. Email us directly at{" "}
          <a href={`mailto:${TO}`} className="text-bh-cyan underline">{TO}</a>.
        </p>
      )}

      <button type="submit" disabled={state === "sending"}
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-bh-blue/40 bg-bh-blue/10 px-7 py-3.5 text-sm font-medium text-[#bfe0ff] transition-colors hover:bg-bh-blue/20 disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Send message"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
