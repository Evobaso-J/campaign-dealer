import { defineEventHandler, readBody, setResponseHeaders } from "h3";
import { ValidationError } from "~~/shared/types/errors";
import { toHttpError } from "~~/server/utils/errors";
import { characterPdfRequestSchema } from "~~/server/utils/validate";
import { getTemplateBytes } from "~~/server/services/pdf/templateCache";
import { overlayCharacterData } from "~~/server/services/pdf/characterSheetOverlay";
import { createI18nResolver } from "~~/server/utils/i18n";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = characterPdfRequestSchema.safeParse(body);
  if (!parsed.success) {
    toHttpError(new ValidationError("Validation failed", parsed.error.issues));
  }

  const { character, language } = parsed.data;

  let templateBytes: Uint8Array;
  try {
    templateBytes = await getTemplateBytes(character.archetype);
  } catch {
    toHttpError(
      new ValidationError("Character sheet template not available", []),
    );
  }

  const resolveI18n = await createI18nResolver(language);
  const pdfBytes = await overlayCharacterData(
    templateBytes!,
    character,
    resolveI18n,
  );

  const filename = `character-sheet-${String(character.characterIdentity.name).toLowerCase().replace(/\s+/g, "-")}.pdf`;

  setResponseHeaders(event, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
  });

  return pdfBytes;
});
