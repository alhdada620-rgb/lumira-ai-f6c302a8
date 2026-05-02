import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { Sparkles, Camera, CameraOff, Loader2, X, ShoppingBag, ExternalLink } from "lucide-react";
import { useCamera } from "./camera-context";
import { useT } from "./i18n";

interface CatalogItem {
  id: string;
  name: string;
  tag: string;
  /** AR overlay tint */
  gradient: string;
  /** Amazon search query */
  query: string;
}

interface Brand {
  id: string;
  name: string;
  outfit: string;
  tint: string;
  items: CatalogItem[];
}

const BRANDS: Brand[] = [
  {
    id: "hm", name: "H&M", outfit: "Casual Crew",
    tint: "linear-gradient(135deg, oklch(0.55 0.2 25 / 0.55), oklch(0.4 0.15 25 / 0.4))",
    items: [
      { id: "hm-1", name: "Oversized Cotton Tee", tag: "Everyday", query: "h&m oversized cotton tee",
        gradient: "linear-gradient(135deg, oklch(0.9 0.02 90 / 0.5), oklch(0.78 0.04 80 / 0.4))" },
      { id: "hm-2", name: "Relaxed Denim Jacket", tag: "Layering", query: "h&m relaxed denim jacket",
        gradient: "linear-gradient(135deg, oklch(0.45 0.08 240 / 0.5), oklch(0.6 0.1 230 / 0.45))" },
      { id: "hm-3", name: "Linen Blazer", tag: "Smart Casual", query: "h&m linen blazer",
        gradient: "linear-gradient(135deg, oklch(0.7 0.05 70 / 0.5), oklch(0.55 0.06 60 / 0.4))" },
      { id: "hm-4", name: "Knit Mock-Neck Sweater", tag: "Winter", query: "h&m knit mock neck sweater",
        gradient: "linear-gradient(135deg, oklch(0.5 0.08 25 / 0.5), oklch(0.35 0.1 20 / 0.45))" },
    ],
  },
  {
    id: "nike", name: "NIKE", outfit: "Sporty Tech Fleece",
    tint: "linear-gradient(135deg, oklch(0.5 0.1 230 / 0.55), oklch(0.3 0.05 230 / 0.45))",
    items: [
      { id: "nike-1", name: "Tech Fleece Hoodie", tag: "Training", query: "nike tech fleece hoodie",
        gradient: "linear-gradient(135deg, oklch(0.25 0.02 260 / 0.55), oklch(0.4 0.04 260 / 0.45))" },
      { id: "nike-2", name: "Aero Run Vest", tag: "Performance", query: "nike aero run vest",
        gradient: "linear-gradient(135deg, oklch(0.7 0.2 150 / 0.5), oklch(0.55 0.18 170 / 0.4))" },
      { id: "nike-3", name: "Dri-FIT Tee", tag: "Sport", query: "nike dri-fit shirt",
        gradient: "linear-gradient(135deg, oklch(0.5 0.18 25 / 0.5), oklch(0.4 0.16 20 / 0.4))" },
      { id: "nike-4", name: "Tech Pack Joggers", tag: "Lifestyle", query: "nike tech pack joggers",
        gradient: "linear-gradient(135deg, oklch(0.2 0.02 260 / 0.55), oklch(0.35 0.04 260 / 0.45))" },
    ],
  },
  {
    id: "zara", name: "ZARA", outfit: "Minimal Tailoring",
    tint: "linear-gradient(135deg, oklch(0.35 0.04 60 / 0.55), oklch(0.2 0.02 60 / 0.45))",
    items: [
      { id: "zara-1", name: "Tailored Wool Blazer", tag: "Smart Casual", query: "zara tailored wool blazer",
        gradient: "linear-gradient(135deg, oklch(0.3 0.02 260 / 0.55), oklch(0.5 0.04 260 / 0.45))" },
      { id: "zara-2", name: "Satin Slip Dress", tag: "Evening", query: "zara satin slip dress",
        gradient: "linear-gradient(135deg, oklch(0.55 0.12 350 / 0.5), oklch(0.7 0.1 320 / 0.4))" },
      { id: "zara-3", name: "Pleated Wide-Leg Trousers", tag: "Modern", query: "zara pleated wide leg trousers",
        gradient: "linear-gradient(135deg, oklch(0.4 0.03 80 / 0.55), oklch(0.25 0.02 80 / 0.45))" },
      { id: "zara-4", name: "Cropped Leather Jacket", tag: "Statement", query: "zara cropped leather jacket",
        gradient: "linear-gradient(135deg, oklch(0.18 0.02 30 / 0.55), oklch(0.3 0.04 30 / 0.45))" },
    ],
  },
  {
    id: "namshi", name: "NAMSHI", outfit: "Modern Abaya",
    tint: "linear-gradient(135deg, oklch(0.6 0.18 320 / 0.5), oklch(0.4 0.12 280 / 0.4))",
    items: [
      { id: "nam-1", name: "Onyx Embroidered Abaya", tag: "Formal", query: "namshi embroidered abaya",
        gradient: "linear-gradient(135deg, oklch(0.2 0.02 280 / 0.55), oklch(0.4 0.05 280 / 0.45))" },
      { id: "nam-2", name: "Royal Velvet Kaftan", tag: "Occasion", query: "namshi velvet kaftan",
        gradient: "linear-gradient(135deg, oklch(0.35 0.15 280 / 0.5), oklch(0.55 0.18 300 / 0.4))" },
      { id: "nam-3", name: "Silk Hijab Set", tag: "Daily", query: "namshi silk hijab",
        gradient: "linear-gradient(135deg, oklch(0.7 0.08 320 / 0.5), oklch(0.55 0.1 300 / 0.4))" },
      { id: "nam-4", name: "Pearl Detail Jalabiya", tag: "Festive", query: "namshi pearl jalabiya",
        gradient: "linear-gradient(135deg, oklch(0.85 0.04 80 / 0.5), oklch(0.7 0.06 60 / 0.4))" },
    ],
  },
  {
    id: "adidas", name: "ADIDAS", outfit: "Track Suit",
    tint: "linear-gradient(135deg, oklch(0.45 0.08 250 / 0.55), oklch(0.25 0.04 250 / 0.45))",
    items: [
      { id: "adi-1", name: "Originals Track Jacket", tag: "Retro", query: "adidas originals track jacket",
        gradient: "linear-gradient(135deg, oklch(0.3 0.05 250 / 0.55), oklch(0.5 0.08 250 / 0.45))" },
      { id: "adi-2", name: "Tiro Training Pants", tag: "Sport", query: "adidas tiro training pants",
        gradient: "linear-gradient(135deg, oklch(0.2 0.02 260 / 0.55), oklch(0.35 0.04 260 / 0.45))" },
      { id: "adi-3", name: "Ultraboost Tee", tag: "Run", query: "adidas ultraboost shirt",
        gradient: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.5), oklch(0.5 0.18 220 / 0.4))" },
      { id: "adi-4", name: "Three-Stripe Hoodie", tag: "Lifestyle", query: "adidas three stripe hoodie",
        gradient: "linear-gradient(135deg, oklch(0.25 0.03 260 / 0.55), oklch(0.4 0.05 260 / 0.45))" },
    ],
  },
  {
    id: "sephora", name: "SEPHORA", outfit: "Beauty Glow",
    tint: "linear-gradient(135deg, oklch(0.6 0.2 0 / 0.5), oklch(0.4 0.18 350 / 0.4))",
    items: [
      { id: "sep-1", name: "Velvet Matte Lipstick", tag: "Bestseller", query: "sephora velvet matte lipstick",
        gradient: "linear-gradient(135deg, oklch(0.55 0.22 25 / 0.5), oklch(0.4 0.18 15 / 0.4))" },
      { id: "sep-2", name: "Liquid Glow Highlighter", tag: "New", query: "sephora liquid glow highlighter",
        gradient: "linear-gradient(135deg, oklch(0.85 0.1 80 / 0.5), oklch(0.7 0.12 60 / 0.4))" },
      { id: "sep-3", name: "Precision Eyeliner", tag: "Pro", query: "sephora precision eyeliner",
        gradient: "linear-gradient(135deg, oklch(0.18 0.02 260 / 0.55), oklch(0.3 0.04 260 / 0.45))" },
      { id: "sep-4", name: "Cloud Blush", tag: "Sheer", query: "sephora cloud blush",
        gradient: "linear-gradient(135deg, oklch(0.78 0.12 15 / 0.5), oklch(0.65 0.14 10 / 0.4))" },
    ],
  },
];

