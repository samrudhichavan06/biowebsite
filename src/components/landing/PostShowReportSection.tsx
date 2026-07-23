export const PostShowReportSection = () => {
  return (
    <section id="postshow-report" className="border-y border-foreground/10 bg-card/30 py-10 md:py-12">
      <div className="container-x">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <span className="chip">Our Partners</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Powering the future <em className="text-accent not-italic">together.</em>
            </h2>
          </div>
          <p className="max-w-md text-foreground/60 text-sm md:text-base leading-relaxed lg:text-right">
            Our partners, supporters and knowledge organisations who made the event possible.
          </p>
        </div>

        <div className="space-y-4">
          {/* Desktop: Big image */}
          <div className="hidden lg:block">
            <img
              src="/all logo images.png"
              alt="All Partners by Category"
              className="w-full h-auto object-contain rounded-xl"
              loading="lazy"
            />
          </div>

          {/* Mobile/Tablet: Image */}
          <div className="lg:hidden">
            <img
              src="/partner_logos_grid.webp"
              alt="Partners by Category"
              className="w-full h-auto object-contain rounded-xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
