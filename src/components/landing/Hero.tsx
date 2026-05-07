import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-bioenergy.jpg";
import bio from "@/assets/event-bioenergy.jpg";
import ren from "@/assets/event-reneweex.jpg";
import wte from "@/assets/event-waste.jpg";
import sum from "@/assets/event-summit.jpg";
import logoBio from "@/assets/logo-bioenergy-white.png";
import logoRen from "@/assets/logo-reneweex.png";
import logoWte from "@/assets/logo-wte.png";
import logoNcbi from "@/assets/logo-ncbi-white.png";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  MapPin,
  CalendarDays,
  Sprout,
  Sun,
  Recycle,
  Globe2,
  Plus,
  Sparkles,
} from "lucide-react";

const heroEvents = [
  {
    id: "bioenergy-global-2026",
    n: "01",
    code: "BIO",
    name: "Bioenergy Global",
    tag: "Bringing global leaders together for a sustainable future",
    desc: "Biofuels, biomass, biogas, ethanol & advanced biorefinery technologies driving India's net-zero ambitions.",
    icon: Sprout,
    img: bio,
    logo: logoBio,
    stats: [["140+", "Exhibitors"], ["35+", "Countries"], ["60+", "Speakers"]],
    pills: ["Biofuels", "Biomass", "Ethanol", "Policy"],
    accent: "bg-primary text-primary-foreground",
    chip: "bg-primary/10 text-primary",
  },
  {
    id: "reneweex-global-2026",
    n: "02",
    code: "REN",
    name: "Reneweex Global",
    tag: "Empowering growth, sustaining the planet",
    desc: "Solar, wind, green hydrogen and storage innovations powering the next decade of renewable deployment.",
    icon: Sun,
    img: ren,
    logo: logoRen,
    stats: [["110+", "Exhibitors"], ["28+", "Countries"], ["45+", "Speakers"]],
    pills: ["Solar", "Wind", "Green H₂", "Storage"],
    accent: "bg-accent text-accent-foreground",
    chip: "bg-accent/15 text-accent",
  },
  {
    id: "waste-to-energy-expo",
    n: "03",
    code: "WTE",
    name: "Waste to Energy Expo",
    tag: "India's first specialised waste-to-energy exhibition",
    desc: "Biogas, MSW conversion, gasification, pyrolysis and circular economy solutions for urban India.",
    icon: Recycle,
    img: wte,
    logo: logoWte,
    stats: [["80+", "Exhibitors"], ["20+", "Countries"], ["30+", "Speakers"]],
    pills: ["Biogas", "MSW", "Gasification", "Circular"],
    accent: "bg-ink text-ink-foreground",
    chip: "bg-ink/10 text-ink",
  },
  {
    id: "bioenergy-global-summit",
    n: "04",
    code: "SUM",
    name: "Bioenergy Global Summit",
    tag: "Net-Zero & energy security — high-level forum",
    desc: "An invitation-only diplomatic forum convening ministers, CEOs and capital around the energy transition.",
    icon: Globe2,
    img: sum,
    logo: logoNcbi,
    stats: [["40+", "Ministers"], ["60+", "CEOs"], ["$2B+", "Capital"]],
    pills: ["Net-Zero", "Diplomacy", "Capital", "Strategy"],
    accent: "bg-secondary text-secondary-foreground",
    chip: "bg-secondary text-secondary-foreground",
  },
];

const tickerItems = [
  "Early-bird passes close 15 June 2026",
  "350+ exhibiting brands confirmed",
  "80+ country pavilions",
  "Hosted-buyer programme open",
  "Net-Zero Summit — invitation only",
  "Live demo zones & startup arena",
];

