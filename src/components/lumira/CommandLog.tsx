import { History, CheckCircle2, XCircle, Mic, Hand } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { onCommandResult, type CommandResult, type VoiceCommand } from "./voice-events";
import { useT } from "./i18n";

const COMMAND_KEYS: Record<VoiceCommand, string> = {
  "analyze-skin": "log.cmd.analyzeSkin",
  "start-mirror": "log.cmd.startMirror",
  "stop-mirror": "log.cmd.stopMirror",
  "connect-pi-wallet": "log.cmd.connectPi",
  "next-outfit": "log.cmd.nextOutfit",
  "try-on-item": "log.cmd.tryOn",
};

type LogEntry = CommandResult & { id: number };

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function CommandLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [flash, setFlash] = useState<number | null>(null);
  const idRef = useRef(0);
  const { t, lang } = useT();

  useEffect(() => {
    return onCommandResult((result) => {
      const id = ++idRef.current;
      setEntries((prev) => [{ ...result, id }, ...prev].slice(0, 5));
      setFlash(id);
      window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 800);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  function formatRelative(ts: number): string {
    const diff = Math.max(0, Math.round((now - ts) / 1000));
    if (lang === "ar") {
      if (diff < 5) return "الآن";
      if (diff < 60) return `قبل ${diff} ث`;
      const m = Math.floor(diff / 60);
      if (m < 60) return `قبل ${m} د`;
      const h = Math.floor(m / 60);
      return `قبل ${h} س`;
    }
    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  }

  return (
    <GlassPanel title={t("log.title")} icon={<History className="h-3.5 w-3.5" />}>
      <div className="space-y-1.5">
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <History className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("log.empty.title")}
            </p>
            <p className="text-[10px] text-muted-foreground/50">
              {t("log.empty.subtitle")}
            </p>
          </div>
        )}

        {entries.map((e) => {
          const ok = e.status === "success";
          const isFlash = flash === e.id;
          const StatusIcon = ok ? CheckCircle2 : XCircle;
          const SourceIcon = e.source === "voice" ? Mic : Hand;
          return (
            <div
              key={e.id}
              className={`flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-xs transition ${
                ok
                  ? "border-emerald-400/20 bg-emerald-400/5"
                  : "border-destructive/25 bg-destructive/5"
              } ${isFlash ? "ring-1 ring-accent shadow-[var(--glow-soft)]" : ""}`}
            >
              <StatusIcon
                className={`h-3.5 w-3.5 shrink-0 ${
                  ok ? "text-emerald-400" : "text-destructive"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-foreground/90">
                    {t(COMMAND_KEYS[e.command])}
                  </span>
                  <SourceIcon
                    className="h-2.5 w-2.5 shrink-0 text-muted-foreground/60"
                  />
                </div>
                {e.message && (
                  <p
                    className={`truncate text-[10px] ${
                      ok ? "text-muted-foreground/70" : "text-destructive/80"
                    }`}
                  >
                    {e.message}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/80">
                  {formatTime(e.ts)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">
                  {formatRelative(e.ts)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
