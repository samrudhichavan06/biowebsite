import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Events } from "@/components/landing/Events";
import { About } from "@/components/landing/About";
import { Venue } from "@/components/landing/Venue";
// Partners section removed from homepage — content consolidated in PostShowReportSection
import { CTA } from "@/components/landing/CTA";
import { Zones } from "@/components/landing/Zones";
import { PostShowReportSection } from "@/components/landing/PostShowReportSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Nav />
    <Hero />
    <Events />
    <Zones />
    <About />
    <PostShowReportSection />
    <Venue />
    <CTA />
    <Footer />
  </main>
);

export default Index;
