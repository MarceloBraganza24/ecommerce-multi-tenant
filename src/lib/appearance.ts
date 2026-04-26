import type { StoreAppearance } from "@/types/store";

export function getAppearanceVars(appearance?: Partial<StoreAppearance>) {
  const buttonRadius = appearance?.buttonRadius || "soft";

  const radiusMap = {
    square: "0px",
    soft: "14px",
    pill: "999px",
  };

  return {
    "--primary": appearance?.primaryColor || "#111827",
    "--secondary": appearance?.secondaryColor || "#f59e0b",
    "--store-bg": appearance?.backgroundColor || "#ffffff",
    "--store-text": appearance?.textColor || "#111827",
    "--button-radius": radiusMap[buttonRadius],
  } as React.CSSProperties;
}

export function getFontClass(fontStyle?: StoreAppearance["fontStyle"]) {
  if (fontStyle === "elegant") return "fontElegant";
  if (fontStyle === "classic") return "fontClassic";
  return "fontModern";
}

export function getLayoutClass(layoutStyle?: StoreAppearance["layoutStyle"]) {
  if (layoutStyle === "sport") return "layoutSport";
  if (layoutStyle === "premium") return "layoutPremium";
  return "layoutMinimal";
}

export function parsePromoMessages(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}