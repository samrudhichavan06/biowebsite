import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { generateAndSendBadge } from "@/lib/badgeService";
import { Button } from "@/components/ui/button";
import { clearAdminAuthenticated, isAdminAuthenticated } from "@/lib/adminAuth";
import { eventCatalog } from "@/lib/events";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import { COLLECTIONS, ExhibitorPaymentHistory } from "@/lib/collections";
import { X } from "lucide-react";
import { AdminSidebar, AdminMenuId } from "@/components/admin/AdminSidebar";
import { AdminDashboardPanel } from "@/components/admin/AdminDashboardPanel";
import { AdminAttendeesPanel } from "@/components/admin/AdminAttendeesPanel";
import { AdminExhibitorsPanel } from "@/components/admin/AdminExhibitorsPanel";
import { AdminAnalyticsPanel } from "@/components/admin/AdminAnalyticsPanel";
import { AdminEventsPanel } from "@/components/admin/AdminEventsPanel";
import { AdminExhibitorMessaging } from "@/components/AdminExhibitorMessaging";
import { AdminFeedbackManagement } from "@/components/AdminFeedbackManagement";

type RegistrationRecord = {
  id: string;
  created_at: string;
  event_name: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  country: string;
  attendee_type: string;
  interests: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [selectedMenu, setSelectedMenu] = useState<AdminMenuId>("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [paymentHistoryByExhibitorId, setPaymentHistoryByExhibitorId] = useState<Record<string, ExhibitorPaymentHistory[]>>({});
  const [adminEvents, setAdminEvents] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"all" | "exhibitors" | "delegates">("all");
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState("");
  const [exhibitorSearchQuery, setExhibitorSearchQuery] = useState("");
  const [exhibitorScanCounts, setExhibitorScanCounts] = useState<Record<string, { name: string; count: number }>>({});

  // Action panel for messages/feedback
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [actionPanelMode, setActionPanelMode] = useState<"messages" | "feedback">("messages");
  const [selectedExhibitorForActions, setSelectedExhibitorForActions] = useState<any | null>(null);

  const authenticated = isAdminAuthenticated();

  // Load registration records
  useEffect(() => {
    const loadData = async () => {
      if (!isFirebaseConfigured || !db) {
        setError("Firebase is not configured.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const requests = eventCatalog.map((event) => {
          const q = query(collection(db, event.registrationTable), orderBy("created_at", "desc"));
          return getDocs(q);
        });
        const results = await Promise.all(requests);
        const merged = results
          .flatMap((snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as RegistrationRecord[];
        setRecords(merged);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load registrations");
        setIsLoading(false);
      }
    };
    if (authenticated) loadData();
  }, [authenticated]);

  // Load users (exhibitors + delegates only) and exhibitor scan counts
  useEffect(() => {
    const loadAllUsers = async () => {
      if (!isFirebaseConfigured || !db) return;
      try {
        const collectionsToFetch = ["exhibitors", "delegates"];
        const requests = collectionsToFetch.map((c) => getDocs(collection(db, c)));
        const results = await Promise.allSettled(requests);
        const merged: any[] = [];
        results.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            res.value.docs.forEach((d) => merged.push({ id: d.id, ...d.data(), collection: collectionsToFetch[idx] }));
          }
        });
        merged.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || (a.created_at ? new Date(a.created_at) : null);
          const bDate = b.createdAt?.toDate?.() || (b.created_at ? new Date(b.created_at) : null);
          if (aDate && bDate) return bDate.getTime() - aDate.getTime();
          return 0;
        });
        setUsers(merged);

        // Load payment history
        try {
          const paymentHistorySnapshot = await getDocs(
            query(collection(db, COLLECTIONS.EXHIBITOR_PAYMENT_HISTORY), orderBy("recordedAt", "desc"))
          );
          const groupedHistory = paymentHistorySnapshot.docs.reduce<Record<string, ExhibitorPaymentHistory[]>>((acc, paymentDoc) => {
            const entry = { id: paymentDoc.id, ...(paymentDoc.data() as ExhibitorPaymentHistory) };
            if (!entry.exhibitorId) return acc;
            if (!acc[entry.exhibitorId]) acc[entry.exhibitorId] = [];
            acc[entry.exhibitorId].push(entry);
            return acc;
          }, {});
          setPaymentHistoryByExhibitorId(groupedHistory);
        } catch (historyErr) {
          console.error("Failed loading payment history:", historyErr);
          setPaymentHistoryByExhibitorId({});
        }

        // Load exhibitor scan counts
        try {
          const scansSnapshot = await getDocs(collection(db, "exhibitor_scans"));
          const scanMap: Record<string, { name: string; count: number }> = {};
          scansSnapshot.docs.forEach((d) => {
            const data = d.data();
            const exId = data.exhibitor_id;
            if (!exId) return;
            if (!scanMap[exId]) {
              scanMap[exId] = { name: data.exhibitor_booth_name || "Unknown", count: 0 };
            }
            scanMap[exId].count += 1;
          });
          setExhibitorScanCounts(scanMap);
        } catch (scanErr) {
          console.error("Failed loading exhibitor scan counts:", scanErr);
        }
      } catch (err) {
        console.error("Failed loading users:", err);
      }
    };

    if (selectedMenu === "attendees" || selectedMenu === "exhibitors" || selectedMenu === "dashboard") {
      loadAllUsers();
    }
  }, [selectedMenu]);

  // Load admin events
  useEffect(() => {
    const loadAdminEvents = async () => {
      if (!isFirebaseConfigured || !db) return;
      try {
        const docRef = doc(db, "admin_settings", "event_catalog");
        const snap = await getDoc(docRef);
        if (snap.exists()) setAdminEvents(snap.data().events || []);
        else setAdminEvents([]);
      } catch (err) {
        console.error("Failed loading admin events:", err);
      }
    };
    if (selectedMenu === "events") loadAdminEvents();
  }, [selectedMenu]);

  // Actions
  const handleDeleteUser = async (userId: string, collectionName: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, collectionName, userId));
      setUsers((prev) => prev.filter((u) => !(u.id === userId && u.collection === collectionName)));
    } catch (err) {
      console.error("Delete user failed:", err);
    }
  };

  const saveAdminEvents = async (eventsPayload: any[]) => {
    if (!db) return;
    try {
      await setDoc(doc(db, "admin_settings", "event_catalog"), { events: eventsPayload });
      setAdminEvents(eventsPayload);
    } catch (err) {
      console.error("Failed saving admin events:", err);
    }
  };

  const updateExhibitor = async (id: string, updates: Partial<any>) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "exhibitors", id), updates);
      setUsers((prev) => prev.map((u) => (u.id === id && u.collection === "exhibitors" ? { ...u, ...updates } : u)));
    } catch (err) {
      console.error("Failed updating exhibitor", err);
    }
  };

  const approveExhibitor = async (id: string, status: "approved" | "rejected", comment?: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "exhibitors", id), { approval_status: status, approval_notes: comment || "" });
      setUsers((prev) => prev.map((u) => (u.id === id && u.collection === "exhibitors" ? { ...u, approval_status: status, approval_notes: comment || "" } : u)));
      alert(`Exhibitor ${status} successfully`);
    } catch (err) {
      console.error("Failed approving exhibitor", err);
      alert("Failed to update exhibitor status");
    }
  };

  const resendBadgeToUser = async (user: any) => {
    try {
      const userRole = user.collection === "delegates" ? "delegate" : "exhibitor";
      const userEmail = user.email || user.email_address || "";
      const userName = user.contactName || user.contact_name || user.companyName || user.company_name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
      if (!userEmail) { alert("Missing email."); return; }
      await generateAndSendBadge({ userId: user.id, userRole, userEmail, userName });
      alert("Badge resend queued.");
    } catch (err) {
      console.error("Failed to resend badge", err);
      alert("Badge resend failed.");
    }
  };

  const exportCSVForRole = (role: string) => {
    const rows = users
      .filter((u) => (role === "all" ? true : u.collection === role))
      .map((u) => ({
        id: u.id,
        collection: u.collection,
        name: u.companyName || `${u.firstName || ""} ${u.lastName || ""}`,
        email: u.email,
      }));
    if (rows.length === 0) return;
    const header = Object.keys(rows[0]).join(",") + "\n";
    const csv = header + rows.map((r) => Object.values(r).map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_${role || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportVisitorRegistrationsForEvent = (eventName: string) => {
    const filteredVisitors = records.filter((r) => {
      const attendeeType = String(r.attendee_type || "").toLowerCase();
      const isVisitor = attendeeType === "visitor";
      return isVisitor && (eventName === "all" ? true : r.event_name === eventName);
    });

    if (filteredVisitors.length === 0) {
      alert(`No visitor registrations found for ${eventName === "all" ? "all events" : eventName}.`);
      return;
    }

    const rows = filteredVisitors.map((r) => ({
      created_at: r.created_at,
      event_name: r.event_name,
      full_name: r.full_name || `${r.firstName || ""} ${r.lastName || ""}`.trim(),
      email: r.email,
      phone: r.phone,
      company: r.company,
      designation: r.designation,
      country: r.country,
      attendee_type: r.attendee_type,
    }));

    const header = Object.keys(rows[0]).join(",") + "\n";
    const csv = header + rows.map((row) => Object.values(row).map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = eventName === "all" ? "all_events_visitors" : eventName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    a.download = `${safeName}_visitors.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Computed data
  const filteredRecords = useMemo(() => {
    if (selectedEvent === "all") return records;
    return records.filter((r) => r.event_name === selectedEvent);
  }, [records, selectedEvent]);

  const dailyTrend = useMemo(() => {
    const days = 7;
    const list: { label: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = filteredRecords.filter((r) => new Date(r.created_at).toDateString() === date.toDateString()).length;
      list.push({ label: date.toLocaleDateString(undefined, { weekday: "short" }), count });
    }
    return list;
  }, [filteredRecords]);

  const getUserDisplayName = (user: any) => {
    const c = String(user.companyName || user.company_name || user.boothName || user.booth_name || "").trim();
    if (c) return c;
    const p = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return p || "Unnamed user";
  };

  if (!authenticated) return <Navigate to="/admin/login" replace />;

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-slate-800 font-sans">
      <section className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[240px_1fr]">
        <AdminSidebar
          selectedMenu={selectedMenu}
          onMenuChange={setSelectedMenu}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={setSidebarOpen}
        />

        <div className="overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm text-slate-500">Loading registrations...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {!isLoading && !error && (
              <>
                {selectedMenu === "dashboard" && (
                  <AdminDashboardPanel
                    records={records}
                    filteredRecords={filteredRecords}
                    selectedEvent={selectedEvent}
                    onEventChange={setSelectedEvent}
                    dailyTrend={dailyTrend}
                    exhibitorScanCounts={exhibitorScanCounts}
                  />
                )}

                {selectedMenu === "attendees" && (
                  <AdminAttendeesPanel
                    users={users}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    searchQuery={attendeeSearchQuery}
                    onSearchChange={setAttendeeSearchQuery}
                    onDeleteUser={handleDeleteUser}
                    onResendBadge={resendBadgeToUser}
                    onExportCSV={exportCSVForRole}
                  />
                )}

                {selectedMenu === "analytics" && (
                  <AdminAnalyticsPanel
                    records={records}
                    filteredRecords={filteredRecords}
                    dailyTrend={dailyTrend}
                    onExportVisitorData={exportVisitorRegistrationsForEvent}
                  />
                )}

                {selectedMenu === "exhibitors" && (
                  <AdminExhibitorsPanel
                    users={users}
                    searchQuery={exhibitorSearchQuery}
                    onSearchChange={setExhibitorSearchQuery}
                    onApproveExhibitor={approveExhibitor}
                    onUpdateExhibitor={updateExhibitor}
                    onDeleteUser={handleDeleteUser}
                    onResendBadge={resendBadgeToUser}
                    paymentHistoryByExhibitorId={paymentHistoryByExhibitorId}
                    exhibitorScanCounts={exhibitorScanCounts}
                    onOpenMessages={(u) => {
                      setSelectedExhibitorForActions(u);
                      setActionPanelMode("messages");
                      setActionPanelOpen(true);
                    }}
                    onOpenFeedback={(u) => {
                      setSelectedExhibitorForActions(u);
                      setActionPanelMode("feedback");
                      setActionPanelOpen(true);
                    }}
                  />
                )}

                {selectedMenu === "events" && (
                  <AdminEventsPanel adminEvents={adminEvents} onSaveEvents={saveAdminEvents} />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Action Panel Overlay */}
      {actionPanelOpen && selectedExhibitorForActions && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">Exhibitor Actions</p>
                <h3 className="text-sm font-bold text-slate-800 truncate">{getUserDisplayName(selectedExhibitorForActions)}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActionPanelOpen(false)} className="h-8 w-8 rounded-full p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 px-4 pt-3">
              <Button
                size="sm"
                onClick={() => setActionPanelMode("messages")}
                className={`rounded-full text-xs transition-colors ${actionPanelMode === "messages" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"} border`}
              >
                Messages
              </Button>
              <Button
                size="sm"
                onClick={() => setActionPanelMode("feedback")}
                className={`rounded-full text-xs transition-colors ${actionPanelMode === "feedback" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"} border`}
              >
                Feedback
              </Button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-4 py-4">
              {actionPanelMode === "messages" ? (
                <AdminExhibitorMessaging
                  exhibitorId={selectedExhibitorForActions.id}
                  exhibitorName={getUserDisplayName(selectedExhibitorForActions)}
                  onMessagesRead={() => {}}
                />
              ) : (
                <AdminFeedbackManagement
                  exhibitorId={selectedExhibitorForActions.id}
                  exhibitorName={getUserDisplayName(selectedExhibitorForActions)}
                  adminId="admin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
