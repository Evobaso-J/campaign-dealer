/**
 * Calibration script for character sheet field positioning.
 *
 * Usage:
 *   npx tsx server/services/pdf/calibrate.ts              # grid mode (default)
 *   npx tsx server/services/pdf/calibrate.ts grid          # grid overlay on all templates
 *   npx tsx server/services/pdf/calibrate.ts test          # sample text at current FIELDS positions
 *
 * Grid mode: overlays a labeled coordinate grid so you can read off x/y values.
 * Test mode: renders sample character data using the FIELDS from characterSheetOverlay.ts.
 *
 * Output goes to the project root: calibrated-{jack,queen,king}.pdf
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PAGE_WIDTH = 651.969;
const PAGE_HEIGHT = 453.543;

const TEMPLATES = ["jack", "queen", "king"] as const;

// ─── Edit these to match characterSheetOverlay.ts FIELDS ───
const FIELDS = {
  name: { x: 57, y: 164, size: 14 },
  pronouns: { x: 284.5, y: 164, size: 7 },
  concept: { x: 45, y: 125, size: 7 },
  weapon: { x: 50, y: 50, size: 8 },
  weaponConcealed: { x: 148.5, y: 48, hw: 5, hh: 9 },
  instrument: { x: 200, y: 50, size: 8 },
  instrumentConcealed: { x: 294.5, y: 48, hw: 5, hh: 9 },
};

/** Per-template offset to adjust for slight layout differences. */
const TEMPLATE_OFFSETS: Record<string, { dx: number; dy: number }> = {
  jack: { dx: 0, dy: 0 },
  queen: { dx: 7, dy: 2 },
  king: { dx: 4, dy: 1 },
};

// ─── Suit skill diamond positions (must match characterSheetOverlay.ts) ───
const SUIT_SKILL_DIAMONDS: Record<
  string,
  Record<string, { x: number; y: number }>
> = {
  jack: {
    clubs: { x: 186, y: 397 },
    hearts: { x: 186, y: 338 },
    spades: { x: 186, y: 278 },
  },
  queen: {
    hearts: { x: 193, y: 399 },
    clubs: { x: 193, y: 340 },
    spades: { x: 193, y: 280 },
  },
  king: {
    clubs: { x: 190, y: 398 },
    hearts: { x: 190, y: 339 },
    spades: { x: 190, y: 279 },
  },
};

// ─── Archetype skill diamond positions (must match characterSheetOverlay.ts) ───
const ARCHETYPE_SKILL_DIAMONDS: Record<
  string,
  Array<{ x: number; y: number }>
> = {
  jack: [
    { x: 345, y: 381 },
    { x: 345, y: 355 },
    { x: 345, y: 323 },
    { x: 345, y: 299 },
    { x: 345, y: 269 },
    { x: 345, y: 239 },
    { x: 345, y: 209 },
  ],
  queen: [
    { x: 350, y: 383 },
    { x: 350, y: 357 },
    { x: 350, y: 325 },
    { x: 350, y: 301 },
    { x: 350, y: 271 },
    { x: 350, y: 241 },
    { x: 350, y: 211 },
  ],
  king: [
    { x: 350, y: 382 },
    { x: 350, y: 356 },
    { x: 350, y: 324 },
    { x: 350, y: 300 },
    { x: 350, y: 270 },
    { x: 350, y: 240 },
    { x: 350, y: 210 },
  ],
};

const SKILL_DIAMOND_SIZE = { hw: 5, hh: 9 };

// ─── Sample data for test mode ───
const SAMPLE = {
  name: "Marco Rossi",
  pronouns: "lui/egli",
  concept:
    "Un vecchio marinaio con molti segreti che ha navigato i sette mari alla ricerca di un tesoro perduto, sopravvivendo a tempeste terribili e battaglie navali contro pirati spietati, portando con sé una mappa antica e una cicatrice sul volto che racconta storie di avventure dimenticate da tutti tranne che da lui stesso",
  weapon: "Sciabola arrugginita",
  instrument: "Fisarmonica",
};

function templatePath(name: string) {
  return resolve(
    __dirname,
    `../../../gdr/the-house-doesnt-always-win/character-sheet-${name}.pdf`,
  );
}

function outputPath(name: string, mode: string) {
  return resolve(
    __dirname,
    `../../../calibrated-${name}${mode === "grid" ? "-grid" : ""}.pdf`,
  );
}

