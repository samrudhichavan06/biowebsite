import { useNavigate } from "react-router-dom";
import { clearAdminAuthenticated } from "@/lib/adminAuth";
import {
  LayoutGrid,
  ChartColumnBig,
  Users,
  Shield,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Briefcase,
} from "lucide-react";

export type AdminMenuId = "dashboard" | "attendees" | "analytics" | "exhibitors" | "events";

interface AdminSidebarProps {
  selectedMenu: AdminMenuId;
  onMenuChange: (id: AdminMenuId) => void;
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
}

const NAV_ITEMS: { ico: any; id: AdminMenuId; label: string }[] = [
  { ico: LayoutGrid, id: "dashboard", label: "Dashboard" },
  { ico: Users, id: "attendees", label: "Attendees" },
  { ico: ChartColumnBig, id: "analytics", label: "Analytics" },
  { ico: Briefcase, id: "exhibitors", label: "Exhibitors" },
  { ico: CalendarDays, id: "events", label: "Events" },
];

export const AdminSidebar = ({ selectedMenu, onMenuChange, sidebarOpen, onSidebarToggle }: AdminSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminAuthenticated();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <button
          onClick={() => onSidebarToggle(!sidebarOpen)}
          className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#0c4f2a] to-[#0a3019] text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => onSidebarToggle(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[240px] lg:flex-col lg:justify-between bg-gradient-to-b from-[#03280f] to-[#024221] p-4 text-white">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400/20 border border-lime-400/30">
              <Shield className="h-5 w-5 text-lime-300" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-wide text-lime-300">BioEnergy</span>
              <span className="block text-[10px] tracking-[0.2em] text-white/50 uppercase">Admin Panel</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Navigation</p>
            {NAV_ITEMS.map(({ ico: Icon, id, label }) => (
              <button
                key={id}
                onClick={() => onMenuChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedMenu === id
                    ? "bg-lime-400/15 text-lime-300 shadow-lg shadow-lime-400/5"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-[11px] text-white/50">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-red-500/15 hover:text-red-300 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#03280f] to-[#024221] p-5 text-white transition-transform duration-300 lg:hidden flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400/20 border border-lime-400/30">
                <Shield className="h-5 w-5 text-lime-300" />
              </div>
              <div>
                <span className="block text-sm font-bold tracking-wide text-lime-300">BioEnergy</span>
                <span className="block text-[10px] tracking-[0.2em] text-white/50 uppercase">Admin Panel</span>
              </div>
            </div>
            <button className="p-1.5 text-white/60 hover:text-white" onClick={() => onSidebarToggle(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Navigation</p>
            {NAV_ITEMS.map(({ ico: Icon, id, label }) => (
              <button
                key={id}
                onClick={() => { onMenuChange(id); onSidebarToggle(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedMenu === id
                    ? "bg-lime-400/15 text-lime-300"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-red-500/15 hover:text-red-300 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
