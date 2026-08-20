import { describe, it, expect } from "vitest";
import {
  formatBrazilianPhone,
  normalizePhoneDigits,
  formatWhatsAppUrlNumber,
} from "@/utils/phoneMask";

describe("phoneMask utilities", () => {
  describe("normalizePhoneDigits", () => {
    it("handles null and undefined", () => {
      expect(normalizePhoneDigits(null)).toBe("");
      expect(normalizePhoneDigits(undefined)).toBe("");
      expect(normalizePhoneDigits("")).toBe("");
    });

    it("strips country code 55 when full international number is provided", () => {
      expect(normalizePhoneDigits("+55 41 98402-7094")).toBe("41984027094");
      expect(normalizePhoneDigits("5541984027094")).toBe("41984027094");
      expect(normalizePhoneDigits("554133334444")).toBe("4133334444");
    });

    it("limits to 11 digits", () => {
      expect(normalizePhoneDigits("41984027094123")).toBe("41984027094");
    });
  });

  describe("formatBrazilianPhone", () => {
    it("formats 11-digit mobile phone with 9th digit properly", () => {
      expect(formatBrazilianPhone("41984027094")).toBe("(41) 98402-7094");
      expect(formatBrazilianPhone("11999999999")).toBe("(11) 99999-9999");
      expect(formatBrazilianPhone("51991205664")).toBe("(51) 99120-5664");
    });

    it("formats 10-digit landline (fixo) properly", () => {
      expect(formatBrazilianPhone("4133334444")).toBe("(41) 3333-4444");
      expect(formatBrazilianPhone("1132541000")).toBe("(11) 3254-1000");
    });

    it("formats raw input with international prefixes and special characters", () => {
      expect(formatBrazilianPhone("+55 41 98402-7094")).toBe("(41) 98402-7094");
      expect(formatBrazilianPhone("41 98402-7094")).toBe("(41) 98402-7094");
      expect(formatBrazilianPhone("(41) 98402-7094")).toBe("(41) 98402-7094");
      expect(formatBrazilianPhone("+55 (41) 3333-4444")).toBe("(41) 3333-4444");
    });

    it("formats partial inputs during typing without dropping digits", () => {
      expect(formatBrazilianPhone("4")).toBe("(4");
      expect(formatBrazilianPhone("41")).toBe("(41");
      expect(formatBrazilianPhone("419")).toBe("(41) 9");
      expect(formatBrazilianPhone("4198402")).toBe("(41) 9840-2");
      expect(formatBrazilianPhone("4198402709")).toBe("(41) 9840-2709");
      expect(formatBrazilianPhone("41984027094")).toBe("(41) 98402-7094");
    });
  });

  describe("formatWhatsAppUrlNumber", () => {
    it("generates wa.me compatible numbers with 55 prefix", () => {
      expect(formatWhatsAppUrlNumber("(41) 98402-7094")).toBe("5541984027094");
      expect(formatWhatsAppUrlNumber("41984027094")).toBe("5541984027094");
      expect(formatWhatsAppUrlNumber("5541984027094")).toBe("5541984027094");
      expect(formatWhatsAppUrlNumber("+55 41 98402-7094")).toBe("5541984027094");
      expect(formatWhatsAppUrlNumber("(41) 3333-4444")).toBe("554133334444");
    });

    it("falls back to default number if empty", () => {
      expect(formatWhatsAppUrlNumber("")).toBe("5511999999999");
      expect(formatWhatsAppUrlNumber(null)).toBe("5511999999999");
    });
  });
});
