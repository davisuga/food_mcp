import type { FoodItem } from "./types";

const FIELD_LABELS: Record<string, string> = {
  id: "ID",
  description: "Description",
  category: "Category",
  humidity_percents: "Humidity (%)",
  energy_kcal: "Energy (kcal)",
  energy_kj: "Energy (kJ)",
  protein_g: "Protein (g)",
  lipid_g: "Fat (g)",
  cholesterol_mg: "Cholesterol (mg)",
  carbohydrate_g: "Carbohydrate (g)",
  fiber_g: "Fiber (g)",
  ashes_g: "Ashes (g)",
  calcium_mg: "Calcium (mg)",
  magnesium_mg: "Magnesium (mg)",
  manganese_mg: "Manganese (mg)",
  phosphorus_mg: "Phosphorus (mg)",
  iron_mg: "Iron (mg)",
  sodium_mg: "Sodium (mg)",
  potassium_mg: "Potassium (mg)",
  copper_mg: "Copper (mg)",
  zinc_mg: "Zinc (mg)",
  retinol_mcg: "Retinol (mcg)",
  re_mcg: "RE (mcg)",
  rae_mcg: "RAE (mcg)",
  thiamine_mg: "Thiamine (mg)",
  riboflavin_mg: "Riboflavin (mg)",
  pyridoxine_mg: "Pyridoxine (mg)",
  niacin_mg: "Niacin (mg)",
  vitaminC_mg: "Vitamin C (mg)",
  saturated_g: "Saturated Fat (g)",
  monounsaturated_g: "Monounsaturated Fat (g)",
  polyunsaturated_g: "Polyunsaturated Fat (g)",
  // ...other fields can be added as needed...
};

export function formatFoodItem(food: FoodItem): string {
  return Object.entries(food)
    .filter(([_, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] || k;
      if (typeof v === "number") {
        return `${label}: ${v.toFixed(2)}`;
      }
      return `${label}: ${v}`;
    })
    .join("\n");
}
