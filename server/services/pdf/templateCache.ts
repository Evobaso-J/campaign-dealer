import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { CharacterArchetype } from "~~/shared/types/character";

const cache = new Map<string, Uint8Array>();

const TEMPLATE_DIR = resolve("gdr/the-house-doesnt-always-win");

export async function getTemplateBytes(
  archetype: CharacterArchetype,
): Promise<Uint8Array> {
  const cached = cache.get(archetype);
  if (cached) return cached;

  const filePath = resolve(TEMPLATE_DIR, `character-sheet-${archetype}.pdf`);
  const bytes = new Uint8Array(await readFile(filePath));
  cache.set(archetype, bytes);
  return bytes;
}
