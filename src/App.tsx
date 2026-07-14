import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/utils/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import EventRegistration from "./pages/EventRegistration";
import EventDetails from "./pages/EventDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ExhibitorRegister from "./pages/ExhibitorRegister";
import ExhibitorLogin from "./pages/ExhibitorLogin";
import ExhibitorPanel from "./pages/ExhibitorPanel";
import DelegateRegister from "./pages/DelegateRegister";
import DelegateSuccess from "./pages/DelegateSuccess";
// Visitor and Fabricator registration pages removed
import UnifiedDashboard from "./pages/UnifiedDashboard";
import DashboardWrapper from "./pages/DashboardWrapper";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import DownloadCenter from "./pages/DownloadCenter";
import NotFound from "./pages/NotFound.tsx";
import PostShowReport from "./pages/PostShowReport";
import Speakers from "./pages/Speakers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register/:eventId" element={<EventRegistration />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          
          {/* Exhibitor Zone */}
          <Route path="/exhibitor/register" element={<ExhibitorRegister />} />
          <Route path="/exhibitor/login" element={<ExhibitorLogin />} />
          <Route path="/exhibitor/panel" element={<ExhibitorPanel />} />
          
          {/* Delegate/Conference Zone */}
          <Route path="/delegate/register" element={<DelegateRegister />} />
          <Route path="/delegate/success" element={<DelegateSuccess />} />
          
          {/* Visitor and Fabricator registration removed; use Events list */}
          
          {/* Unified Dashboard & Resources */}
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/registration/success" element={<RegistrationSuccess />} />
          <Route path="/downloads" element={<DownloadCenter />} />
          <Route path="/postshow-report" element={<PostShowReport />} />
          <Route path="/speakers" element={<Speakers />} />
          
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
