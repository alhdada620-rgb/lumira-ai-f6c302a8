import { createFileRoute, Link } from "@tanstack/react-router";
import { HealthSkinAI } from "@/components/lumira/HealthSkinAI";
import { FashionStage } from "@/components/lumira/FashionStage";
import { PiPayWallet } from "@/components/lumira/PiPayWallet";
import { MiniDashboard } from "@/components/lumira/MiniDashboard";
import { VoiceVisualizer } from "@/components/lumira/VoiceVisualizer";
import { CameraProvider } from "@/components/lumira/camera-context";
import { WalletProvider } from "@/components/lumira/wallet-context";
import { ProfileProvider } from "@/components/lumira/profile-context";
import { SkinProvider } from "@/components/lumira/skin-context";
import { ProfileData } from "@/components/lumira/ProfileData";
import { SmartShopping } from "@/components/lumira/SmartShopping";
import { LanguageProvider, useT } from "@/components/lumira/i18n";
import { LanguageToggle } from "@/components/lumira/LanguageToggle";
import { CaptionsOverlay } from "@/components/lumira/CaptionsOverlay";
import { HudJump } from "@/components/lumira/HudJump";
import bgImg from "@/assets/lumira-bg.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <LanguageProvider>
      <WalletProvider>
        <ProfileProvider>
          <SkinProvider>
            <CameraProvider>
              <IndexShell />
            </CameraProvider>
          </SkinProvider>
        </ProfileProvider>
      </WalletProvider>
    </LanguageProvider>
  );
}

function IndexShell() {
  const { t, lang } = useT();
  const isAr = lang === "ar";

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      <CaptionsOverlay />
      <div className="fixed inset-0 -z-10 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${bgImg})` }} />
      
      <main className="relative z-10 p-4 md:p-8">
        <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
           <h1 className="text-2xl tracking-[0.3em] font-light">LUMIRA</h1>
           <div className="flex gap-4 items-center">
             <LanguageToggle />
             <span className="text-[10px] text-cyan-400">DEV: ISLAM ALI</span>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6"><HealthSkinAI /><VoiceVisualizer /></div>
          <div className="lg:col-span-6"><FashionStage /><SmartShopping /></div>
          <div className="lg:col-span-3 space-y-6"><MiniDashboard /><PiPayWallet /><ProfileData /></div>
        </div>
      </main>
      
      <footer className="p-4 text-center text-[10px] opacity-50 tracking-widest">
        #إسلام_علي | PI NETWORK ECOSYSTEM
      </footer>
    </div>
  );
}
