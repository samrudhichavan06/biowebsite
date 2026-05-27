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
                className="relative mt-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#0f1724] to-[#111827] p-0 text-white shadow-2xl"
              >
                <style>{`
                  @keyframes shimmer { 0% { transform: translateX(-110%); } 100% { transform: translateX(110%); } }
                  @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 8px rgba(255,223,102,0.45);} 50% { transform: scale(1.04); box-shadow: 0 0 26px rgba(255,223,102,0.95);} 100% { transform: scale(1); box-shadow: 0 0 8px rgba(255,223,102,0.45);} }
                  @keyframes glow { 0% { box-shadow: 0 0 8px rgba(255,223,102,0.4);} 50% { box-shadow: 0 0 34px rgba(255,223,102,0.95);} 100% { box-shadow: 0 0 8px rgba(255,223,102,0.4);} }
                  .shimmer-overlay { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
                  .shimmer { position: absolute; top: 0; left: -40%; width: 60%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%); transform: translateX(-100%); animation: shimmer 2200ms linear infinite; mix-blend-mode: overlay; }
                  .vip-pulse { animation: pulse 2200ms ease-in-out infinite; border-radius: 9999px; }
                  .qr-glow { animation: glow 2600ms ease-in-out infinite; border-radius: 8px; }
                  .sparkle { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: radial-gradient(circle,#fff,#ffe59e); opacity: .95; filter: blur(0.4px); }
                `}</style>

                <div className="flex flex-col items-stretch rounded-[1.5rem] overflow-hidden md:flex-row">
                  {/* Left main ticket area (dark/gold) */}
                  <div className="relative w-full bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-300 p-4 sm:p-6 md:w-3/4">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),transparent)]" />
                    <div className="shimmer-overlay"><div className="shimmer" /></div>
                    <span className="sparkle" style={{left: '8%', top: '18%'}} />
                    <span className="sparkle" style={{left: '22%', top: '28%'}} />
                    <span className="sparkle" style={{left: '56%', top: '8%'}} />
                    <span className="sparkle" style={{left: '68%', top: '36%'}} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/95 vip-pulse">Delegate Pass</p>
                        <h2 className="mt-3 font-display text-2xl leading-tight text-white drop-shadow-lg sm:text-3xl">{pass.eventName}</h2>
                        <p className="mt-1 text-sm text-white/90 sm:text-base">Pass No: {pass.passNumber}</p>
                      </div>
                      <div className="shrink-0 rounded-sm bg-white px-2 py-2 shadow-sm vip-pulse sm:px-3" style={{boxShadow:'0 6px 20px rgba(255,220,120,0.35)'}}>
                        <img src={logo} alt="BioEnergy Global" className="h-8 w-auto object-contain sm:h-10" />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 text-white/95 sm:grid-cols-2 sm:mt-6">
                      <div>
                        <div className="text-sm sm:text-base"><span className="font-medium">Name:</span> {pass.fullName}</div>
                        <div className="mt-2 text-sm sm:text-base"><span className="font-medium">Email:</span> {pass.email}</div>
                        {pass.phone && <div className="mt-2 text-sm sm:text-base"><span className="font-medium">Phone:</span> {pass.phone}</div>}
                      </div>
                      <div>
                        {pass.company && <div className="text-sm sm:text-base"><span className="font-medium">Company:</span> {pass.company}</div>}
                        <div className="mt-2 text-sm sm:text-base"><span className="font-medium">Type:</span> {pass.attendeeType}</div>
                        {pass.designation && <div className="mt-2 text-sm sm:text-base"><span className="font-medium">Designation:</span> {pass.designation}</div>}
                      </div>
                    </div>

                    <p className="mt-5 text-[10px] uppercase tracking-widest text-white/80 sm:mt-6 sm:text-xs">Issued {new Date(pass.issuedAt).toLocaleString()}</p>
                  </div>

                  {/* Vertical tear line */}
                  <div className="h-0.5 w-full bg-white/20 md:h-auto md:w-0.5" />

                  {/* Right stub with QR (white) */}
                  <div className="flex w-full flex-col items-center justify-center bg-white p-4 md:w-1/4">
                    <div className="qr-glow rounded-md bg-white p-2 shadow-lg" style={{ borderRadius: 12 }}>
                      <div className="scale-90 sm:scale-100">
                        <QRCodeSVG value={qrPayload} size={160} includeMargin />
                      </div>
                    </div>
                    <div className="mt-4 text-sm font-semibold text-gray-700 sm:text-base">Admit</div>
                    <div className="mt-1 text-xs text-gray-500">Show at entry</div>
                  </div>
                </div>
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
