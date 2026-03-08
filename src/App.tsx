import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Auth from "./pages/Auth";
import Social from "./pages/Social";
import Pulse from "./pages/Pulse";
import Marketplace from "./pages/Marketplace";
import Safety from "./pages/Safety";
import Leaderboard from "./pages/Leaderboard";
import VisionQuest from "./pages/VisionQuest";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/vision-quest" element={<VisionQuest />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/social" replace />} />
            <Route path="social" element={<Social />} />
            <Route path="pulse" element={<Pulse />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="safety" element={<Safety />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
