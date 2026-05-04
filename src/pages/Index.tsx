import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Events } from "@/components/landing/Events";
import { About } from "@/components/landing/About";
import { Venue } from "@/components/landing/Venue";
import { Partners } from "@/components/landing/Partners";
import { CTA } from "@/components/landing/CTA";
import { Zones } from "@/components/landing/Zones";
import { Footer } from "@/components/landing/Footer";

const Index = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Nav />
    <Hero />
    <Zones />
    <Events />
    <About />
    <Venue />
    <Partners />
    <CTA />
    <Footer />
  </main>
);

export default Index;
