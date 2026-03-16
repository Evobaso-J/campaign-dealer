import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { PDFPage, PDFFont } from "pdf-lib";
import type { CharacterSheet } from "~~/shared/types/character";

/**
 * The template PDFs are 453.543 × 651.969 pts (portrait dimensions)
 * but all content is drawn rotated 90° counter-clockwise, making them
 * appear landscape when viewed. To overlay text that appears correctly
 * in the landscape view we draw with rotate=90° and transform visual
 * landscape coordinates (vx = left→right, vy = top→bottom) into raw
 * PDF coordinates: pdf_x = vy, pdf_y = pageHeight − vx.
 */
const PAGE_HEIGHT = 651.969;

/** Visual landscape coordinates for each fillable field. Shared across all three archetype templates. */
const FIELDS = {
  name: { vx: 636, vy: 385, size: 9, bold: true },
  pronouns: { vx: 536, vy: 432, size: 7 },
  concept: { vx: 620, vy: 385, size: 7, maxWidth: 45 },
  weapon: { vx: 600, vy: 385, size: 8 },
  weaponConcealed: { vx: 585, vy: 433 },
  instrument: { vx: 568, vy: 385, size: 8 },
  instrumentConcealed: { vx: 553, vy: 433 },
} as const;

function drawRotatedText(
  page: PDFPage,
  text: string,
  vx: number,
  vy: number,
  opts: { size?: number; font: PDFFont; bold?: boolean },
): void {
  page.drawText(text, {
    x: vy,
    y: PAGE_HEIGHT - vx,
    size: opts.size ?? 8,
    font: opts.font,
    color: rgb(0.1, 0.1, 0.1),
    rotate: degrees(90),
  });
}

function drawConcealedMark(
  page: PDFPage,
  vx: number,
  vy: number,
  font: PDFFont,
): void {
  drawRotatedText(page, "X", vx, vy, { size: 9, font });
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function overlayCharacterData(
  templateBytes: Uint8Array,
  character: CharacterSheet,
  resolveI18n: (key: string) => string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(templateBytes);
  const page = doc.getPage(0);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const identity = character.characterIdentity;

  // Name
  drawRotatedText(page, String(identity.name), FIELDS.name.vx, FIELDS.name.vy, {
    size: FIELDS.name.size,
    font: fontBold,
  });

  // Pronouns
  if (identity.pronouns) {
    drawRotatedText(
      page,
      String(identity.pronouns),
      FIELDS.pronouns.vx,
      FIELDS.pronouns.vy,
      { size: FIELDS.pronouns.size, font },
    );
  }

  // Concept (with word wrapping)
  if (identity.concept) {
    const conceptLines = wrapText(
      String(identity.concept),
      font,
      FIELDS.concept.size,
      FIELDS.concept.maxWidth,
    );
    for (let i = 0; i < conceptLines.length; i++) {
      drawRotatedText(
        page,
        conceptLines[i]!,
        FIELDS.concept.vx + i * 10,
        FIELDS.concept.vy,
        { size: FIELDS.concept.size, font },
      );
    }
  }

  // Weapon
  if (identity.weapon) {
    drawRotatedText(
      page,
      String(identity.weapon.name),
      FIELDS.weapon.vx,
      FIELDS.weapon.vy,
      { size: FIELDS.weapon.size, font },
    );
    if (identity.weapon.concealed) {
      drawConcealedMark(
        page,
        FIELDS.weaponConcealed.vx,
        FIELDS.weaponConcealed.vy,
        fontBold,
      );
    }
  }

  // Instrument
  if (identity.instrument) {
    drawRotatedText(
      page,
      String(identity.instrument.name),
      FIELDS.instrument.vx,
      FIELDS.instrument.vy,
      { size: FIELDS.instrument.size, font },
    );
    if (identity.instrument.concealed) {
      drawConcealedMark(
        page,
        FIELDS.instrumentConcealed.vx,
        FIELDS.instrumentConcealed.vy,
        fontBold,
      );
    }
  }

  return doc.save();
}
