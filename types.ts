import * as z from "zod";


export const The120_GEnumSchema = z.enum([
    "*",
    "NA",
    ",0,02",
    "",
    "Tr",
]);
export type The120_GEnum = z.infer<typeof The120_GEnumSchema>;


export const CategorySchema = z.enum([
    "Alimentos preparados",
    "Bebidas (alcoólicas e não alcoólicas)",
    "Carnes e derivados",
    "Cereais e derivados",
    "Frutas e derivados",
    "Gorduras e óleos",
    "Leguminosas e derivados",
    "Leite e derivados",
    "Miscelâneas",
    "Nozes e sementes",
    "Outros alimentos industrializados",
    "Ovos e derivados",
    "Pescados e frutos do mar",
    "Produtos açucarados",
    "Verduras, hortaliças e derivados",
]);
export type Category = z.infer<typeof CategorySchema>;


export const ThreonineGEnumSchema = z.enum([
    "a",
    "",
]);
export type ThreonineGEnum = z.infer<typeof ThreonineGEnumSchema>;
const nullableNumber = () =>
  z.preprocess((val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (["", "NA", "*", "Tr", ",0,02"].includes(trimmed)) return null;
      const parsed = Number(trimmed.replace(",", "."));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }, z.number().nullable());

export const FoodItemSchema = z.object({
  id: z.number(),
  description: z.string(),
  category: CategorySchema,
  humidity_percents: nullableNumber(),
  energy_kcal: nullableNumber(),
  energy_kj: nullableNumber(),
  protein_g: nullableNumber(),
  lipid_g: nullableNumber(),
  cholesterol_mg: nullableNumber(),
  carbohydrate_g: nullableNumber(),
  fiber_g: nullableNumber(),
  ashes_g: nullableNumber(),
  calcium_mg: nullableNumber(),
  magnesium_mg: nullableNumber(),
  manganese_mg: nullableNumber(),
  phosphorus_mg: nullableNumber(),
  iron_mg: nullableNumber(),
  sodium_mg: nullableNumber(),
  potassium_mg: nullableNumber(),
  copper_mg: nullableNumber(),
  zinc_mg: nullableNumber(),
  retinol_mcg: nullableNumber(),
  re_mcg: nullableNumber(),
  rae_mcg: nullableNumber(),
  thiamine_mg: nullableNumber(),
  riboflavin_mg: nullableNumber(),
  pyridoxine_mg: nullableNumber(),
  niacin_mg: nullableNumber(),
  vitaminC_mg: nullableNumber(),
  saturated_g: nullableNumber(),
  monounsaturated_g: nullableNumber(),
  polyunsaturated_g: nullableNumber(),
  "12:0_g": nullableNumber(),
  "14:0_g": nullableNumber(),
  "16:0_g": nullableNumber(),
  "18:0_g": nullableNumber(),
  "20:0_g": nullableNumber(),
  "22:0_g": nullableNumber(),
  "24:0_g": nullableNumber(),
  "14:1_g": nullableNumber(),
  "16:1_g": nullableNumber(),
  "18:1_g": nullableNumber(),
  "20:1_g": nullableNumber(),
  "18:2 n-6_g": nullableNumber(),
  "18:3 n-3_g": nullableNumber(),
  "20:4_g": nullableNumber(),
  "20:5_g": nullableNumber(),
  "22:5_g": nullableNumber(),
  "22:6_g": nullableNumber(),
  "18:1t_g": nullableNumber(),
  "18:2t_g": nullableNumber(),
  tryptophan_g: nullableNumber(),
  threonine_g: nullableNumber(),
  isoleucine_g: nullableNumber(),
  leucine_g: nullableNumber(),
  lysine_g: nullableNumber(),
  methionine_g: nullableNumber(),
  cystine_g: nullableNumber(),
  phenylalanine_g: nullableNumber(),
  tyrosine_g: nullableNumber(),
  valine_g: nullableNumber(),
  arginine_g: nullableNumber(),
  histidine_g: nullableNumber(),
  alanine_g: nullableNumber(),
  aspartic_g: nullableNumber(),
  glutamic_g: nullableNumber(),
  glycine_g: nullableNumber(),
  proline_g: nullableNumber(),
  serine_g: nullableNumber(),
});
export type FoodItem = z.infer<typeof FoodItemSchema>;
