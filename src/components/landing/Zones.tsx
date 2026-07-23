import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, Hammer, Zap } from "lucide-react";

export function Zones() {
  const zones = [
    {
      title: "Exhibitor Zone",
      description: "Stall booking, payment tracking, booth guidelines, and material uploads",
      icon: Users,
      color: "from-accent to-accent/80",
      bgLight: "bg-accent/10",
      textColor: "text-accent",
      link: "/exhibitor/register",
      features: [
        "Stall allocation view",
        "Payment tracking",
        "Upload materials",
        "Exhibitor manual",
      ],
    },
    
    {
      title: "Delegate / Conference Zone",
      description: "Conference registration, speaker details, agenda, and VIP passes",
      icon: Crown,
      color: "from-primary/70 to-primary/50",
      bgLight: "bg-primary/5",
      textColor: "text-primary",
      link: "/delegate/register",
      features: [
        "Conference badge",
        "Agenda access",
        "Speaker directory",
        "Certificate generation",
      ],
    },
  ];

  return (
    <section className="px-4 py-16 bg-secondary/30 lg:py-18">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-3xl">
            <span className="chip">Registration Zones</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Choose Your <em className="text-accent not-italic">Path</em>
            </h2>
          </div>
          <p className="max-w-md text-foreground/60 text-sm md:text-base leading-relaxed lg:text-right">
            Select the registration zone that matches your role and unlock tailored features, resources, and networking opportunities designed for your success.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {zones.map((zone, idx) => {
            const Icon = zone.icon;
            return (
              <Card key={idx} className="group overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div className={`h-1 bg-gradient-to-r ${zone.color}`} />
                <CardHeader className="pb-2 pt-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className={`rounded-xl bg-gradient-to-br p-2.5 text-primary-foreground ${zone.color}`}>
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-display text-foreground">{zone.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-foreground/70">{zone.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div>
                    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">Key Features</p>
                    <ul className="space-y-1.5">
                      {zone.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center gap-2 text-xs text-foreground/75 sm:text-sm">
                          <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${zone.color}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to={zone.link} className="block">
                    <Button className={`h-9 w-full bg-gradient-to-r text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg ${zone.color}`}>
                      Register Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-20 bg-card rounded-2xl p-10 border border-border shadow-soft">
          <h3 className="text-3xl font-display font-bold mb-8 text-center text-foreground">Maximize Your Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary" size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-foreground mb-2 text-lg">Flexible Participation</h4>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Register across multiple zones to explore different opportunities and roles suited to your interests
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary" size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-foreground mb-2 text-lg">Networking Hub</h4>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Connect with exhibitors, delegates, fabricators, and fellow visitors across all zones
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-accent" size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-foreground mb-2 text-lg">Premium Access</h4>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Get exclusive resources, priority support, and premium tools tailored to each zone
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
