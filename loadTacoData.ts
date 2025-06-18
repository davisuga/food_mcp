// Utility to load TACO data for tools that need the full array
import { readFileSync } from "fs";
import { join } from "path";
import type { FoodItem } from "./index";

export function loadTacoData(): FoodItem[] {
  return JSON.parse(
    readFileSync(join(__dirname, "TACO.json"), "utf-8")
  ) as FoodItem[];
}
