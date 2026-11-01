import type { IndustryId } from "./industries";
import type { MaterialId } from "./materials";

/**
 * Product range. Blade types and their applications are standard industry categories;
 * no dimensions, hardness values or tolerances are claimed here — those are agreed per drawing.
 * Confirm the range with the company before launch (README → "Content to confirm").
 */
export type CategoryId = "plate-shearing" | "rolling-mill" | "coil-processing" | "recycling" | "paper-converting";

export type Category = { id: CategoryId; name: string; blurb: string };

export const categories: Category[] = [
  { id: "plate-shearing", name: "Plate & sheet shearing", blurb: "Straight blades for guillotine, swing-beam and section shears." },
  { id: "rolling-mill", name: "Rolling mill shears", blurb: "Hot and cold blades for crop, flying, billet and bar shears." },
  { id: "coil-processing", name: "Coil processing", blurb: "Slitter knives, spacers and cut-to-length line blades." },
  { id: "recycling", name: "Recycling & size reduction", blurb: "Scrap shear, shredder and granulator knives." },
  { id: "paper-converting", name: "Paper & converting", blurb: "Long guillotine knives for paper and board." },
];

export type DrawingId =
  | "straight-4edge"
  | "swing-beam"
  | "section"
  | "hot-crop"
  | "billet"
  | "bar"
  | "slitter"
  | "ctl"
  | "alligator"
  | "shredder"
  | "granulator"
  | "paper";

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  summary: string;
  overview: string[];
  machines: string[];
  industries: IndustryId[];
  options: { label: string; detail: string }[];
  quoteNeeds: string[];
  grades: MaterialId[];
  drawing: DrawingId;
  keywords: string[];
};

const COMMON_QUOTE_NEEDS = [
  "Drawing (PDF, DXF, DWG or STEP) or clear photos of the existing blade with a tape measure in frame",
  "Machine make, model and capacity",
  "Material being cut and its maximum thickness",
  "Quantity, including any spares",
];

