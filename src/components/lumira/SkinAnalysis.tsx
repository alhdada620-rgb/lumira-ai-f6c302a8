import { Sparkles, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { useServerFn } from "@tanstack/react-start";
import { generateSkinInsight } from "@/utils/skin-insight.functions";
import { onVoiceCommand, reportCommandResult, type CommandSource } from "./voice-events";
import { useT } from "./i18n";

type MetricKey = "hydration" | "smoothness" | "skinTone";

const metricConfig: { labelKey: string; key: MetricKey; color: string }[] = [
  { labelKey: "skin.metric.hydration", key: "hydration", color: "oklch(0.8 0.15 200)" },
  { labelKey: "skin.metric.smoothness", key: "smoothness", color: "oklch(0.8 0.18 160)" },
  { labelKey: "skin.metric.skinTone", key: "skinTone", color: "oklch(0.78 0.18 320)" },
];

const initialValues: Record<MetricKey, number> = {
  hydration: 87,
  smoothness: 92,
  skinTone: 78,
};

function CircularGauge({
  value,
  color,
  label,
  titleText,
  ariaText,
  onClick,
}: {
  value: number;
  color: string;
  label: string;
  titleText: string;
  ariaText: string;
  onClick: () => void;
}) {
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (value / 100) * circumference;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 rounded-lg p-1 transition hover:bg-accent/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      title={titleText}
      aria-label={ariaText}
    >
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="oklch(0.3 0.04 230 / 0.4)" strokeWidth="4" />
          <circle
            cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-light text-foreground text-glow transition group-hover:scale-110">
            {value}
          </span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent">
        {label}
      </span>
    </button>
  );
}

type HistoryEntry = { id: number; text: string; ts: number };

export function SkinAnalysis() {
  const generate = useServerFn(generateSkinInsight);
  const { t, lang } = useT();
  const [values, setValues] = useState<Record<MetricKey, number>>(initialValues);
  const [insight, setInsight] = useState<string>(() => t("skin.analyzing"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const reqIdRef = useRef(0);
  const entryIdRef = useRef(0);

  // Tick every 15s so relative timestamps stay fresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
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

  const fetchInsight = async (next: Record<MetricKey, number>, source?: CommandSource) => {
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await generate({ data: next });
      if (myReq !== reqIdRef.current) return;
      setInsight(res.insight);
      setError(res.error);
      if (!res.error) {
        setHistory((prev) => [
          { id: ++entryIdRef.current, text: res.insight, ts: Date.now() },
          ...prev,
        ].slice(0, 3));
        if (source) {
          reportCommandResult({
            command: "analyze-skin", source, status: "success",
            message: t("skin.cmd.newInsight"),
          });
        }
      } else if (source) {
        reportCommandResult({
          command: "analyze-skin", source, status: "error",
          message:
            res.error === "rate_limit" ? t("skin.cmd.rateLimit") :
            res.error === "payment_required" ? t("skin.cmd.creditsOut") :
            res.error === "missing_key" ? t("skin.cmd.notConfigured") :
            t("skin.cmd.gatewayError"),
        });
      }
    } catch (e) {
      if (myReq !== reqIdRef.current) return;
      console.error(e);
      setInsight(t("skin.unable"));
      setError("network_error");
      if (source) {
        reportCommandResult({
          command: "analyze-skin", source, status: "error", message: t("skin.cmd.networkError"),
        });
      }
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  };

  // Debounce AI calls so rapid taps don't spam the gateway
  useEffect(() => {
    const t = setTimeout(() => {
      fetchInsight(values);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  // Voice command: re-run analysis on demand
  useEffect(() => {
    const off = onVoiceCommand((cmd, source) => {
      if (cmd === "analyze-skin") fetchInsight(values, source);
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const simulate = (key: MetricKey) => {
    setValues((prev) => {
      const current = prev[key];
      let next = current;
      let tries = 0;
      while (next === current && tries < 5) {
        const delta = Math.round((Math.random() - 0.5) * 30);
        next = Math.max(40, Math.min(99, current + delta));
        tries++;
      }
      return { ...prev, [key]: next };
    });
  };

  return (
    <GlassPanel title={t("skin.title")} icon={<Sparkles className="h-3.5 w-3.5" />} accent>
      <div className="flex justify-around">
        {metricConfig.map((m) => {
          const label = t(m.labelKey);
          return (
            <CircularGauge
              key={m.key}
              value={values[m.key]}
              color={m.color}
              label={label}
              titleText={t("skin.gauge.tapTitle", { label })}
              ariaText={t("skin.gauge.aria", { label, value: values[m.key] })}
              onClick={() => simulate(m.key)}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-[9px] uppercase tracking-widest text-muted-foreground/60">
        {t("skin.tapHint")}
      </p>
      <div className="mt-5 rounded-md border border-accent/20 bg-accent/5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="text-accent">{t("skin.aiInsight")}</span>{" "}
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
                <span className="ms-1">{t("skin.thinking")}</span>
              </span>
            ) : (
              insight
            )}
          </p>
          <button
            onClick={() => fetchInsight(values)}
            disabled={loading}
            className="shrink-0 rounded-full p-1 text-accent/70 transition hover:bg-accent/10 hover:text-accent disabled:opacity-40"
            title={t("skin.refresh")}
            aria-label={t("skin.refresh")}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {error && !loading && (
          <p className="mt-1.5 text-[10px] uppercase tracking-widest text-destructive/70">
            {error === "rate_limit" && t("skin.error.rate_limit")}
            {error === "payment_required" && t("skin.error.payment_required")}
            {error === "missing_key" && t("skin.error.missing_key")}
            {(error === "gateway_error" || error === "network_error") && t("skin.error.gateway_error")}
          </p>
        )}
      </div>
      {history.length > 1 && (
        <div className="mt-3 space-y-1.5 border-t border-accent/10 pt-2.5">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
            {t("skin.recent")}
          </p>
          {history.slice(1).map((h) => (
            <div key={h.id} className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent/40" />
              <p className="flex-1 text-[10px] leading-relaxed text-muted-foreground/70 line-clamp-2">
                {h.text}
              </p>
              <span className="shrink-0 text-[9px] uppercase tracking-wider text-muted-foreground/50">
                {formatRelative(h.ts)}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
