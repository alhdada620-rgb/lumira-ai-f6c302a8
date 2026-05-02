import { Droplet, HeartPulse, Brain, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { useT } from "./i18n";

function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={`h-5 w-full text-primary ${className}`} preserveAspectRatio="none">
      <path
        d="M0,12 Q10,2 20,12 T40,12 T60,12 T80,12 T100,12 T120,12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
      />
    </svg>
  );
}

interface Row {
  icon: typeof Droplet;
  labelEn: string;
  labelAr: string;
  valueEn: string;
  valueAr: string;
  pct: number;
}

function jitter(base: number, range = 4, min = 0, max = 100) {
  const v = base + (Math.random() - 0.5) * range * 2;
  return Math.max(min, Math.min(max, v));
}

export function HealthSkinAI() {
  const { lang } = useT();
  const isAr = lang === "ar";
  const [bpm, setBpm] = useState(74);
  const [hydration, setHydration] = useState(82);
  const [stress, setStress] = useState(30);
  const [glow, setGlow] = useState(88);

  useEffect(() => {
    const id = setInterval(() => {
      setBpm((b) => Math.round(jitter(b, 3, 62, 92)));
      setHydration((h) => Math.round(jitter(h, 2, 70, 95)));
      setStress((s) => Math.round(jitter(s, 3, 15, 55)));
      setGlow((g) => Math.round(jitter(g, 2, 75, 98)));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const stressLabel = (n: number) => (n < 35 ? { en: "Low", ar: "منخفض" } : n < 60 ? { en: "Mild", ar: "متوسط" } : { en: "High", ar: "مرتفع" });
  const sl = stressLabel(stress);

  const rows: Row[] = [
    { icon: Droplet, labelEn: "Skin Hydration", labelAr: "ترطيب البشرة", valueEn: `${hydration}%`, valueAr: `${hydration}%`, pct: hydration },
    { icon: HeartPulse, labelEn: "Heart Rate", labelAr: "معدل النبض", valueEn: `${bpm} BPM`, valueAr: `${bpm} نبضة`, pct: Math.min(100, bpm) },
    { icon: Brain, labelEn: "Stress Level", labelAr: "مستوى التوتر", valueEn: sl.en, valueAr: sl.ar, pct: stress },
    { icon: Sparkles, labelEn: "Skin Glow", labelAr: "إشراق البشرة", valueEn: `${glow}%`, valueAr: `${glow}%`, pct: glow },
  ];

  return (
    <GlassPanel title={isAr ? "الصحة وذكاء البشرة" : "Health & Skin AI"} icon={<Sparkles className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 transition hover:border-primary/40 hover:shadow-[var(--glow-soft)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-background/40">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground truncate">
                    {isAr ? r.labelAr : r.labelEn}
                  </span>
                  <span className="text-sm font-light text-foreground text-glow tabular-nums">
                    {isAr ? r.valueAr : r.valueEn}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{ width: `${r.pct}%`, boxShadow: "0 0 8px var(--primary)" }}
                    />
                  </div>
                  <Wave className="w-10" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
