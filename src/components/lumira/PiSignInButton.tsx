import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { usePiAuth } from "./pi-auth-context";
import { useT } from "./i18n";

export function PiSignInButton() {
  const { user, status, error, signIn } = usePiAuth();
  const { lang } = useT();
  const isAr = lang === "ar";

  const busy = status === "initializing" || status === "authenticating" || status === "verifying";

  if (status === "authenticated" && user) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300"
        title={user.uid}
      >
        <CheckCircle2 className="h-3 w-3" />@{user.username}
      </span>
    );
  }

  return (
    <button
      onClick={() => void signIn()}
      disabled={busy}
      title={error ?? undefined}
      className="pi-glow-cta group relative inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-[oklch(0.08_0.01_260)] px-5 py-2.5 text-xs font-bold tracking-wide text-white transition active:scale-[0.98] disabled:opacity-70"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-accent to-primary text-[14px] font-black italic leading-none text-background shadow-inner">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === "error" ? <AlertTriangle className="h-3.5 w-3.5" /> : "π"}
      </span>
      <span>
        {busy
          ? isAr ? "جاري الدخول…" : "Signing in…"
          : status === "error"
            ? isAr ? "حاول مجدداً" : "Retry"
            : isAr ? "دخول Pi" : "Sign in with Pi"}
      </span>
    </button>
  );
}