export const products: Product[] = [
  {
    slug: "guillotine-shear-blades",
    name: "Guillotine shear blades",
    category: "plate-shearing",
    summary: "Straight upper and lower blades for hydraulic and mechanical guillotine plate shears.",
    overview: [
      "Guillotine blades work in pairs: a raked upper blade travels past a fixed lower blade, and the clearance between them is set for the thickness and grade being cut.",
      "Rectangular blades can be ground with cutting edges on all four corners, so a blade can be turned and flipped to bring a fresh edge into use before it needs regrinding.",
    ],
    machines: ["Hydraulic guillotine shears", "Mechanical guillotine shears", "Variable-rake shears"],
    industries: ["fabrication", "coil-processing"],
    options: [
      { label: "Cutting edges", detail: "Two or four edges, depending on section and machine." },
      { label: "Mounting", detail: "Bolt-hole pattern, counterbores and spacing to suit the blade seat." },
      { label: "Segmenting", detail: "One-piece or segmented sets for long beds." },
      { label: "Grade", detail: "Chosen for the material and thickness you shear most often." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Blade length, width and thickness, and the hole pattern"],
    grades: ["d2", "s1", "ni4"],
    drawing: "straight-4edge",
    keywords: ["plate shear", "hydraulic shear", "sheet metal", "upper blade", "lower blade", "4 edge"],
  },
  {
    slug: "swing-beam-shear-blades",
    name: "Swing-beam shear blades",
    category: "plate-shearing",
    summary: "Blades for swing-beam shears, where the upper beam pivots through an arc.",
    overview: [
      "On a swing-beam shear the upper blade moves on an arc rather than straight down, which affects how the blade seat and edge geometry are specified.",
      "Upper blades are commonly made with two cutting edges and lower blades with four, matched to the machine's seat and fixing arrangement.",
    ],
    machines: ["Hydraulic swing-beam shears"],
    industries: ["fabrication"],
    options: [
      { label: "Cutting edges", detail: "Upper and lower blade edges specified to the machine design." },
      { label: "Mounting", detail: "Hole pattern and seat profile to your drawing or sample." },
      { label: "Grade", detail: "Selected for thickness range and material." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Upper and lower blade dimensions"],
    grades: ["d2", "s1"],
    drawing: "swing-beam",
    keywords: ["swing beam", "pivot shear", "sheet metal"],
  },
  {
    slug: "section-and-angle-shear-blades",
    name: "Section & angle shear blades",
    category: "plate-shearing",
    summary: "Profiled blades for ironworkers and section shears cutting angle, flat, round and square bar.",
    overview: [
      "Section shear blades carry a profile matched to the stock they cut, such as an angle, round or square, so the section is supported and sheared cleanly without distortion.",
      "They are typically made to the machine maker's pattern or to a sample blade.",
    ],
    machines: ["Ironworkers", "Angle and section shears", "Bar cutters"],
    industries: ["fabrication", "steel-mills"],
    options: [
      { label: "Profile", detail: "Angle, round, square, flat or a custom section." },
      { label: "Sets", detail: "Fixed and moving blades supplied as matched sets." },
      { label: "Grade", detail: "Shock-resisting grades are common for heavy sections." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Section sizes the blade must cut"],
    grades: ["s1", "d2"],
    drawing: "section",
    keywords: ["ironworker", "angle cutter", "section shear", "bar cutter"],
  },
  {
    slug: "hot-crop-and-flying-shear-blades",
    name: "Hot crop & flying shear blades",
    category: "rolling-mill",
    summary: "Blades for crop and flying shears that cut hot stock on the move in rolling mills.",
    overview: [
      "Crop shears trim the head and tail of hot stock; flying shears cut the bar to length while it is still travelling. Both expose the blade to heat and impact on every cut.",
      "Hot-work grades are used because they keep their hardness at temperature and resist the cracking caused by repeated heating and cooling.",
    ],
    machines: ["Crop shears", "Flying shears", "Rotary and crank shears"],
    industries: ["steel-mills"],
    options: [
      { label: "Edge form", detail: "Straight or profiled edges to suit the shear." },
      { label: "Mounting", detail: "Slots, holes and seat faces to the mill's drawing." },
      { label: "Grade", detail: "Hot-work grades selected for stock temperature and section." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Stock temperature at the shear, if known"],
    grades: ["h13", "ni4"],
    drawing: "hot-crop",
    keywords: ["crop shear", "flying shear", "hot shear", "rolling mill", "TMT"],
  },
  {
    slug: "billet-and-bloom-shear-blades",
    name: "Billet & bloom shear blades",
    category: "rolling-mill",
    summary: "Heavy-section blades for shearing billets and blooms, hot or cold.",
    overview: [
      "Billet and bloom shears cut large square or rectangular sections, so the blades are thick, heavy and loaded hard on every stroke.",
      "Toughness through the full section matters as much as edge hardness; nickel-bearing and hot-work grades are widely used for this reason.",
    ],
    machines: ["Billet shears", "Bloom shears", "Hydraulic and mechanical heavy shears"],
    industries: ["steel-mills", "recycling"],
    options: [
      { label: "Edge form", detail: "Flat or grooved edges for the section being cut." },
      { label: "Cutting edges", detail: "Reversible designs where the machine allows." },
      { label: "Grade", detail: "Chosen for section size and cutting temperature." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Billet or bloom section size and cutting temperature"],
    grades: ["ni4", "h13"],
    drawing: "billet",
    keywords: ["billet shear", "bloom shear", "heavy shear", "steel plant"],
  },
  {
    slug: "bar-and-rebar-shear-blades",
    name: "Bar & rebar shear blades",
    category: "rolling-mill",
    summary: "Grooved and flat blades for cutting round bar, rebar and wire rod.",
    overview: [
      "Bar shear blades often carry grooves that cradle several bars at once so each one is cut squarely without flattening.",
      "They are used on mill cooling-bed shears, cold shears and stand-alone bar cutting machines.",
    ],
    machines: ["Cold shears", "Cooling-bed shears", "Bar cutting machines"],
    industries: ["steel-mills", "fabrication"],
    options: [
      { label: "Grooves", detail: "Number, pitch and radius to suit the bar diameters cut." },
      { label: "Edges", detail: "Single or multiple usable edges." },
      { label: "Grade", detail: "Hot or cold grades depending on where the shear sits." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Bar diameters and how many bars are cut per stroke"],
    grades: ["h13", "d2", "s1"],
    drawing: "bar",
    keywords: ["rebar", "TMT bar", "wire rod", "bar cutter", "cold shear"],
  },
  {
    slug: "rotary-slitter-knives",
    name: "Rotary slitter knives & spacers",
    category: "coil-processing",
    summary: "Circular slitting knives and matching spacers for coil slitting lines.",
    overview: [
      "Slitter knives are mounted in pairs on upper and lower arbors and separated by spacers; together they set the strip width and the horizontal clearance between knives.",
      "Because knives and spacers are stacked, flatness and parallelism on every piece add up across the arbor and show in the slit edge.",
    ],
    machines: ["Coil slitting lines", "Strip slitters"],
    industries: ["coil-processing"],
    options: [
      { label: "Bore & keyway", detail: "To suit the arbor diameter and key." },
      { label: "Sets", detail: "Knives with matching spacers and stripper rings." },
      { label: "Grade", detail: "Selected for coil grade and thickness." },
    ],
    quoteNeeds: [
      "Outer diameter, bore, thickness and keyway of knives and spacers",
      "Line make and arbor size",
      "Coil grades and thickness range",
      "Number of knives and spacers per set",
    ],
    grades: ["d2", "d3"],
    drawing: "slitter",
    keywords: ["slitting knife", "circular knife", "spacer", "coil slitter", "arbor"],
  },
  {
    slug: "cut-to-length-line-blades",
    name: "Cut-to-length & trimming blades",
    category: "coil-processing",
    summary: "Straight blades for cut-to-length line shears and edge-trimming shears.",
    overview: [
      "Cut-to-length lines uncoil, level and cut strip into sheets; the line shear blades work at high cycle counts, so consistent edges matter for sheet squareness.",
      "Edge-trim blades remove the coil edge before slitting or cutting to length.",
    ],
    machines: ["Cut-to-length lines", "Edge trimmers", "Flying and stop-start line shears"],
    industries: ["coil-processing"],
    options: [
      { label: "Cutting edges", detail: "Two or four edges." },
      { label: "Mounting", detail: "Hole pattern to the line's blade holder." },
      { label: "Grade", detail: "Matched to coil grade and gauge." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Line make and maximum strip width"],
    grades: ["d2", "d3"],
    drawing: "ctl",
    keywords: ["cut to length", "CTL", "trimmer", "line shear"],
  },
  {
    slug: "scrap-shear-blades",
    name: "Scrap & alligator shear blades",
    category: "recycling",
    summary: "Reversible blades for alligator shears and baler-shears processing scrap.",
    overview: [
      "Scrap shears meet mixed material with unpredictable shock loads, so blades are specified for toughness first and wear resistance second.",
      "Many designs are reversible, giving several usable edges per blade before regrinding.",
    ],
    machines: ["Alligator shears", "Baler-shears", "Container and guillotine scrap shears"],
    industries: ["recycling"],
    options: [
      { label: "Cutting edges", detail: "Reversible designs with two or four edges." },
      { label: "Mounting", detail: "Bolt pattern to suit the jaw or blade seat." },
      { label: "Grade", detail: "Shock-resisting and nickel-bearing grades are common." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Type of scrap processed"],
    grades: ["s1", "ni4"],
    drawing: "alligator",
    keywords: ["alligator shear", "crocodile shear", "baler shear", "scrap yard"],
  },
  {
    slug: "shredder-knives",
    name: "Shredder knives",
    category: "recycling",
    summary: "Hooked rotary knives and spacers for single- and multi-shaft shredders.",
    overview: [
      "Shredder knives are discs with hooks that grip and tear material as the shafts turn; spacers between them set the cutting gap.",
      "Hook count, profile and thickness are fixed by the shredder design and usually made to drawing or sample.",
    ],
    machines: ["Twin-shaft shredders", "Four-shaft shredders", "Single-shaft shredders"],
    industries: ["recycling", "plastics"],
    options: [
      { label: "Profile", detail: "Hook count and profile to the shredder design." },
      { label: "Bore", detail: "Hex, square or round bore to suit the shaft." },
      { label: "Grade", detail: "Selected for the material being shredded." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Shaft profile and knife count per shaft"],
    grades: ["d2", "s1"],
    drawing: "shredder",
    keywords: ["shredder blade", "twin shaft", "rotary knife", "hook knife"],
  },
  {
    slug: "granulator-knives",
    name: "Granulator knives",
    category: "recycling",
    summary: "Rotor and bed knives for plastic granulators.",
    overview: [
      "Granulators cut plastic between knives on a spinning rotor and stationary bed knives; the gap between them sets how cleanly material is cut and how many fines are made.",
      "Rotor knives are supplied as weight-matched sets so the rotor stays balanced.",
    ],
    machines: ["Plastic granulators", "Beside-the-press granulators", "Central granulators"],
    industries: ["plastics", "recycling"],
    options: [
      { label: "Sets", detail: "Rotor and bed knives, weight-matched." },
      { label: "Mounting", detail: "Slots or holes to the rotor and bed design." },
      { label: "Grade", detail: "Chosen for the polymers and fillers processed." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Granulator rotor width and knife count"],
    grades: ["d2", "d3"],
    drawing: "granulator",
    keywords: ["granulator blade", "rotor knife", "bed knife", "plastic regrind"],
  },
  {
    slug: "paper-guillotine-knives",
    name: "Paper guillotine knives",
    category: "paper-converting",
    summary: "Long straight knives for paper and board guillotine cutters.",
    overview: [
      "Paper guillotine knives are long and thin, so staying straight through heat treatment and grinding is the main manufacturing challenge.",
      "A hard cutting edge, often high-speed steel, on a tougher body is a common construction for long life between sharpenings.",
    ],
    machines: ["Paper guillotine cutters", "Three-knife trimmers", "Board cutters"],
    industries: ["paper-print"],
    options: [
      { label: "Construction", detail: "Solid or with a hard inlaid cutting edge." },
      { label: "Bevel", detail: "Angle chosen for the stock being cut." },
      { label: "Mounting", detail: "Slot and hole pattern to the cutter model." },
    ],
    quoteNeeds: [...COMMON_QUOTE_NEEDS, "Cutter model and knife length"],
    grades: ["hss", "d2"],
    drawing: "paper",
    keywords: ["paper cutter", "guillotine knife", "trimmer", "board"],
  },
];

export const productBySlug = new Map(products.map((p) => [p.slug, p]));
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<CategoryId, Category>;

/** Machine types across the range, for filtering. */
export const machineTypes = Array.from(new Set(products.flatMap((p) => p.machines))).sort();

export function relatedProducts(p: Product, limit = 3): Product[] {
  const score = (o: Product) =>
    (o.category === p.category ? 2 : 0) + o.industries.filter((i) => p.industries.includes(i)).length;
  return products
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, s: score(o) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ o }) => o);
}
