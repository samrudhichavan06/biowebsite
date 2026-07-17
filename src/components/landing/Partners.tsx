import meera from "@/assets/logo-meera.png";
import ncbi from "@/assets/logo-ncbi.png";
import reneweex from "@/assets/logo-reneweex.png";
import wte from "@/assets/logo-wte.png";
import bioenergy from "@/assets/logo-bioenergy.png";

const partners: { name: string; logo?: string }[] = [
  { name: "Meera Trade Fair Media", logo: meera },
  { name: "BioEnergy Global", logo: bioenergy },
  { name: "Reneweex Global", logo: reneweex },
  { name: "Waste to Energy", logo: wte },
  { name: "NCBI", logo: ncbi },
  { name: "Durham University" },
  { name: "Samarth (Ministry of Power)", logo: "/partners/samarth.jpg" },
];

export const Partners = () => (
  <section id="partners" className="border-y border-foreground/10 bg-background py-14">
    <div className="container-x">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="chip">In partnership with</span>
        <span className="text-xs uppercase tracking-[0.2em] text-foreground/50">
          Organisers · Knowledge & association partners
        </span>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-foreground/10 sm:grid-cols-3 lg:grid-cols-6">
        {partners.map((p) => (
          <div key={p.name} className="grid h-28 place-items-center bg-background p-5 text-center">
            {p.logo ? (
              <img src={p.logo} alt={p.name} className="max-h-14 w-auto object-contain" loading="lazy" />
            ) : (
              <span className="font-display text-lg">{p.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);
