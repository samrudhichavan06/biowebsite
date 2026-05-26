import { Link } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

export default function DelegateSuccess() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-display font-semibold mb-4">Payment Successful</h1>
          <p className="text-muted-foreground mb-6">Thank you for your purchase. Your delegate pass has been received.</p>

          <div className="rounded-lg border p-6 bg-white/80 shadow-sm">
            <p className="mb-4">You will receive a confirmation email with your pass and QR code shortly. Please save that email or visit the Downloads page to retrieve your pass.</p>
            <p className="text-sm text-muted-foreground mb-6">If you don't receive the email within a few minutes, contact <a href="mailto:info@meeratradefair.com" className="text-amber-600">info@meeratradefair.com</a>.</p>

            <div className="flex justify-center gap-3">
              <Link to="/downloads">
                <Button variant="outline">Go to Downloads</Button>
              </Link>
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
