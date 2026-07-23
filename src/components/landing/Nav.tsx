import logo from "@/assets/logo-bioenergy.png";
import { Link } from "react-router-dom";

const links = [
  { label: "Events", href: "#events" },
  { label: "About", href: "#about" },
  { label: "Speakers", href: "#speakers" },
  { label: "Venue", href: "#venue" },
  { label: "Partners", href: "#partners" },
];

export const Nav = () => (
  <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/70 backdrop-blur-xl">
    <div className="container-x flex h-16 items-center justify-between">
      <div className="flex items-center gap-4">
        <a href="#" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight" aria-label="BioEnergy Global Expo">
          <img src={logo} alt="BioEnergy Global" className="h-9 w-auto" />
        </a>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-xs uppercase tracking-[0.2em] text-foreground/70">Supported by</span>
          <img
            src="/partners/WhatsApp_Image_2026-06-04_at_1.22.59_PM-removebg-preview.png"
            alt="Ministry of Environment, Forest and Climate Change"
            className="h-10 w-auto max-w-[120px] object-contain"
          />
        </div>
      </div>
      <nav className="hidden items-center gap-8 md:flex">
        {links.map((l) => 
          l.href.startsWith("/") ? (
            <Link key={l.href} to={l.href} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ) : (
            <a key={l.href} href={l.href} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              {l.label}
            </a>
          )
        )}
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/exhibitor/register" className="hidden rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium hover:bg-foreground/5 sm:inline-block">
          Exhibit
        </Link>
        <a href="#events" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5">
          Register →
        </a>
      </div>
    </div>
  </header>
);
