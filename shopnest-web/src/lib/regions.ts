// The 31 regions of Tanzania, used by the marketplace location filter and the seller profile.
export const TZ_REGIONS: string[] = [
  "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi", "Kigoma", "Kilimanjaro", "Lindi",
  "Manyara", "Mara", "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North", "Pemba South", "Pwani",
  "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga", "Unguja North", "Unguja South",
  "Zanzibar Urban/West",
];

// A saved location is "Area, Region" or just "Region". Splits it for the seller form.
export function splitLocation(loc: string): { region: string; area: string } {
  const text = (loc || "").trim();
  if (!text) return { region: "", area: "" };
  const low = text.toLowerCase();
  const hit = TZ_REGIONS.filter((r) => low.includes(r.toLowerCase())).sort((a, b) => b.length - a.length)[0];
  if (!hit) return { region: "", area: text };
  const i = low.indexOf(hit.toLowerCase());
  const rest = (text.slice(0, i) + text.slice(i + hit.length)).replace(/^[\s,;-]+|[\s,;-]+$/g, "");
  return { region: hit, area: rest };
}
export function joinLocation(region: string, area: string): string {
  const a = area.trim();
  if (!region) return a;
  return a ? a + ", " + region : region;
}
