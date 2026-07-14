import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { SpeakerCard } from "@/components/landing/SpeakerCard";
import { speakers } from "@/data/speakers";
import { Sparkles } from "lucide-react";

export default function Speakers() {
  const verifiedSpeakers = speakers.filter((s) => s.verified);
  const unverifiedSpeakers = speakers.filter((s) => !s.verified);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Ambient Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 grid-lines opacity-60" />
          <div className="blob absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
          <div className="blob absolute right-[-120px] top-[260px] h-[380px] w-[380px] rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="container-x pt-16 pb-12">
          {/* Meta Bar */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              <Sparkles className="inline h-3 w-3 mr-1" /> Thought Leaders
            </span>
            <span className="rounded-full border border-foreground/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-foreground/70">
              120+ Global Speakers
            </span>
          </div>

          {/* Header */}
          <div className="max-w-3xl">
            <h1 className="display text-[13vw] leading-[0.9] sm:text-[10vw] lg:text-[7.2rem]">
              Meet our <em>inspiring</em> speakers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground/70">
              Convening industry pioneers, policymakers, researchers, and innovators
              from across the globe to drive transformation in bioenergy, renewables,
              waste-to-energy, and net-zero solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Speakers Grid */}
      <section className="container-x pb-20">
        {/* Verified Speakers */}
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
              <h2 className="font-display text-3xl sm:text-4xl">Our Featured Speakers</h2>
            </div>
            <p className="mt-2 text-sm text-foreground/60">
              {verifiedSpeakers.length} confirmed speakers from leading organizations worldwide
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {verifiedSpeakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        </div>

        {/* Unverified Speakers Warning */}
        {unverifiedSpeakers.length > 0 && (
          <div className="mt-16 pt-12 border-t border-foreground/10">
            <div className="rounded-2xl border border-amber-200/50 bg-amber-50/30 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Pending Verification
                </span>
              </div>
              <p className="text-sm text-amber-900/80">
                The following speaker information is pending verification and should not be published until confirmed:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {unverifiedSpeakers.map((speaker) => (
                  <div key={speaker.id} className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                    <p className="font-semibold text-amber-900">{speaker.name}</p>
                    <p className="mt-1 text-sm text-amber-800/70">{speaker.designation}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-20 w-16 overflow-hidden rounded-lg bg-slate-200">
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <a
                        href={speaker.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-600 hover:text-amber-700 underline"
                      >
                        View full image →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container-x pb-16">
        <div className="rounded-3xl border border-foreground/10 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-12 text-center">
          <h2 className="font-display text-3xl">Interested in speaking?</h2>
          <p className="mt-3 text-foreground/70">
            We're always seeking thought leaders to share insights on the energy transition.
          </p>
          <a
            href="https://wa.me/919142659818?text=Hello%20Bioenergy%20Expo%202026%20Speaker%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5"
          >
            Get in Touch
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
