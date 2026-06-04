import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { HubIndicator } from "./CitySync";
import { OnboardingTour } from "./OnboardingTour";
import { OnboardingChecklist } from "./OnboardingChecklist";
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-[2000ms]">
      <OnboardingTour />
      <OnboardingChecklist />
      {/* Alpha tester mode banner — remove with ALPHA_MOCK_AUTH in useAuth.ts */}
      <div className="sticky top-0 z-50 w-full bg-primary/15 border-b border-primary/30 px-3 py-1.5 text-center text-[11px] font-medium text-primary backdrop-blur-sm">
        Wayfare V0 · Alpha Preview · login bypassed for testers
      </div>
      {/* Hub indicator header */}
      <header className="sticky top-0 z-40 flex items-center justify-end px-4 py-2">
        <HubIndicator />
      </header>
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
