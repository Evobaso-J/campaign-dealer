import type { CharacterSheet } from "~~/shared/types/character";

export function useCharacterPdf() {
  async function openPdf(character: CharacterSheet): Promise<void> {
    const pdfBytes = await $fetch("/api/campaign/character-pdf", {
      method: "POST",
      body: { character },
      responseType: "arrayBuffer",
    });

    const blob = new Blob(
      [new Uint8Array(pdfBytes as unknown as ArrayBuffer)],
      { type: "application/pdf" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return { openPdf };
}
