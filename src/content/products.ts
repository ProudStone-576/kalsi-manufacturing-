/**
 * Product range, as described by the company. No dimensions, hardness values or tolerances are
 * claimed here; tools are made to the customer's drawing, sample or specification.
 */
export type CategoryId = "shearing-blades" | "trimming-slitting" | "piercing-punches" | "steel-stamps";

export type Category = { id: CategoryId; name: string; blurb: string };

export const categories: Category[] = [
  { id: "shearing-blades", name: "Shearing blades", blurb: "Straight and custom-profile blades for cutting metal sheets and plates." },
  { id: "trimming-slitting", name: "Trimming & slitting cutters", blurb: "Cutters for trimming drawn parts and slitting coil into narrow strips." },
  { id: "piercing-punches", name: "Steel piercing punches", blurb: "Hardened punches for clean, accurate holes." },
  { id: "steel-stamps", name: "Steel stamps", blurb: "Stamps for marking, numbering and coding products." },
];

export type DrawingId = "shear-blade" | "trimming-cutter" | "slitting-cutter" | "punch" | "stamp";

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  summary: string;
  overview: string[];
  uses: string[];
  options: { label: string; detail: string }[];
  drawing: DrawingId;
  keywords: string[];
};

const SIZE_TO_ORDER = { label: "Size", detail: "Made to your drawing, sample or specification." };
const STEEL_GRADE = { label: "Grade", detail: "Tool steel chosen for the application." };
const built = (noun: string) =>
  `Each ${noun} is made from carefully selected tool steel, heat-treated for the right balance of hardness and toughness, then precision-ground to tight tolerances.`;

export const products: Product[] = [
  {
    slug: "shearing-blades",
    name: "Shearing blades",
    category: "shearing-blades",
    summary: "Straight and custom-profile blades for cutting metal sheets and plates cleanly and accurately.",
    overview: [
      "Our shearing blades cut metal sheets and plates cleanly and accurately, so sheets can be cut to the customised sizes needed for further work.",
      built("blade"),
    ],
    uses: ["Cutting metal sheets", "Cutting metal plates", "Cutting sheets to customised sizes"],
    options: [
      { label: "Profile", detail: "Straight, or a custom profile." },
      SIZE_TO_ORDER,
    ],
    drawing: "shear-blade",
    keywords: ["shear blade", "sheet", "plate", "straight blade", "custom profile"],
  },
  {
    slug: "trimming-cutters",
    name: "Trimming cutters",
    category: "trimming-slitting",
    summary: "Cutters that trim the extra sheet left after the draw process, leaving product corners and edges free.",
    overview: [
      "Trimming cutters remove the extra sheet left on a part after the draw process, so the product's corners and edges come out free and clean.",
      built("cutter"),
    ],
    uses: ["Trimming extra sheet after drawing", "Freeing product corners and edges"],
    options: [
      { label: "Profile", detail: "To suit the part being trimmed." },
      SIZE_TO_ORDER,
    ],
    drawing: "trimming-cutter",
    keywords: ["trimming cutter", "trim", "draw", "deep drawing", "edge", "corner"],
  },
  {
    slug: "slitting-cutters",
    name: "Slitting cutters",
    category: "trimming-slitting",
    summary: "Cutters for slitting on decoiler machines, making narrow strips with minimum burr.",
    overview: [
      "Slitting cutters are used on decoiler machines to slit material into narrow strips with minimum burr.",
      built("cutter"),
    ],
    uses: ["Slitting on decoiler machines", "Making narrow strips with minimum burr"],
    options: [
      SIZE_TO_ORDER,
      STEEL_GRADE,
    ],
    drawing: "slitting-cutter",
    keywords: ["slitting cutter", "slitter", "decoiler", "strip", "coil", "burr"],
  },
  {
    slug: "steel-piercing-punches",
    name: "Steel piercing punches",
    category: "piercing-punches",
    summary: "Hardened punches for clean, accurate holes in metal and other materials, built for repeated high-pressure use.",
    overview: [
      "Our piercing punches make clean, accurate holes in metal and other materials.",
      "They are hardened to handle repeated high-pressure use, and precision-ground to tight tolerances.",
    ],
    uses: ["Piercing holes in metal", "Piercing holes in other materials"],
    options: [
      { label: "Size & shape", detail: "Made to your drawing, sample or specification." },
      STEEL_GRADE,
    ],
    drawing: "punch",
    keywords: ["piercing punch", "punch", "hole", "press tool", "piercing"],
  },
  {
    slug: "steel-stamps",
    name: "Steel stamps",
    category: "steel-stamps",
    summary: "Durable stamps for marking, numbering and coding products, so parts can be identified and traced clearly.",
    overview: [
      "Our steel stamps mark, number and code products, so your parts can be identified and traced clearly.",
      "Each stamp is made from carefully selected tool steel and heat-treated for durability.",
    ],
    uses: ["Marking products", "Numbering parts", "Coding for identification and traceability"],
    options: [
      { label: "Marking", detail: "Characters, numbers or codes to your specification." },
      SIZE_TO_ORDER,
    ],
    drawing: "stamp",
    keywords: ["steel stamp", "marking", "numbering", "coding", "traceability", "letter punch"],
  },
];

export const productBySlug = new Map(products.map((p) => [p.slug, p]));
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export function relatedProducts(p: Product, limit = 3): Product[] {
  const same = products.filter((o) => o.slug !== p.slug && o.category === p.category);
  const rest = products.filter((o) => o.slug !== p.slug && o.category !== p.category);
  return [...same, ...rest].slice(0, limit);
}
