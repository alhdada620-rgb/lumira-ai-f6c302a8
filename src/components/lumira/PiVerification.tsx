import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, ExternalLink, RefreshCw } from "lucide-react";

const EXPECTED_KEY =
  "f51bf3dbe299a0b14c34f9600f4da97c80967509828e08f6cb9358c4e6f2c5dd71917a163a4cb882482fa0afb195abd842775e25c5ed5bcbef3a9bf92bf9c81c";

const DOMAIN_STORAGE_KEY = "lumira:pi-verification-domain";

type Status = "idle" | "checking" | "ok" | "mismatch" | "error";

function buildTargetUrl(domain: string): string {
  const trimmed = domain.trim();
  if (!trimmed) return "/validation-key.txt";
  // Strip trailing slashes
  let base = trimmed.replace(/\/+$/, "");
  // Add protocol if missing
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  // Remove trailing /validation-key.txt if user already typed it
  base = base.replace(/\/validation-key\.txt$/i, "");
  return `${base}/validation-key.txt`;
}

export function PiVerification() {
  const [mounted, setMounted] = useState(false);
  const [domain, setDomain] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [httpCode, setHttpCode] = useState<number | null>(null);
  const [detail, setDetail] = useState<string>("");
  const [lastCheckedAt, setLastCheckedAt] = useState<string>("");
  const [lastUrl, setLastUrl] = useState<string>("");

  const runCheck = async (overrideDomain?: string) => {
    const useDomain = overrideDomain ?? domain;
    const url = buildTargetUrl(useDomain);
    setLastUrl(url);
    setStatus("checking");
    setDetail("");
    setHttpCode(null);
    try {
      const res = await fetch(url, { cache: "no-store", mode: "cors" });
      setHttpCode(res.status);
      if (!res.ok) {
        setStatus("error");
        setDetail(`HTTP ${res.status} ${res.statusText || ""}`.trim());
        setLastCheckedAt(new Date().toLocaleTimeString());
        return;
      }
      const text = (await res.text()).trim();
      if (text === EXPECTED_KEY) {
        setStatus("ok");
        setDetail(`HTTP ${res.status} · key matches (${text.length} chars)`);
      } else {
        setStatus("mismatch");
        setDetail(
          `HTTP ${res.status} · got ${text.slice(0, 12)}… (${text.length} chars)`,
        );
      }
      setLastCheckedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setStatus("error");
      setDetail(
        e instanceof Error
          ? `${e.message} (CORS or network — try opening the file link)`
          : "Network error",
      );
      setLastCheckedAt(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    setMounted(true);
    let initial = "";
    try {
      initial = localStorage.getItem(DOMAIN_STORAGE_KEY) ?? "";
    } catch {
      // ignore
    }
    setDomain(initial);
    runCheck(initial);
  }, []);

  const handleSaveAndCheck = () => {
    try {
      if (domain.trim()) {
        localStorage.setItem(DOMAIN_STORAGE_KEY, domain.trim());
      } else {
        localStorage.removeItem(DOMAIN_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    runCheck();
  };

  const handleClearDomain = () => {
    setDomain("");
    try {
      localStorage.removeItem(DOMAIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    runCheck("");
  };

  if (!mounted) return null;

  const Icon =
    status === "ok"
      ? CheckCircle2
      : status === "checking" || status === "idle"
      ? Loader2
      : XCircle;

  const tone =
    status === "ok"
      ? "text-emerald-400 border-emerald-400/30"
      : status === "checking" || status === "idle"
      ? "text-muted-foreground border-primary/20"
      : "text-destructive border-destructive/40";

  const label =
    status === "ok"
      ? "Verified"
      : status === "checking" || status === "idle"
      ? "Checking…"
      : status === "mismatch"
      ? "Mismatch"
      : "Unreachable";

  const fileLink = buildTargetUrl(domain);

  return (
    <div className="mt-6 flex w-full max-w-xl flex-col items-center gap-3">
      <div
        className={`flex flex-wrap items-center justify-center gap-2 rounded-full border ${tone} bg-card/40 px-4 py-2 backdrop-blur`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${status === "checking" ? "animate-spin" : ""}`}
        />
        <span className="text-[10px] uppercase tracking-[0.25em]">
          Pi Verification: {label}
        </span>
        {httpCode !== null && (
          <span className="rounded-full border border-current/40 px-2 py-0.5 text-[9px] font-medium tracking-widest">
            HTTP {httpCode}
          </span>
        )}
        {detail && (
          <span className="text-[10px] tracking-wider text-muted-foreground/70">
            · {detail}
          </span>
        )}
      </div>

      <div className="flex w-full flex-col gap-2 rounded-2xl border border-primary/20 bg-card/40 p-3 backdrop-blur sm:flex-row sm:items-center">
        <input
          type="url"
          inputMode="url"
          placeholder="https://your-domain.com (leave blank for current site)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveAndCheck();
          }}
          className="flex-1 rounded-full border border-primary/20 bg-background/40 px-4 py-2 text-xs tracking-wider text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSaveAndCheck}
          disabled={status === "checking"}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-primary transition hover:bg-primary/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3 w-3 ${status === "checking" ? "animate-spin" : ""}`}
          />
          Verify
        </button>
        {domain && (
          <button
            type="button"
            onClick={handleClearDomain}
            className="rounded-full border border-border/40 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={fileLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Open file <ExternalLink className="h-3 w-3" />
        </a>
        {lastUrl && (
          <span className="max-w-full truncate text-[9px] tracking-widest text-muted-foreground/60">
            Target: {lastUrl}
          </span>
        )}
      </div>

      {lastCheckedAt && (
        <span className="text-[9px] tracking-[0.3em] text-muted-foreground/60">
          Last checked {lastCheckedAt}
        </span>
      )}
    </div>
  );
}
