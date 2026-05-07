import slideText from "@/data/bio2025_slide_text.json";
import { Link } from "react-router-dom";

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
    <section id="postshow-report" className="border-y border-foreground/10 bg-card/30 py-14">
      <div className="container-x space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip">2025 Post Show Report</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">Bio Energy Global 2025 Highlights</h2>
            <p className="mt-3 max-w-3xl text-sm text-foreground/70 md:text-base">
              {getSlideText("slide2.xml")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {highlightStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-foreground/10 bg-background p-4">
              <div className="font-display text-2xl">{item.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-foreground/60">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-foreground/10 bg-background p-5">
            <h3 className="font-display text-xl">Association & Government Support</h3>
            <p className="mt-3 text-sm text-foreground/70">{getSlideText("slide10.xml")}</p>
            <p className="mt-3 text-sm text-foreground/70">{getSlideText("slide12.xml")}</p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-background p-5">
            <h3 className="font-display text-xl">Road Ahead</h3>
            <p className="mt-3 text-sm text-foreground/70">{getSlideText("slide33.xml")}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-display text-2xl">Partners by Category</h3>
          <p className="text-sm text-foreground/60">
            Our partners, supporters and knowledge organisations who made the event possible.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {partnerCategories.map((category) => (
              <div key={category.title} className="rounded-2xl border border-foreground/10 bg-background p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
                  {category.title}
                </h4>
                <div className="mt-3 grid gap-3">
                  {category.logos.map((logo) => (
                    <div key={logo} className="rounded-xl border border-foreground/10 bg-white p-2">
                      <img
                        src={`/imports/bio2025/ppt/media/${logo}`}
                        alt={`${category.title} logo`}
                        className="max-h-28 w-full object-contain"
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
          <h3 className="font-display text-2xl">Exhibitors</h3>
          <p className="mt-2 text-sm text-foreground/60">Complete exhibitors logo board from the uploaded report.</p>
          <div className="mt-4 rounded-2xl border border-foreground/10 bg-background p-3">
            <img
              src={`/imports/bio2025/ppt/media/${exhibitorsBoard}`}
              alt="Bio Energy Global 2025 exhibitors"
              className="w-full rounded-xl object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl">Post Show Photo Gallery</h3>
          <p className="mt-2 text-sm text-foreground/60">
            Key event photos imported from the PPT and displayed on the website.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((item) => (
              <img
                key={item}
                src={`/imports/bio2025/ppt/media/${item}`}
                alt={item}
                className="h-40 w-full rounded-xl border border-foreground/10 object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
