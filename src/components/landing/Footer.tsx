import logo from "@/assets/logo-bioenergy-white.png";
import meera from "@/assets/logo-meera-white.png";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export const Footer = () => (
  <footer className="bg-ink text-ink-foreground relative">
    {/* WhatsApp Float Button */}
    <a
      href="https://wa.me/919142659818?text=Hello%20Bioenergy%20Expo%202026"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={24} />
    </a>

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
                <Link to="/visitor/register" className="underline-offset-4 hover:underline">
                  Visitor Registration
                </Link>
              </li>
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
              <li>
                <Link to="/fabricator/register" className="underline-offset-4 hover:underline">
                  Vendor/Fabricator
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
                  <MessageCircle size={14} />
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
