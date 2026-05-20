import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDoc, collection, getDocs, limit, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { sha256Hash } from "@/lib/crypto";
import { clearExhibitorSession, setExhibitorSession } from "@/lib/exhibitorAuth";

const ExhibitorRegister = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boothName, setBoothName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Clear any existing exhibitor session to avoid reusing an old account
    try {
      clearExhibitorSession();
    } catch {}

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      toast.error("Firebase is not configured");
      setIsSubmitting(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const existingExhibitors = await getDocs(
        query(collection(db, "exhibitors"), where("email", "==", normalizedEmail), limit(1)),
      );

      if (!existingExhibitors.empty) {
        toast.error("Account already exists", {
          description: "An exhibitor account with this email is already registered.",
        });
        setIsSubmitting(false);
        return;
      }

      const passwordHash = await sha256Hash(password);

      const docRef = await addDoc(collection(db, "exhibitors"), {
        booth_name: boothName.trim(),
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        approval_status: "pending",
        created_at: new Date().toISOString(),
      });

      // Auto-login the newly created exhibitor (replace any previous session)
      try {
        setExhibitorSession({
          id: docRef.id,
          booth_name: boothName.trim(),
          company_name: companyName.trim(),
          contact_name: contactName.trim(),
          email: normalizedEmail,
        });
        toast.success("Exhibitor account created", {
          description: "Welcome — you are signed in to your exhibitor panel.",
        });
        navigate("/exhibitor/panel", { replace: true });
        return;
      } catch (err) {
        // fallback: clear session and navigate to login
        try {
          clearExhibitorSession();
        } catch {}
        toast.success("Exhibitor account created", {
          description: "Please login to access the QR scanning panel.",
        });
        navigate("/exhibitor/login", { replace: true });
      }
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Could not create exhibitor account",
      });
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container-x flex min-h-screen items-center justify-center py-8">
        <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-card/80 p-6 shadow-card md:p-8">
          <p className="chip text-[0.68rem] tracking-[0.16em]">Exhibitor onboarding</p>
          <h1 className="mt-4 font-display text-4xl">Exhibitor Registration</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register your booth account to scan attendee QR passes at the venue.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booth-name">Booth name</Label>
              <Input id="booth-name" required value={boothName} onChange={(evt) => setBoothName(evt.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input id="company-name" required value={companyName} onChange={(evt) => setCompanyName(evt.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contact-name">Contact person</Label>
              <Input id="contact-name" required value={contactName} onChange={(evt) => setContactName(evt.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
                placeholder="booth@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(evt) => setPassword(evt.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(evt) => setConfirmPassword(evt.target.value)}
              />
            </div>

            <Button type="submit" className="sm:col-span-2" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create exhibitor account"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already registered? {" "}
            <Link to="/exhibitor/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default ExhibitorRegister;
