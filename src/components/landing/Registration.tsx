import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addDoc, collection } from "firebase/firestore";
import type { EventInfo } from "@/lib/events";
import { db, isFirebaseConfigured } from "@/lib/firebase";

const RequiredStar = () => <span className="ml-1 text-destructive">*</span>;

const passThemeMap: Record<string, { card: string; badge: string }> = {
  "bioenergy-global-2026": {
    card: "bg-gradient-to-br from-[#0a4762] via-[#0e7aa0] to-[#44cfa0] text-white",
    badge: "bg-white/20 text-white",
  },
  "reneweex-global-2026": {
    card: "bg-gradient-to-br from-[#0a4762] via-[#11759c] to-[#42c7a5] text-white",
    badge: "bg-white/20 text-white",
  },
  "waste-to-energy-expo": {
    card: "bg-gradient-to-br from-[#112c5e] via-[#1a5f96] to-[#42c7a5] text-white",
    badge: "bg-white/20 text-white",
  },
  "bioenergy-global-summit": {
    card: "bg-gradient-to-br from-[#10251f] via-[#0f5f68] to-[#44cfa0] text-white",
    badge: "bg-white/20 text-white",
  },
};

type RegistrationFormValues = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  country: string;
  interests: string;
  consent: boolean;
};

type GeneratedPass = {
  passNumber: string;
  issuedAt: string;
  eventId: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  country: string;
  attendeeType: "Visitor";
  interests: string;
  consent: boolean;
};

const initialValues: RegistrationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  designation: "",
  country: "",
  interests: "",
  consent: false,
};

type RegistrationEvent = Pick<EventInfo, "id" | "n" | "name" | "subtitle" | "logo" | "registrationTable">;

