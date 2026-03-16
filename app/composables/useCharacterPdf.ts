import type { CharacterSheet } from "~~/shared/types/character";

export function useCharacterPdf() {
  const { locale } = useI18n();

  async function downloadPdf(character: CharacterSheet): Promise<void> {
    const pdfBytes = await $fetch("/api/campaign/character-pdf", {
      method: "POST",
      body: { character, language: locale.value },
      responseType: "arrayBuffer",
    });

    const blob = new Blob(
      [new Uint8Array(pdfBytes as unknown as ArrayBuffer)],
      { type: "application/pdf" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `character-sheet-${String(character.characterIdentity.name).toLowerCase().replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  return { downloadPdf };
}
