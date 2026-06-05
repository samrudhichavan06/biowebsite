import { useMemo } from "react";
import { Search, Download, Mail, BadgeCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendeesPanelProps {
  users: any[];
  roleFilter: "all" | "exhibitors" | "delegates";
  onRoleFilterChange: (val: "all" | "exhibitors" | "delegates") => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onDeleteUser: (id: string, collection: string) => void;
  onResendBadge: (user: any) => void;
  onExportCSV: (role: string) => void;
}

export const AdminAttendeesPanel = ({
  users,
  roleFilter,
  onRoleFilterChange,
  searchQuery,
  onSearchChange,
  onDeleteUser,
  onResendBadge,
  onExportCSV,
}: AttendeesPanelProps) => {
  const normalizedUsers = useMemo(() => {
    return users.map((u) => {
      let collectionName = String(u.collection || u.role || u.attendeeType || u._collection || "").trim().toLowerCase();
      if (collectionName === "delegate") collectionName = "delegates";
      if (collectionName === "exhibitor") collectionName = "exhibitors";
      if (collectionName === "visitor") collectionName = "visitors";
      if (collectionName === "fabricator") collectionName = "fabricators";
      return {
        ...u,
        _collection: collectionName,
      };
    });
  }, [users]);

  const filteredByRole = useMemo(() => {
    if (roleFilter === "all") return normalizedUsers;
    return normalizedUsers.filter((u) => u._collection === roleFilter);
  }, [normalizedUsers, roleFilter]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredByRole;
    return filteredByRole.filter((u) => {
      const fields = [u.companyName, u.company_name, u.contactName, u.contact_name, u.email, u.firstName, u.lastName, u.packageTitle, u.package_title];
      return fields.some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [filteredByRole, searchQuery]);

  const getDisplayName = (u: any) => {
    const company = String(u.companyName || u.company_name || u.boothName || u.booth_name || "").trim();
    if (company) return company;
    const person = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return person || "Unnamed user";
  };

  const getSecondary = (u: any) => {
    if (u._collection === "exhibitors") return String(u.contactName || u.contact_name || u.email || "Exhibitor").trim();
    return String(u.email || u.phone || "—").trim();
  };

  const totalRevenue = useMemo(() => {
    return filteredByRole.reduce((sum, u) => {
      const amount = Number(u.amount || u.amount_inr || 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [filteredByRole]);

  const formattedRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-800">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Attendees</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">Manage exhibitors and delegates</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
          Total revenue: <span className="text-slate-900">{formattedRevenue}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full">{filteredUsers.length} records</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "exhibitors", "delegates"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRoleFilterChange(r)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${
                roleFilter === r
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <Button
            size="sm"
            onClick={() => onExportCSV(roleFilter)}
            className="h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 gap-1.5 shadow-sm font-semibold text-xs"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3.5 font-bold">Type</th>
                <th className="px-5 py-3.5 font-bold">User</th>
                <th className="px-5 py-3.5 font-bold">Email / Contact</th>
                <th className="px-5 py-3.5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">No attendees found.</td></tr>
              )}
              {filteredUsers.map((u) => {
                const displayName = getDisplayName(u);
                const secondary = getSecondary(u);
                return (
                  <tr key={`${u._collection}-${u.id}`} className="hover:bg-slate-50/40 transition align-top">
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] border ${
                        u._collection === "exhibitors"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-teal-50 text-teal-700 border-teal-100"
                      }`}>
                        {u._collection}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{displayName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{secondary}</div>
                          {u._collection === "delegates" && (
                            <div className="text-[11px] text-slate-400 mt-1">
                              {String(u.packageTitle || u.package_title || "").trim()
                                ? `Plan: ${u.packageTitle || u.package_title}`
                                : "Plan: not set"}
                              {u.amount || u.amount_inr ? ` • ₹${Number(u.amount || u.amount_inr).toLocaleString()}` : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                      <div>{u.email || "—"}</div>
                      {u._collection === "exhibitors" && (
                        <div className="text-slate-400 font-medium mt-0.5">{u.contact_name || u.contactName || "—"}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => navigator.clipboard.writeText(u.email || "")}
                          className="h-7.5 px-3 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Mail className="h-3 w-3" /> Copy
                        </button>
                        <button
                          onClick={() => onResendBadge(u)}
                          className="h-7.5 px-3 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition flex items-center gap-1.5 shadow-sm"
                        >
                          <BadgeCheck className="h-3 w-3" /> Badge
                        </button>
                        <button
                          onClick={() => onDeleteUser(u.id, u.collection || u._collection)}
                          className="h-7.5 px-3 rounded-lg bg-red-50 border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
