import { Sprout, Globe2, Factory, Zap } from "lucide-react";

const pillars = [
  { i: Sprout, t: "Bioenergy & biofuels", d: "From feedstock to fuel — biomass, biogas, ethanol and SAF." },
  { i: Zap, t: "Renewable power", d: "Solar, wind, storage and the green hydrogen economy." },
  { i: Factory, t: "Waste-to-energy", d: "Circular MSW, gasification and industrial decarbonisation." },
  { i: Globe2, t: "Policy & finance", d: "Net-Zero strategies, climate capital and global cooperation." },
];

export const About = () => (
  <section id="about" className="bg-secondary py-20 md:py-28">
    <div className="container-x grid gap-14 md:grid-cols-12">
      <div className="md:col-span-5">
        <span className="chip">About the expo</span>
        <h2 className="display mt-5 text-5xl md:text-6xl">
          Where India meets the <em>world</em> on clean energy.
        </h2>
        <p className="mt-6 max-w-md text-foreground/70">
          Hosted by Meera Trade Fair Media, BioEnergy India Expo 2026 is the country's most ambitious gathering on the energy transition — three days of exhibition, summit and dialogue at IICC Yashobhoomi, New Delhi.
        </p>
        <div className="mt-8 flex gap-3">
          <a href="/exhibitor/register" className="rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground">Become an exhibitor</a>
          <a href="#" className="rounded-full border border-foreground/15 px-5 py-3 text-sm">Download brochure</a>
        </div>
      </div>

      <div className="md:col-span-7">
        <div className="grid gap-px overflow-hidden rounded-2xl bg-foreground/10 sm:grid-cols-2">
          {pillars.map(({ i: Icon, t, d }) => (
            <div key={t} className="bg-background p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-xl">{t}</h3>
              <p className="mt-2 text-sm text-foreground/65">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
