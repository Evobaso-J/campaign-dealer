import { describe, expect, it } from "vitest";
import { parseAIJson } from "./parseAIJson";

describe("parseAIJson", () => {
  it("parses plain JSON", () => {
    const result = parseAIJson<{ name: string }>('{"name": "Alice"}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Alice");
  });

  it("extracts JSON from markdown code block", () => {
    const raw = '```json\n{"name": "Bob"}\n```';
    const result = parseAIJson<{ name: string }>(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Bob");
  });

  it("extracts JSON from code block without json tag", () => {
    const raw = '```\n{"count": 42}\n```';
    const result = parseAIJson<{ count: number }>(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.count).toBe(42);
  });

  it("replaces undefined with null", () => {
    const raw = '{"name": "Charlie", "weapon": undefined}';
    const result = parseAIJson<{ name: string; weapon: null }>(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Charlie");
      expect(result.value.weapon).toBeNull();
    }
  });

  it("handles fenced code block with undefined values", () => {
    const raw = '```json\n{"concept": undefined, "name": "Dana"}\n```';
    const result = parseAIJson<{ concept: null; name: string }>(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.concept).toBeNull();
      expect(result.value.name).toBe("Dana");
    }
  });

  it("returns error for unparseable text", () => {
    const result = parseAIJson("not json at all");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
    }
  });

  it("trims whitespace before parsing", () => {
    const raw = '  \n  {"ok": true}  \n  ';
    const result = parseAIJson<{ ok: boolean }>(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.ok).toBe(true);
  });
});
