import { defineEventHandler, readBody, setResponseHeaders } from "h3";
import { ValidationError } from "~~/shared/types/errors";
import { toHttpError } from "~~/server/utils/errors";
import { characterPdfRequestSchema } from "~~/server/utils/validate";
import { getTemplateBytes } from "~~/server/services/pdf/templateCache";
import { overlayCharacterData } from "~~/server/services/pdf/characterSheetOverlay";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = characterPdfRequestSchema.safeParse(body);
  if (!parsed.success) {
    toHttpError(new ValidationError("Validation failed", parsed.error.issues));
  }

  const { character } = parsed.data;

  let templateBytes: Uint8Array;
  try {
    templateBytes = await getTemplateBytes(character.archetype);
  } catch {
    toHttpError(
      new ValidationError("Character sheet template not available", []),
    );
  }

  const pdfBytes = await overlayCharacterData(templateBytes!, character);

  const filename = `character-sheet-${String(character.characterIdentity.name).toLowerCase().replace(/\s+/g, "-")}.pdf`;

  setResponseHeaders(event, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${filename}"`,
  });

  return pdfBytes;
});
