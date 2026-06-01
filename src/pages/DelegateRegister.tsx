import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { generateAndSendBadge } from "@/lib/badgeService";
import { db } from "@/lib/firebase";
import { collection as fbCollection, addDoc } from "firebase/firestore";

type DelegateRow = {
  fullName: string;
  designation: string;
};

type PackageId = "global-summit" | "ncbi" | "both-days" | "onsite-both-days";

const PACKAGE_OPTIONS: Array<{
  id: PackageId;
  title: string;
  subtitle: string;
  inrPerPerson: number;
  usdPerPerson: number;
}> = [
  {
    id: "global-summit",
    title: "2nd Global Summit",
    subtitle: "29–30 July 2026 · Yashobhoomi, IICC",
    inrPerPerson: 5000,
    usdPerPerson: 200,
  },
  {
    id: "ncbi",
    title: "5th NCBI",
    subtitle: "29–30 July 2026 · Yashobhoomi, IICC",
    inrPerPerson: 5000,
    usdPerPerson: 200,
  },
  {
    id: "both-days",
    title: "Both Days Access",
    subtitle: "Combined access to both events",
    inrPerPerson: 9000,
    usdPerPerson: 300,
  },
  {
    id: "onsite-both-days",
    title: "Onsite Both Days",
    subtitle: "Full onsite delegate access",
    inrPerPerson: 12000,
    usdPerPerson: 400,
  },
];

