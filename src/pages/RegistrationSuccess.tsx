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
                className="relative mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3a2f0b] via-[#7b5e10] to-[#f6d365] p-5 text-[#271f12] shadow-[0_18px_45px_rgba(31,20,10,0.28)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-3">
                      <p className="inline-flex items-center rounded-full bg-yellow-400/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#fff]">
                        Delegate Pass
                      </p>
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                        VIP
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-[1.7rem] leading-[1.05] sm:text-[1.95rem]">{pass.eventName}</h2>
                    <p className="mt-1 text-xs font-medium text-[#fff8e6]">Pass No: {pass.passNumber}</p>
                  </div>
                  <div className="rounded-sm bg-white px-3 py-2 shadow-sm">
                    <img src={logo} alt="BioEnergy Global" className="h-8 w-auto object-contain" />
                  </div>
                </div>

                <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.78rem] leading-snug sm:text-[0.9rem]">
                    <div className="col-span-2"><span className="text-[#fff8e6]">Name:</span> {pass.fullName}</div>
                    <div className="col-span-2"><span className="text-[#fff8e6]">Email:</span> {pass.email}</div>
                    {pass.phone && <div><span className="text-[#fff8e6]">Phone:</span> {pass.phone}</div>}
                    {pass.country && <div><span className="text-[#fff8e6]">Country:</span> {pass.country}</div>}
                    {pass.company && <div><span className="text-[#fff8e6]">Company:</span> {pass.company}</div>}
                    <div><span className="text-[#fff8e6]">Type:</span> {pass.attendeeType}</div>
                    {pass.designation && <div className="col-span-2"><span className="text-[#fff8e6]">Designation:</span> {pass.designation}</div>}
                    {pass.interests && <div className="col-span-2"><span className="text-[#fff8e6]">Interests:</span> {pass.interests}</div>}
                  </dl>

                  <div className="mx-auto rounded-[1.35rem] bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)] sm:mx-0">
                    <QRCodeSVG value={qrPayload} size={150} includeMargin />
                  </div>
                </div>

                <p className="relative z-10 mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
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
