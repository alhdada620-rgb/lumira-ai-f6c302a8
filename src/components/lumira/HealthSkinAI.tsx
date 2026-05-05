// ... (نفس الـ imports اللي عندك)

export function HealthSkinAI() {
  const { t, lang } = useT();
  const isAr = lang === "ar";
  // ... (نفس الـ states)

  return (
    <GlassPanel title={t("skin.title")} icon={<Sparkles className="h-4 w-4 text-cyan-400" />}>
      <div className="flex h-[300px] gap-4 p-2">
        {/* Sliders العمودية على اليسار */}
        <div className="flex flex-col justify-around py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase rotate-180 [writing-mode:vertical-lr]">{t("skin.hydration")}</span>
            <input type="range" className="h-24 w-1 accent-cyan-500 [appearance:slider-vertical]" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase rotate-180 [writing-mode:vertical-lr]">{t("skin.smoothness")}</span>
            <input type="range" className="h-24 w-1 accent-cyan-500 [appearance:slider-vertical]" />
          </div>
        </div>

        {/* منطقة العرض الرئيسية (السكين سكان) */}
        <div className="relative flex-1 rounded-2xl border border-cyan-500/20 bg-black/40 overflow-hidden neon-border">
          <img src={skinScan} className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-3 w-full text-center">
             <button className="bg-cyan-500 text-black text-[10px] px-4 py-1 rounded-full font-bold animate-pulse">
               {isAr ? "بدء التحليل الذكي" : "START AI SCAN"}
             </button>
          </div>
        </div>

        {/* Sliders العمودية على اليمين */}
        <div className="flex flex-col justify-around py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase [writing-mode:vertical-lr]">{t("skin.tone")}</span>
            <input type="range" className="h-24 w-1 accent-cyan-500 [appearance:slider-vertical]" />
          </div>
          <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] text-cyan-400 font-bold uppercase [writing-mode:vertical-lr]">UV</span>
             <input type="range" className="h-24 w-1 accent-cyan-500 [appearance:slider-vertical]" />
          </div>
        </div>
      </div>

      {/* توقيع إسلام علي في نهاية العنصر */}
      <div className="mt-2 text-center border-t border-white/5 pt-2">
        <p className="text-[9px] text-white/30 tracking-widest uppercase">Dev: Islam Ali | #إسلام_علي</p>
      </div>
    </GlassPanel>
  );
}
