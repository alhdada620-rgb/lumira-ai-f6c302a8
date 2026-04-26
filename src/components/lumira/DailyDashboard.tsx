import { Cloud, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { useWallet } from "./wallet-context";
import { useT } from "./i18n";

export function DailyDashboard() {
  const [now, setNow] = useState<Date | null>(null);
  const { balance, todayDelta } = useWallet();
  const { t, lang } = useT();

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const time = now
    ? now.toLocaleTimeString(lang === "ar" ? "en-US" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "--:--";
  const date = now ? now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" }) : "\u00a0";

  const formattedBalance = balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const deltaPositive = todayDelta >= 0;
  const deltaLabel = `${deltaPositive ? "+" : "−"}${Math.abs(todayDelta).toFixed(2)} ${t("dashboard.wallet.today")}`;

  return (
    <GlassPanel className="col-span-full lg:col-span-2">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Time */}
        <div className="text-center md:text-start">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t("dashboard.localTime")}</div>
          <div className="mt-1 font-light text-6xl tabular-nums text-foreground text-glow tracking-tight">
            {time}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{date}</div>
        </div>

        {/* Weather */}
        <div className="flex flex-col items-center justify-center border-y border-primary/10 py-4 md:border-x md:border-y-0 md:py-0">
          <Cloud className="h-8 w-8 text-primary animate-float-slow" style={{ filter: "drop-shadow(0 0 12px var(--primary))" }} />
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-light text-glow">22</span>
            <span className="text-sm text-muted-foreground">°C</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("dashboard.weather.condition")}</div>
          <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
            <span>{t("dashboard.weather.h")} 28°</span>
            <span>{t("dashboard.weather.l")} 17°</span>
            <span>{t("dashboard.weather.hum")} 54%</span>
          </div>
        </div>

        {/* Pi Wallet — balance only, no fiat conversion */}
        <div className="text-center md:text-end">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:justify-end">
            <Wallet className="h-3 w-3 text-accent" />
            {t("dashboard.wallet.title")}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-1.5 md:justify-end">
            <span className="text-3xl font-light text-glow-accent">π</span>
            <span className="font-light text-4xl tabular-nums text-glow-accent">{formattedBalance}</span>
          </div>
          <div
            className={`mt-1 text-xs uppercase tracking-widest ${
              deltaPositive ? "text-emerald-400/90" : "text-destructive/90"
            }`}
          >
            {deltaLabel}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
