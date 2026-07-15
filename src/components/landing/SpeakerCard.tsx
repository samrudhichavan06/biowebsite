import { Speaker } from "@/data/speakers";
import { AlertCircle } from "lucide-react";

type SpeakerCardProps = {
  speaker: Speaker;
};

export const SpeakerCard = ({ speaker }: SpeakerCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-lg">
      <div className="overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-200 to-slate-300">
        <img
          src={speaker.image}
          alt={speaker.name}
          className="h-[350px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!speaker.verified && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Unverified</span>
          </div>
        )}
      </div>

      <div className="space-y-3 bg-background p-6 text-foreground">
        <h3 className="font-display text-xl font-semibold leading-tight text-foreground">
          {speaker.name}
        </h3>
        <p className="text-sm leading-relaxed text-foreground/75">
          {speaker.designation}
        </p>
        {speaker.company && (
          <p className="text-xs uppercase tracking-[0.16em] text-foreground/50">
            {speaker.company}
          </p>
        )}
      </div>
    </div>
  );
};
