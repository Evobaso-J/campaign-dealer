import type { CharacterSheet } from "~~/shared/types/character";

export function useCharacterPdf() {
  const { t } = useI18n();

  async function downloadPdf(character: CharacterSheet): Promise<void> {
    const { buildCharacterPdf } = await import("~/utils/pdfCharacterSheet");
    const pdfBytes = await buildCharacterPdf(character, t);

    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `character-sheet-${String(character.characterIdentity.name).toLowerCase().replace(/\s+/g, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { downloadPdf };
}
