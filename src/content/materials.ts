/**
 * Reference: tool-steel grades commonly specified for shearing blades across the industry.
 * Descriptions are general metallurgy, not S.K. Kalsi specifications. Grade and hardness for
 * a given order are agreed against the customer's drawing and application at quotation.
 */
export type MaterialId = "d2" | "d3" | "s1" | "h13" | "ni4" | "hss";

export type Material = {
  id: MaterialId;
  name: string;
  designations: string;
  family: string;
  character: string;
  suits: string;
};

export const materials: Material[] = [
  {
    id: "d2",
    name: "D2",
    designations: "AISI D2 · DIN 1.2379 · X153CrMoV12",
    family: "High-carbon, high-chromium cold-work tool steel (about 12% Cr)",
    character: "High wear resistance with workable toughness; holds an edge well in cold cutting.",
    suits: "Cold shearing of thin to medium sheet, slitting knives, granulator knives.",
  },
  {
    id: "d3",
    name: "D3",
    designations: "AISI D3 · DIN 1.2080 · X210Cr12",
    family: "High-carbon, high-chromium cold-work tool steel",
    character: "Very high wear resistance; lower toughness than D2, so less forgiving of shock.",
    suits: "Thin material, abrasive stock and long production runs with little impact load.",
  },
  {
    id: "s1",
    name: "1.2550",
    designations: "DIN 1.2550 · 60WCrV8 (comparable to AISI S1)",
    family: "Shock-resisting tool steel",
    character: "High toughness and resistance to chipping under impact.",
    suits: "Thick plate, structural sections and scrap shearing where blades take heavy shock.",
  },
  {
    id: "h13",
    name: "H13",
    designations: "AISI H13 · DIN 1.2344 · X40CrMoV5-1",
    family: "Chromium hot-work tool steel",
    character: "Keeps its hardness at elevated temperature and resists thermal fatigue.",
    suits: "Hot shearing in rolling mills: crop, flying, billet and bar shears.",
  },
  {
    id: "ni4",
    name: "4% Ni",
    designations: "DIN 1.2767 · X45NiCrMo4",
    family: "Nickel-chromium-molybdenum tool steel",
    character: "Very high toughness with good through-hardening in heavy sections.",
    suits: "Heavy-section and hot shearing blades that must not crack under load.",
  },
  {
    id: "hss",
    name: "HSS",
    designations: "e.g. AISI M2 · DIN 1.3343",
    family: "High-speed steel, typically as a welded or inlaid cutting edge",
    character: "High hardness and edge retention; usually combined with a tougher steel body.",
    suits: "Paper and board guillotine knives and other long, thin knives.",
  },
];

export const materialById = Object.fromEntries(materials.map((m) => [m.id, m])) as Record<MaterialId, Material>;