export function EventRegistrationForm({ event }: { event: RegistrationEvent }) {
  const [values, setValues] = useState<RegistrationFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<GeneratedPass | null>(null);
  const passCardRef = useRef<HTMLDivElement | null>(null);

  const sendAttendeeConfirmationEmail = async (payload: GeneratedPass) => {
    const apiBaseUrl = String(import.meta.env.VITE_EMAIL_API_BASE_URL || "").trim();
    const endpoint = apiBaseUrl
      ? `${apiBaseUrl.replace(/\/$/, "")}/api/send-attendee-email`
      : "/api/send-attendee-email";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attendeeEmail: payload.email,
        attendeeName: payload.fullName,
        eventName: payload.eventName,
        passNumber: payload.passNumber,
        issuedAt: payload.issuedAt,
        company: payload.company,
        designation: payload.designation,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
      const details = payload?.details || payload?.error || `HTTP ${response.status}`;
      throw new Error(details);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submittedValues = { ...values };

    if (!isFirebaseConfigured || !db) {
      toast.error("Firebase is not configured", {
        description: "Set VITE_FIREBASE_* variables in your .env file.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, event.registrationTable), {
        created_at: new Date().toISOString(),
        event_id: event.id,
        event_name: event.name,
        full_name: submittedValues.fullName,
        email: submittedValues.email,
        phone: submittedValues.phone,
        company: submittedValues.company,
        designation: submittedValues.designation,
        country: submittedValues.country,
        attendee_type: "Visitor",
        interests: submittedValues.interests,
        consent: submittedValues.consent,
      });
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Could not save registration",
      });
      setIsSubmitting(false);
      return;
    }

    const attendeePass: GeneratedPass = {
      passNumber: `PASS-${Date.now().toString().slice(-8)}`,
      issuedAt: new Date().toISOString(),
      eventId: event.id,
      eventName: event.name,
      fullName: submittedValues.fullName,
      email: submittedValues.email,
      phone: submittedValues.phone,
      company: submittedValues.company,
      designation: submittedValues.designation,
      country: submittedValues.country,
      attendeeType: "Visitor",
      interests: submittedValues.interests,
      consent: submittedValues.consent,
    };

    setGeneratedPass(attendeePass);

    try {
      await sendAttendeeConfirmationEmail(attendeePass);
      toast.success(`Registration confirmed for ${event.name}`, {
        description: `A confirmation email was sent to ${submittedValues.email}.`,
      });
    } catch (error) {
      toast.success(`Registration received for ${event.name}`, {
        description: `Pass created successfully. Email could not be sent: ${error instanceof Error ? error.message : "unknown error"}.`,
      });
    }

    setValues(initialValues);
    setIsSubmitting(false);
  };

  const qrPayload = generatedPass
    ? JSON.stringify(
        {
          pass_number: generatedPass.passNumber,
          issued_at: generatedPass.issuedAt,
          event_id: generatedPass.eventId,
          event_name: generatedPass.eventName,
          full_name: generatedPass.fullName,
          email: generatedPass.email,
          phone: generatedPass.phone,
          company: generatedPass.company,
          designation: generatedPass.designation,
          country: generatedPass.country,
          attendee_type: generatedPass.attendeeType,
          interests: generatedPass.interests,
          consent: generatedPass.consent,
        },
        null,
        0,
      )
    : "";

  const passTheme = passThemeMap[event.id] ?? passThemeMap["bioenergy-global-2026"];

  const handleDownloadPass = async () => {
    if (!passCardRef.current || !generatedPass) {
      return;
    }

    try {
      const canvas = await html2canvas(passCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${generatedPass.eventId}-${generatedPass.passNumber}.png`;
      link.click();
    } catch {
      toast.error("Could not download pass", {
        description: "Please try again.",
      });
    }
  };

  return (
    <>
      <article className="w-full rounded-[1.15rem] border border-border/70 bg-card/80 p-4 shadow-card backdrop-blur-sm md:p-5">
        <div className="mb-4">
          <p className="chip text-[0.7rem] tracking-[0.16em]">Attendee registration</p>
          <h3 className="mt-3 font-display text-xl leading-tight md:text-2xl">{event.name}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{event.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${event.id}-fullName`}>Full name<RequiredStar /></Label>
              <Input
                id={`${event.id}-fullName`}
                required
                value={values.fullName}
                onChange={(evt) => setValues((prev) => ({ ...prev, fullName: evt.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${event.id}-email`}>Email address<RequiredStar /></Label>
              <Input
                id={`${event.id}-email`}
                type="email"
                required
                value={values.email}
                onChange={(evt) => setValues((prev) => ({ ...prev, email: evt.target.value }))}
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${event.id}-phone`}>Phone number<RequiredStar /></Label>
              <Input
                id={`${event.id}-phone`}
                required
                value={values.phone}
                onChange={(evt) => setValues((prev) => ({ ...prev, phone: evt.target.value }))}
                placeholder="+91 00000 00000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${event.id}-country`}>Country<RequiredStar /></Label>
              <Input
                id={`${event.id}-country`}
                required
                value={values.country}
                onChange={(evt) => setValues((prev) => ({ ...prev, country: evt.target.value }))}
                placeholder="India"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${event.id}-company`}>Company / organization<RequiredStar /></Label>
              <Input
                id={`${event.id}-company`}
                required
                value={values.company}
                onChange={(evt) => setValues((prev) => ({ ...prev, company: evt.target.value }))}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${event.id}-designation`}>Designation<RequiredStar /></Label>
              <Input
                id={`${event.id}-designation`}
                required
                value={values.designation}
                onChange={(evt) => setValues((prev) => ({ ...prev, designation: evt.target.value }))}
                placeholder="Manager / Director / Founder"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${event.id}-attendeeType`}>Attendee type<RequiredStar /></Label>
              <input
                id={`${event.id}-attendeeType`}
                className="flex h-9 w-full cursor-not-allowed rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground/70"
                value="Visitor"
                required
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${event.id}-interests`}>Areas of interest<RequiredStar /></Label>
            <Textarea
              id={`${event.id}-interests`}
              className="min-h-[72px]"
              value={values.interests}
              onChange={(evt) => setValues((prev) => ({ ...prev, interests: evt.target.value }))}
              placeholder="Tell us what sessions, technologies, or business topics you want to explore."
              required
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/70 p-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border"
              checked={values.consent}
              onChange={(evt) => setValues((prev) => ({ ...prev, consent: evt.target.checked }))}
              required
            />
            I agree to be contacted regarding attendance and event updates for this expo.
            <RequiredStar />
          </label>

          <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : `Register for ${event.name}`}
          </Button>
        </form>
      </article>

      <Dialog open={Boolean(generatedPass)} onOpenChange={(open) => !open && setGeneratedPass(null)}>
        <DialogContent className="max-w-[42rem] border-0 bg-[#f5f0d8] p-0 text-[#243123] shadow-2xl sm:rounded-[1.5rem]">
          <DialogHeader className="relative px-6 pb-3 pt-6 sm:px-8 sm:pt-7">
            <DialogTitle className="font-display text-[1.6rem] leading-tight text-[#243123] sm:text-[1.9rem]">
              Your Entry Pass is Ready
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-[34rem] text-sm text-[#4e5a45]">
              Show this pass at the venue. The QR code includes your submitted attendee details.
            </DialogDescription>
          </DialogHeader>

          {generatedPass && (
            <div className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
              <div
                ref={passCardRef}
                className={`relative overflow-hidden rounded-[2rem] p-5 shadow-[0_18px_45px_rgba(31,47,35,0.24)] ${passTheme.card}`}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/20 blur-3xl" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="max-w-[70%]">
                    <p className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${passTheme.badge}`}>
                      Event {event.n} Visitor Pass
                    </p>
                    <h4 className="mt-3 font-display text-[1.7rem] leading-[1.05] sm:text-[1.95rem]">{generatedPass.eventName}</h4>
                    <p className="mt-1 text-xs font-medium text-white/85">Pass No: {generatedPass.passNumber}</p>
                  </div>
                  <div className="rounded-sm bg-white px-3 py-2 shadow-sm">
                    <img src={event.logo} alt={generatedPass.eventName} className="h-8 w-auto object-contain" loading="lazy" />
                  </div>
                </div>

                <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.78rem] leading-snug sm:text-[0.9rem]">
                    <div className="col-span-2"><span className="text-white/80">Name:</span> {generatedPass.fullName}</div>
                    <div className="col-span-2"><span className="text-white/80">Email:</span> {generatedPass.email}</div>
                    <div><span className="text-white/80">Phone:</span> {generatedPass.phone}</div>
                    <div><span className="text-white/80">Country:</span> {generatedPass.country}</div>
                    <div><span className="text-white/80">Company:</span> {generatedPass.company}</div>
                    <div><span className="text-white/80">Type:</span> {generatedPass.attendeeType}</div>
                    <div className="col-span-2"><span className="text-white/80">Designation:</span> {generatedPass.designation}</div>
                    <div className="col-span-2"><span className="text-white/80">Interests:</span> {generatedPass.interests}</div>
                  </dl>

                  <div className="mx-auto rounded-[1.35rem] bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)] sm:mx-0">
                    <QRCodeSVG value={qrPayload} size={150} includeMargin />
                  </div>
                </div>

                <p className="relative z-10 mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
                  Issued {new Date(generatedPass.issuedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="button" className="gap-2 rounded-full bg-[#3d8f1e] px-5 hover:bg-[#2f7614]" onClick={handleDownloadPass}>
                  <Download className="h-4 w-4" />
                  Download Pass
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
