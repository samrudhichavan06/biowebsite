/*
Script: import-pdfs.js
Description: Extracts text from PDF files in a folder and writes a JSON mapping file
Usage:
  1. Install dependency: npm install pdf-parse
  2. Place PDFs in ./public/imports/events/ with filenames matching event ids (e.g. bioenergy-global-2026.pdf)
  3. Run: node scripts/import-pdfs.js
  4. Output: src/data/event_contents.json
*/

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const INPUT_DIR = path.resolve(__dirname, '../public/imports/events');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/event_contents.json');

async function extractFromFile(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (err) {
    console.error('Failed to parse PDF:', filePath, err.message);
    return null;
  }
}

(async () => {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error('Input directory not found:', INPUT_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'));
  if (!files.length) {
    console.error('No PDF files found in', INPUT_DIR);
    process.exit(1);
  }

  const out = {};
  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const id = path.basename(file, '.pdf');
    console.log('Processing', file);
    const text = await extractFromFile(filePath);
    if (text) {
      out[id] = {
        rawText: text,
      };
    }
  }

  // Ensure output dir exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote event contents to', OUTPUT_FILE);
})();
