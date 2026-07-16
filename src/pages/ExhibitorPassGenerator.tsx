import { FormEvent, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminCredentials,
  isExhibitorPassGeneratorAuthenticated,
  setExhibitorPassGeneratorAuthenticated,
  verifyAdminCredentials,
} from "@/lib/adminAuth";
import { eventCatalog } from "@/lib/events";
import meeraLogo from "@/assets/logo-meera-white.png";
import bioenergyLogo from "@/assets/logo-bioenergy-white.png";

type MemberInput = {
  fullName: string;
  designation: string;
};

type GeneratedPass = MemberInput & {
  passNumber: string;
  qrPayload: string;
};

const emptyMember: MemberInput = {
  fullName: "",
  designation: "",
};

const ExhibitorPassGenerator = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isExhibitorPassGeneratorAuthenticated());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");
  const [eventId, setEventId] = useState(eventCatalog[0]?.id || "");
  const [members, setMembers] = useState<MemberInput[]>([{ ...emptyMember }]);
  const [generatedPasses, setGeneratedPasses] = useState<GeneratedPass[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const passListRef = useRef<HTMLDivElement | null>(null);

  const selectedEvent = useMemo(
    () => eventCatalog.find((event) => event.id === eventId) ?? eventCatalog[0],
    [eventId],
  );

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = verifyAdminCredentials(username.trim(), password);
    if (!valid) {
      toast.error("Invalid login", { description: "Username or password is incorrect." });
      return;
    }

    setExhibitorPassGeneratorAuthenticated();
    setIsLoggedIn(true);
    toast.success("Access granted", { description: "You may now generate exhibitor passes." });
    setUsername("");
    setPassword("");
  };

  const handleAddMember = () => {
    setMembers((current) => [...current, { ...emptyMember }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((current) => current.filter((_, idx) => idx !== index));
  };

  const handleMemberChange = (index: number, field: keyof MemberInput, value: string) => {
    setMembers((current) =>
      current.map((member, idx) => (idx === index ? { ...member, [field]: value } : member)),
    );
  };

  const handleGeneratePasses = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company name is required.");
      return;
    }

    const validMembers = members.filter((member) => member.fullName.trim());
    if (validMembers.length === 0) {
      toast.error("Add at least one member with a name.");
      return;
    }

    setIsGenerating(true);
    const generated = validMembers.map((member, index) => {
      const passNumber = `EXH-${Date.now().toString().slice(-6)}-${index + 1}`;
      const qrPayload = JSON.stringify({
        pass_number: passNumber,
        company_name: companyName.trim(),
        full_name: member.fullName.trim(),
        designation: member.designation.trim(),
        event_id: selectedEvent?.id,
        event_name: selectedEvent?.name,
      });

      return {
        ...member,
        passNumber,
        qrPayload,
      };
    });

    setGeneratedPasses(generated);
    setIsGenerating(false);
    toast.success("Passes generated", {
      description: `${generated.length} exhibitor pass${generated.length === 1 ? "" : "es"} created.`,
    });
  };

  const handleDownloadAll = async () => {
    if (!passListRef.current || generatedPasses.length === 0) {
      return;
    }

    const cards = passListRef.current.querySelectorAll<HTMLDivElement>(".exhibitor-pass-card");
    if (cards.length === 0) {
      toast.error("No pass cards found to download.");
      return;
    }

    try {
      for (let index = 0; index < cards.length; index += 1) {
        const canvas = await html2canvas(cards[index], {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.68));
        if (!blob) {
          throw new Error("Could not create pass image.");
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedEvent?.id || "exhibitor"}-${generatedPasses[index].passNumber}.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      toast.success("Downloaded all passes");
    } catch (error) {
      toast.error("Download failed", { description: String(error) });
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="container-x flex min-h-screen items-center justify-center py-10">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/90 p-8 shadow-card backdrop-blur-xl">
            <p className="chip text-[0.68rem] tracking-[0.16em]">Pass generator access</p>
            <h1 className="mt-4 font-display text-4xl">Exhibitor Pass Generator</h1>
            <p className="mt-2 text-sm text-muted-foreground">Login to generate exhibitor passes for your team.</p>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="passgen-username">Username</Label>
                <Input
                  id="passgen-username"
                  value={username}
                  onChange={(evt) => setUsername(evt.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passgen-password">Password</Label>
                <Input
                  id="passgen-password"
                  type="password"
                  value={password}
                  onChange={(evt) => setPassword(evt.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <Button className="w-full" type="submit">
                Login
              </Button>
            </form>

            <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate("/admin/login")}>Go to admin page</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container-x py-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="chip text-[0.68rem] tracking-[0.16em]">Exhibitor pass generator</p>
            <h1 className="mt-3 font-display text-4xl">Create exhibitor passes</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Add your company name, choose the event and submit one or more team members. Each pass includes the Meera and global logo, the event logo, exhibitor details and a QR code.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownloadAll} disabled={generatedPasses.length === 0 || isGenerating}>
              Download all passes
            </Button>
            <Button variant="secondary" onClick={() => setGeneratedPasses([])} disabled={generatedPasses.length === 0}>
              Clear passes
            </Button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 shadow-card">
            <form className="space-y-6" onSubmit={handleGeneratePasses}>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(evt) => setCompanyName(evt.target.value)}
                  placeholder="Enter exhibitor company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-select">Select event</Label>
                <select
                  id="event-select"
                  value={eventId}
                  onChange={(evt) => setEventId(evt.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {eventCatalog.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">Team members</p>
                  <Button type="button" size="sm" onClick={handleAddMember}>
                    Add member
                  </Button>
                </div>

                <div className="mt-4 space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">Member {index + 1}</p>
                        {members.length > 1 ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveMember(index)}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`member-name-${index}`}>Member name</Label>
                          <Input
                            id={`member-name-${index}`}
                            value={member.fullName}
                            onChange={(evt) => handleMemberChange(index, "fullName", evt.target.value)}
                            placeholder="Full name"
                            required={index === 0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`member-designation-${index}`}>Designation</Label>
                          <Input
                            id={`member-designation-${index}`}
                            value={member.designation}
                            onChange={(evt) => handleMemberChange(index, "designation", evt.target.value)}
                            placeholder="Designation"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(evt) => setNotes(evt.target.value)}
                  placeholder="Optional internal notes, booth number, team details..."
                  className="min-h-[5rem]"
                />
              </div>

              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Generating passes..." : "Generate passes"}
              </Button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-card">
              <div>
                <p className="text-sm font-semibold">Selected event</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedEvent?.name}</p>
              </div>
              <img src={selectedEvent?.logo} alt={selectedEvent?.name} className="h-12 w-auto object-contain" loading="lazy" />
            </div>

            <div ref={passListRef} className="space-y-6">
              {generatedPasses.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-card/70 p-6 text-center text-sm text-muted-foreground">
                  Generated passes will appear here.
                </div>
              ) : (
                generatedPasses.map((pass) => (
                  <div key={pass.passNumber} className="exhibitor-pass-card overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-lg">
                    <div className="bg-slate-950 px-6 py-5 text-white">
                      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex items-center gap-4">
                          <img src={bioenergyLogo} alt="BioEnergy Global" className="h-10 w-auto" />
                          <img src={meeraLogo} alt="Meera Trade Fair Media" className="h-10 w-auto" />
                        </div>
                        <img src={selectedEvent?.logo} alt={selectedEvent?.name} className="h-12 w-auto object-contain" />
                      </div>
                      <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-300 sm:grid-cols-2">
                        <div>{selectedEvent?.subtitle}</div>
                        <div className="text-right">Exhibitor pass</div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Company</p>
                          <p className="mt-1 text-xl font-semibold text-slate-900">{companyName}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-right text-xs uppercase tracking-[0.18em] text-slate-500">
                          {pass.passNumber}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-500">Name</p>
                          <p className="mt-1 font-semibold text-slate-900">{pass.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Designation</p>
                          <p className="mt-1 font-semibold text-slate-900">{pass.designation || "-"}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center sm:flex-row sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">QR code</p>
                          <p className="mt-1 text-sm text-slate-700">Scan for exhibitor details</p>
                        </div>
                        <div className="rounded-3xl bg-white p-3 shadow-sm">
                          <QRCodeSVG value={pass.qrPayload} size={120} includeMargin />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default ExhibitorPassGenerator;
