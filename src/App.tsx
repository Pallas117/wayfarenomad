import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { useRouteBreadcrumb } from "@/hooks/useBreadcrumb";
import { CitySyncProvider } from "./components/CitySync";
import { ScanningTheStars } from "./components/CitySync";
import { PowerProvider } from "./components/PowerProvider";
import { MOUAgreement } from "./components/MOUAgreement";
import { Prefetcher } from "./components/Prefetcher";
import Social from "./pages/Social";
import Pulse from "./pages/Pulse";
import BulletinBoard from "./pages/retro/BulletinBoard";
import Logbook from "./pages/retro/Logbook";
import TicketCounter from "./pages/retro/TicketCounter";
// Marketplace archived — replaced by Luma integration in Pulse
import Safety from "./pages/Safety";
import Leaderboard from "./pages/Leaderboard";
import VisionQuest from "./pages/VisionQuest";
import SettingsPage from "./pages/Settings";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminVerify from "./pages/AdminVerify";
import KrabiHub from "./pages/KrabiHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RouteTracker = () => {
  useRouteBreadcrumb();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PowerProvider>
      <CitySyncProvider>
        <Toaster />
        <Sonner />
        <ScanningTheStars />
        <MOUAgreement />
        <Prefetcher />
        <BrowserRouter>
          <RouteTracker />
          <Routes>
            <Route path="/auth" element={<Navigate to="/pulse" replace />} />
            <Route path="/vision-quest" element={<VisionQuest />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/board" replace />} />
              <Route path="board" element={<BulletinBoard />} />
              <Route path="logbook" element={<Logbook />} />
              <Route path="tickets" element={<TicketCounter />} />
              <Route path="social" element={<Social />} />
              <Route path="pulse" element={<Pulse />} />
              {/* marketplace archived */}
              <Route path="safety" element={<Safety />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="krabi" element={<KrabiHub />} />
              <Route path="admin/verify" element={<AdminVerify />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CitySyncProvider>
      </PowerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
