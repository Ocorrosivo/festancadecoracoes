import { describe, it, expect } from "vitest";
import { hexToHsl } from "@/utils/themeUtils";

describe("themeUtils", () => {
  it("converts hex colors to HSL accurately", () => {
    // Pure Red #ff0000 -> 0 100% 50%
    expect(hexToHsl("#ff0000")).toEqual({ h: 0, s: 100, l: 50 });
    // Default Festança Pink #ff4f9a
    const pink = hexToHsl("#ff4f9a");
    expect(pink).not.toBeNull();
    expect(pink?.h).toBeGreaterThanOrEqual(330);
    expect(pink?.h).toBeLessThanOrEqual(340);
  });

  it("handles shorthand hex #rgb", () => {
    expect(hexToHsl("#f00")).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("returns null for invalid hex values", () => {
    expect(hexToHsl("invalid")).toBeNull();
    expect(hexToHsl("")).toBeNull();
    expect(hexToHsl("#12345")).toBeNull();
  });
});
