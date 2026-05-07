import images from "@/data/bio2025_media.json";
import { Link } from "react-router-dom";

const PostShowReport = () => {
  return (
    <section className="container-x py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl">Bio Energy Global — 2025 Post Show Report</h2>
        <Link to="/" className="text-sm text-foreground/60">Back home</Link>
      </div>

      <p className="mb-8 max-w-2xl text-foreground/70">Images and assets extracted from the Post Show Report. Use these assets for partner pages, galleries and the downloads section.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((name: string) => (
          <div key={name} className="overflow-hidden rounded-lg border bg-background p-2">
            <img
              src={`/imports/bio2025/ppt/media/${name}`}
              alt={name}
              loading="lazy"
              className="h-48 w-full object-cover"
            />
            <div className="mt-2 text-xs text-foreground/60">{name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PostShowReport;