const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID || "YOUR_RAZORPAY_KEY_ID";
const GST_RATE = 0.18;
const TEST_MODE = true; // Toggle to force test price
const TEST_PRICE_RUPEES = 1;

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as typeof window & { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function DelegateRegister() {
  const [delegate, setDelegate] = useState<DelegateRow>({ fullName: "", designation: "" });
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageId>("global-summit");
  const [loading, setLoading] = useState(false);

  const selectedPackageData = useMemo(
    () => PACKAGE_OPTIONS.find((option) => option.id === selectedPackage) ?? PACKAGE_OPTIONS[0],
    [selectedPackage],
  );

  const delegateCount = 1;

  const subtotal = selectedPackageData.inrPerPerson * delegateCount;
  const gstAmount = Math.round(subtotal * GST_RATE);
  let grandTotal = subtotal + gstAmount;

  if (TEST_MODE) {
    grandTotal = TEST_PRICE_RUPEES;
  }

  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  const updateDelegate = (field: keyof DelegateRow, value: string) => {
    setDelegate((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!companyName.trim() || !mobileNumber.trim() || !emailAddress.trim()) {
        alert("Please fill in company name, mobile number, and email address.");
        return;
      }

      const validDelegate = delegate.fullName.trim() && delegate.designation.trim() ? delegate : null;
      if (!validDelegate) {
        alert("Please fill at least one delegate with name and designation.");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailAddress.trim())) {
        alert("Please enter a valid email address.");
        return;
      }

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady) {
        alert("Razorpay checkout could not be loaded. Please try again.");
        return;
      }

      const notes = {
        company: companyName.trim(),
        gst_number: gstNumber.trim(),
        address: address.trim(),
        mobile: mobileNumber.trim(),
        email: emailAddress.trim(),
        receipt: `rcpt_${Date.now()}`,
        package_id: selectedPackageData.id,
        package_title: selectedPackageData.title,
        delegates: JSON.stringify([validDelegate]),
        delegate_count: "1",
        subtotal_inr: String(subtotal),
        gst_inr: String(gstAmount),
        total_inr: String(grandTotal),
      };
      // Create an order server-side to use an authoritative amount
      try {
        const createResp = await fetch(`/api/razorpay/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: TEST_MODE ? TEST_PRICE_RUPEES * 100 : grandTotal * 100, currency: "INR", receipt: notes.receipt, notes }),
        });

        const createJson = await createResp.json();

        let order = createJson?.order;

        // If server-side order creation failed, fall back to client-side checkout
        // by passing amount and currency directly (useful for local testing).
        // Razorpay allows initializing checkout with `amount` and `key`.
        const fallback = !createResp.ok || !createJson?.ok || !order?.id;

        if (fallback) {
          console.warn("create-order failed, using client-side fallback checkout", createJson);
        }

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: fallback ? (TEST_MODE ? TEST_PRICE_RUPEES * 100 : Math.round(grandTotal * 100)) : order.amount,
          currency: fallback ? "INR" : order.currency || "INR",
          ...(fallback ? {} : { order_id: order.id }),
          name: "BioEnergy Global 2026",
          description: `${selectedPackageData.title} Delegate Registration`,
          prefill: {
            name: delegate.fullName.trim(),
            email: emailAddress.trim(),
            contact: mobileNumber.trim(),
          },
          notes,
          theme: {
            color: "#1D9E75",
          },
          handler: async (response: { razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
            try {
              const paymentId = response.razorpay_payment_id ?? "";

              // Prepare pass and redirect immediately; run badge generation in background
              try {
                const registrationCode = `RCPT-${Date.now()}`;
                const passObj = {
                  eventId: "bioenergy-global-2026",
                  passNumber: registrationCode,
                  issuedAt: new Date().toISOString(),
                  eventName: "BioEnergy Global 2026",
                  attendeeType: "Delegate",
                  fullName: delegate.fullName.trim(),
                  email: emailAddress.trim(),
                  phone: mobileNumber.trim(),
                  company: companyName.trim(),
                  designation: delegate.designation.trim(),
                  country: "",
                  interests: "",
                };

                sessionStorage.setItem("bioenergy_latest_pass", JSON.stringify(passObj));
                try {
                  localStorage.setItem("bioenergy_latest_pass", JSON.stringify(passObj));
                } catch (e) {
                  console.error("Failed to save pass locally:", e);
                }

                // Background task: generate badge + persist locally and via API
                (async () => {
                  try {
                    const badgeRes = await generateAndSendBadge({
                      userId: paymentId || `temp_${Date.now()}`,
                      userRole: "delegate",
                      userEmail: emailAddress.trim(),
                      userName: delegate.fullName.trim(),
                    });

                    const saved = {
                      paymentId,
                      orderId: response.razorpay_order_id,
                      badge: badgeRes,
                      createdAt: new Date().toISOString(),
                    };

                    try {
                      const existing = JSON.parse(localStorage.getItem("my_badges_v1") || "[]");
                      existing.push(saved);
                      localStorage.setItem("my_badges_v1", JSON.stringify(existing));
                    } catch (e) {
                      console.error("Failed to save badge locally:", e);
                    }

                    // Persist the delegate registration through the server first, then fall back to Firestore if needed.
                    try {
                      const recordResp = await fetch("/api/razorpay/record-delegate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fullName: delegate.fullName.trim(),
                          email: emailAddress.trim(),
                          phone: mobileNumber.trim(),
                          company: companyName.trim(),
                          designation: delegate.designation.trim(),
                          attendeeType: "Delegate",
                          eventId: "bioenergy-global-2026",
                          eventName: "Bioenergy Global 2026",
                          packageId: selectedPackageData.id,
                          packageTitle: selectedPackageData.title,
                          paymentId,
                          orderId: response.razorpay_order_id,
                          receipt: notes?.receipt || `rcpt_${Date.now()}`,
                          registrationCode,
                          country: "",
                          interests: "",
                        }),
                      });

                      if (!recordResp.ok && db) {
                        const timestamp = new Date().toISOString();
                        const recordData = {
                          created_at: timestamp,
                          event_name: "Bioenergy Global 2026",
                          full_name: delegate.fullName.trim(),
                          email: emailAddress.trim(),
                          phone: mobileNumber.trim(),
                          company: companyName.trim(),
                          designation: delegate.designation.trim(),
                          country: "",
                          attendee_type: "Delegate",
                          interests: "",
                          paymentId,
                          orderId: response.razorpay_order_id,
                          registrationCode,
                        };

                        await Promise.all([
                          addDoc(fbCollection(db, "registrations_bioenergy_global_2026"), recordData),
                          addDoc(fbCollection(db, "delegates"), {
                            id: paymentId || response.razorpay_order_id || registrationCode,
                            firstName: delegate.fullName.trim().split(/\s+/)[0] || delegate.fullName.trim(),
                            lastName: delegate.fullName.trim().split(/\s+/).slice(1).join(" "),
                            email: emailAddress.trim(),
                            phone: mobileNumber.trim(),
                            company: companyName.trim(),
                            designation: delegate.designation.trim(),
                            passType: "vip",
                            agendaDownloaded: false,
                            certificateGenerated: false,
                            eventId: "bioenergy-global-2026",
                            createdAt: timestamp,
                            updatedAt: timestamp,
                            paymentId,
                            orderId: response.razorpay_order_id,
                            attendeeType: "Delegate",
                            fullName: delegate.fullName.trim(),
                          }),
                        ]);
                      }
                    } catch (e) {
                      console.error("Failed to persist delegate registration:", e);
                    }
                  } catch (err) {
                    console.error("Background badge generation failed:", err);
                  }
                })();

                // Redirect user to the pass page right away (route defined at /registration/success)
                window.location.href = "/registration/success";
                return;
              } catch (e) {
                console.error("Failed to prepare redirect pass:", e);
              }
            } catch (e) {
              console.error(e);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const RazorpayCheckout = (window as typeof window & {
          Razorpay?: new (options: typeof options) => { open: () => void };
        }).Razorpay;

        if (!RazorpayCheckout) {
          alert("Razorpay is not available right now.");
          return;
        }

        const checkout = new RazorpayCheckout(options);
        checkout.open();
      } catch (err) {
        console.error(err);
        alert("Payment initialization failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-[2rem] border border-emerald-200 bg-white/75 p-6 shadow-[0_20px_50px_rgba(18,74,57,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Delegate Registration
                </div>
                <h1 className="mt-4 text-3xl font-display font-semibold text-foreground sm:text-4xl">BioEnergy Global 2026</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  29–30 July 2026 · Yashobhoomi, IICC, Dwarka Sec-25, New Delhi. Complete your delegate registration and pay securely with Razorpay.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                <div className="font-semibold">Secure payment</div>
                <div>18% GST auto-calculated</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Delegate Details</CardTitle>
                  <p className="text-sm text-muted-foreground">Fill details for one delegate only.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Delegate 1</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="delegate-name">Full Name</Label>
                        <Input
                          id="delegate-name"
                          value={delegate.fullName}
                          onChange={(event) => updateDelegate("fullName", event.target.value)}
                          placeholder="Enter full name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="delegate-designation">Designation</Label>
                        <Input
                          id="delegate-designation"
                          value={delegate.designation}
                          onChange={(event) => updateDelegate("designation", event.target.value)}
                          placeholder="Enter designation"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="company-name">Company / Organisation Name</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Company / Organisation"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst-number">GST Number</Label>
                    <Input
                      id="gst-number"
                      value={gstNumber}
                      onChange={(event) => setGstNumber(event.target.value)}
                      placeholder="GSTIN"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile-number">Mobile Number</Label>
                    <Input
                      id="mobile-number"
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      placeholder="Mobile number"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Company address"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      value={emailAddress}
                      onChange={(event) => setEmailAddress(event.target.value)}
                      placeholder="Email address"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Package Selection</CardTitle>
                  <p className="text-sm text-muted-foreground">Choose one package for the selected delegates.</p>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedPackage} onValueChange={(value) => setSelectedPackage(value as PackageId)} className="grid gap-4 md:grid-cols-2">
                    {PACKAGE_OPTIONS.map((option) => {
                      const active = selectedPackage === option.id;

                      return (
                        <Label
                          key={option.id}
                          htmlFor={option.id}
                          className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                            active
                              ? "border-emerald-500 bg-emerald-50 shadow-[0_14px_30px_rgba(29,158,117,0.12)]"
                              : "border-border bg-background hover:border-emerald-300 hover:bg-emerald-50/60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-foreground">{option.title}</div>
                                  <div className="mt-1 text-xs text-muted-foreground">{option.subtitle}</div>
                                </div>
                                <div className="text-right text-sm font-semibold text-emerald-700">
                                  ₹{option.inrPerPerson.toLocaleString()}/person
                                  <div className="text-xs font-medium text-muted-foreground">${option.usdPerPerson}/person</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-6 border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Selected package</div>
                    <div className="mt-1 font-semibold text-foreground">{selectedPackageData.title}</div>
                    <div className="text-sm text-muted-foreground">{selectedPackageData.subtitle}</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delegates</span>
                      <span className="font-semibold">{delegateCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">18% GST</span>
                      <span className="font-semibold">₹{gstAmount.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-foreground">Grand total</span>
                      <span className="font-bold text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Amount sent to Razorpay will be <span className="font-semibold">{grandTotal * 100} paise</span>.
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={loading}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening Razorpay...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Pay with Razorpay
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    18% GST included · Receipt sent to your email · Secured by Razorpay
                  </p>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
