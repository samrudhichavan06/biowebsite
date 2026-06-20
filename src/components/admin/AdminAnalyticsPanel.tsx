import { useMemo } from "react";
import { BarChart3, PieChart } from "lucide-react";
import { eventCatalog } from "@/lib/events";

interface AnalyticsPanelProps {
  records: any[];
  filteredRecords: any[];
  dailyTrend: { label: string; count: number }[];
  onExportVisitorData: (eventName: string) => void;
}

export const AdminAnalyticsPanel = ({ records, filteredRecords, dailyTrend, onExportVisitorData }: AnalyticsPanelProps) => {
  const maxTrend = Math.max(...dailyTrend.map((d) => d.count), 1);

  const attendeeTypes = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const t = r.attendee_type || "Unknown";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords]);

  const eventBreakdown = useMemo(() => {
    return eventCatalog.map((ev) => {
      const evRecords = records.filter((r) => r.event_name === ev.name);
      const types: Record<string, number> = {};
      evRecords.forEach((r) => {
        const t = r.attendee_type || "Unknown";
        types[t] = (types[t] || 0) + 1;
      });
      return { name: ev.name, total: evRecords.length, types };
    });
  }, [records]);

  const typeColors: Record<string, string> = {
    Visitor: "#10b981",
    Delegate: "#06b6d4",
    Exhibitor: "#f59e0b",
    Speaker: "#8b5cf6",
    VIP: "#ec4899",
    Unknown: "#94a3b8",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-800">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">Registration insights and trends</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 7-day trend */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> 7-Day Registration Trend
          </h3>
          <div className="flex items-end gap-3 h-44 px-2">
            {dailyTrend.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-600">{day.count}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-500 transition-all duration-700 min-h-[6px]"
                  style={{ height: `${Math.max((day.count / maxTrend) * 100, 5)}%` }}
                />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Attendee Type Breakdown */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-teal-600" /> Attendee Type Breakdown
          </h3>
          <div className="space-y-3.5">
            {attendeeTypes.map((item) => {
              const pct = filteredRecords.length > 0 ? Math.round((item.count / filteredRecords.length) * 100) : 0;
              const color = typeColors[item.type] || typeColors.Unknown;
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-semibold">{item.type}</span>
                    <span className="text-xs font-bold text-slate-800">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
            {attendeeTypes.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center font-medium">No data available.</p>
            )}
          </div>
        </article>
      </div>

      {/* Per-event breakdown */}
      <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Per-Event Registration Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {eventBreakdown.map((ev) => (
            <div key={ev.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 truncate">{ev.name}</h4>
                  <p className="mt-2 text-2xl font-black text-slate-900">{ev.total}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onExportVisitorData(ev.name)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
                >
                  Export Visitors
                </button>
              </div>
              <div className="mt-3.5 space-y-1.5 border-t border-slate-200/60 pt-3">
                {Object.entries(ev.types).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors[type] || "#94a3b8" }} />
                      {type}
                    </span>
                    <span className="text-slate-800 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};
