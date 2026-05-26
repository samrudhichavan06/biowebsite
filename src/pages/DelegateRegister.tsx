import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const PASSES = [
  {
    id: "global-summit",
    title: "2nd Global Summit",
    price: "₹5,900/person",
    url: "https://rzp.io/rzp/FjF6R5cE",
    description:
      "Register as a delegate for the 2nd Global Summit on Bioenergy, held on 29–30 July 2026 at Yashobhoomi, IICC, Dwarka Sec-25, New Delhi. Full access to summit sessions, presentations, and networking.",
  },
  {
    id: "ncbi",
    title: "5th NCBI",
    price: "₹5,900/person",
    url: "https://rzp.io/rzp/2ypOQgUm",
    description:
      "Register as a delegate for the 5th National Conference on Bioenergy (NCBI), held on 29–30 July 2026 at Yashobhoomi, IICC, Dwarka Sec-25, New Delhi. Full conference sessions and networking.",
  },
  {
    id: "both-days",
    title: "Both Days Access",
    price: "₹11,800/person",
    url: "https://rzp.io/rzp/fo9IwHp0",
    description:
      "Combined access to both the 2nd Global Summit and 5th NCBI on 29–30 July 2026. Full entry to all sessions, panels, and networking events across both days.",
  },
];

export default function DelegateRegister() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />

      <main className="flex-1 px-6 py-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-semibold mb-3">Delegate Registration</h1>
        <p className="text-muted-foreground mb-8">Choose a pass to proceed to secure payment. 18% GST applicable. For queries contact: info@meeratradefair.com</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PASSES.map((p) => (
            <Card key={p.id} className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{p.title}</span>
                  <span className="text-sm font-medium text-foreground">{p.price}</span>
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-muted-foreground">{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">18% GST applicable</div>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="flex items-center gap-2">
                    Buy Now <ExternalLink size={14} />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-8">If you need a manual invoice or group booking, please contact <a href="mailto:info@meeratradefair.com" className="text-amber-600">info@meeratradefair.com</a>.</p>
      </main>

      <Footer />
    </div>
  );
}
