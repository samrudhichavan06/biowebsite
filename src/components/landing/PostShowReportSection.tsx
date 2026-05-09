import slideText from "@/data/bio2025_slide_text.json";

type SlideEntry = { slide: string; text: string };

const cleanText = (value: string) =>
  value
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const getSlideText = (slideName: string) => {
  const item = (slideText as SlideEntry[]).find((entry) => entry.slide === slideName);
  return item ? cleanText(item.text) : "";
};

const partnerCategories = [
  { title: "Powered By", logos: ["image2.png"] },
  { title: "In Association With", logos: ["image23.jpg"] },
  { title: "Supported By", logos: ["image11.png"] },
  { title: "Global Event Partner", logos: ["image19.png"] },
  { title: "International Partner", logos: ["image13.png"] },
  { title: "Knowledge Partner", logos: ["image6.png"] },
  { title: "International Knowledge Partner", logos: ["image1.png"] },
  { title: "Industry Partners", logos: ["image28.png"] },
  { title: "Gift Partner", logos: ["image5.png"] },
  { title: "Hydration Partners", logos: ["image16.png"] },
  { title: "Media Partners", logos: ["image93.png", "image96.png", "image106.png"] },
];

const exhibitorsBoard = "image24.png";

const galleryImages = [
  "image35.png",
  "image36.png",
  "image38.jpg",
  "image39.jpg",
  "image40.jpg",
  "image41.jpg",
  "image42.jpg",
  "image43.jpg",
  "image44.jpg",
  "image45.jpg",
  "image46.jpg",
  "image47.jpg",
];

const highlightStats = [
  { label: "Visitors", value: "10,500+" },
  { label: "Exhibitors", value: "150+" },
  { label: "Speakers", value: "60+" },
  { label: "B2B Meetings", value: "2,500+" },
  { label: "Business Leads", value: "1,000+" },
  { label: "Successful Deals", value: "500+" },
];

export const PostShowReportSection = () => {
  return (
    <section id="postshow-report" className="border-y border-foreground/10 bg-card/30 py-10 md:py-12">
      <div className="container-x space-y-7 md:space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-4xl">
            <span className="chip">2025 Post Show Report</span>
            <h2 className="mt-3 font-display text-2xl md:text-3xl">Bio Energy Global 2025 Highlights</h2>
            <p className="mt-2 max-w-3xl text-sm text-foreground/70 md:text-[0.95rem]">
              {getSlideText("slide2.xml")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
          {highlightStats.map((item) => (
            <div key={item.label} className="rounded-xl border border-foreground/10 bg-background px-3 py-3 text-center md:px-3.5 md:py-3.5">
              <div className="font-display text-xl md:text-2xl">{item.value}</div>
              <div className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-foreground/60 md:text-[0.72rem]">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-3.5 lg:grid-cols-2">
          <div className="rounded-xl border border-foreground/10 bg-background p-4 md:p-4.5">
            <h3 className="font-display text-lg md:text-xl">Association & Government Support</h3>
            <p className="mt-2.5 text-sm text-foreground/70">{getSlideText("slide10.xml")}</p>
            <p className="mt-2.5 text-sm text-foreground/70">{getSlideText("slide12.xml")}</p>
          </div>
          <div className="rounded-xl border border-foreground/10 bg-background p-4 md:p-4.5">
            <h3 className="font-display text-lg md:text-xl">Road Ahead</h3>
            <p className="mt-2.5 text-sm text-foreground/70">{getSlideText("slide33.xml")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xl md:text-2xl">Partners by Category</h3>
          <p className="text-sm text-foreground/60 md:max-w-3xl">
            Our partners, supporters and knowledge organisations who made the event possible.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {partnerCategories.map((category) => (
              <div key={category.title} className="rounded-xl border border-foreground/10 bg-background p-3.5">
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
                  {category.title}
                </h4>
                <div className="mt-2.5 grid gap-2.5">
                  {category.logos.map((logo) => (
                    <div key={logo} className="rounded-lg border border-foreground/10 bg-white p-2">
                      <img
                        src={`/imports/bio2025/ppt/media/${logo}`}
                        alt={`${category.title} logo`}
                        className="max-h-20 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl md:text-2xl">Exhibitors</h3>
          <p className="mt-1.5 text-sm text-foreground/60">Complete exhibitors logo board from the uploaded report.</p>
          <div className="mt-3 rounded-xl border border-foreground/10 bg-background p-2.5 md:p-3">
            <img
              src={`/imports/bio2025/ppt/media/${exhibitorsBoard}`}
              alt="Bio Energy Global 2025 exhibitors"
              className="w-full rounded-lg object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl md:text-2xl">Post Show Photo Gallery</h3>
          <p className="mt-1.5 text-sm text-foreground/60">
            Key event photos imported from the PPT and displayed on the website.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((item) => (
              <img
                key={item}
                src={`/imports/bio2025/ppt/media/${item}`}
                alt={item}
                className="h-28 w-full rounded-lg border border-foreground/10 object-cover md:h-32"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
