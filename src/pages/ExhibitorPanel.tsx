import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clearExhibitorSession, getExhibitorSession, isExhibitorAuthenticated } from "@/lib/exhibitorAuth";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

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

const SCANNER_ELEMENT_ID = "exhibitor-qr-scanner";

const ExhibitorPanel = () => {
  const navigate = useNavigate();
  const exhibitor = getExhibitorSession();
  const [lastScanned, setLastScanned] = useState<ScannedAttendee | null>(null);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerInstanceRef = useRef<Html5QrcodeScanner | null>(null);
  const latestDecodedRef = useRef<string>("");

  const authenticated = isExhibitorAuthenticated();

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
    if (!authenticated || !exhibitor) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      SCANNER_ELEMENT_ID,
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
      },
      false,
    );

    scannerInstanceRef.current = scanner;

    scanner.render(
      async (decodedText) => {
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
          await addDoc(collection(db, "exhibitor_scans"), {
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
        } catch (error) {
          toast.error("Scan save failed", {
            description: error instanceof Error ? error.message : "Could not save scan record",
          });
          return;
        }

        setLastScanned(attendee);
        toast.success("Attendee scanned", { description: `${attendee.fullName} added to your panel.` });
        fetchScans();
      },
      () => {
        // ignore noisy decode errors
      },
    );

    return () => {
      const scannerInstance = scannerInstanceRef.current;
      scannerInstanceRef.current = null;
      if (scannerInstance) {
        scannerInstance.clear().catch(() => {
          // no-op on cleanup
        });
      }
    };
  }, [authenticated, exhibitor]);

  if (!authenticated || !exhibitor) {
    return <Navigate to="/exhibitor/login" replace />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container-x py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="chip text-[0.68rem] tracking-[0.16em]">Exhibitor panel</p>
            <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{exhibitor.booth_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Scan attendee QR codes and view your own scan records.</p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearExhibitorSession();
              navigate("/exhibitor/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-card">
            <h2 className="text-sm font-medium">Scan attendee pass</h2>
            <p className="mt-1 text-xs text-muted-foreground">Allow camera access and point at the attendee QR code.</p>

            <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-background p-3">
              <div id={SCANNER_ELEMENT_ID} />
            </div>

            {scannerError && <p className="mt-3 text-sm text-destructive">{scannerError}</p>}
          </article>

          <article className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-card">
            <h2 className="text-sm font-medium">Last scanned attendee</h2>
            {!lastScanned && <p className="mt-3 text-sm text-muted-foreground">No attendee scanned yet.</p>}

            {lastScanned && (
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {lastScanned.fullName}</div>
                <div><span className="text-muted-foreground">Email:</span> {lastScanned.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {lastScanned.phone}</div>
                <div><span className="text-muted-foreground">Company:</span> {lastScanned.company}</div>
                <div><span className="text-muted-foreground">Designation:</span> {lastScanned.designation}</div>
                <div><span className="text-muted-foreground">Country:</span> {lastScanned.country}</div>
                <div><span className="text-muted-foreground">Event:</span> {lastScanned.eventName}</div>
                <div><span className="text-muted-foreground">Pass No:</span> {lastScanned.passNumber}</div>
              </dl>
            )}
          </article>
        </div>

        <article className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card/70 shadow-card">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-medium">Your scanned attendees</h2>
            <span className="text-xs text-muted-foreground">{records.length} records</span>
          </div>

          {isLoadingRecords && <p className="px-4 py-4 text-sm text-muted-foreground">Loading scan records...</p>}

          {!isLoadingRecords && (
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3">Scanned</th>
                  <th className="px-4 py-3">Pass</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Country</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={8}>
                      No scans yet for your booth.
                    </td>
                  </tr>
                )}

                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/30 last:border-b-0">
                    <td className="px-4 py-3">{new Date(record.scanned_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{record.attendee_pass_number}</td>
                    <td className="px-4 py-3">{record.event_name}</td>
                    <td className="px-4 py-3">{record.attendee_full_name}</td>
                    <td className="px-4 py-3">{record.attendee_email}</td>
                    <td className="px-4 py-3">{record.attendee_phone}</td>
                    <td className="px-4 py-3">{record.attendee_company}</td>
                    <td className="px-4 py-3">{record.attendee_country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>
    </main>
  );
};

export default ExhibitorPanel;
