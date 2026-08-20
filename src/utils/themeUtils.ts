/**
 * Converte cor HEX (#RRGGBB ou #RGB) para valores HSL.
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  if (!hex || typeof hex !== "string") return null;
  let cleaned = hex.replace(/^#/, "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  if (cleaned.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;

  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Aplica cores dinâmicas no elemento raiz (:root) do documento.
 */
export function applyDynamicTheme(primaryHex?: string | null, secondaryHex?: string | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (primaryHex) {
    const hsl = hexToHsl(primaryHex);
    if (hsl) {
      root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      const hoverL = Math.max(0, hsl.l - 6);
      root.style.setProperty("--primary-hover", `${hsl.h} ${hsl.s}% ${hoverL}%`);
      root.style.setProperty("--ring", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty("--sidebar-primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty("--sidebar-ring", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }

  if (secondaryHex) {
    const hsl = hexToHsl(secondaryHex);
    if (hsl) {
      root.style.setProperty("--secondary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }
}
