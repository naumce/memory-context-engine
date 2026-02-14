import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Zones from "./pages/Zones";
import ZoneCreation from "./pages/ZoneCreation";
import ZoneDetail from "./pages/ZoneDetail";
import ZoneOperationsPage from "./pages/ZoneOperationsPage";
import Households from "./pages/Households";
import Bins from "./pages/Bins";
import Campaigns from "./pages/Campaigns";
import Organization from "./pages/Organization";
import NotFound from "./pages/NotFound";
import CitizenAuth from "./pages/CitizenAuth";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import CitizenSchedule from "./pages/citizen/CitizenSchedule";
import CitizenReport from "./pages/citizen/CitizenReport";
import CitizenRecycling from "./pages/citizen/CitizenRecycling";
import CitizenProfile from "./pages/citizen/CitizenProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/zones" element={<Zones />} />
          <Route path="/admin/zones/create" element={<ZoneCreation />} />
          <Route path="/admin/zones/:zoneId/analyze" element={<ZoneDetail />} />
          <Route path="/admin/zones/:zoneId/operations" element={<ZoneOperationsPage />} />
          <Route path="/admin/households" element={<Households />} />
          <Route path="/admin/bins" element={<Bins />} />
          <Route path="/admin/campaigns" element={<Campaigns />} />
          <Route path="/admin/organization" element={<Organization />} />
          {/* Citizen Portal */}
          <Route path="/citizen/auth" element={<CitizenAuth />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/schedule" element={<CitizenSchedule />} />
          <Route path="/citizen/report" element={<CitizenReport />} />
          <Route path="/citizen/recycling" element={<CitizenRecycling />} />
          <Route path="/citizen/profile" element={<CitizenProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
