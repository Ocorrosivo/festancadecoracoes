import { describe, it, expect } from "vitest";
import {
  toNumberOrNull,
  getEffectivePrice,
  getVariationName,
  type ProductImage,
} from "@/utils/productImagePrice";

const image = (overrides: Partial<ProductImage> = {}): ProductImage => ({
  image_url: "https://example.com/a.jpg",
  is_primary: false,
  custom_price: null,
  nome_opcional: null,
  ordem: 0,
  ...overrides,
});

describe("toNumberOrNull", () => {
  it("returns null for empty values", () => {
    expect(toNumberOrNull(null)).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
    expect(toNumberOrNull("")).toBeNull();
  });

  it("returns null for non-numeric strings", () => {
    expect(toNumberOrNull("abc")).toBeNull();
  });

  it("parses numbers and numeric strings", () => {
    expect(toNumberOrNull(125)).toBe(125);
    expect(toNumberOrNull("280.00")).toBe(280);
    expect(toNumberOrNull("1250.5")).toBe(1250.5);
    expect(toNumberOrNull("1.250,50")).toBe(1250.5);
    expect(toNumberOrNull("R$ 1.250,50")).toBe(1250.5);
  });
});

describe("getEffectivePrice", () => {
  it("falls back to the product price when no custom price exists", () => {
    expect(getEffectivePrice(image(), "R$ 199,00")).toBe("R$ 199,00");
    expect(getEffectivePrice(null, "Sob consulta")).toBe("Sob consulta");
  });

  it("uses the image custom price when present", () => {
    expect(getEffectivePrice(image({ custom_price: 280 }), "R$ 199,00")).toBe("R$ 280,00");
    expect(getEffectivePrice(image({ custom_price: 1250.5 }), "R$ 199,00")).toBe("R$ 1250,50");
  });

  it("never leaks the product price when the selected image has its own price", () => {
    const productPrice = "R$ 199,00";
    const result = getEffectivePrice(image({ custom_price: 50 }), productPrice);
    expect(result).not.toBe(productPrice);
    expect(result).toBe("R$ 50,00");
  });
});

describe("getVariationName", () => {
  it("returns null for blank names", () => {
    expect(getVariationName(image())).toBeNull();
    expect(getVariationName(image({ nome_opcional: "   " }))).toBeNull();
    expect(getVariationName(null)).toBeNull();
  });

  it("returns the trimmed variation name", () => {
    expect(getVariationName(image({ nome_opcional: "  Tema Coral " }))).toBe("Tema Coral");
  });
});

describe("gallery selection semantics", () => {
  const gallery: ProductImage[] = [
    image({ id: "1", ordem: 0, custom_price: null, nome_opcional: "Azul bebê" }),
    image({ id: "2", ordem: 1, is_primary: true, custom_price: 300, nome_opcional: "Tema Coral" }),
    image({ id: "3", ordem: 2, custom_price: 450 }),
  ];

  it("resolves exactly one primary image", () => {
    expect(gallery.filter((img) => img.is_primary)).toHaveLength(1);
  });

  it("switches effective price per selected index", () => {
    const productPrice = "R$ 199,00";
    expect(getEffectivePrice(gallery[0], productPrice)).toBe("R$ 199,00");
    expect(getEffectivePrice(gallery[1], productPrice)).toBe("R$ 300,00");
    expect(getEffectivePrice(gallery[2], productPrice)).toBe("R$ 450,00");
  });
});
