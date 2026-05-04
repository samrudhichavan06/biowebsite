import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, Hammer, Zap } from "lucide-react";

export function Zones() {
  const zones = [
    {
      title: "Visitor Zone",
      description: "Quick registration, badge download, event schedule, and exhibitor list",
      icon: Users,
      color: "from-primary to-primary/80",
      bgLight: "bg-primary/10",
      textColor: "text-primary",
      link: "/visitor/register",
      features: [
        "Fast registration",
        "QR badge download",
        "Event brochure",
        "Exhibitor directory",
      ],
    },
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
    {
      title: "Fabricator / Vendor Zone",
      description: "Design submission, approval system, guidelines, and drawings upload",
      icon: Hammer,
      color: "from-accent/70 to-accent/50",
      bgLight: "bg-accent/5",
      textColor: "text-accent",
      link: "/fabricator/register",
      features: [
        "Design submission",
        "Approval tracking",
        "Guidelines access",
        "Drawings portal",
      ],
    },
  ];

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold font-display text-foreground mb-4">Choose Your Path</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Select the registration zone that matches your role and unlock tailored features, resources, and networking opportunities designed for your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {zones.map((zone, idx) => {
            const Icon = zone.icon;
            return (
              <Card key={idx} className="group hover:shadow-card transition-all duration-300 overflow-hidden border-border bg-card">
                <div className={`h-1 bg-gradient-to-r ${zone.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${zone.color} rounded-xl text-primary-foreground`}>
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-display text-foreground">{zone.title}</CardTitle>
                  <CardDescription className="text-base text-foreground/70">{zone.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground/60 mb-3 uppercase tracking-wide">Key Features</p>
                    <ul className="space-y-2">
                      {zone.features.map((feature, fidx) => (
                        <li key={fidx} className="text-sm text-foreground/75 flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${zone.color}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to={zone.link} className="block">
                    <Button className={`w-full bg-gradient-to-r ${zone.color} text-primary-foreground font-semibold hover:shadow-lg transition-all`}>
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