export const Hero = () => {
  const [active, setActive] = useState(0);
  const current = heroEvents[active];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const videos = Array.from(document.querySelectorAll("video[data-src]")) as HTMLVideoElement[];
    if (!videos.length) return;

    const onIntersection: IntersectionObserverCallback = (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const v = entry.target as HTMLVideoElement;
        const src = v.getAttribute("data-src");
        if (src && v.src !== src) {
          v.src = src;
          // start playback if muted/autoplay allowed
          v.play().catch(() => {});
        }
        obs.unobserve(v);
      });
    };

    const io = new IntersectionObserver(onIntersection, { root: null, threshold: 0.2 });
    videos.forEach((v) => io.observe(v));

    return () => io.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-lines opacity-60" />
        <div className="blob absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="blob absolute right-[-120px] top-[260px] h-[380px] w-[380px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Top meta bar */}
      <div className="container-x pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 pb-4 text-xs uppercase tracking-[0.22em] text-foreground/60">
          <div className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent">
              <Sparkles className="h-3 w-3" />
            </span>
            India edition · 4th year
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <span>29 – 31 July 2026</span>
            <span className="h-1 w-1 rounded-full bg-foreground/30" />
            <span>IICC Yashobhoomi · New Delhi</span>
            <span className="h-1 w-1 rounded-full bg-foreground/30" />
            <span className="flex items-center gap-2 text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Registrations open
            </span>
          </div>
        </div>
      </div>

      {/* Mobile video (above hero on small screens) */}
      <div className="container-x block md:hidden mt-6">
        <video
          data-src="/videos/Conference-Montage-Demo.mp4"
          poster={heroImg}
          className="w-full rounded-xl shadow-card object-cover"
          preload="none"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* Main hero grid */}
      <div className="container-x grid gap-10 pt-12 pb-10 lg:grid-cols-12 lg:gap-8 lg:pt-16">
        {/* LEFT — Headline + showcase */}
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-ink px-3 py-1 font-medium uppercase tracking-[0.18em] text-ink-foreground">
              4 expos
            </span>
            <span className="rounded-full border border-foreground/15 px-3 py-1 uppercase tracking-[0.18em] text-foreground/70">
              1 venue
            </span>
            <span className="rounded-full border border-foreground/15 px-3 py-1 uppercase tracking-[0.18em] text-foreground/70">
              3 days
            </span>
            <span className="rounded-full border border-foreground/15 px-3 py-1 uppercase tracking-[0.18em] text-foreground/70">
              80+ countries
            </span>
          </div>

          <h1 className="display mt-6 text-[13vw] leading-[0.9] sm:text-[10vw] lg:text-[7.2rem]">
            India's <em>greenest</em><br />
            gathering of<br />
            the decade.
          </h1>

          <p className="mt-6 max-w-xl text-base text-foreground/70 md:text-lg">
            Four landmark expos. One mission. Convening 12,000+ visitors,
            350+ exhibitors and 120+ global speakers around the future of
            bioenergy, renewables, waste-to-energy and net-zero policy.
          </p>

          {/* CTA cluster */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#events"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 text-sm font-medium text-ink-foreground shadow-card transition-transform hover:-translate-y-0.5"
            >
              Reserve your pass
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background/60 px-5 py-3 text-sm font-medium backdrop-blur transition hover:bg-foreground/5"
            >
              <Plus className="h-4 w-4" /> Become an exhibitor
            </a>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex -space-x-2">
                {[bio, ren, wte, sum].map((src, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 overflow-hidden rounded-full border-2 border-background"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
              <div className="text-xs leading-tight text-foreground/70">
                <div className="font-medium text-foreground">12,000+ delegates</div>
                <div>already registered</div>
              </div>
            </div>
          </div>

          {/* Showcase image with overlays */}
          <div className="relative mt-10 overflow-hidden rounded-[2rem] shadow-card">
            <img
              src={current.img}
              alt={current.name}
              className="h-[44vh] w-full object-cover transition-all duration-700 md:h-[52vh]"
              key={current.code}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

            {/* event badge */}
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <current.icon className="h-3.5 w-3.5 text-accent" />
              Now showing · {current.code}
            </div>

            {/* live floating card */}
            <div className="float-slow absolute right-5 top-5 hidden w-64 rounded-2xl border border-background/20 bg-background/90 p-4 backdrop-blur md:block">
              <div className="text-[11px] uppercase tracking-[0.2em] text-foreground/50">
                Early bird
              </div>
              <p className="mt-1 text-sm leading-snug">
                Save up to <strong>40%</strong> on delegate passes. Closes
                <strong> 15 June 2026</strong>.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-foreground/60">
                <span>From ₹4,999</span>
                <Link to={`/register/${current.id}`} className="font-medium text-accent">
                  Apply →
                </Link>
              </div>
            </div>

            {/* bottom info strip */}
            <div className="absolute inset-x-5 bottom-5 grid gap-3 rounded-2xl border border-background/20 bg-ink/70 p-4 text-ink-foreground backdrop-blur md:grid-cols-[1fr_auto] md:items-center md:gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={current.logo}
                  alt={current.name}
                  className="h-12 w-auto shrink-0 object-contain md:h-14"
                />
                <div>
                  <div className="font-display text-2xl md:text-3xl">
                    {current.name}
                  </div>
                  <div className="text-xs opacity-80 md:text-sm">{current.tag}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-accent" /> 29 – 31 July
                </span>
                <span className="hidden h-3 w-px bg-ink-foreground/30 md:inline-block" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-accent" /> Yashobhoomi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Vertical event stack */}
        <aside className="lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.22em] text-foreground/60">
              The four expos
            </div>
            <div className="text-xs text-foreground/50">
              0{active + 1} / 04
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {heroEvents.map((e, i) => {
              const isActive = i === active;
              const Icon = e.icon;
              return (
                <div
                  key={e.code}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onKeyDown={(evt) => {
                    if (evt.key === "Enter" || evt.key === " ") {
                      evt.preventDefault();
                      setActive(i);
                    }
                  }}
                  className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 ${
                    isActive
                      ? `${e.accent} border-transparent shadow-card`
                      : "border-foreground/10 bg-card hover:border-foreground/25"
                  } cursor-pointer`}
                >
                  <div className="flex items-stretch gap-4 p-4">
                    <div
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${
                        isActive ? "bg-background/15" : "bg-foreground/5"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
                          {e.n} · {e.code}
                        </span>
                        <ArrowUpRight
                          className={`h-4 w-4 transition-transform ${
                            isActive ? "rotate-45" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          }`}
                        />
                      </div>
                      <h3 className="mt-1 font-display text-xl leading-tight">
                        {e.name}
                      </h3>
                      <p className="mt-0.5 text-xs opacity-75 line-clamp-1">
                        {e.tag}
                      </p>
                    </div>
                  </div>

                  {/* expanded body */}
                  <div
                    className={`grid transition-all duration-500 ${
                      isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-4 px-4 pb-4">
                        <p className="text-sm leading-relaxed opacity-90">
                          {e.desc}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {e.stats.map(([n, l]) => (
                            <div
                              key={l}
                              className="rounded-xl bg-background/15 px-3 py-2 backdrop-blur"
                            >
                              <div className="font-display text-lg leading-none">{n}</div>
                              <div className="mt-1 text-[10px] uppercase tracking-wider opacity-75">
                                {l}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {e.pills.map((p) => (
                            <span
                              key={p}
                              className="rounded-full bg-background/15 px-2.5 py-1 text-[10px] uppercase tracking-wider"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={`/register/${e.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:opacity-90"
                        >
                          Register now
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule micro-card */}
          <div className="mt-5 rounded-2xl border border-foreground/10 bg-card p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground/60">
              <span>Schedule snapshot</span>
              <span className="text-accent">3 days</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["29 Jul", "Opening · Keynotes"],
                ["30 Jul", "Expo · Summit"],
                ["31 Jul", "Awards · B2B"],
              ].map(([d, t]) => (
                <div key={d} className="rounded-xl bg-background p-3">
                  <div className="font-display text-base">{d}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-foreground/60">
                    {t}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Desktop video (under hero on md+ screens) */}
      <div className="container-x hidden md:block mt-8">
        <video
          data-src="/videos/Conference-Montage-Demo.mp4"
          poster={heroImg}
          className="w-full rounded-xl shadow-card object-cover"
          preload="none"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      </div>

      {/* Stat strip */}
      <div className="container-x">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-foreground/10 md:grid-cols-4">
          {[
            ["12,000+", "Expected visitors", "from 80+ nations"],
            ["350+", "Exhibiting brands", "across 4 halls"],
            ["120+", "Speakers & panels", "industry · gov · academia"],
            ["50,000m²", "Exhibition space", "at IICC Yashobhoomi"],
          ].map(([n, l, s]) => (
            <div key={l} className="bg-background p-6">
              <div className="font-display text-3xl md:text-4xl">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground/60">
                {l}
              </div>
              <div className="mt-1 text-xs text-foreground/50">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live ticker */}
      <div className="mt-10 border-y border-foreground/10 bg-ink py-3 text-ink-foreground">
        <div className="flex overflow-hidden">
          <div className="ticker flex shrink-0 items-center gap-10 pr-10 text-sm uppercase tracking-[0.22em]">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="flex items-center gap-3">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {t}
                </span>
                <span className="h-1 w-1 rounded-full bg-ink-foreground/40" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
