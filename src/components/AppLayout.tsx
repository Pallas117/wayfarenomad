import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { HubIndicator } from "./CitySync";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-[2000ms]">
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