export function FashionStage() {
  const { lang } = useT();
  const isAr = lang === "ar";
  const { stream, active, error, starting, start, stop } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeBrandIdx, setActiveBrandIdx] = useState(0);
  const [openMall, setOpenMall] = useState<Brand | null>(null);
  const [overlay, setOverlay] = useState<{ id: string; name: string; brand: string; gradient: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [trying, setTrying] = useState(false);

  const brand = BRANDS[activeBrandIdx];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (stream) {
      v.srcObject = stream;
      v.play().catch(() => {});
    } else {
      v.srcObject = null;
    }
  }, [stream]);

  const runProgress = () => {
    setTrying(true);
    setProgress(0);
    const startTs = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - startTs) / 1500) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setTrying(false), 400);
      }
    }, 50);
  };

  const tryItem = (b: Brand, item: CatalogItem) => {
    setOverlay({ id: item.id, name: item.name, brand: b.name, gradient: item.gradient });
    runProgress();
  };

  const tryBrandDefault = () => {
    setOverlay({ id: brand.id, name: brand.outfit, brand: brand.name, gradient: brand.tint });
    runProgress();
  };

  const amazonUrl = (q: string) =>
    `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;

  return (
    <GlassPanel
      title={isAr ? "المرآة الذكية · واقع معزز" : "Smart Mirror · AR"}
      icon={<Sparkles className="h-3.5 w-3.5" />}
      accent
      className="lg:col-span-1"
    >
      <div className="space-y-4">
        {/* Live mirror frame */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-accent/30 bg-background/40">
          <div className="pointer-events-none absolute -inset-px rounded-xl shadow-[var(--glow-primary)]" />
          <div className="absolute inset-0 hud-grid opacity-25" />

          {/* Live camera feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: "scaleX(-1)",
              filter: "brightness(1.05) contrast(1.05) saturate(1.1) drop-shadow(0 0 18px var(--primary))",
              opacity: active ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />

          {/* Idle state */}
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 animate-ring-rotate rounded-full border border-dashed border-primary/40" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 shadow-[var(--glow-soft)]" />
                <Camera className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                {isAr ? "المرآة في وضع الاستعداد" : "Mirror Standby"}
              </p>
              <button
                onClick={start}
                disabled={starting}
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-primary shadow-[var(--glow-soft)] hover:shadow-[var(--glow-primary)] disabled:opacity-60"
              >
                {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                {starting ? (isAr ? "جاري التشغيل…" : "Starting…") : (isAr ? "تشغيل الكاميرا" : "Start Mirror")}
              </button>
              {error && <p className="text-[10px] text-destructive/80">{error}</p>}
            </div>
          )}

          {/* AR outfit overlay on live feed */}
          {overlay && (
            <div
              key={overlay.id}
              className="pointer-events-none absolute inset-0 transition-opacity duration-700 animate-fade-in"
              style={{ background: overlay.gradient, mixBlendMode: "overlay", opacity: 0.85 }}
            />
          )}

          {/* AR brand watermark */}
          {overlay && (
            <div
              key={`wm-${overlay.id}`}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 text-2xl font-extrabold tracking-[0.15em] text-foreground/85 text-glow-accent drop-shadow-[0_0_12px_rgba(0,0,0,0.6)] animate-fade-in"
            >
              {overlay.brand}
            </div>
          )}

          {/* Outfit name badge */}
          {overlay && (
            <div
              key={`of-${overlay.id}`}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full border border-accent/50 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-accent backdrop-blur animate-fade-in shadow-[var(--glow-accent)]"
            >
              {overlay.name}
            </div>
          )}

          {/* AR / live tag */}
          <div className="absolute start-3 top-3 flex items-center gap-1 rounded border border-primary/40 bg-background/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-primary backdrop-blur">
            <span className={`h-1 w-1 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`} />
            {active ? (isAr ? "مباشر" : "LIVE") : "AR"}
          </div>

          {/* Stop btn */}
          {active && (
            <button
              onClick={stop}
              className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-background/60 px-2 py-1 text-[9px] uppercase tracking-widest text-destructive backdrop-blur hover:bg-destructive/15"
            >
              <CameraOff className="h-3 w-3" />
              {isAr ? "إيقاف" : "Stop"}
            </button>
          )}

          {/* Scan + progress */}
          {trying && (
            <>
              <div className="pointer-events-none absolute inset-x-0 h-12 animate-scan bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 rounded-full border border-accent/30 bg-background/70 p-0.5 backdrop-blur">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${progress}%`, boxShadow: "0 0 8px var(--accent)" }}
                />
              </div>
            </>
          )}
        </div>

        {/* Try-on / Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={tryBrandDefault}
            disabled={trying}
            className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-primary/50 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 px-5 py-2.5 text-xs uppercase tracking-[0.4em] text-foreground shadow-[var(--glow-soft)] transition hover:shadow-[var(--glow-primary)] active:scale-[0.98] disabled:opacity-70"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {trying
              ? isAr ? `جاري التركيب… ${Math.round(progress)}%` : `Fitting… ${Math.round(progress)}%`
              : isAr ? "جرّب الآن" : "Try On"}
          </button>
          {overlay && (
            <button
              onClick={() => setOverlay(null)}
              className="rounded-full border border-destructive/40 bg-destructive/10 p-2.5 text-destructive hover:bg-destructive/20"
              title={isAr ? "مسح" : "Clear"}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Brand carousel — clicking opens mall */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-lg border border-primary/20 bg-card/40 p-2">
          {BRANDS.map((b, i) => {
            const isActive = i === activeBrandIdx;
            return (
              <button
                key={b.id}
                onClick={() => { setActiveBrandIdx(i); setOpenMall(b); }}
                title={b.outfit}
                className={`relative shrink-0 rounded-md px-3 py-2 text-[11px] font-bold tracking-widest transition-all active:scale-95 ${
                  isActive
                    ? "border border-accent/60 bg-accent/15 text-accent shadow-[var(--glow-accent)]"
                    : "border border-primary/15 bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>

        <p className="text-center text-[9px] uppercase tracking-[0.3em] text-muted-foreground/70">
          {isAr ? "انقر على ماركة لفتح المتجر" : "Tap a brand to open the mall"}
        </p>
      </div>

      {/* Mall modal */}
      {openMall && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm sm:items-center"
          onClick={() => setOpenMall(null)}
        >
          <div
            className="glass-panel relative max-h-[88vh] w-full max-w-2xl overflow-y-auto p-5 sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-primary/15 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-medium uppercase tracking-[0.25em] text-foreground text-glow-accent">
                  {openMall.name} · {isAr ? "المتجر" : "Mall"}
                </h3>
              </div>
              <button
                onClick={() => setOpenMall(null)}
                className="rounded-full border border-primary/30 bg-card/40 p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {openMall.items.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg border border-accent/30 bg-card/40 backdrop-blur transition hover:shadow-[var(--glow-soft)]"
                >
                  <div className="relative h-28">
                    <div className="absolute inset-0" style={{ background: item.gradient }} />
                    <div className="absolute inset-0 hud-grid opacity-30" />
                    <svg viewBox="0 0 100 120" className="absolute inset-0 mx-auto h-full text-foreground/40">
                      <circle cx="50" cy="22" r="9" fill="currentColor" opacity="0.4" />
                      <path d="M30,42 L70,42 L74,92 L60,92 L55,58 L45,58 L40,92 L26,92 Z" fill="currentColor" opacity="0.4" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 p-2.5">
                    <p className="truncate text-xs text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{openMall.name} · {item.tag}</p>
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => { tryItem(openMall, item); setOpenMall(null); if (!active) start(); }}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1.5 text-[10px] uppercase tracking-widest text-primary transition hover:bg-primary/20 hover:shadow-[var(--glow-soft)]"
                      >
                        <Sparkles className="h-3 w-3" /> {isAr ? "جرّب" : "Try On"}
                      </button>
                      <a
                        href={amazonUrl(item.query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-2 py-1.5 text-[10px] uppercase tracking-widest text-accent transition hover:bg-accent/20"
                        title={isAr ? "تسوّق على أمازون" : "Shop on Amazon"}
                      >
                        <ExternalLink className="h-3 w-3" /> {isAr ? "أمازون" : "Amazon"}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
