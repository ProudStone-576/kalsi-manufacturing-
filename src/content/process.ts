/**
 * Process and buyer-guidance copy. Written as the general workflow of made-to-drawing blade
 * manufacture; review against how the company actually works (README → "Content to confirm").
 */

export const ORDER_STEPS = [
  {
    title: "Send the details",
    body: "A drawing, or photos and measurements of the blade you use now, plus the machine and the material you cut.",
  },
  {
    title: "Engineering review",
    body: "We check the drawing against the application and agree grade, hardness and any open dimensions with you.",
  },
  {
    title: "Quotation",
    body: "You receive a written quotation with price, delivery time and the specification it is based on.",
  },
  {
    title: "Manufacture",
    body: "Blades are machined, heat treated and ground to the agreed drawing, then inspected before dispatch.",
  },
  {
    title: "Delivery",
    body: "Blades are protected against corrosion and edge damage and packed for transport to your site.",
  },
];

export const QUOTE_CHECKLIST = [
  "A drawing (PDF, DXF, DWG or STEP) — or clear photos of the existing blade with a tape measure in view",
  "Machine make, model and rated capacity",
  "The material you cut, and its maximum thickness or section",
  "Number of cutting edges, if you know it",
  "Quantity, including spares",
];

export const MANUFACTURING_STAGES = [
  {
    title: "Material",
    body: "Tool-steel grade is selected for the application, and the stock is checked against its material certificate before work starts.",
  },
  {
    title: "Machining",
    body: "Blanks are cut and machined close to size, with holes, slots, counterbores and profiles produced to the drawing.",
  },
  {
    title: "Heat treatment",
    body: "Hardening and tempering develop the hardness and toughness the application needs. This step decides most of a blade's working life.",
  },
  {
    title: "Grinding",
    body: "Faces and cutting edges are ground for flatness, parallelism and a sharp, square edge.",
  },
  {
    title: "Inspection",
    body: "Dimensions, hardness and edge condition are checked against the drawing before the blade is released.",
  },
  {
    title: "Marking & packing",
    body: "Blades are identified, protected against corrosion and packed so edges cannot be damaged in transit.",
  },
];

export const LIFE_FACTORS = [
  {
    title: "Grade selection",
    body: "A grade that is too hard for the shock in the job chips; one that is too soft wears and rolls its edge. The right grade sits between.",
  },
  {
    title: "Heat treatment",
    body: "The same steel can perform very differently depending on how it is hardened and tempered. Consistent heat treatment gives consistent blades.",
  },
  {
    title: "Flatness & straightness",
    body: "A blade that is not flat or straight cannot hold a constant clearance along its length, so cut quality varies across the sheet.",
  },
  {
    title: "Clearance & set-up",
    body: "Blade clearance should suit the thickness and grade being cut. Too tight overloads the edge; too loose leaves burrs and bent edges.",
  },
];

export const FAQ = [
  {
    q: "Can you make a blade without a drawing?",
    a: "Usually, yes. Clear photos of the existing blade with a tape measure in frame, its main dimensions, the hole positions and the machine make and model are often enough to prepare a drawing for your approval. For complex profiles a sample blade may be needed.",
  },
  {
    q: "How do I know when a shear blade needs regrinding?",
    a: "Common signs are a growing burr on the cut edge, a rougher or torn-looking cut face, the sheet bending at the cut, or the machine needing more force than usual. On four-edge blades, rotate to a fresh edge first.",
  },
  {
    q: "Can a blade be reground, and how many times?",
    a: "Most shear blades can be reground several times. Each regrind removes material, so the limit is set by the minimum width or height the machine can still adjust for. Keep a record of the original size and every regrind.",
  },
  {
    q: "Which steel grade should I choose?",
    a: "It depends on what you cut, how thick it is, whether it is hot or cold, and how much shock the blade takes. Tell us the application and we will recommend a grade and explain why. The materials reference on this page explains the main options.",
  },
  {
    q: "Can I request a complete set in one go?",
    a: "Yes. Add every part to one quote request — upper and lower blades, all segments of a long bed, or matched sets such as slitter knives with spacers and weight-matched granulator knives — and it is quoted as a set.",
  },
];
