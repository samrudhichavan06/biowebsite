import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { eventCatalog } from "@/lib/events";

export const Events = () => (
  <section id="events" className="container-x pt-6 md:py-24">
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <span className="chip">Four events · One venue</span>
        <h2 className="display mt-5 text-5xl md:text-7xl">
          One ticket. <em>Four worlds</em><br />of clean energy.
        </h2>
      </div>
      <p className="max-w-sm text-foreground/70">
        Curated tracks designed for industry, government and academia — moving from research to deployment under one roof.
      </p>
    </div>

    <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
      {eventCatalog.map((e) => {
        const isDark = e.tone?.includes("bg-ink") || e.tone?.includes("bg-primary") || e.tone?.includes("bg-accent") || e.tone?.includes("bg-secondary");
        const primaryBtnClass = isDark
          ? "h-9 rounded-full px-4 text-sm bg-white/95 text-foreground shadow-sm"
          : "h-9 rounded-full px-4 text-sm bg-accent text-accent-foreground";
        const outlineBtnClass = isDark
          ? "h-9 rounded-full px-4 text-sm bg-transparent border border-white/20 text-white"
          : "h-9 rounded-full px-4 text-sm border border-border bg-background text-foreground";

        return (
        <article
          key={e.n}
          className={`group relative flex w-full flex-col overflow-hidden rounded-[1.4rem] ${e.tone} shadow-card transition-transform hover:-translate-y-1`}
        >
          <Link to={`/events/${e.id}`} aria-label={`Open event page for ${e.name}`}>
            <div className="relative h-44 overflow-hidden md:h-52 lg:h-40 xl:h-44">
              <img
                src={e.img}
                alt={e.name}
                loading="lazy"
                width={1024}
                height={1280}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
                {e.n} / 04
              </div>
              <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
          <div className="flex flex-1 flex-col gap-3 p-4 md:p-5 lg:p-4 xl:p-5">
            <img src={e.logo} alt={e.name} className="h-8 w-auto self-start object-contain" loading="lazy" />
            <h3 className="font-display text-2xl leading-tight xl:text-[1.6rem]">{e.name}</h3>
            <p className="text-xs leading-relaxed opacity-80 xl:text-sm">{e.tag}</p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {e.focus.map((f) => (
                <span key={f} className="rounded-full border border-current/20 px-2.5 py-0.5 text-[0.62rem] uppercase tracking-wider opacity-80">
                  {f}
                </span>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <Button asChild className={primaryBtnClass}>
                <Link to={`/events/${e.id}`}>View details</Link>
              </Button>
              <Button asChild variant="outline" className={outlineBtnClass}>
                <Link to={`/register/${e.id}`}>Register</Link>
              </Button>
            </div>
          </div>
        </article>
        );
      })}
    </div>
  </section>
);
