import type { StaticImageData } from "next/image";
import credits from "./image-credits.json";
import guillotineShearBlade from "../../public/images/guillotine-shear-blade.jpg";
import grindingSparks from "../../public/images/grinding-sparks.jpg";
import surfaceGrinder from "../../public/images/surface-grinder.jpg";
import heatTreatmentFurnace from "../../public/images/heat-treatment-furnace.jpg";
import fabricationCutting from "../../public/images/fabrication-cutting.jpg";
import fabricationSparks from "../../public/images/fabrication-sparks.jpg";
import steelCoils from "../../public/images/steel-coils.jpg";
import type { CategoryId } from "./products";

/**
 * Photographs are licensed from Wikimedia Commons (see /credits). They illustrate metalworking
 * in general — not S.S. Kalsi Industries' own works. Replace them with the company's own
 * photography when available (README → "Content to confirm").
 */
export type Photo = { src: StaticImageData; alt: string; credit: keyof typeof credits };

const photo = (src: StaticImageData, credit: keyof typeof credits, alt: string): Photo => ({ src, credit, alt });

export const photos = {
  guillotineShear: photo(guillotineShearBlade, "guillotine-shear-blade", "Underside of a hydraulic guillotine shear showing the hold-downs and upper blade"),
  grindingSparks: photo(grindingSparks, "grinding-sparks", "Sparks from a grinding wheel finishing a steel part"),
  surfaceGrinder: photo(surfaceGrinder, "surface-grinder", "Surface grinding machine in a workshop"),
  furnace: photo(heatTreatmentFurnace, "heat-treatment-furnace", "Computer-controlled heat treatment furnaces"),
  fabricationCutting: photo(fabricationCutting, "fabrication-cutting", "Fabricator cutting steel sections with an angle grinder"),
  fabricationSparks: photo(fabricationSparks, "fabrication-sparks", "Fabricator cutting sheet steel in a shower of sparks"),
  steelCoils: photo(steelCoils, "steel-coils", "Rows of steel coils in a service centre warehouse"),
} satisfies Record<string, Photo>;

export const categoryPhoto: Record<CategoryId, Photo> = {
  "shearing-blades": photos.guillotineShear,
  "trimming-slitting": photos.steelCoils,
  "piercing-punches": photos.fabricationSparks,
  "steel-stamps": photos.fabricationCutting,
};

export const imageCredits = credits;
