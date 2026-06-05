import { useMemo } from "react";
import { TrendingUp, Users, Briefcase, Globe2, UserCheck, BarChart3, IndianRupee } from "lucide-react";
import { eventCatalog } from "@/lib/events";

interface DashboardPanelProps {
  records: any[];
  filteredRecords: any[];
  selectedEvent: string;
  onEventChange: (val: string) => void;
  dailyTrend: { label: string; count: number }[];
  exhibitorScanCounts: Record<string, { name: string; count: number }>;
}

export const AdminDashboardPanel = ({
  records,
  filteredRecords,
  selectedEvent,
  onEventChange,
  dailyTrend,
  exhibitorScanCounts,
}: DashboardPanelProps) => {
  const totalRegistrations = filteredRecords.length;
  const uniqueCompanies = new Set(filteredRecords.map((r) => r.company)).size;
  const uniqueCountries = new Set(filteredRecords.map((r) => r.country)).size;
  const totalRevenue = filteredRecords.reduce((sum, r) => {
    const amount = Number(r.amount || r.amount_inr || 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const formattedRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalRevenue);
  const todayCount = filteredRecords.filter((r) => {
    const today = new Date();
    const created = new Date(r.created_at);
    return created.toDateString() === today.toDateString();
  }).length;

  const totalExhibitorScans = Object.values(exhibitorScanCounts).reduce((s, e) => s + e.count, 0);

  const eventDistribution = eventCatalog.map((event) => ({
    name: event.name,
    count: records.filter((r) => r.event_name === event.name).length,
  }));
  const totalAcrossEvents = eventDistribution.reduce((s, i) => s + i.count, 0);

  const topExhibitors = useMemo(() => {
    return Object.entries(exhibitorScanCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [exhibitorScanCounts]);

  const maxTrend = Math.max(...dailyTrend.map((d) => d.count), 1);

  const donutSegments = useMemo(() => {
    const colors = ["#059669", "#10b981", "#0d9488", "#d97706"];
    let cumulative = 0;
    return eventDistribution.map((item, i) => {
      const pct = totalAcrossEvents > 0 ? (item.count / totalAcrossEvents) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      return { ...item, pct, start, color: colors[i % colors.length] };
    });
  }, [eventDistribution, totalAcrossEvents]);

  const donutGradient = donutSegments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-800">
      {/* Event filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">Overview of all event registrations</p>
        </div>
        <select
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          value={selectedEvent}
          onChange={(e) => onEventChange(e.target.value)}
        >
          <option value="all">All Events</option>
          {eventCatalog.map((ev) => (
            <option key={ev.id} value={ev.name}>{ev.name}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={<Users className="h-5 w-5" />} label="Total Attendees" value={totalRegistrations} accent="lime" sub="Live registrations" />
        <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Today" value={todayCount} accent="emerald" sub="New today" />
        <KpiCard icon={<Briefcase className="h-5 w-5" />} label="Companies" value={uniqueCompanies} accent="teal" sub="Participating" />
        <KpiCard icon={<Globe2 className="h-5 w-5" />} label="Countries" value={uniqueCountries} accent="amber" sub="Global reach" />
        <KpiCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={formattedRevenue} accent="emerald" sub="Total revenue" />
      </div>

      {/* Exhibitor Scan Total Card */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">Total Exhibitor Scans</p>
              <p className="text-3xl font-bold text-emerald-600 mt-0.5">{totalExhibitorScans}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Attendees scanned by all exhibitors</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* 7-day bar chart */}
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" /> Registration Trend
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Last 7 days</span>
            </div>
            <div className="flex items-end gap-2.5 h-36 px-2">
              {dailyTrend.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-600">{day.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-500 transition-all duration-700 ease-out min-h-[4px]"
                    style={{ height: `${Math.max((day.count / maxTrend) * 100, 4)}%` }}
                  />
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">{day.label}</span>
                </div>
              ))}
            </div>
          </article>

          {/* Recent Registrations */}
          <article className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900">Recent Registrations</h3>
              <span className="text-[11px] text-slate-400 font-semibold">{filteredRecords.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-slate-400 border-b border-slate-100 bg-slate-50/40">
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold hidden sm:table-cell">Event</th>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold hidden md:table-cell">Email</th>
                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">Plan</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No registrations found.</td></tr>
                  )}
                  {filteredRecords.slice(0, 8).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 hidden sm:table-cell font-semibold">{r.event_name?.split(" ")[0]}</td>
                      <td className="px-5 py-3.5 text-slate-900 font-semibold">{r.full_name}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 hidden md:table-cell">{r.email}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 hidden lg:table-cell">{r.packageTitle || r.package_title || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-semibold border border-emerald-100/50">
                          {r.attendee_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Event Distribution */}
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Event Distribution</h3>
            <div className="flex justify-center mb-4">
              <div
                className="h-32 w-32 rounded-full shadow-inner"
                style={{ background: totalAcrossEvents > 0 ? `conic-gradient(${donutGradient})` : "#e2e8f0" }}
              >
                <div className="m-5 grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-lg font-bold text-slate-800 shadow">
                  {totalAcrossEvents}
                </div>
              </div>
            </div>
            <ul className="space-y-2">
              {donutSegments.map((item) => (
                <li key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-xs">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-800 text-xs">{item.count}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Exhibitor Leaderboard */}
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" /> Top Exhibitors by Scans
            </h3>
            {topExhibitors.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 font-medium">No scan data yet.</p>
            ) : (
              <ul className="space-y-2">
                {topExhibitors.map((ex, i) => (
                  <li key={ex.id} className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-xs text-slate-600 font-semibold">{ex.name}</span>
                    <span className="text-xs font-bold text-emerald-600">{ex.count} scans</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};

function KpiCard({ icon, label, value, accent, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: string; sub: string }) {
  const accentMap: Record<string, string> = {
    lime: "bg-gradient-to-br from-white to-slate-50/50 border-slate-200/80 text-emerald-600 shadow-sm",
    emerald: "bg-gradient-to-br from-white to-slate-50/50 border-slate-200/80 text-emerald-600 shadow-sm",
    teal: "bg-gradient-to-br from-white to-slate-50/50 border-slate-200/80 text-teal-600 shadow-sm",
    amber: "bg-gradient-to-br from-white to-slate-50/50 border-slate-200/80 text-amber-600 shadow-sm",
  };
  const iconBgMap: Record<string, string> = {
    lime: "bg-emerald-50 text-emerald-600",
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
  };
  const cls = accentMap[accent] || accentMap.lime;
  const iconCls = iconBgMap[accent] || iconBgMap.lime;

  return (
    <article className={`rounded-2xl border ${cls} p-5 hover:scale-[1.02] transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-bold">{label}</p>
        <div className={`h-9 w-9 rounded-lg ${iconCls} flex items-center justify-center font-semibold shadow-sm`}>{icon}</div>
      </div>
      <p className="mt-3 text-3.5xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400 font-semibold">{sub}</p>
    </article>
  );
}
