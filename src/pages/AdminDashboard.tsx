import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { generateAndSendBadge, getBadgeByRegistrationCode, markBadgeAsScanned } from "@/lib/badgeService";
import { Button } from "@/components/ui/button";
import { clearAdminAuthenticated, isAdminAuthenticated } from "@/lib/adminAuth";
import { eventCatalog } from "@/lib/events";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import {
  CalendarDays,
  ChartColumnBig,
  CircleDollarSign,
  Globe2,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";

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
  const [selectedMenu, setSelectedMenu] = useState<"dashboard" | "analytics" | "users" | "location" | "events">("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [adminEvents, setAdminEvents] = useState<any[]>([]);
  const [eventsEditor, setEventsEditor] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'exhibitors' | 'visitors' | 'delegates' | 'fabricators'>('all');
  const [scannerCode, setScannerCode] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessageBody, setBroadcastMessageBody] = useState('');
  const [broadcastRoles, setBroadcastRoles] = useState<string[]>(['exhibitors','visitors','delegates','fabricators']);

  const authenticated = isAdminAuthenticated();

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
          const q = query(
            collection(db, event.registrationTable),
            orderBy("created_at", "desc")
          );
          return getDocs(q);
        });

        const results = await Promise.all(requests);
        const merged = results
          .flatMap((snapshot) =>
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) as RegistrationRecord[];

        setRecords(merged);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load registrations");
        setIsLoading(false);
      }
    };

    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  // Load users across collections when admin opens Users panel
  useEffect(() => {
    const loadAllUsers = async () => {
      if (!isFirebaseConfigured || !db) return;
      try {
        const collectionsToFetch = ["exhibitors", "visitors", "delegates", "fabricators"];
        // Avoid ordering by a missing field (exhibitors use created_at). Sort client-side instead.
        const requests = collectionsToFetch.map((c) => getDocs(collection(db, c)));
        const results = await Promise.allSettled(requests);
        const merged: any[] = [];
        results.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            const snap = res.value;
            snap.docs.forEach((d) => merged.push({ id: d.id, ...d.data(), collection: collectionsToFetch[idx] }));
          }
        });
        merged.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || (a.created_at ? new Date(a.created_at) : null);
          const bDate = b.createdAt?.toDate?.() || (b.created_at ? new Date(b.created_at) : null);
          if (aDate && bDate) return bDate.getTime() - aDate.getTime();
          return 0;
        });
        setUsers(merged);
      } catch (err) {
        console.error("Failed loading users:", err);
      }
    };

    if (selectedMenu === "users") {
      loadAllUsers();
    }
  }, [selectedMenu]);

  // Load admin-managed events from admin_settings/event_catalog when opening Events panel
  useEffect(() => {
    const loadAdminEvents = async () => {
      if (!isFirebaseConfigured || !db) return;
      try {
        const docRef = doc(db, "admin_settings", "event_catalog");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAdminEvents(snap.data().events || []);
        } else {
          setAdminEvents([]);
        }
      } catch (err) {
        console.error("Failed loading admin events:", err);
      }
    };

    if (selectedMenu === "events") {
      loadAdminEvents();
    }
  }, [selectedMenu]);

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

  // ---------- New admin actions ----------
  const updateExhibitor = async (id: string, updates: Partial<any>) => {
    if (!db) return;
    try {
      const ref = doc(db, "exhibitors", id);
      await updateDoc(ref, updates);
      setUsers((prev) => prev.map(u => (u.id === id && u.collection === 'exhibitors' ? { ...u, ...updates } : u)));
    } catch (err) {
      console.error('Failed updating exhibitor', err);
    }
  };

  const approveFabricator = async (id: string, status: 'approved' | 'rejected', comment?: string) => {
    if (!db) return;
    try {
      const ref = doc(db, 'fabricators', id);
      await updateDoc(ref, { designSubmissionStatus: status === 'approved' ? 'approved' : 'rejected', approvalNotes: comment || '' });
      setUsers((prev) => prev.map(u => (u.id === id && u.collection === 'fabricators' ? { ...u, designSubmissionStatus: status === 'approved' ? 'approved' : 'rejected', approvalNotes: comment || '' } : u)));
    } catch (err) {
      console.error('Failed approving fabricator', err);
    }
  };

  const resendBadgeToUser = async (user: any) => {
    try {
      const userRole = user.collection === "visitors"
        ? "visitor"
        : user.collection === "delegates"
          ? "delegate"
          : "exhibitor";
      const userEmail = user.email || user.email_address || "";
      const userName =
        user.contactName ||
        user.contact_name ||
        user.companyName ||
        user.company_name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "Exhibitor";

      if (!userEmail) {
        alert("Missing email for this user. Please update their record first.");
        return;
      }

      await generateAndSendBadge({
        userId: user.id,
        userRole,
        userEmail,
        userName,
      });
      alert("Badge resend queued.");
    } catch (err) {
      console.error('Failed to resend badge', err);
      alert("Badge resend failed. Check console for details.");
    }
  };

  const broadcastMessage = async (roles: string[], title: string, message: string) => {
    if (!db) return;
    try {
      // create notification docs for all users matching roles
      const batches: Promise<any>[] = [];
      for (const role of roles) {
        const q = query(collection(db, role), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          const payload = {
            recipientId: d.id,
            recipientRole: role,
            title,
            message,
            type: 'info',
            read: false,
            createdAt: new Date().toISOString(),
          };
          batches.push(addDoc(collection(db, 'notifications'), payload) as any);
        });
      }
      await Promise.all(batches);
    } catch (err) {
      console.error('Broadcast failed', err);
    }
  };

  const exportCSVForRole = (role: string) => {
    const rows = users.filter(u => (role === 'all' ? true : u.collection === role)).map(u => ({
      id: u.id,
      collection: u.collection,
      name: u.companyName || `${u.firstName || ''} ${u.lastName || ''}`,
      email: u.email,
    }));
    const header = Object.keys(rows[0] || {}).join(',') + '\n';
    const csv = header + rows.map(r => Object.values(r).map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${role || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openScannerAndMark = async (code: string, scannedBy = 'admin') => {
    try {
      const badge = await getBadgeByRegistrationCode(code);
      if (!badge) return false;
      await markBadgeAsScanned(badge.id, scannedBy);
      return true;
    } catch (err) {
      console.error('Scanner error', err);
      return false;
    }
  };

  const filteredRecords = useMemo(() => {
    if (selectedEvent === "all") {
      return records;
    }
    return records.filter((record) => record.event_name === selectedEvent);
  }, [records, selectedEvent]);

  const normalizedUsers = useMemo(() => {
    return users.map((u) => ({
      ...u,
      _collection: String(u.collection || u.role || u._collection || "").trim().toLowerCase(),
    }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const role = roleFilter.trim().toLowerCase();
    if (role === "all") return normalizedUsers;
    return normalizedUsers.filter((u) => u._collection === role);
  }, [normalizedUsers, roleFilter]);

  const totalVisitors = filteredRecords.length;
  const uniqueCompanies = new Set(filteredRecords.map((record) => record.company)).size;
  const uniqueCountries = new Set(filteredRecords.map((record) => record.country)).size;
  const todayVisitors = filteredRecords.filter((record) => {
    const today = new Date();
    const created = new Date(record.created_at);
    return created.toDateString() === today.toDateString();
  }).length;

  const eventDistribution = eventCatalog.map((event) => {
    const count = records.filter((record) => record.event_name === event.name).length;
    return { name: event.name, count };
  });

  const totalAcrossEvents = eventDistribution.reduce((sum, item) => sum + item.count, 0);

  const dailyTrend = useMemo(() => {
    const days = 7;
    const list: { label: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = filteredRecords.filter((record) => {
        const created = new Date(record.created_at);
        return created.toDateString() === date.toDateString();
      }).length;
      list.push({ label: date.toLocaleDateString(undefined, { weekday: "short" }), count });
    }
    return list;
  }, [filteredRecords]);

  const trendPath = useMemo(() => {
    const width = 480;
    const height = 140;
    const padding = 12;
    const max = Math.max(...dailyTrend.map((d) => d.count), 1);
    return dailyTrend
      .map((point, index) => {
        const x = padding + (index * (width - padding * 2)) / (dailyTrend.length - 1 || 1);
        const y = height - padding - (point.count / max) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [dailyTrend]);

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#eef5df]">
      <section className="grid min-h-screen w-full overflow-hidden border border-foreground/10 bg-background lg:grid-cols-[74px_1fr]">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden bg-gradient-to-b from-[#03280f] to-[#024221] p-3 text-white lg:flex lg:flex-col lg:items-center lg:justify-between">
          <div className="space-y-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime-400/20">
              <Shield className="h-5 w-5 text-lime-300" />
            </div>
            <div className="space-y-3">
              {[
                { ico: LayoutGrid, id: "dashboard" },
                { ico: ChartColumnBig, id: "analytics" },
                { ico: Users, id: "users" },
                { ico: Globe2, id: "location" },
                { ico: CalendarDays, id: "events" },
              ].map(({ ico: Icon, id }, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMenu(id as any)}
                  className={`grid h-10 w-10 place-items-center rounded-xl text-white/85 transition hover:bg-white/15 ${selectedMenu === id ? "bg-white/10" : ""}`}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white/90 transition hover:bg-white/20"
            onClick={() => {
              clearAdminAuthenticated();
              navigate("/admin/login", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </aside>

        {/* Mobile Menu Button */}
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#0c4f2a] to-[#0a3019] text-white shadow-lg hover:shadow-xl transition"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#03280f] to-[#024221] p-4 text-white transition-transform duration-300 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime-400/20">
              <Shield className="h-5 w-5 text-lime-300" />
            </div>
            <div className="space-y-3">
              {[LayoutGrid, ChartColumnBig, Users, Globe2, CalendarDays].map((Icon, idx) => (
                <button key={idx} type="button" className="w-full text-left px-4 py-2 rounded-lg text-white/85 transition hover:bg-white/15 flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{["Dashboard", "Analytics", "Users", "Location", "Events"][idx]}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="mt-auto flex w-full items-center gap-3 rounded-lg bg-white/10 px-4 py-2 text-white/90 transition hover:bg-white/20"
            onClick={() => {
              clearAdminAuthenticated();
              navigate("/admin/login", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </aside>

        <div className="p-3 sm:p-4 md:p-5 overflow-y-auto pb-20 lg:pb-0">
          {/* Top Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 px-3 sm:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Event Admin</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Registration control center</p>
              </div>
              <Button
                type="button"
                className="h-10 rounded-full bg-[#08331a] px-4 text-white hover:bg-[#0b4a24] w-full sm:w-auto"
                onClick={() => {
                  clearAdminAuthenticated();
                  navigate("/admin/login", { replace: true });
                }}
              >
                Logout
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-10 rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <select
                id="event-filter"
                className="h-10 rounded-full border border-border bg-background px-3 text-sm w-full sm:w-auto"
                value={selectedEvent}
                onChange={(evt) => setSelectedEvent(evt.target.value)}
              >
                <option value="all">All events</option>
                {eventCatalog.map((event) => (
                  <option key={event.id} value={event.name}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && <p className="mt-5 text-sm text-muted-foreground">Loading registrations...</p>}
          {error && <p className="mt-5 text-sm text-destructive">{error}</p>}

          {!isLoading && !error && (
            <div className="mt-4">
              {selectedMenu === "dashboard" && (
                <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
                  <div className="space-y-4">
                    {/* KPI Cards - responsive grid */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                      <article className="rounded-2xl border border-[#0f5a31] bg-gradient-to-br from-[#0c4f2a] to-[#0a3019] p-4 text-white">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/75">Total visitors</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-semibold">{totalVisitors}</p>
                        <p className="mt-1 text-xs text-lime-300">Live registrations</p>
                      </article>
                      <article className="rounded-2xl border border-border/70 bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Today</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-semibold">{todayVisitors}</p>
                        <p className="mt-1 text-xs text-emerald-600">new today</p>
                      </article>
                      <article className="rounded-2xl border border-border/70 bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Companies</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-semibold">{uniqueCompanies}</p>
                        <p className="mt-1 text-xs text-muted-foreground">participating</p>
                      </article>
                      <article className="rounded-2xl border border-border/70 bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Countries</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-semibold">{uniqueCountries}</p>
                        <p className="mt-1 text-xs text-muted-foreground">global reach</p>
                      </article>
                    </div>

                    {/* Analytics Chart */}
                    <article className="rounded-2xl border border-border/70 bg-card p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-sm font-medium">Registration Analytics</h2>
                        <span className="text-xs text-muted-foreground">Last 7 days</span>
                      </div>
                      <div className="mt-3 rounded-xl border border-border/50 bg-gradient-to-br from-lime-100/40 to-emerald-100/40 p-3 overflow-x-auto">
                        <svg viewBox="0 0 480 140" className="h-32 sm:h-44 w-full min-w-[280px]" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#84cc16" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>
                          <path d={trendPath} fill="none" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {dailyTrend.map((day) => (
                            <span key={day.label}>{day.label}</span>
                          ))}
                        </div>
                      </div>
                    </article>

                    {/* Registrations Table - Responsive */}
                    <article className="rounded-2xl border border-border/70 bg-card overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 px-3 sm:px-4 py-3">
                        <h2 className="text-sm font-medium">Recent Registrations</h2>
                        <span className="text-xs text-muted-foreground">{filteredRecords.length} rows</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-sm">
                          <thead>
                            <tr className="border-b border-border/50 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground bg-background/30">
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Created</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap hidden sm:table-cell">Event</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Name</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap hidden md:table-cell">Email</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap hidden lg:table-cell">Phone</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap hidden xl:table-cell">Company</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap hidden xl:table-cell">Country</th>
                              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRecords.length === 0 && (
                              <tr>
                                <td className="px-3 sm:px-4 py-6 text-muted-foreground text-center" colSpan={8}>
                                  No registrations found.
                                </td>
                              </tr>
                            )}
                            {filteredRecords.slice(0, 10).map((record) => (
                              <tr key={record.id} className="border-b border-border/30 last:border-b-0 hover:bg-background/50">
                                <td className="px-3 sm:px-4 py-3 text-xs whitespace-nowrap">{new Date(record.created_at).toLocaleDateString()}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs whitespace-nowrap hidden sm:table-cell font-medium">{record.event_name.split(' ')[0]}</td>
                                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{record.full_name.split(' ')[0]}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs whitespace-nowrap hidden md:table-cell">{record.email.substring(0, 15)}...</td>
                                <td className="px-3 sm:px-4 py-3 text-xs whitespace-nowrap hidden lg:table-cell">{record.phone}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs whitespace-nowrap hidden xl:table-cell">{record.company}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs whitespace-nowrap hidden xl:table-cell">{record.country}</td>
                                <td className="px-3 sm:px-4 py-3 whitespace-nowrap"><span className="inline-block px-2 py-1 bg-lime-100/50 text-lime-700 text-xs rounded">{record.attendee_type}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  </div>

                  {/* Right Sidebar - Event Distribution & Notes */}
                  <div className="space-y-4">
                    <article className="rounded-2xl border border-border/70 bg-card p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">Event Distribution</h3>
                        <CircleDollarSign className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div className="mt-4 flex justify-center">
                        <div
                          className="h-32 w-32 sm:h-36 sm:w-36 rounded-full"
                          style={{
                            background: `conic-gradient(#0b4021 0 ${Math.round((eventDistribution[0]?.count || 0) / Math.max(totalAcrossEvents, 1) * 360)}deg, #2f855a ${Math.round((eventDistribution[0]?.count || 0) / Math.max(totalAcrossEvents, 1) * 360)}deg ${Math.round(((eventDistribution[0]?.count || 0) + (eventDistribution[1]?.count || 0)) / Math.max(totalAcrossEvents, 1) * 360)}deg, #84cc16 ${Math.round(((eventDistribution[0]?.count || 0) + (eventDistribution[1]?.count || 0)) / Math.max(totalAcrossEvents, 1) * 360)}deg ${Math.round(((eventDistribution[0]?.count || 0) + (eventDistribution[1]?.count || 0) + (eventDistribution[2]?.count || 0)) / Math.max(totalAcrossEvents, 1) * 360)}deg, #f59e0b ${Math.round(((eventDistribution[0]?.count || 0) + (eventDistribution[1]?.count || 0) + (eventDistribution[2]?.count || 0)) / Math.max(totalAcrossEvents, 1) * 360)}deg 360deg)`,
                          }}
                        >
                          <div className="m-4 sm:m-6 grid h-20 sm:h-24 w-20 sm:w-24 place-items-center rounded-full bg-background text-lg sm:text-xl font-semibold">
                            {totalAcrossEvents}
                          </div>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm">
                        {eventDistribution.map((item) => (
                          <li key={item.name} className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs sm:text-sm text-muted-foreground">{item.name}</span>
                            <span className="font-medium text-xs sm:text-sm">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </article>

                    <article className="rounded-2xl border border-border/70 bg-card p-4">
                      <h3 className="text-sm font-medium">Dashboard Notes</h3>
                      <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                        <li>Use event filter from the top bar to narrow records.</li>
                        <li>Visitor pass data syncs from Firebase collections.</li>
                        <li>Update admin credentials in your .env file as needed.</li>
                      </ul>
                    </article>
                  </div>
                </div>
              )}

              {selectedMenu === "analytics" && (
                <div className="grid gap-4">
                  <article className="rounded-2xl border border-border/70 bg-card p-4">
                    <h2 className="text-sm font-medium">Analytics Overview</h2>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Summary metrics and visualizations based on registration data.</p>
                      <div className="mt-4 rounded-xl border border-border/50 p-4 bg-background/30">
                        <svg viewBox="0 0 480 140" className="h-44 w-full" preserveAspectRatio="none">
                          <path d={trendPath} fill="none" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {selectedMenu === "users" && (
                <div className="grid gap-4">
                  <article className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium">User Management</h2>
                      <span className="text-xs text-muted-foreground">{filteredUsers.length} records</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {['all','exhibitors','visitors','delegates','fabricators'].map((r) => (
                          <button
                            key={r}
                            onClick={() => setRoleFilter(r as any)}
                            className={`px-3 py-1 rounded-full text-xs ${roleFilter === r ? 'bg-[#08331a] text-white' : 'bg-background border border-border'}`}>
                            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                          </button>
                        ))}
                        <Button size="sm" onClick={() => exportCSVForRole(roleFilter)}>Export CSV</Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input className="h-9 rounded-full border border-border px-3 text-sm" placeholder="Scan/Code" value={scannerCode} onChange={e => setScannerCode(e.target.value)} />
                        <Button size="sm" onClick={async () => { const ok = await openScannerAndMark(scannerCode); if (ok) alert('Marked as scanned'); else alert('Not found'); }}>Scan</Button>
                      </div>
                    </div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border/50">
                            <th className="px-3 py-2">Collection</th>
                            <th className="px-3 py-2">Name / Company</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody key={roleFilter}>
                          {filteredUsers.map((u) => (
                            <tr key={`${u._collection}-${u.id}`} className="border-b border-border/30 hover:bg-background/50">
                              <td className="px-3 py-2 text-xs font-medium">{u._collection}</td>
                              <td className="px-3 py-2">{u.companyName || `${u.firstName || ''} ${u.lastName || ''}`}</td>
                              <td className="px-3 py-2 text-xs">{u.email}</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(u.email || '')}>Copy Email</Button>
                                  <Button size="sm" variant="secondary" onClick={() => resendBadgeToUser(u)}>Resend Badge</Button>
                                  {u._collection === 'exhibitors' && (
                                    <Button size="sm" onClick={() => {
                                      const stall = prompt('Assign stall/booth number', u.boothNumber || u.stallNumber || '');
                                      if (stall !== null) updateExhibitor(u.id, { boothNumber: stall, stallAllocated: true });
                                    }}>Assign Stall</Button>
                                  )}
                                  {u._collection === 'fabricators' && (
                                    <>
                                      <Button size="sm" onClick={() => {
                                        const comment = prompt('Approval notes (optional)', 'Approved by admin');
                                        approveFabricator(u.id, 'approved', comment || '');
                                      }}>Approve</Button>
                                      <Button size="sm" variant="destructive" onClick={() => {
                                        const comment = prompt('Rejection reason (optional)', '');
                                        approveFabricator(u.id, 'rejected', comment || '');
                                      }}>Reject</Button>
                                    </>
                                  )}
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id, u.collection || u._collection)}>Delete</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-card p-3">
                        <h3 className="text-sm font-medium">Broadcast Message</h3>
                        <div className="mt-2 space-y-2">
                          <input className="w-full rounded border px-2 py-1" placeholder="Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
                          <textarea className="w-full rounded border px-2 py-1" rows={3} placeholder="Message" value={broadcastMessageBody} onChange={e => setBroadcastMessageBody(e.target.value)} />
                          <div className="flex items-center gap-2 flex-wrap">
                            {['exhibitors','visitors','delegates','fabricators'].map(r => (
                              <label key={r} className="text-xs inline-flex items-center gap-2">
                                <input type="checkbox" checked={broadcastRoles.includes(r)} onChange={(e) => setBroadcastRoles(prev => e.target.checked ? Array.from(new Set([...prev, r])) : prev.filter(x => x !== r))} />
                                {r}
                              </label>
                            ))}
                          </div>
                          <div className="mt-2">
                            <Button size="sm" onClick={() => { broadcastMessage(broadcastRoles, broadcastTitle, broadcastMessageBody); alert('Broadcast queued'); }}>Send Broadcast</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>

                  {roleFilter === 'exhibitors' && (
                    <article className="rounded-2xl border border-border/70 bg-card p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium">Exhibitor Management</h2>
                        <span className="text-xs text-muted-foreground">{filteredUsers.length} exhibitors</span>
                      </div>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border/50">
                              <th className="px-3 py-2">Company</th>
                              <th className="px-3 py-2">Email</th>
                              <th className="px-3 py-2">Stall</th>
                              <th className="px-3 py-2">Payment</th>
                              <th className="px-3 py-2">Materials</th>
                              <th className="px-3 py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((u) => (
                              <tr key={`exhibitor-${u.id}`} className="border-b border-border/30 hover:bg-background/50">
                                <td className="px-3 py-2">
                                  <div className="text-xs font-medium">{u.companyName || u.company_name || '—'}</div>
                                  <div className="text-[11px] text-muted-foreground">{u.contactName || u.contact_name || '—'}</div>
                                </td>
                                <td className="px-3 py-2 text-xs">{u.email}</td>
                                <td className="px-3 py-2 text-xs">
                                  <div className="flex flex-col gap-2">
                                    <select
                                      className="h-8 rounded border border-border bg-background px-2 text-xs"
                                      value={u.stallSize || 'small'}
                                      onChange={(e) => updateExhibitor(u.id, { stallSize: e.target.value })}
                                    >
                                      <option value="small">Small</option>
                                      <option value="medium">Medium</option>
                                      <option value="large">Large</option>
                                    </select>
                                    <button
                                      className="h-8 rounded border border-border bg-background px-2 text-xs"
                                      onClick={() => {
                                        const stall = prompt('Assign stall/booth number', u.boothNumber || u.booth_number || '');
                                        if (stall !== null) updateExhibitor(u.id, { boothNumber: stall, stallAllocated: true });
                                      }}
                                    >
                                      {u.boothNumber || u.booth_number || 'Assign booth'}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  <div className="flex flex-col gap-2">
                                    <select
                                      className="h-8 rounded border border-border bg-background px-2 text-xs"
                                      value={u.paymentStatus || 'pending'}
                                      onChange={(e) => updateExhibitor(u.id, { paymentStatus: e.target.value })}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="partial">Partial</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    <button
                                      className="h-8 rounded border border-border bg-background px-2 text-xs"
                                      onClick={() => {
                                        const amount = prompt('Update payment amount', String(u.paymentAmount || u.payment_amount || '0'));
                                        if (amount !== null) updateExhibitor(u.id, { paymentAmount: Number(amount) || 0 });
                                      }}
                                    >
                                      Amount: {u.paymentAmount || u.payment_amount || 0}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  <div className="flex flex-col gap-2">
                                    {u.logoUrl || u.logo_url ? (
                                      <a className="text-xs text-primary underline" href={u.logoUrl || u.logo_url} target="_blank" rel="noreferrer">Logo</a>
                                    ) : (
                                      <span className="text-[11px] text-muted-foreground">No logo</span>
                                    )}
                                    {u.brochureUrl || u.brochure_url ? (
                                      <a className="text-xs text-primary underline" href={u.brochureUrl || u.brochure_url} target="_blank" rel="noreferrer">Brochure</a>
                                    ) : (
                                      <span className="text-[11px] text-muted-foreground">No brochure</span>
                                    )}
                                    <label className="flex items-center gap-2 text-[11px]">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(u.exhibitorManualDownloaded || u.exhibitor_manual_downloaded)}
                                        onChange={(e) => updateExhibitor(u.id, { exhibitorManualDownloaded: e.target.checked })}
                                      />
                                      Manual downloaded
                                    </label>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  <div className="flex flex-col gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => resendBadgeToUser(u)}>Resend Badge</Button>
                                    <Button size="sm" variant="ghost" onClick={() => {
                                      const notes = prompt('Add internal notes', u.additionalNotes || u.additional_notes || '');
                                      if (notes !== null) updateExhibitor(u.id, { additionalNotes: notes });
                                    }}>Notes</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  )}
                </div>
              )}

              {selectedMenu === "events" && (
                <div className="grid gap-4">
                  <article className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium">Event Catalog (Admin)</h2>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => { setAdminEvents(eventCatalog as any); setEventsEditor(JSON.stringify(eventCatalog, null, 2)); }}>Import From Code</Button>
                        <Button size="sm" onClick={() => setEventsEditor(JSON.stringify(adminEvents, null, 2))}>Edit JSON</Button>
                        <Button size="sm" onClick={() => saveAdminEvents(adminEvents)}>Save</Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <textarea value={eventsEditor} onChange={(e) => setEventsEditor(e.target.value)} rows={12} className="w-full rounded border border-border p-3 bg-background text-sm" />
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => {
                          try {
                            const parsed = JSON.parse(eventsEditor);
                            saveAdminEvents(parsed);
                          } catch (err) {
                            console.error('Invalid JSON in events editor', err);
                          }
                        }}>Apply JSON</Button>
                        <Button variant="ghost" onClick={() => { setEventsEditor(JSON.stringify(adminEvents, null, 2)); }}>Reset</Button>
                      </div>
                    </div>
                  </article>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
