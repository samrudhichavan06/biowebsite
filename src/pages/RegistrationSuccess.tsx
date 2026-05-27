import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import logo from "@/assets/logo-bioenergy.png";

type LatestPass = {
  passNumber: string;
  issuedAt: string;
  eventName: string;
  attendeeType: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  country: string;
  interests: string;
};

const passStorageKey = "bioenergy_latest_pass";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const [pass, setPass] = useState<LatestPass | null>(null);
  const passCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(passStorageKey);
      if (!raw) {
        navigate("/", { replace: true });
        return;
      }
      setPass(JSON.parse(raw) as LatestPass);
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleDownloadPass = async () => {
    if (!passCardRef.current || !pass) {
      return;
    }

    const canvas = await html2canvas(passCardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `pass-${pass.passNumber}.png`;
    link.click();
  };

  const qrPayload = pass
    ? JSON.stringify(
        {
          pass_number: pass.passNumber,
          issued_at: pass.issuedAt,
          event_name: pass.eventName,
          full_name: pass.fullName,
          email: pass.email,
          phone: pass.phone,
          company: pass.company,
          designation: pass.designation,
          country: pass.country,
          attendee_type: pass.attendeeType,
          interests: pass.interests,
        },
        null,
        0,
      )
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />
      <main className="flex-1 flex items-center justify-center py-12">
        {pass && (
          <div className="w-full max-w-4xl px-4">
            <div className="rounded-[1.5rem] bg-[#f5f0d8] p-6 shadow-[0_25px_50px_rgba(25,35,20,0.18)]">
              <h1 className="font-display text-2xl text-[#243123]">Your Entry Pass is Ready</h1>
              <p className="mt-2 text-sm text-[#4e5a45]">
                Show this pass at the venue. The QR code includes your submitted attendee details.
              </p>

              <div
                ref={passCardRef}
                className="relative mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3b2500] via-[#d2a843] to-[#fff3b0] p-5 text-white shadow-[0_20px_80px_rgba(255,214,120,0.8)] ring-1 ring-yellow-100/60"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-yellow-200/30" />
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-200/50 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-amber-300/55 blur-[90px]" />
                <div className="pointer-events-none absolute inset-x-0 top-10 h-14 bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-80" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-3">
                      <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-100 drop-shadow-[0_0_6px_rgba(255,233,170,0.9)]">
                        Delegate Pass
                      </p>
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-100 px-2.5 py-1 text-[10px] font-bold text-[#5a3b00] shadow-[0_0_14px_rgba(255,240,170,0.95)]">
                        VIP
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-[1.7rem] leading-[1.05] drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)] sm:text-[1.95rem]">{pass.eventName}</h2>
                    <p className="mt-1 text-xs font-medium text-yellow-100">Pass No: {pass.passNumber}</p>
                  </div>
                  <div className="rounded-sm bg-white px-3 py-2 shadow-[0_0_18px_rgba(255,255,255,0.65)]">
                    <img src={logo} alt="BioEnergy Global" className="h-8 w-auto object-contain" />
                  </div>
                </div>

                <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.78rem] leading-snug sm:text-[0.9rem]">
                    <div className="col-span-2"><span className="text-white/80">Name:</span> {pass.fullName}</div>
                    <div className="col-span-2"><span className="text-white/80">Email:</span> {pass.email}</div>
                    {pass.phone && <div><span className="text-white/80">Phone:</span> {pass.phone}</div>}
                    {pass.country && <div><span className="text-white/80">Country:</span> {pass.country}</div>}
                    {pass.company && <div><span className="text-white/80">Company:</span> {pass.company}</div>}
                    <div><span className="text-white/80">Type:</span> <strong className="ml-1 text-yellow-100">{pass.attendeeType}</strong></div>
                    {pass.designation && <div className="col-span-2"><span className="text-white/80">Designation:</span> {pass.designation}</div>}
                    {pass.interests && <div className="col-span-2"><span className="text-white/80">Interests:</span> {pass.interests}</div>}
                  </dl>

                  <div className="mx-auto rounded-[1.35rem] bg-white p-3 shadow-[0_0_30px_rgba(255,236,170,0.7)] ring-2 ring-yellow-200/60 sm:mx-0">
                    <QRCodeSVG value={qrPayload} size={150} includeMargin />
                  </div>
                </div>

                <p className="relative z-10 mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-yellow-100/90">
                  Issued {new Date(pass.issuedAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Button type="button" className="gap-2 rounded-full bg-[#3d8f1e] px-5 hover:bg-[#2f7614]" onClick={handleDownloadPass}>
                  <Download className="h-4 w-4" />
                  Download Pass
                </Button>
                <div className="flex gap-3">
                  <Link to="/" className="rounded-full border px-5 py-2 text-sm">Back to Home</Link>
                  <Link to="/downloads" className="rounded-full border px-5 py-2 text-sm">Downloads</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RegistrationSuccess;
