import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import EventRegistration from "./pages/EventRegistration";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ExhibitorRegister from "./pages/ExhibitorRegister";
import ExhibitorLogin from "./pages/ExhibitorLogin";
import ExhibitorPanel from "./pages/ExhibitorPanel";
import VisitorRegister from "./pages/VisitorRegister";
import DelegateRegister from "./pages/DelegateRegister";
import FabricatorRegister from "./pages/FabricatorRegister";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import DashboardWrapper from "./pages/DashboardWrapper";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import DownloadCenter from "./pages/DownloadCenter";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register/:eventId" element={<EventRegistration />} />
          
          {/* Exhibitor Zone */}
          <Route path="/exhibitor/register" element={<ExhibitorRegister />} />
          <Route path="/exhibitor/login" element={<ExhibitorLogin />} />
          <Route path="/exhibitor/panel" element={<ExhibitorPanel />} />
          
          {/* Visitor Zone */}
          <Route path="/visitor/register" element={<VisitorRegister />} />
          
          {/* Delegate/Conference Zone */}
          <Route path="/delegate/register" element={<DelegateRegister />} />
          
          {/* Fabricator/Vendor Zone */}
          <Route path="/fabricator/register" element={<FabricatorRegister />} />
          
          {/* Unified Dashboard & Resources */}
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/registration/success" element={<RegistrationSuccess />} />
          <Route path="/downloads" element={<DownloadCenter />} />
          
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
