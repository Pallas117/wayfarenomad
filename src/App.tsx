import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CitySyncProvider } from "./components/CitySync";
import { ScanningTheStars } from "./components/CitySync";
import { PowerProvider } from "./components/PowerProvider";
import { MOUAgreement } from "./components/MOUAgreement";
import Auth from "./pages/Auth";
import Social from "./pages/Social";
import Pulse from "./pages/Pulse";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PowerProvider>
      <CitySyncProvider>
        <Toaster />
        <Sonner />
        <ScanningTheStars />
        <MOUAgreement />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/vision-quest" element={<VisionQuest />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/pulse" replace />} />
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
