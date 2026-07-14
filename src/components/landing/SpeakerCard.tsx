import { Speaker } from "@/data/speakers";
import { AlertCircle } from "lucide-react";

type SpeakerCardProps = {
  speaker: Speaker;
};

export const SpeakerCard = ({ speaker }: SpeakerCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative h-[350px] w-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
        <img
          src={speaker.image}
          alt={speaker.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Unverified Badge */}
        {!speaker.verified && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Unverified</span>
          </div>
        )}

        {/* Speaker Info Overlay - Bottom */}
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 text-white">
          <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight">
            {speaker.name}
          </h3>
          <p className="line-clamp-3 text-sm text-white/90 leading-snug">
            {speaker.designation}
          </p>
        </div>
      </div>
    </div>
  );
};
