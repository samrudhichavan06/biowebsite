import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, Delegate } from "@/lib/collections";
import { setAuthUser, type AuthUser } from "@/lib/auth";
import { generateAndSendBadge } from "@/lib/badgeService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Crown } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function DelegateRegister() {
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
    passType: "standard" as "standard" | "vip" | "speaker",
    isSpeaker: false,
    speakerTopic: "",
    speakerBio: "",
    agreeTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "passType") {
      setFormData(prev => ({ ...prev, passType: value as "standard" | "vip" | "speaker" }));
    }
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof formData],
    }));
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

      if (!formData.agreeTerms) {
        toast({
          title: "Terms Not Accepted",
          description: "Please accept the terms and conditions",
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

      // Create delegate record (omit speakerDetails unless speaker)
      const delegateData: any = {
        id: "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        company: formData.company || "",
        designation: formData.designation || "",
        passType: formData.passType,
        agendaDownloaded: false,
        certificateGenerated: false,
        eventId: "bioenergy-2026",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (formData.passType === 'speaker') {
        delegateData.speakerDetails = {
          topic: formData.speakerTopic || "",
          bio: formData.speakerBio || "",
          sessionTime: "",
        };
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.DELEGATES), delegateData);
      const delegateId = docRef.id;

      // Create auth session
      const authUser: AuthUser = {
        id: delegateId,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: "delegate",
        phone: formData.phone,
        timestamp: Date.now(),
      };

      setAuthUser(authUser);

      // Generate and send badge
      await generateAndSendBadge({
        userId: delegateId,
        userRole: "delegate",
        userEmail: formData.email,
        userName: `${formData.firstName} ${formData.lastName}`,
      });

      const passPayload = {
        passNumber: `DEL-${Date.now().toString(36).toUpperCase()}`,
        issuedAt: new Date().toISOString(),
        eventName: "BioEnergy Global 2026",
        attendeeType: "Delegate",
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
        title: "Delegate Registration Successful!",
        description: "Your conference badge has been sent to your email. Get ready for an amazing event!",
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
        <Card className="w-full max-w-2xl border-border shadow-card bg-card">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-2xl pb-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary-foreground/20 rounded-lg">
                <Crown size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Delegate Registration</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Join our premium conference experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-semibold">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-semibold">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Pass Type */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Pass Type</h3>
                <Select value={formData.passType} onValueChange={(value) => handleSelectChange("passType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Pass - Access to all sessions</SelectItem>
                    <SelectItem value="vip">VIP Pass - Priority access + networking dinner</SelectItem>
                    <SelectItem value="speaker">Speaker Pass - Present and participate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speaker Information */}
              {formData.passType === "speaker" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div>
                    <Label htmlFor="speakerTopic" className="text-sm font-semibold">
                      Speaking Topic
                    </Label>
                    <Input
                      id="speakerTopic"
                      name="speakerTopic"
                      value={formData.speakerTopic}
                      onChange={handleInputChange}
                      placeholder="Your presentation topic"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerBio" className="text-sm font-semibold">
                      Bio / About You
                    </Label>
                    <textarea
                      id="speakerBio"
                      name="speakerBio"
                      value={formData.speakerBio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself and your expertise"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={() => handleCheckboxChange("agreeTerms")}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  I agree to the conference terms and conditions, and I'll receive email updates about the event
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-2">
                <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Your conference badge and agenda will be sent to your email immediately
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                disabled={loading}
              >
                {loading ? "Processing..." : "Complete Conference Registration"}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              <a href="/dashboard" className="text-amber-600 hover:underline">Back to Home</a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
