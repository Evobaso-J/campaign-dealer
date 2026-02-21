import { describe, expect, it } from "vitest";

describe("example unit test", () => {
  it("performs basic arithmetic", () => {
    expect(1 + 1).toBe(2);
  });

  it("handles string operations", () => {
    expect("hello world").toContain("hello");
  });
});
