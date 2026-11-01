import type { StaticImageData } from "next/image";
import credits from "./image-credits.json";
import rollingMillHotBar from "../../public/images/rolling-mill-hot-bar.jpg";
import rollingMillGlow from "../../public/images/rolling-mill-glow.jpg";
import plateMillDescaler from "../../public/images/plate-mill-descaler.jpg";
import guillotineShearBlade from "../../public/images/guillotine-shear-blade.jpg";
import grindingSparks from "../../public/images/grinding-sparks.jpg";
import surfaceGrinder from "../../public/images/surface-grinder.jpg";
import heatTreatmentFurnace from "../../public/images/heat-treatment-furnace.jpg";
import fabricationCutting from "../../public/images/fabrication-cutting.jpg";
import fabricationSparks from "../../public/images/fabrication-sparks.jpg";
import steelCoils from "../../public/images/steel-coils.jpg";
import scrapShearJaw from "../../public/images/scrap-shear-jaw.jpg";
import scrapShearCut from "../../public/images/scrap-shear-cut.jpg";
import scrapYard from "../../public/images/scrap-yard.jpg";
import plasticRegrind from "../../public/images/plastic-regrind.jpg";
import paperCutter from "../../public/images/paper-cutter.jpg";
import type { CategoryId } from "./products";
import type { IndustryId } from "./industries";

/**
 * Photographs are licensed from Wikimedia Commons (see /credits). They show the industries and
 * machines our blades serve — not S.K. Kalsi's own works. Replace them with the company's own
 * photography when available (README → "Content to confirm").
 */
export type Photo = { src: StaticImageData; alt: string; credit: keyof typeof credits };

const photo = (src: StaticImageData, credit: keyof typeof credits, alt: string): Photo => ({ src, credit, alt });

export const photos = {
  rollingMillHotBar: photo(rollingMillHotBar, "rolling-mill-hot-bar", "Red-hot steel bar running through a rolling mill"),
  rollingMillGlow: photo(rollingMillGlow, "rolling-mill-glow", "Glowing steel on the roller table of a rolling mill"),
  plateMill: photo(plateMillDescaler, "plate-mill-descaler", "Hot plate passing through the descaler of a plate mill"),
  guillotineShear: photo(guillotineShearBlade, "guillotine-shear-blade", "Underside of a hydraulic guillotine shear showing the hold-downs and upper blade"),
  grindingSparks: photo(grindingSparks, "grinding-sparks", "Sparks from a grinding wheel finishing a steel part"),
  surfaceGrinder: photo(surfaceGrinder, "surface-grinder", "Surface grinding machine in a workshop"),
  furnace: photo(heatTreatmentFurnace, "heat-treatment-furnace", "Computer-controlled heat treatment furnaces"),
  fabricationCutting: photo(fabricationCutting, "fabrication-cutting", "Fabricator cutting steel sections with an angle grinder"),
  fabricationSparks: photo(fabricationSparks, "fabrication-sparks", "Fabricator cutting sheet steel in a shower of sparks"),
  steelCoils: photo(steelCoils, "steel-coils", "Rows of steel coils in a service centre warehouse"),
  scrapShearJaw: photo(scrapShearJaw, "scrap-shear-jaw", "Hydraulic scrap shear jaw biting through heavy steel"),
  scrapShearCut: photo(scrapShearCut, "scrap-shear-cut", "Scrap shear cutting through a steel tank wall"),
  scrapYard: photo(scrapYard, "scrap-yard", "Mixed scrap metal piled in a recycling yard"),
  plasticRegrind: photo(plasticRegrind, "plastic-regrind", "Granulated plastic flakes after size reduction"),
  paperCutter: photo(paperCutter, "paper-cutter", "Operator at an industrial paper guillotine cutter"),
} satisfies Record<string, Photo>;

export const categoryPhoto: Record<CategoryId, Photo> = {
  "plate-shearing": photos.guillotineShear,
  "rolling-mill": photos.rollingMillGlow,
  "coil-processing": photos.steelCoils,
  recycling: photos.scrapYard,
  "paper-converting": photos.paperCutter,
};

export const industryPhoto: Record<IndustryId, Photo> = {
  "steel-mills": photos.rollingMillHotBar,
  fabrication: photos.fabricationSparks,
  "coil-processing": photos.steelCoils,
  recycling: photos.scrapShearJaw,
  plastics: photos.plasticRegrind,
  "paper-print": photos.paperCutter,
};

export const imageCredits = credits;
