import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Zones from "./pages/Zones";
import ZoneDetail from "./pages/ZoneDetail";
import Households from "./pages/Households";
import Bins from "./pages/Bins";
import Campaigns from "./pages/Campaigns";
import Organization from "./pages/Organization";
import NotFound from "./pages/NotFound";

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
          <Route path="/admin/zones/:zoneId/analyze" element={<ZoneDetail />} />
          <Route path="/admin/households" element={<Households />} />
          <Route path="/admin/bins" element={<Bins />} />
          <Route path="/admin/campaigns" element={<Campaigns />} />
          <Route path="/admin/organization" element={<Organization />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
