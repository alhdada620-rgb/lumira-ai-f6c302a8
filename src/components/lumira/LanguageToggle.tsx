import { Languages } from "lucide-react";
import { useT } from "./i18n";

export function LanguageToggle() {
  const { toggleLang, t, lang } = useT();
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t("header.langSwitchAria")}
      title={t("header.langSwitchAria")}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-primary backdrop-blur transition hover:border-primary/60 hover:bg-primary/10 hover:shadow-[var(--glow-soft)]"
    >
      <Languages className="h-3 w-3" />
      <span
        className={lang === "en" ? "font-arabic" : "font-latin"}
        style={{
          fontFamily:
            lang === "en"
              ? "'Tajawal','Noto Kufi Arabic','Cairo',system-ui,sans-serif"
              : "'Inter', system-ui, sans-serif",
        }}
      >
        {t("header.langSwitch")}
      </span>
    </button>
  );
}
