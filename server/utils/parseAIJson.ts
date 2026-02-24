import { jsonrepair } from "jsonrepair";
import { ok, err, type Result } from "./errors";

/**
 * Extracts and parses JSON from raw AI completion text.
 *
 * Handles common quirks of LLM output:
 *   1. JSON wrapped in a markdown fenced code block (```json … ```)
 *   2. Literal `undefined` values where JSON expects `null`
 *   3. Structural issues (missing commas, trailing commas, etc.) via jsonrepair
 */
export function parseAIJson<T>(raw: string): Result<T, Error> {
  let text = raw;
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  if (fenced) text = fenced[1]!;

  text = text.replace(/:\s*undefined\b/g, ": null");
  text = text.trim();

  try {
    const parsedJson = JSON.parse(jsonrepair(text));
    if (!parsedJson || typeof parsedJson !== "object") {
      return err(new Error("Parsed JSON is falsy"));
    }
    return ok(parsedJson as T);
  } catch (cause) {
    return err(new Error("Failed to parse AI JSON response", { cause }));
  }
}
