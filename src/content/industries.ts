export type IndustryId = "steel-mills" | "fabrication" | "coil-processing" | "recycling" | "plastics" | "paper-print";

export type Industry = {
  id: IndustryId;
  name: string;
  short: string;
  summary: string;
  challenges: string[];
};

export const industries: Industry[] = [
  {
    id: "steel-mills",
    name: "Steel plants & rolling mills",
    short: "Rolling mills",
    summary:
      "Hot and cold shearing of billets, blooms, bars and rebar on crop, flying and stationary shears in continuous production.",
    challenges: [
      "Blades work hot and take repeated impact, so grade choice balances hot hardness against toughness.",
      "Unplanned blade changes stop the line; consistent dimensions make changeovers predictable.",
      "Profiles and mounting details vary from mill to mill and are usually made to drawing.",
    ],
  },
  {
    id: "fabrication",
    name: "Sheet metal & plate fabrication",
    short: "Fabrication",
    summary:
      "Straight-cut blades for hydraulic and mechanical guillotine shears, swing-beam shears and ironworkers in job shops and OEM plants.",
    challenges: [
      "Cut quality depends on blade condition and the clearance set for each thickness.",
      "Four-edge blades can be rotated to use every cutting edge before regrinding.",
      "Bolt-hole pattern and length must match the machine exactly.",
    ],
  },
  {
    id: "coil-processing",
    name: "Coil processing & service centres",
    short: "Coil processing",
    summary:
      "Rotary slitter knives, spacers and cut-to-length blades for slitting lines and cut-to-length lines handling HR, CR, coated and non-ferrous coil.",
    challenges: [
      "Burr height and edge quality depend on knife flatness, parallelism and tooling set-up.",
      "Knives and spacers are used as matched sets, so tolerances stack.",
      "Different coil grades and thicknesses call for different knife grades.",
    ],
  },
  {
    id: "recycling",
    name: "Scrap & metal recycling",
    short: "Recycling",
    summary:
      "Blades for alligator shears, baler-shears and shredders processing mixed and heavy scrap.",
    challenges: [
      "Mixed scrap means unpredictable shock loads; toughness matters as much as wear resistance.",
      "Blades are often reversible so each edge can be used before regrinding.",
      "Downtime is costly, so many yards keep a spare set ready to swap.",
    ],
  },
  {
    id: "plastics",
    name: "Plastics & polymer recycling",
    short: "Plastics",
    summary:
      "Rotor and bed knives for granulators and size-reduction machines handling production scrap, film and post-consumer plastic.",
    challenges: [
      "Rotor-to-bed knife gap governs regrind quality and fines.",
      "Glass-filled and abrasive polymers wear edges quickly.",
      "Knife sets must be balanced and matched in weight on the rotor.",
    ],
  },
  {
    id: "paper-print",
    name: "Paper, print & converting",
    short: "Paper & print",
    summary: "Long guillotine knives for paper and board cutters, and straight knives for converting lines.",
    challenges: [
      "Long, thin knives must stay straight through heat treatment and grinding.",
      "A hard cutting edge on a tough body gives long service between sharpenings.",
      "Bevel angle is chosen for the stock being cut.",
    ],
  },
];

export const industryById = Object.fromEntries(industries.map((i) => [i.id, i])) as Record<IndustryId, Industry>;
