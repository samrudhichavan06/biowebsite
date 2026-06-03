import fs from "fs";
import path from "path";
import zlib from "zlib";

// List of target categories to map slides to
const TARGET_CATEGORIES = [
  "Organized By",
  "Event Partner",
  "Presented By",
  "Co-Powered By",
  "Gold Sponsors",
  "Silver Sponsor",
  "Associate Partners",
  "International Partner",
  "Knowledge Partner",
  "Bioenergy Partners",
  "Industry Partners",
  "Int Knowledge Partner UK",
  "Research Partners",
  "Gift Partner",
  "Hydration Partner",
  "Exhibitors",
  "Media Partners"
];

// Helper to check and resolve category matches from slide text
function matchCategory(text) {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const cat of TARGET_CATEGORIES) {
    const normalizedCat = cat.toLowerCase().replace(/[^a-z0-9]/g, "");
    // Match full name or specific sub-phrase matching
    if (normalizedText.includes(normalizedCat) || normalizedCat.includes(normalizedText)) {
      return cat;
    }
  }
  // Try fallback keyword matching
  if (normalizedText.includes("organizer") || normalizedText.includes("organized")) return "Organized By";
  if (normalizedText.includes("eventpartner")) return "Event Partner";
  if (normalizedText.includes("presented")) return "Presented By";
  if (normalizedText.includes("powered")) return "Co-Powered By";
  if (normalizedText.includes("gold")) return "Gold Sponsors";
  if (normalizedText.includes("silver")) return "Silver Sponsor";
  if (normalizedText.includes("associate")) return "Associate Partners";
  if (normalizedText.includes("international")) return "International Partner";
  if (normalizedText.includes("knowledge") && normalizedText.includes("uk")) return "Int Knowledge Partner UK";
  if (normalizedText.includes("knowledge")) return "Knowledge Partner";
  if (normalizedText.includes("bioenergy")) return "Bioenergy Partners";
  if (normalizedText.includes("industry")) return "Industry Partners";
  if (normalizedText.includes("research")) return "Research Partners";
  if (normalizedText.includes("gift")) return "Gift Partner";
  if (normalizedText.includes("hydration") || normalizedText.includes("whatr")) return "Hydration Partner";
  if (normalizedText.includes("exhibitor")) return "Exhibitors";
  if (normalizedText.includes("media")) return "Media Partners";

  return null;
}

export default async function handler(req, res) {
  try {
    const pptxPath = path.resolve(process.cwd(), "Presentation.pptx");
    if (!fs.existsSync(pptxPath)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Presentation.pptx not found in workspace root" }));
      return;
    }

    console.log("Reading Presentation.pptx...");
    const buffer = fs.readFileSync(pptxPath);
    const files = new Map();
    let offset = 0;

    // Scan ZIP entries (local file headers)
    while (offset < buffer.length - 30) {
      const signature = buffer.readUInt32LE(offset);
      if (signature === 0x02014b50 || signature === 0x06054b50) {
        break; // Stop at Central Directory or End of Central Directory
      }
      if (signature !== 0x04034b50) {
        offset++;
        continue;
      }
      
      const compMethod = buffer.readUInt16LE(offset + 8);
      const compSize = buffer.readUInt32LE(offset + 18);
      const nameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      
      const filename = buffer.toString("utf8", offset + 30, offset + 30 + nameLen);
      const dataOffset = offset + 30 + nameLen + extraLen;
      const compressedData = buffer.subarray(dataOffset, dataOffset + compSize);
      
      files.set(filename, {
        compMethod,
        compSize,
        data: compressedData
      });
      
      offset = dataOffset + compSize;
    }

    console.log(`Read ${files.size} zip entries.`);

    // Decompress a helper function
    const decompress = (entry) => {
      if (entry.compMethod === 0) return entry.data;
      if (entry.compMethod === 8) return zlib.inflateRawSync(entry.data);
      throw new Error(`Unsupported compression method ${entry.compMethod}`);
    };

    // Find slides, rels, and media
    const slides = [];
    const rels = new Map();
    const media = new Map();

    for (const [filename, entry] of files.entries()) {
      if (filename.startsWith("ppt/slides/slide") && filename.endsWith(".xml")) {
        const slideNum = parseInt(filename.match(/\d+/)[0], 10);
        slides.push({
          num: slideNum,
          path: filename,
          xml: decompress(entry).toString("utf8")
        });
      } else if (filename.startsWith("ppt/slides/_rels/slide") && filename.endsWith(".xml.rels")) {
        const slideNum = parseInt(filename.match(/\d+/)[0], 10);
        rels.set(slideNum, decompress(entry).toString("utf8"));
      } else if (filename.startsWith("ppt/media/")) {
        const baseName = path.basename(filename);
        media.set(baseName, decompress(entry));
      }
    }

    slides.sort((a, b) => a.num - b.num);
    console.log(`Found ${slides.length} slides and ${media.size} media files.`);

    const outputLog = [];
    const categoryLogosMap = {};
    for (const cat of TARGET_CATEGORIES) {
      categoryLogosMap[cat] = [];
    }

    // Process each slide to extract text and image relationships
    for (const slide of slides) {
      const xml = slide.xml;
      
      // Extract all text content from <a:t>...</a:t>
      const textMatches = xml.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      const textContent = textMatches.map(m => m.replace(/<\/?a:t>/g, "")).join(" ").trim();

      const matchedCat = matchCategory(textContent);
      outputLog.push(`Slide ${slide.num}: Text: "${textContent.substring(0, 80)}" => Matched Category: ${matchedCat || "None"}`);

      if (!matchedCat) continue;

      // Extract image targets from the corresponding .rels file
      const slideRelXml = rels.get(slide.num);
      if (!slideRelXml) continue;

      // Match targets like Target="../media/image1.png"
      const imageTargets = [];
      const relMatches = slideRelXml.match(/Target="..\/media\/([^"]+)"/g) || [];
      for (const match of relMatches) {
        const filename = match.match(/Target="..\/media\/([^"]+)"/)[1];
        imageTargets.push(filename);
      }

      // Copy referenced images to output category folder
      const catSlug = matchedCat.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const destFolder = path.join(process.cwd(), "public", "logos_extracted", catSlug);
      
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }

      for (const imgName of imageTargets) {
        const imgBuffer = media.get(imgName);
        if (imgBuffer) {
          const destPath = path.join(destFolder, imgName);
          fs.writeFileSync(destPath, imgBuffer);

          // Get clean display name from file or index
          const displayName = imgName.split(".")[0].replace(/_/g, " ");

          // Add to data map
          categoryLogosMap[matchedCat].push({
            name: displayName,
            src: `/logos_extracted/${catSlug}/${imgName}`
          });
        }
      }
    }

    // Write src/data/categorizedLogos.ts
    const tsCode = `export type CategorizedLogo = { name: string; src: string; }
export type LogoCategory = { title: string; folder: string; logos: CategorizedLogo[]; }

export const categorizedLogos: LogoCategory[] = ${JSON.stringify(
      TARGET_CATEGORIES.map(cat => {
        const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        return {
          title: cat,
          folder: catSlug,
          logos: categoryLogosMap[cat]
        };
      }),
      null,
      2
    )};
`;

    const dataPath = path.resolve(process.cwd(), "src/data/categorizedLogos.ts");
    fs.writeFileSync(dataPath, tsCode, "utf8");

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      success: true,
      slidesMatched: outputLog,
      stats: TARGET_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = categoryLogosMap[cat].length;
        return acc;
      }, {})
    }));
  } catch (error) {
    console.error("Extraction error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
}
