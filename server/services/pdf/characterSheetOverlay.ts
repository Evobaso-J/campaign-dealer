import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFPage, PDFFont } from "pdf-lib";
import type {
  CharacterArchetype,
  CharacterSheet,
  CharacterSuit,
} from "~~/shared/types/character";

/** Field positions in the landscape character sheet (origin = bottom-left). */
const FIELDS = {
  name: { x: 57, y: 164, size: 14, bold: true },
  pronouns: { x: 284.5, y: 164, size: 7 },
  concept: { x: 45, y: 125, size: 7, maxWidth: 260, maxLines: 6 },
  weapon: { x: 50, y: 50, size: 8 },
  weaponConcealed: { x: 148.5, y: 48, hw: 5, hh: 9 },
  instrument: { x: 200, y: 50, size: 8 },
  instrumentConcealed: { x: 294.5, y: 48, hw: 5, hh: 9 },
} as const;

/** Diamond position for each suit skill panel, per archetype template.
 *  Panel order differs between templates; offsets are baked in. */
const SUIT_SKILL_DIAMONDS: Record<
  CharacterArchetype,
  Record<CharacterSuit, { x: number; y: number }>
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

/** Diamond positions for each archetype skill (right side, "Abilità" section).
 *  All 7 skills are always drawn. Offsets baked in per archetype. */
const ARCHETYPE_SKILL_DIAMONDS: Record<
  CharacterArchetype,
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

const TEXT_COLOR = rgb(0.1, 0.1, 0.1);

function drawDiamond(
  page: PDFPage,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
): void {
  page.drawSvgPath(`M 0 ${hh} L ${hw} 0 L 0 ${-hh} L ${-hw} 0 Z`, {
    x: cx,
    y: cy,
    color: TEXT_COLOR,
  });
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  maxLines?: number,
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
  return maxLines ? lines.slice(0, maxLines) : lines;
}

export async function overlayCharacterData(
  templateBytes: Uint8Array,
  character: CharacterSheet,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(templateBytes);
  const page = doc.getPage(0);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const identity = character.characterIdentity;

  // Name
  page.drawText(String(identity.name), {
    x: FIELDS.name.x,
    y: FIELDS.name.y,
    size: FIELDS.name.size,
    font: fontBold,
    color: TEXT_COLOR,
  });

  // Pronouns
  if (identity.pronouns) {
    page.drawText(String(identity.pronouns), {
      x: FIELDS.pronouns.x,
      y: FIELDS.pronouns.y,
      size: FIELDS.pronouns.size,
      font,
      color: TEXT_COLOR,
    });
  }

  // Concept (with word wrapping)
  if (identity.concept) {
    const conceptLines = wrapText(
      String(identity.concept),
      font,
      FIELDS.concept.size,
      FIELDS.concept.maxWidth,
      FIELDS.concept.maxLines,
    );
    for (let i = 0; i < conceptLines.length; i++) {
      page.drawText(conceptLines[i]!, {
        x: FIELDS.concept.x,
        y: FIELDS.concept.y - i * 9,
        size: FIELDS.concept.size,
        font,
        color: TEXT_COLOR,
      });
    }
  }

  // Weapon
  if (identity.weapon) {
    page.drawText(String(identity.weapon.name), {
      x: FIELDS.weapon.x,
      y: FIELDS.weapon.y,
      size: FIELDS.weapon.size,
      font,
      color: TEXT_COLOR,
    });
    if (identity.weapon.concealed) {
      drawDiamond(
        page,
        FIELDS.weaponConcealed.x,
        FIELDS.weaponConcealed.y,
        FIELDS.weaponConcealed.hw,
        FIELDS.weaponConcealed.hh,
      );
    }
  }

  // Instrument
  if (identity.instrument) {
    page.drawText(String(identity.instrument.name), {
      x: FIELDS.instrument.x,
      y: FIELDS.instrument.y,
      size: FIELDS.instrument.size,
      font,
      color: TEXT_COLOR,
    });
    if (identity.instrument.concealed) {
      drawDiamond(
        page,
        FIELDS.instrumentConcealed.x,
        FIELDS.instrumentConcealed.y,
        FIELDS.instrumentConcealed.hw,
        FIELDS.instrumentConcealed.hh,
      );
    }
  }

  // Archetype skill diamonds (all 7)
  for (const pos of ARCHETYPE_SKILL_DIAMONDS[character.archetype]) {
    drawDiamond(
      page,
      pos.x,
      pos.y,
      SKILL_DIAMOND_SIZE.hw,
      SKILL_DIAMOND_SIZE.hh,
    );
  }

  // Suit skill diamond
  const suitPos = SUIT_SKILL_DIAMONDS[character.archetype][character.suit];
  drawDiamond(
    page,
    suitPos.x,
    suitPos.y,
    SKILL_DIAMOND_SIZE.hw,
    SKILL_DIAMOND_SIZE.hh,
  );

  return doc.save();
}
