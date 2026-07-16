import logo from "@/assets/logo-bioenergy-white.png";
import meera from "@/assets/logo-meera-white.png";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="bg-ink text-ink-foreground relative">
    <div className="container-x py-16">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <img src={logo} alt="BioEnergy Global" className="h-12 w-auto" />
          <p className="mt-5 max-w-sm text-sm opacity-70">
            Organised by Meera Trade Fair Media Pvt. Ltd. — C-323, Tower C, Noida One, Sector 62, Noida, UP-201309.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.22em] opacity-50">Organised by</span>
            <img src={meera} alt="Meera Trade Fair Media" className="h-8 w-auto opacity-90" />
          </div>
        </div>
        <div className="grid gap-10 md:col-span-7 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-50">Participate</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/exhibitor/register" className="underline-offset-4 hover:underline">
                  Exhibitor Registration
                </Link>
              </li>
              <li>
                <Link to="/delegate/register" className="underline-offset-4 hover:underline">
                  Delegate Registration
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-50">Portal</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="underline-offset-4 hover:underline">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="underline-offset-4 hover:underline">
                  Download Center
                </Link>
              </li>
              <li>
                <Link to="/exhibitor/login" className="underline-offset-4 hover:underline">
                  Exhibitor Login
                </Link>
              </li>
              <li>
                <Link to="/exhibitor/pass-generator" className="underline-offset-4 hover:underline">
                  Exhibitor Pass Generator
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="underline-offset-4 hover:underline">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-50">Contact</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="mailto:info@meeratradefair.com" className="underline-offset-4 hover:underline">
                  info@meeratradefair.com
                </a>
              </li>
              <li>
                <a href="tel:+919142659818" className="underline-offset-4 hover:underline">
                  +91 9142 659 818
                </a>
              </li>
              <li>
                <a href="tel:+917011807613" className="underline-offset-4 hover:underline">
                  +91 7011 807 613
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/919142659818"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-semibold transition"
                >
                  <svg viewBox="0 0 32 32" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M16.04 3.2c-7.1 0-12.86 5.72-12.86 12.79 0 2.25.6 4.45 1.74 6.37L3.2 28.8l6.63-1.7a12.9 12.9 0 0 0 6.21 1.59h.01c7.1 0 12.86-5.72 12.86-12.79 0-3.4-1.33-6.6-3.74-9.01a12.83 12.83 0 0 0-9.13-3.69zm7.51 18.57c-.31.87-1.5 1.66-2.4 1.85-.62.12-1.41.21-4.58-.99-4.05-1.58-6.66-5.69-6.86-5.96-.19-.27-1.64-2.17-1.64-4.14 0-1.97 1.03-2.94 1.4-3.34.36-.4.79-.5 1.05-.5h.77c.25 0 .59-.1.92.7.31.75 1.06 2.6 1.16 2.79.1.19.17.43.03.7-.14.27-.22.43-.43.66-.22.24-.46.54-.66.72-.22.2-.45.41-.19.8.26.4 1.15 1.89 2.46 3.05 1.7 1.51 3.14 1.98 3.54 2.2.4.2.63.17.86-.1.23-.27.99-1.16 1.25-1.55.26-.4.53-.33.89-.2.36.13 2.3 1.09 2.69 1.29.4.2.66.3.76.46.1.17.1.97-.21 1.84z"
                    />
                  </svg>
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-foreground/10 pt-6 text-xs opacity-60 md:flex-row md:items-center">
        <span>© 2026 Meera Trade Fair Media Pvt. Ltd. All rights reserved.</span>
        <span>Privacy · Terms · Code of conduct</span>
      </div>
    </div>
  </footer>
);
