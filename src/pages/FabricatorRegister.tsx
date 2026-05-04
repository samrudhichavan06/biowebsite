import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, Fabricator } from "@/lib/collections";
import { setAuthUser, type AuthUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { generateAndSendBadge } from "@/lib/badgeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Hammer } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Checkbox } from "@/components/ui/checkbox";

export default function FabricatorRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const passStorageKey = "bioenergy_latest_pass";

  const specializations = [
    "Welding",
    "Sheet Metal Fabrication",
    "CNC Machining",
    "Assembly",
    "Coating & Painting",
    "Quality Testing",
    "Design & CAD",
    "Equipment Supply",
  ];

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    specialization: [] as string[],
    yearsInBusiness: "",
    certifications: "",
    guidelinesAccepted: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec],
    }));
  };

  const handleCheckboxChange = () => {
    setFormData(prev => ({ ...prev, guidelinesAccepted: !prev.guidelinesAccepted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.companyName || !formData.contactName || !formData.email) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (formData.specialization.length === 0) {
        toast({
          title: "Select Specialization",
          description: "Please select at least one specialization",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.guidelinesAccepted) {
        toast({
          title: "Guidelines Not Accepted",
          description: "Please accept the fabrication guidelines",
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

      // Create fabricator record
      const fabricatorData: Fabricator = {
        id: "",
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone || "",
        specialization: formData.specialization,
        designSubmissionStatus: "pending",
        guidelinesAccepted: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.FABRICATORS), fabricatorData);
      const fabricatorId = docRef.id;

      // Create auth session
      const authUser: AuthUser = {
        id: fabricatorId,
        email: formData.email,
        name: formData.contactName,
        role: "fabricator",
        companyName: formData.companyName,
        phone: formData.phone,
        timestamp: Date.now(),
      };

      setAuthUser(authUser);

      // Generate and send badge for fabricator so gatekeepers can scan on-site
      try {
        await generateAndSendBadge({
          userId: fabricatorId,
          userRole: "exhibitor",
          userEmail: formData.email,
          userName: formData.contactName,
        });
      } catch (err) {
        console.error("Badge send failed for fabricator", err);
      }

      const passPayload = {
        passNumber: `FAB-${Date.now().toString(36).toUpperCase()}`,
        issuedAt: new Date().toISOString(),
        eventName: "BioEnergy Global 2026",
        attendeeType: "Fabricator",
        fullName: formData.contactName,
        email: formData.email,
        phone: formData.phone || "",
        company: formData.companyName || "",
        designation: "",
        country: "",
        interests: "",
      };

      try {
        sessionStorage.setItem(passStorageKey, JSON.stringify(passPayload));
      } catch {
        // ignore
      }

      toast({
        title: "Registration Successful!",
        description: "Your vendor account is created and your badge will be emailed shortly.",
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
          <CardHeader className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-t-2xl pb-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-accent-foreground/20 rounded-lg">
                <Hammer size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Fabricator Registration</CardTitle>
                <CardDescription className="text-accent-foreground/80">
                  Join our manufacturing network
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-semibold">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your Manufacturing Company"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName" className="text-sm font-semibold">
                        Contact Person *
                      </Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="yearsInBusiness" className="text-sm font-semibold">
                        Years in Business
                      </Label>
                      <Input
                        id="yearsInBusiness"
                        name="yearsInBusiness"
                        value={formData.yearsInBusiness}
                        onChange={handleInputChange}
                        placeholder="e.g., 5"
                        className="mt-1"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Contact Details</h3>
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
                      placeholder="company@example.com"
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

              {/* Specializations */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Specializations *</h3>
                <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {specializations.map(spec => (
                    <div key={spec} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={spec}
                        checked={formData.specialization.includes(spec)}
                        onChange={() => handleSpecializationToggle(spec)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor={spec} className="text-sm cursor-pointer">
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <Label htmlFor="certifications" className="text-sm font-semibold">
                  ISO/Quality Certifications
                </Label>
                <textarea
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  placeholder="List any relevant certifications (ISO 9001, etc.)"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                  rows={2}
                />
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-blue-900">Fabrication Guidelines Overview</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Design submissions must follow technical specifications</li>
                  <li>• Quality standards: ISO 9001 compliance required for approval</li>
                  <li>• Lead time: Minimum 4 weeks for fabrication</li>
                  <li>• All designs subject to technical review by our panel</li>
                  <li>• Documentation: Complete drawings and material specs required</li>
                </ul>
              </div>

              {/* Accept Guidelines */}
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="guidelinesAccepted"
                  checked={formData.guidelinesAccepted}
                  onChange={handleCheckboxChange}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="guidelinesAccepted" className="text-sm text-gray-700">
                  I acknowledge and accept the fabrication guidelines and quality standards
                </label>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3 flex gap-2">
                <AlertCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">
                  After registration, you'll access your vendor portal to submit designs, track approvals, and manage projects
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white"
                disabled={loading}
              >
                {loading ? "Processing..." : "Register as Fabricator/Vendor"}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              <a href="/dashboard" className="text-slate-600 hover:underline">Back to Home</a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