// ─── Grid mode ───
async function grid(name: string) {
  const doc = await PDFDocument.load(readFileSync(templatePath(name)));
  const page = doc.getPage(0);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const gridColor = rgb(1, 0, 0);
  const step = 25;

  // Vertical grid lines (constant x)
  for (let x = 0; x <= PAGE_WIDTH; x += step) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: PAGE_HEIGHT },
      thickness: x % 100 === 0 ? 0.5 : 0.2,
      color: gridColor,
      opacity: 0.4,
    });
    if (x % 50 === 0) {
      page.drawText(`x=${x}`, {
        x: x + 2,
        y: PAGE_HEIGHT - 8,
        size: 6,
        font,
        color: gridColor,
      });
    }
  }

  // Horizontal grid lines (constant y)
  for (let y = 0; y <= PAGE_HEIGHT; y += step) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: PAGE_WIDTH, y },
      thickness: y % 100 === 0 ? 0.5 : 0.2,
      color: gridColor,
      opacity: 0.4,
    });
    if (y % 50 === 0) {
      page.drawText(`y=${y}`, {
        x: 5,
        y: y + 2,
        size: 6,
        font,
        color: gridColor,
      });
    }
  }

  const out = outputPath(name, "grid");
  writeFileSync(out, await doc.save());
  console.log(`  grid → ${out}`);
}

// ─── Test mode ───
async function test(name: string) {
  const doc = await PDFDocument.load(readFileSync(templatePath(name)));
  const page = doc.getPage(0);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { dx, dy } = TEMPLATE_OFFSETS[name] ?? { dx: 0, dy: 0 };

  for (const [key, field] of Object.entries(FIELDS)) {
    const fx = field.x + dx;
    const fy = field.y + dy;
    if ("hw" in field) {
      // Filled diamond for concealed marks
      page.drawSvgPath(
        `M 0 ${field.hh} L ${field.hw} 0 L 0 ${-field.hh} L ${-field.hw} 0 Z`,
        {
          x: fx,
          y: fy,
          color: rgb(0.1, 0.1, 0.1),
        },
      );
    } else {
      const text = SAMPLE[key as keyof typeof SAMPLE];
      if (!text) continue;
      if (key === "concept") {
        // Word-wrap concept into multiple lines
        const maxWidth = 260;
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, field.size);
          if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        for (let i = 0; i < Math.min(lines.length, 6); i++) {
          page.drawText(lines[i]!, {
            x: fx,
            y: fy - i * 9,
            size: field.size,
            font,
            color: rgb(0.1, 0.1, 0.1),
          });
        }
      } else {
        page.drawText(text, {
          x: fx,
          y: fy,
          size: field.size,
          font: key === "name" ? fontBold : font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
    }
  }

  // Suit skill diamonds (draw all three to verify positions)
  const suitPositions = SUIT_SKILL_DIAMONDS[name];
  if (suitPositions) {
    for (const pos of Object.values(suitPositions)) {
      page.drawSvgPath(
        `M 0 ${SKILL_DIAMOND_SIZE.hh} L ${SKILL_DIAMOND_SIZE.hw} 0 L 0 ${-SKILL_DIAMOND_SIZE.hh} L ${-SKILL_DIAMOND_SIZE.hw} 0 Z`,
        { x: pos.x, y: pos.y, color: rgb(0.1, 0.1, 0.1) },
      );
    }
  }

  // Archetype skill diamonds (draw all 7)
  const archetypePositions = ARCHETYPE_SKILL_DIAMONDS[name];
  if (archetypePositions) {
    for (const pos of archetypePositions) {
      page.drawSvgPath(
        `M 0 ${SKILL_DIAMOND_SIZE.hh} L ${SKILL_DIAMOND_SIZE.hw} 0 L 0 ${-SKILL_DIAMOND_SIZE.hh} L ${-SKILL_DIAMOND_SIZE.hw} 0 Z`,
        { x: pos.x, y: pos.y, color: rgb(0.1, 0.1, 0.1) },
      );
    }
  }

  const out = outputPath(name, "test");
  writeFileSync(out, await doc.save());
  console.log(`  test → ${out}`);
}

// ─── Main ───
async function main() {
  const mode = process.argv[2] || "grid";
  console.log(`Mode: ${mode}`);
  for (const name of TEMPLATES) {
    console.log(`${name}:`);
    if (mode === "grid") await grid(name);
    else if (mode === "test") await test(name);
    else {
      console.error(`Unknown mode: ${mode}. Use "grid" or "test".`);
      process.exit(1);
    }
  }
}

main().catch(console.error);
