import { jsonrepair } from "jsonrepair";

/**
 * Extracts and parses JSON from raw AI completion text.
 *
 * Handles common quirks of LLM output:
 *   1. JSON wrapped in a markdown fenced code block (```json … ```)
 *   2. Literal `undefined` values where JSON expects `null`
 *   3. Structural issues (missing commas, trailing commas, etc.) via jsonrepair
 */
export function parseAIJson<T>(raw: string): T {
  let text = raw;

  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  if (fenced) text = fenced[1]!;

  text = text.replace(/:\s*undefined\b/g, ": null");
  text = text.trim();

  try {
    return JSON.parse(jsonrepair(text)) as T;
  } catch (cause) {
    throw new Error("Failed to parse AI JSON response", { cause });
  }
}
