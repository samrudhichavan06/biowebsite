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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <a
          href="https://wa.me/919142659818?text=Hello%20Bioenergy%20Expo%202026"
          target="_blank"
          rel="noopener noreferrer"
          className="group fixed right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 whatsapp-float overflow-hidden"
          style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <span className="whatsapp-sweep" />
          <svg viewBox="0 0 32 32" className="relative z-10 h-6 w-6" aria-hidden="true">
            <path
              fill="currentColor"
              d="M16.04 3.2c-7.1 0-12.86 5.72-12.86 12.79 0 2.25.6 4.45 1.74 6.37L3.2 28.8l6.63-1.7a12.9 12.9 0 0 0 6.21 1.59h.01c7.1 0 12.86-5.72 12.86-12.79 0-3.4-1.33-6.6-3.74-9.01a12.83 12.83 0 0 0-9.13-3.69zm7.51 18.57c-.31.87-1.5 1.66-2.4 1.85-.62.12-1.41.21-4.58-.99-4.05-1.58-6.66-5.69-6.86-5.96-.19-.27-1.64-2.17-1.64-4.14 0-1.97 1.03-2.94 1.4-3.34.36-.4.79-.5 1.05-.5h.77c.25 0 .59-.1.92.7.31.75 1.06 2.6 1.16 2.79.1.19.17.43.03.7-.14.27-.22.43-.43.66-.22.24-.46.54-.66.72-.22.2-.45.41-.19.8.26.4 1.15 1.89 2.46 3.05 1.7 1.51 3.14 1.98 3.54 2.2.4.2.63.17.86-.1.23-.27.99-1.16 1.25-1.55.26-.4.53-.33.89-.2.36.13 2.3 1.09 2.69 1.29.4.2.66.3.76.46.1.17.1.97-.21 1.84z"
            />
          </svg>
        </a>
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
