import bio from "@/assets/event-bioenergy.jpg";
import ren from "@/assets/event-reneweex.jpg";
import wte from "@/assets/event-waste.jpg";
import sum from "@/assets/event-summit.jpg";
import logoBioDark from "@/assets/logo-bioenergy.png";
import logoRen from "@/assets/logo-reneweex.png";
import logoWte from "@/assets/logo-wte.png";
import logoNcbiLight from "@/assets/logo-ncbi-white.png";

export type EventInfo = {
  id: string;
  registrationTable: string;
  n: string;
  name: string;
  tag: string;
  subtitle: string;
  focus: string[];
  img: string;
  logo: string;
  tone: string;
  audience?: string;
  overview?: string;
  highlights?: string[];
  whatYouGet?: string[];
};

export const eventCatalog: EventInfo[] = [
  {
    id: "bioenergy-global-2026",
    registrationTable: "registrations_bioenergy_global_2026",
    n: "01",
    name: "Bioenergy Global 2026",
    tag: "Bringing global leaders together for a sustainable future.",
    subtitle: "Biomass, biofuels and policy innovation",
    focus: ["Biofuels", "Biomass", "Policy"],
    img: bio,
    logo: logoBioDark,
    tone: "bg-card text-foreground",
    audience:
      "Researchers, project developers, policy makers, equipment suppliers and investors interested in biomass and biofuels.",
    overview:
      "Bioenergy Global brings together stakeholders across the bioenergy value chain to discuss biomass supply, conversion technologies, biofuels markets and policy frameworks driving sustainable deployment.",
    highlights: [
      "Technical sessions on advanced biofuels",
      "Policy workshops and market outlooks",
      "Exhibition of conversion technologies and feedstock solutions",
    ],
    whatYouGet: ["Access to sessions & recordings", "Networking with global buyers", "Exhibitor floor pass"],
  },
  {
    id: "reneweex-global-2026",
    registrationTable: "registrations_reneweex_global_2026",
    n: "02",
    name: "Reneweex Global 2026",
    tag: "Empowering growth, sustaining the planet.",
    subtitle: "Solar, wind and green hydrogen ecosystem",
    focus: ["Solar", "Wind", "Green H2"],
    img: ren,
    logo: logoRen,
    tone: "bg-primary text-primary-foreground",
    audience:
      "Project developers, EPC contractors, utilities, component manufacturers and investors focused on renewable electricity and green hydrogen.",
    overview:
      "Reneweex Global showcases utility-scale renewables, storage, and green hydrogen solutions — with case studies, procurement forums and technology deep-dives.",
    highlights: ["Project finance panel", "Tech demos for storage & H2", "Country pavilions"],
    whatYouGet: ["Business matchmaking", "Policy & procurement sessions", "Access to RFPs and tenders"],
  },
  {
    id: "waste-to-energy-expo",
    registrationTable: "registrations_waste_to_energy_expo",
    n: "03",
    name: "Waste to Energy Expo",
    tag: "India's first specialised WTE exhibition.",
    subtitle: "MSW, biogas and conversion technologies",
    focus: ["Biogas", "MSW", "Gasification"],
    img: wte,
    logo: logoWte,
    tone: "bg-card text-foreground",
    audience:
      "Municipal authorities, technology vendors, waste managers and investors seeking scalable WtE solutions.",
    overview:
      "Waste to Energy Expo presents market-ready WtE technologies alongside policy sessions to accelerate municipal deployment and financing models.",
    highlights: ["Municipal procurement clinics", "Technology showcases", "Case studies from urban India"],
    whatYouGet: ["Site visits & technical briefings", "Supplier directory", "Project funding guidance"],
  },
  {
    id: "bioenergy-global-summit",
    registrationTable: "registrations_bioenergy_global_summit",
    n: "04",
    name: "Bioenergy Global Summit",
    tag: "Net-Zero & energy security - high-level forum.",
    subtitle: "Leadership forum on net-zero and energy security",
    focus: ["Net-Zero", "Diplomacy", "Capital"],
    img: sum,
    logo: logoNcbiLight,
    tone: "bg-ink text-ink-foreground",
    audience:
      "Ministers, C-suite executives, development finance institutions and institutional investors focused on energy security and large-scale decarbonisation.",
    overview:
      "An invitation-only forum convening policy leaders and capital providers to discuss pathways for net-zero and energy security through strategic investments and cooperation.",
    highlights: ["Ministerial roundtables", "Investor panels", "Strategic partnership announcements"],
    whatYouGet: ["Exclusive networking", "High-level policy briefings", "Priority meeting slots"],
  },
];
