import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clearExhibitorSession, getExhibitorSession, isExhibitorAuthenticated } from "@/lib/exhibitorAuth";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/collections";
import {
  QrCode,
  Store,
  CreditCard,
  FileCheck,
  LogOut,
  Menu,
  X,
  UserCheck,
  Sparkles,
  ShieldAlert,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Globe,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

type ScannedAttendee = {
  passNumber: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  country: string;
  attendeeType: string;
  interests: string;
};

type ScanRecord = {
  id: string;
  scanned_at: string;
  attendee_full_name: string;
  attendee_email: string;
  attendee_phone: string;
  attendee_company: string;
  attendee_designation: string;
  attendee_country: string;
  attendee_type: string;
  attendee_pass_number: string;
  event_name: string;
};

type ExhibitorProfile = {
  boothName?: string;
  boothNumber?: string;
  stallAllocated?: boolean;
  stallSize?: "small" | "medium" | "large";
  paymentStatus?: "pending" | "partial" | "completed";
  paymentAmount?: number;
  logoUrl?: string;
  brochureUrl?: string;
  exhibitorManualDownloaded?: boolean;
  additionalNotes?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
};

type ExhibitorDownload = {
  id: string;
  title: string;
  type: "brochure" | "floor_plan" | "manual" | "agenda" | "guidelines";
  fileUrl: string;
  fileSize: number;
  category: string;
};

const SCANNER_ELEMENT_ID = "exhibitor-qr-scanner";

const ExhibitorPanel = () => {
  const navigate = useNavigate();
  let exhibitor: ReturnType<typeof getExhibitorSession> = null;
  try {
    exhibitor = getExhibitorSession();
  } catch {
    exhibitor = null;
  }
  const [lastScanned, setLastScanned] = useState<ScannedAttendee | null>(null);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [exhibitorProfile, setExhibitorProfile] = useState<ExhibitorProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [stallSize, setStallSize] = useState<"small" | "medium" | "large">("small");
  const [stallNotes, setStallNotes] = useState("");
  const [downloads, setDownloads] = useState<ExhibitorDownload[]>([]);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(true);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const latestDecodedRef = useRef<string>("");
  const boothName = exhibitor?.booth_name?.trim() || exhibitor?.company_name?.trim() || "Exhibitor";

  // Premium dashboard states
  const [activeTab, setActiveTab] = useState<"scan" | "stall" | "records">("scan");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Client-side export to CSV function
  const exportMyScans = () => {
    if (records.length === 0) {
      toast.error("No scans to export", { description: "Your scan record list is currently empty." });
      return;
    }
    try {
      const rows = records.map(r => ({
        "Scanned At": new Date(r.scanned_at).toLocaleString(),
        "Pass Number": r.attendee_pass_number,
        "Event Name": r.event_name,
        "Full Name": r.attendee_full_name,
        "Email Address": r.attendee_email,
        "Phone Number": r.attendee_phone,
        "Company Name": r.attendee_company,
        "Designation": r.attendee_designation,
        "Country": r.attendee_country,
        "Attendee Type": r.attendee_type,
      }));
      const header = Object.keys(rows[0]).join(',') + '\n';
      const csv = header + rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(exhibitor?.booth_name || "exhibitor").replace(/\s+/g, '_')}_scan_leads.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export successful", { description: "Attendee scan leads CSV has been downloaded." });
    } catch (err) {
      toast.error("Export failed", { description: "Could not generate CSV file." });
    }
  };

  let authenticated = false;
  try {
    authenticated = isExhibitorAuthenticated();
  } catch {
    authenticated = false;
  }

  const fetchScans = async () => {
    if (!exhibitor || !isFirebaseConfigured || !db) {
      setIsLoadingRecords(false);
      return;
    }

    try {
      const snapshot = await getDocs(query(collection(db, "exhibitor_scans"), where("exhibitor_id", "==", exhibitor.id)));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => String(b.scanned_at || "").localeCompare(String(a.scanned_at || ""))) as ScanRecord[];

      setRecords(data);
      setIsLoadingRecords(false);
    } catch (error) {
      toast.error("Could not load scans", {
        description: error instanceof Error ? error.message : "Failed to load scan records",
      });
      setIsLoadingRecords(false);
      return;
    }
  };

  useEffect(() => {
    setIsLoadingRecords(true);
    fetchScans();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!exhibitor || !isFirebaseConfigured || !db) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const ref = doc(db, COLLECTIONS.EXHIBITORS, exhibitor.id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          const profile: ExhibitorProfile = {
            boothName: data.boothName || data.booth_name || exhibitor.booth_name,
            boothNumber: data.boothNumber || data.booth_number || "",
            stallAllocated: Boolean(data.stallAllocated || data.stall_allocated),
            stallSize: data.stallSize || data.stall_size || "small",
            paymentStatus: data.paymentStatus || data.payment_status || "pending",
            paymentAmount: Number(data.paymentAmount || data.payment_amount || 0),
            logoUrl: data.logoUrl || data.logo_url || "",
            brochureUrl: data.brochureUrl || data.brochure_url || "",
            exhibitorManualDownloaded: Boolean(data.exhibitorManualDownloaded || data.exhibitor_manual_downloaded),
            additionalNotes: data.additionalNotes || data.additional_notes || "",
            approvalStatus: data.approval_status || "pending",
          };
          setExhibitorProfile(profile);
          setStallSize(profile.stallSize || "small");
          setStallNotes(profile.additionalNotes || "");
        } else {
          const profile: ExhibitorProfile = {
            boothName: exhibitor.booth_name,
            approvalStatus: "pending",
          };
          setExhibitorProfile(profile);
        }
      } catch (error) {
        toast.error("Could not load exhibitor profile", {
          description: error instanceof Error ? error.message : "Failed to load exhibitor data",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [exhibitor]);

  useEffect(() => {
    const loadDownloads = async () => {
      if (!isFirebaseConfigured || !db) {
        setIsLoadingDownloads(false);
        return;
      }
      try {
        const snapshot = await getDocs(
          query(collection(db, COLLECTIONS.DOWNLOADS), where("category", "==", "Exhibitor")),
        );
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as ExhibitorDownload),
        }));
        setDownloads(items);
      } catch (error) {
        toast.error("Could not load exhibitor downloads", {
          description: error instanceof Error ? error.message : "Failed to load downloads",
        });
      } finally {
        setIsLoadingDownloads(false);
      }
    };

    loadDownloads();
  }, []);

  const handleSaveStallBooking = async () => {
    if (!exhibitor || !isFirebaseConfigured || !db) {
      return;
    }

    try {
      const ref = doc(db, COLLECTIONS.EXHIBITORS, exhibitor.id);
      await updateDoc(ref, {
        stallSize,
        additionalNotes: stallNotes,
        updatedAt: new Date(),
      });
      setExhibitorProfile((prev) => ({
        ...prev,
        stallSize,
        additionalNotes: stallNotes,
      }));
      toast.success("Stall booking updated", {
        description: "Your stall booking details have been saved.",
      });
    } catch (error) {
      toast.error("Could not save stall booking", {
        description: error instanceof Error ? error.message : "Failed to update booking",
      });
    }
  };

  const startScanner = async () => {
    if (!authenticated || !exhibitor || isLoadingProfile || exhibitorProfile?.approvalStatus !== "approved") {
      return;
    }

    if (scannerInstanceRef.current) {
      return;
    }

    setScannerError(null);

    if (!window.isSecureContext) {
      setScannerError("Camera access requires HTTPS or localhost.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError("Camera is not supported on this device or browser.");
      return;
    }

    if (!document.getElementById(SCANNER_ELEMENT_ID)) {
      return;
    }

    const container = document.getElementById(SCANNER_ELEMENT_ID);
    if (container) {
      container.innerHTML = "";
    }

    const { Html5Qrcode, Html5QrcodeScanType } = await import("html5-qrcode");

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      verbose: false,
    });

    scannerInstanceRef.current = scanner;

    const handleScanSuccess = async (decodedText: string) => {
      if (!isFirebaseConfigured || !db) {
        toast.error("Firebase is not configured");
        return;
      }

      if (decodedText === latestDecodedRef.current) {
        return;
      }

      latestDecodedRef.current = decodedText;

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(decodedText) as Record<string, unknown>;
      } catch {
        toast.error("Invalid QR", { description: "QR code format is not recognized." });
        return;
      }

      const attendee: ScannedAttendee = {
        passNumber: String(payload.pass_number || ""),
        eventName: String(payload.event_name || ""),
        fullName: String(payload.full_name || ""),
        email: String(payload.email || ""),
        phone: String(payload.phone || ""),
        company: String(payload.company || ""),
        designation: String(payload.designation || ""),
        country: String(payload.country || ""),
        attendeeType: String(payload.attendee_type || "Visitor"),
        interests: String(payload.interests || ""),
      };

      if (!attendee.passNumber || !attendee.fullName || !attendee.email) {
        toast.error("Incomplete QR", { description: "Required attendee details are missing." });
        return;
      }

      try {
        const docRef = await addDoc(collection(db, "exhibitor_scans"), {
          exhibitor_id: exhibitor.id,
          exhibitor_booth_name: exhibitor.booth_name,
          attendee_pass_number: attendee.passNumber,
          attendee_full_name: attendee.fullName,
          attendee_email: attendee.email,
          attendee_phone: attendee.phone,
          attendee_company: attendee.company,
          attendee_designation: attendee.designation,
          attendee_country: attendee.country,
          attendee_type: attendee.attendeeType,
          attendee_interests: attendee.interests,
          event_name: attendee.eventName,
          raw_payload: payload,
          scanned_at: new Date().toISOString(),
        });

        const newRecord: ScanRecord = {
          id: docRef.id,
          scanned_at: new Date().toISOString(),
          attendee_full_name: attendee.fullName,
          attendee_email: attendee.email,
          attendee_phone: attendee.phone,
          attendee_company: attendee.company,
          attendee_designation: attendee.designation,
          attendee_country: attendee.country,
          attendee_type: attendee.attendeeType,
          attendee_pass_number: attendee.passNumber,
          event_name: attendee.eventName,
        };

        setRecords(prev => [newRecord, ...prev]);
        setLastScanned(attendee);
        toast.success("Attendee scanned", { description: `${attendee.fullName} added to your panel.` });

        setTimeout(() => {
          latestDecodedRef.current = "";
        }, 2000);
      } catch (error) {
        toast.error("Scan save failed", {
          description: error instanceof Error ? error.message : "Could not save scan record",
        });
      }
    };

    try {
      await scanner.start(
        { facingMode: { exact: "environment" } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.777778,
          disableFlip: false,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
      handleScanSuccess,
      () => {
        // Ignore per-frame decode errors to avoid noisy logs.
      },
    );
    } catch {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.777778,
            disableFlip: false,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          handleScanSuccess,
          () => {
            // Ignore per-frame decode errors to avoid noisy logs.
          },
        );
      } catch {
        setScannerError("Unable to open back camera. Please allow camera permission and retry.");
        scannerInstanceRef.current = null;
      }
    }
  };

  const stopScanner = async () => {
    const scanner = scannerInstanceRef.current;
    if (!scanner) {
      return;
    }

    scannerInstanceRef.current = null;
    latestDecodedRef.current = "";

    try {
      await scanner.stop();
    } catch {
      // Ignore stop errors when the scanner is not running yet.
    }

    try {
      await scanner.clear();
    } catch {
      // Ignore cleanup errors from partially initialized scanners.
    }
  };

  useEffect(() => {
    if (activeTab !== "scan") {
      void stopScanner();
      setScannerError(null);
      return;
    }

    startScanner();

    return () => {
      void stopScanner();
    };
  }, [activeTab, authenticated, exhibitor, isLoadingProfile, exhibitorProfile]);

  if (!authenticated || !exhibitor) {
    return <Navigate to="/exhibitor/login" replace />;
  }

  if (isLoadingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-md">
          <div className="relative inline-flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-lime-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-700 border-t-transparent animate-spin"></div>
            <Sparkles className="h-6 w-6 text-emerald-800 animate-pulse" />
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground">Synchronizing Console</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fetching secure event catalogs, attendee logs, and stall profiles from the cloud.
          </p>
        </div>
      </main>
    );
  }

  const isApprovalPending = exhibitorProfile?.approvalStatus === "pending";
  if (isApprovalPending) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <section className="w-full max-w-md rounded-3xl border border-white/60 bg-white/75 p-6 shadow-2xl backdrop-blur-md text-center md:p-8">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100/80 border border-amber-200/50 shadow-inner">
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground">Approval Pending</h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Your exhibitor profile is complete and has been securely sent to our event coordinators. Once verified and approved, you'll be granted live attendee scanning capabilities.
          </p>
          <div className="mt-6 rounded-2xl bg-amber-50/50 border border-amber-200/40 p-4 text-xs text-[#605a40] space-y-2 text-left">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-amber-700 min-w-[60px]">Booth:</span>
              <span>{exhibitor.booth_name}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-amber-700 min-w-[60px]">Status:</span>
              <span>Pending Review</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              className="w-full h-11 rounded-xl bg-background/90 hover:bg-muted/50 text-foreground shadow-sm"
              onClick={() => {
                clearExhibitorSession();
                navigate("/exhibitor/login");
              }}
            >
              Back to Login
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.attendee_full_name.toLowerCase().includes(q) ||
      r.attendee_email.toLowerCase().includes(q) ||
      r.attendee_company.toLowerCase().includes(q) ||
      r.attendee_pass_number.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#03280f] to-[#024221] text-white p-5 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-lime-400/20 flex items-center justify-center border border-lime-400/30">
                <Sparkles className="h-5 w-5 text-lime-300" />
              </div>
              <div>
                <span className="block text-sm font-semibold tracking-wider uppercase text-lime-300">BioEnergy</span>
                <span className="block text-[10px] tracking-[0.2em] text-white/60">EXHIBITOR ZONE</span>
              </div>
            </div>
            <button className="lg:hidden p-1 text-white/80 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 border border-white/5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-lime-400 text-emerald-950 font-bold flex items-center justify-center text-sm shadow-md">
                {boothName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <span className="block font-medium truncate text-sm">{boothName}</span>
                <span className="block text-xs text-white/60 truncate">{exhibitor.company_name}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-white/50">Stall Ref:</span>
              <span className="font-semibold text-lime-300 uppercase tracking-wider">{exhibitorProfile?.boothNumber || "Pending"}</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "scan", label: "Scan Dashboard", ico: QrCode },
              { id: "stall", label: "Stall Setup & Files", ico: Store },
              { id: "records", label: "Scan Lead Logs", ico: UserCheck },
            ].map((tab) => {
              const Icon = tab.ico;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-lime-400 text-emerald-950 shadow-lg shadow-lime-400/10 scale-[1.02]" : "text-white/80 hover:bg-white/5 hover:text-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === "records" && records.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-emerald-950 text-white' : 'bg-white/20 text-white'}`}>
                      {records.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => { clearExhibitorSession(); navigate("/exhibitor/login", { replace: true }); }} className="w-full h-10 rounded-xl justify-start gap-3 hover:bg-white/5 text-white/80 hover:text-white hover:text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/40 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-black/5">
              <Menu className="h-5 w-5 text-emerald-950" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-emerald-950 capitalize sm:text-xl font-display">
                {activeTab === "scan" && "Scanner Console"}
                {activeTab === "stall" && "Booth & Stall Setup"}
                {activeTab === "records" && "Scanned Attendee Logs"}
              </h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 shadow-sm animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            Live Sync
          </span>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-white/50 bg-[#0c4f2a]/95 p-4 text-white shadow-md flex items-center justify-between group hover:scale-[1.01] transition-transform">
              <div className="space-y-1">
                <span className="block text-xs uppercase tracking-[0.14em] text-white/70">Total Scans</span>
                <span className="block text-2xl font-bold font-display">{records.length} leads</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-lime-300" />
              </div>
            </article>

            <article className="rounded-2xl border border-white/50 bg-white/75 p-4 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all hover:shadow-md">
              <div className="space-y-1">
                <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">Booth Number</span>
                <span className="block text-xl font-bold font-display text-emerald-950 uppercase">{exhibitorProfile?.boothNumber || "Pending"}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Store className="h-6 w-6 text-emerald-800" />
              </div>
            </article>

            <article className="rounded-2xl border border-white/50 bg-white/75 p-4 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all hover:shadow-md">
              <div className="space-y-1">
                <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">Stall Size</span>
                <span className="block text-sm font-bold font-display text-emerald-950 capitalize">{stallSize} Stall (10x10)</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-800" />
              </div>
            </article>

            <article className="rounded-2xl border border-white/50 bg-white/75 p-4 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all hover:shadow-md">
              <div className="space-y-1">
                <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">Payment Tracking</span>
                <span className="block text-sm font-bold font-display text-[#0c2c17]">{exhibitorProfile?.paymentAmount || 0} INR</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-emerald-800" />
              </div>
            </article>
          </section>

          <section className="transition-all duration-300">
{activeTab === "scan" && (
               <div className="grid gap-6 lg:grid-cols-[1fr_420px] items-start">
                 <article className="rounded-2xl border border-white/55 bg-white/80 p-5 shadow-lg backdrop-blur-md">
                   <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
                     <h2 className="text-base font-semibold text-emerald-950 font-display">Live Attendee Scanner</h2>
                     <QrCode className="h-5 w-5 text-[#0a4d25] animate-pulse" />
                   </div>
                   <div className="overflow-hidden rounded-2xl border border-[#0c4f2a]/15 bg-[#031d0b] p-4 shadow-inner relative max-w-lg mx-auto min-h-[280px]">
                     <div className="absolute inset-6 border border-lime-400/20 rounded-xl pointer-events-none flex items-center justify-center">
                       <div className="w-48 h-48 border-2 border-lime-400/50 border-dashed rounded-lg animate-pulse" />
                     </div>
                     <div id={SCANNER_ELEMENT_ID} className="relative z-10 min-h-[200px]" />
                   </div>
                   {scannerError && <div className="mt-4 p-3 bg-red-50 border border-red-200/50 rounded-xl flex items-center gap-2.5 text-xs text-red-600">{scannerError}</div>}
                 </article>

                <article className="rounded-2xl border border-white/55 bg-white/80 p-5 shadow-lg backdrop-blur-md">
                  <h2 className="text-base font-semibold text-emerald-950 font-display mb-4 border-b border-black/5 pb-3">Last Scanned Attendee</h2>
                  {!lastScanned ? (
                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4 rounded-xl border border-dashed border-[#0c4f2a]/15 bg-[#fefefe]/40">
                      <QrCode className="h-7 w-7 text-[#0a4d25] animate-bounce" />
                      <p className="text-xs text-muted-foreground">Scan an attendee QR code to see details.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-gradient-to-br from-[#043317] to-[#02220e] p-4 text-white shadow-md">
                        <h3 className="font-bold text-lg">{lastScanned.fullName}</h3>
                        <p className="text-xs text-white/70">{lastScanned.designation}</p>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center gap-2.5 p-2 bg-[#fbfbfb] rounded-lg border border-black/5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{lastScanned.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              </div>
            )}

            {activeTab === "stall" && (
              <div className="grid gap-6 md:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] items-start">
                <article className="rounded-2xl border border-white/55 bg-white/80 p-5 shadow-lg backdrop-blur-md space-y-4">
                  <h2 className="text-base font-semibold text-emerald-950">Stall Allocation Setup</h2>
                  <select className="w-full h-10 rounded-xl border border-black/10 bg-white px-3 text-sm" value={stallSize} onChange={(e) => setStallSize(e.target.value)}>
                    <option value="small">Small (10x10)</option>
                    <option value="medium">Medium (20x20)</option>
                    <option value="large">Large (30x30)</option>
                  </select>
                  <textarea className="w-full min-h-[120px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" value={stallNotes} onChange={(e) => setStallNotes(e.target.value)} />
                  <Button className="w-full bg-[#08331a]" onClick={handleSaveStallBooking}>Save Changes</Button>
                </article>
                <article className="rounded-2xl border border-white/55 bg-white/80 p-5 shadow-lg backdrop-blur-md">
                  <h2 className="text-base font-semibold text-emerald-950 mb-4">Guidelines</h2>
                  {downloads.map(f => (
                    <div key={f.id} className="flex justify-between items-center p-3 mb-2 bg-white rounded-lg border border-black/5">
                      <span className="text-xs font-medium">{f.title}</span>
                      <a href={f.fileUrl} target="_blank" rel="noreferrer" className="text-emerald-800 text-xs font-bold underline">Download</a>
                    </div>
                  ))}
                </article>
              </div>
            )}

            {activeTab === "records" && (
              <article className="rounded-2xl border border-white/55 bg-white/80 overflow-hidden shadow-lg backdrop-blur-md">
                <div className="p-4 border-b border-black/5 flex justify-between gap-3">
                  <input type="text" className="h-10 rounded-xl border pl-4 text-xs w-64" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button onClick={exportMyScans} className="bg-[#08331a]">Export CSV</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f5f2e8] border-b">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="border-b">
                          <td className="px-4 py-3">{new Date(r.scanned_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold">{r.attendee_full_name}</td>
                          <td className="px-4 py-3">{r.attendee_email}</td>
                          <td className="px-4 py-3">{r.attendee_company}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ExhibitorPanel;
