import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import FunnelLeads from "./pages/FunnelLeads";
import ConversionRetention from "./pages/ConversionRetention";
import PowerCycleVsBarre from "./pages/PowerCycleVsBarre";
import Sessions from "./pages/Sessions";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ExecutiveSummary />} />
            <Route path="/funnel-leads" element={<FunnelLeads />} />
            <Route path="/conversion-retention" element={<ConversionRetention />} />
            <Route path="/power-cycle-vs-barre" element={<PowerCycleVsBarre />} />
            <Route path="/sessions" element={<Sessions />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
