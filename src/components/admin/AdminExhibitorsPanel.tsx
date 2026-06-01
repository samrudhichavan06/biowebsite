import { useMemo } from "react";
import { Search, Shield, Download, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExhibitorPaymentHistory } from "@/lib/collections";

interface ExhibitorsPanelProps {
  users: any[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onApproveExhibitor: (id: string, status: "approved" | "rejected", comment?: string) => void;
  onUpdateExhibitor: (id: string, updates: Partial<any>) => void;
  onDeleteUser: (id: string, collection: string) => void;
  onResendBadge: (user: any) => void;
  paymentHistoryByExhibitorId: Record<string, ExhibitorPaymentHistory[]>;
  exhibitorScanCounts: Record<string, { name: string; count: number }>;
  onOpenMessages: (user: any) => void;
  onOpenFeedback: (user: any) => void;
}

export const AdminExhibitorsPanel = ({
  users,
  searchQuery,
  onSearchChange,
  onApproveExhibitor,
  onUpdateExhibitor,
  onDeleteUser,
  onResendBadge,
  paymentHistoryByExhibitorId,
  exhibitorScanCounts,
  onOpenMessages,
  onOpenFeedback,
}: ExhibitorsPanelProps) => {
  const exhibitors = useMemo(() => {
    return users
      .filter((u) => String(u.collection || u._collection || "").toLowerCase() === "exhibitors")
      .map((u) => ({ ...u, _collection: "exhibitors" }));
  }, [users]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exhibitors;
    return exhibitors.filter((u) => {
      const fields = [u.companyName, u.company_name, u.contactName, u.contact_name, u.email, u.boothNumber, u.booth_number, u.paymentTransactionId];
      return fields.some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [exhibitors, searchQuery]);

  const stats = useMemo(() => {
    const total = exhibitors.length;
    const approved = exhibitors.filter((u) => String(u.approval_status || u.approvalStatus || "pending") === "approved").length;
    const pending = exhibitors.filter((u) => String(u.approval_status || u.approvalStatus || "pending") === "pending").length;
    const paid = exhibitors.filter((u) => String(u.paymentStatus || u.payment_status || "pending") === "completed").length;
    return { total, approved, pending, paid };
  }, [exhibitors]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-800">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-3 shadow-sm">
            <Shield className="h-3.5 w-3.5" /> Exhibitor Management
          </div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Manage Exhibitors</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">Approvals, booth assignment, payments, and communications</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "text-slate-800 bg-white" },
            { label: "Approved", value: stats.approved, color: "text-emerald-700 bg-emerald-50/50 border-emerald-100" },
            { label: "Pending", value: stats.pending, color: "text-amber-700 bg-amber-50/50 border-amber-100" },
            { label: "Paid", value: stats.paid, color: "text-blue-700 bg-blue-50/50 border-blue-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border border-slate-200 ${s.color} px-4 py-3 shadow-sm`}>
              <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-bold">{s.label}</div>
              <div className="mt-1 text-2xl font-black">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search company, contact, booth, email..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        {searchQuery && (
          <Button size="sm" variant="ghost" onClick={() => onSearchChange("")} className="h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm bg-white font-semibold">
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3.5 font-bold">Exhibitor</th>
                <th className="px-4 py-3.5 font-bold">Booth</th>
                <th className="px-4 py-3.5 font-bold">Approval</th>
                <th className="px-4 py-3.5 font-bold">Payment</th>
                <th className="px-4 py-3.5 font-bold">Scans</th>
                <th className="px-4 py-3.5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No exhibitors found.</td></tr>
              )}
              {filtered.map((u) => {
                const companyName = u.companyName || u.company_name || u.boothName || u.booth_name || "Unnamed";
                const contactName = u.contactName || u.contact_name || "—";
                const boothNumber = u.boothNumber || u.booth_number || "Unassigned";
                const stallValue = u.stallSize || u.stall_size || "small";
                const paymentStatus = u.paymentStatus || u.payment_status || "pending";
                const approvalStatus = u.approval_status || "pending";
                const paymentAmount = u.paymentAmount || u.payment_amount || 0;
                const scanCount = exhibitorScanCounts[u.id]?.count || 0;
                const paymentHistory = paymentHistoryByExhibitorId[u.id] || [];
                const currentProofUrl = u.paymentProofUrl || u.payment_proof_url || "";

                return (
                  <tr key={`ex-${u.id}`} className="hover:bg-slate-50/40 transition align-top">
                    {/* Exhibitor info */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700 border border-emerald-100">
                          {companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{companyName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{contactName}</div>
                          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Booth */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5 max-w-[130px]">
                        <select
                          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none shadow-sm focus:border-emerald-500"
                          value={stallValue}
                          onChange={(e) => onUpdateExhibitor(u.id, { stallSize: e.target.value })}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                        <button
                          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-left text-xs text-slate-600 hover:bg-slate-50 shadow-sm font-semibold truncate"
                          onClick={() => {
                            const stall = prompt("Assign booth number", boothNumber === "Unassigned" ? "" : boothNumber);
                            if (stall !== null) onUpdateExhibitor(u.id, { boothNumber: stall, stallAllocated: true });
                          }}
                        >
                          {boothNumber === "Unassigned" ? "Assign booth" : `#${boothNumber}`}
                        </button>
                      </div>
                    </td>
                    {/* Approval */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5 max-w-[140px]">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          approvalStatus === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : approvalStatus === "rejected" ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {approvalStatus === "approved" ? "Approved" : approvalStatus === "rejected" ? "Rejected" : "Pending"}
                        </span>
                        {approvalStatus === "pending" ? (
                          <div className="flex gap-1">
                            <button className="h-7 px-2 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-500 transition shadow-sm" onClick={() => onApproveExhibitor(u.id, "approved", "Approved by admin")}>Approve</button>
                            <button className="h-7 px-2 rounded-lg bg-red-50 border border-red-200 text-red-600 font-semibold text-[10px] hover:bg-red-100 transition shadow-sm" onClick={() => onApproveExhibitor(u.id, "rejected", "Rejected by admin")}>Reject</button>
                          </div>
                        ) : (
                          <select
                            className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-600 outline-none shadow-sm"
                            value={approvalStatus}
                            onChange={(e) => onApproveExhibitor(u.id, e.target.value as any, `${e.target.value === "approved" ? "Approved" : "Rejected"} by admin`)}
                          >
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                      </div>
                    </td>
                    {/* Payment */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5 max-w-[150px]">
                        <select
                          className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-600 outline-none shadow-sm"
                          value={paymentStatus}
                          onChange={(e) => onUpdateExhibitor(u.id, { paymentStatus: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-left text-[11px] text-slate-600 hover:bg-slate-50 font-bold shadow-sm"
                          onClick={() => {
                            const amount = prompt("Update payment amount", String(paymentAmount));
                            if (amount !== null) onUpdateExhibitor(u.id, { paymentAmount: Number(amount) || 0 });
                          }}
                        >
                          ₹{paymentAmount}
                        </button>
                        {currentProofUrl && (
                          <a href={currentProofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:underline">
                            Proof Document
                          </a>
                        )}
                        {paymentHistory.length > 0 && (
                          <details className="rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                            <summary className="cursor-pointer text-[10px] font-bold text-slate-500">History ({paymentHistory.length})</summary>
                            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                              {paymentHistory.map((entry) => (
                                <div key={entry.id} className="rounded bg-white border border-slate-100 p-2 text-[10px] text-slate-500">
                                  <div className="font-semibold">{new Date(entry.recordedAt).toLocaleString()}</div>
                                  <div className="font-medium mt-0.5">₹{entry.paymentAmount} — {entry.transactionId}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </td>
                    {/* Scans */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-lg font-bold text-emerald-600">{scanCount}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">attendees scanned</span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5 max-w-[120px]">
                        <button onClick={() => onOpenMessages(u)} className="h-7.5 px-3 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition text-left shadow-sm">Messages</button>
                        <button onClick={() => onOpenFeedback(u)} className="h-7.5 px-3 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition text-left shadow-sm">Feedback</button>
                        <button onClick={() => onResendBadge(u)} className="h-7.5 px-3 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition text-left shadow-sm font-semibold">Resend Badge</button>
                        <button onClick={() => onDeleteUser(u.id, u.collection || u._collection)} className="h-7.5 px-3 rounded-lg bg-red-50 border border-red-200 text-[10px] font-semibold text-red-600 hover:bg-red-100 transition text-left shadow-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && exhibitors.length > 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-500">No exhibitors match your search</p>
          <p className="mt-2 text-xs text-slate-400">Try a different search term.</p>
        </div>
      )}
    </div>
  );
};
