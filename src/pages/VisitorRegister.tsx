import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, Visitor } from "@/lib/collections";
import { setAuthUser, type AuthUser } from "@/lib/auth";
import { generateAndSendBadge } from "@/lib/badgeService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Zap } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function VisitorRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const passStorageKey = "bioenergy_latest_pass";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create registration code
      const registrationCode = `VIS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create visitor record
      const visitorData: Visitor = {
        id: "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        company: formData.company || "",
        designation: formData.designation || "",
        registrationCode,
        qrCode: "",
        badge: { generated: false },
        eventId: "bioenergy-2026",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.VISITORS), visitorData);
      const visitorId = docRef.id;

      // Create auth session
      const authUser: AuthUser = {
        id: visitorId,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: "visitor",
        phone: formData.phone,
        timestamp: Date.now(),
      };

      setAuthUser(authUser);

      // Generate and send badge
      await generateAndSendBadge({
        userId: visitorId,
        userRole: "visitor",
        userEmail: formData.email,
        userName: `${formData.firstName} ${formData.lastName}`,
        registrationCode,
      });

      const passPayload = {
        passNumber: registrationCode,
        issuedAt: new Date().toISOString(),
        eventName: "BioEnergy Global 2026",
        attendeeType: "Visitor",
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || "",
        company: formData.company || "",
        designation: formData.designation || "",
        country: "",
        interests: "",
      };

      try {
        sessionStorage.setItem(passStorageKey, JSON.stringify(passPayload));
      } catch {
        // ignore
      }

      toast({
        title: "Registration Complete!",
        description: "Your badge has been sent to your email. Welcome to Bioenergy Expo 2026!",
      });

      setTimeout(() => navigate("/registration/success"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border shadow-card bg-card">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-2xl pb-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary-foreground/20 rounded-lg">
                <Zap size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Visitor Registration</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Get your badge instantly
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First"
                    className="mt-1 border-border"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91-XXXX-XXXX-XXXX"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-sm font-semibold">
                  Company/Organization
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your Company"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="designation" className="text-sm font-semibold">
                  Designation/Role
                </Label>
                <Input
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Your Role"
                  className="mt-1"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                <AlertCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-primary/80 leading-relaxed">
                  Your badge will be sent to your email immediately after registration. Check your inbox within 2 minutes.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:shadow-lg transition-all mt-6"
                disabled={loading}
              >
                {loading ? "Processing..." : "Get My Badge Now"}
              </Button>
            </form>

            <p className="text-xs text-center text-foreground/60 mt-5">
              <a href="/dashboard" className="text-primary hover:text-primary/80 transition-colors">Back to Home</a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
