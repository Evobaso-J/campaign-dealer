import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CharacterSheet, CharacterSuit } from "~~/shared/types/character";

const SUIT_SYMBOLS: Record<CharacterSuit, string> = {
  hearts: "(H)",
  clubs: "(C)",
  spades: "(S)",
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export async function buildCharacterPdf(
  character: CharacterSheet,
  resolveI18n: (key: string) => string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const black = rgb(0, 0, 0);
  const grey = rgb(0.4, 0.4, 0.4);

  let y = PAGE_HEIGHT - MARGIN;

  // --- Header ---
  const archetype = character.archetype.toUpperCase();
  const suit = character.suit.toUpperCase();
  const suitSymbol = SUIT_SYMBOLS[character.suit];
  const headerText = `${archetype} OF ${suit}  ${suitSymbol}`;

  page.drawText(headerText, {
    x: MARGIN,
    y,
    size: 20,
    font: fontBold,
    color: black,
  });
  y -= 28;

  // Character name and pronouns
  const identity = character.characterIdentity;
  let nameLine = String(identity.name);
  if (identity.pronouns) {
    nameLine += ` \u2014 ${String(identity.pronouns)}`;
  }
  page.drawText(nameLine, {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
    color: black,
  });
  y -= 20;

  // Concept
  if (identity.concept) {
    const conceptText = String(identity.concept);
    const wrappedLines = wrapText(conceptText, font, 10, CONTENT_WIDTH);
    for (const line of wrappedLines) {
      page.drawText(line, { x: MARGIN, y, size: 10, font, color: grey });
      y -= 14;
    }
  }
  y -= 10;

  // --- Section: Modifiers ---
  y = drawSectionHeader(page, fontBold, "MODIFIERS", y);

  const suits: CharacterSuit[] = ["hearts", "clubs", "spades"];
  const colWidth = CONTENT_WIDTH / 3;

  for (let i = 0; i < suits.length; i++) {
    const s = suits[i]!;
    const x = MARGIN + i * colWidth;
    const label = `${SUIT_SYMBOLS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}: ${formatModifier(character.modifiers[s])}`;
    page.drawText(label, { x, y, size: 11, font, color: black });
  }
  y -= 24;

  // --- Section: Damage ---
  y = drawSectionHeader(page, fontBold, "DAMAGE", y);

  for (let i = 0; i < suits.length; i++) {
    const s = suits[i]!;
    const x = MARGIN + i * colWidth;
    drawCheckbox(page, x, y, character.damage[s]);
    const label = ` ${s.charAt(0).toUpperCase() + s.slice(1)}`;
    page.drawText(label, { x: x + 14, y: y + 2, size: 10, font, color: black });
  }
  y -= 24;

  // --- Section: Equipment ---
  if (identity.weapon || identity.instrument) {
    y = drawSectionHeader(page, fontBold, "EQUIPMENT", y);

    if (identity.weapon) {
      page.drawText(`Weapon: ${String(identity.weapon.name)}`, {
        x: MARGIN,
        y,
        size: 10,
        font,
        color: black,
      });
      drawCheckbox(page, MARGIN + 250, y - 2, identity.weapon.concealed);
      page.drawText("Concealed", {
        x: MARGIN + 266,
        y,
        size: 10,
        font,
        color: grey,
      });
      y -= 16;
    }

    if (identity.instrument) {
      page.drawText(`Instrument: ${String(identity.instrument.name)}`, {
        x: MARGIN,
        y,
        size: 10,
        font,
        color: black,
      });
      drawCheckbox(page, MARGIN + 250, y - 2, identity.instrument.concealed);
      page.drawText("Concealed", {
        x: MARGIN + 266,
        y,
        size: 10,
        font,
        color: grey,
      });
      y -= 16;
    }
    y -= 8;
  }

  // --- Section: Suit Skill ---
  y = drawSectionHeader(page, fontBold, "SUIT SKILL", y);
  y = drawSkill(page, font, fontBold, character.suitSkill, resolveI18n, y);

  // --- Section: Archetype Skills ---
  y = drawSectionHeader(page, fontBold, "ARCHETYPE SKILLS", y);
  for (const skill of character.archetypeSkills) {
    y = drawSkill(page, font, fontBold, skill, resolveI18n, y);
  }

  // --- Section: Notes ---
  y -= 4;
  y = drawSectionHeader(page, fontBold, "NOTES", y);

  // Draw ruled lines for notes
  const lineSpacing = 18;
  const notesBottom = MARGIN + 20;
  while (y > notesBottom) {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= lineSpacing;
  }

  return doc.save();
}

function drawSectionHeader(
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  title: string,
  y: number,
): number {
  page.drawLine({
    start: { x: MARGIN, y: y + 6 },
    end: { x: PAGE_WIDTH - MARGIN, y: y + 6 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 6;
  page.drawText(title, { x: MARGIN, y, size: 10, font, color: rgb(0, 0, 0) });
  y -= 18;
  return y;
}

function drawCheckbox(
  page: ReturnType<PDFDocument["addPage"]>,
  x: number,
  y: number,
  checked: boolean,
): void {
  const size = 10;
  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: checked ? rgb(0, 0, 0) : rgb(1, 1, 1),
  });
}

function drawSkill(
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontBold: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  skill: CharacterSheet["suitSkill"],
  resolveI18n: (key: string) => string,
  y: number,
): number {
  const name = resolveI18n(String(skill.name));
  const description = resolveI18n(String(skill.description));

  page.drawText(name, {
    x: MARGIN,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  if (skill.uses) {
    const usesText = `Uses: ${skill.uses.usesLeft} / ${skill.uses.maxUses}`;
    const usesWidth = font.widthOfTextAtSize(usesText, 9);
    page.drawText(usesText, {
      x: PAGE_WIDTH - MARGIN - usesWidth,
      y,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }
  y -= 14;

  const wrappedDesc = wrapText(description, font, 9, CONTENT_WIDTH);
  for (const line of wrappedDesc) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 12;
  }
  y -= 6;
  return y;
}

function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
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
