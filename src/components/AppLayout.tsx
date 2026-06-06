import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { HubIndicator } from "./CitySync";
import { OnboardingTour } from "./OnboardingTour";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { RadioDialSidebar } from "./retro/RadioDialSidebar";
import { PageTransition } from "./retro/PageTransition";
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-[2000ms] md:pl-[88px]">
      <OnboardingTour />
      <OnboardingChecklist />
      <RadioDialSidebar />
      {/* Alpha tester mode banner — remove with ALPHA_MOCK_AUTH in useAuth.ts */}
      <div className="sticky top-0 z-30 w-full bg-[hsl(var(--foreground))] text-[hsl(var(--amber))] border-b-2 border-[hsl(var(--foreground))] px-3 py-1 text-center font-mono-retro text-[10px] tracking-[0.3em] uppercase">
        ▮ Wayfare V0 · Alpha Preview · login bypassed for testers ▮
      </div>
      <header className="flex items-center justify-end px-4 py-2">
        <HubIndicator />
      </header>
      <main className="pb-24 md:pb-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
