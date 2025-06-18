import { FastMCP } from "fastmcp";
import { z } from "zod";
import MiniSearch from "minisearch";
import { readFileSync } from "fs";
import { join } from "path";
import { loadTacoData } from "./loadTacoData";

// Define the food item type
export interface FoodItem {
  id: number;
  description: string;
  category: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  lipid_g: number;
  fiber_g: number;
  [key: string]: any;
}

// Initialize FastMCP server
const server = new FastMCP({
  name: "TACO Food Search",
  version: "1.0.0",
});

// Load and index food data
let miniSearch: MiniSearch<FoodItem>;

function initializeSearch() {
  try {
    // Load TACO.json
    const tacoData = JSON.parse(
      readFileSync(join(__dirname, "TACO.json"), "utf-8")
    ) as FoodItem[];

    // Initialize MiniSearch with relevant fields
    miniSearch = new MiniSearch<FoodItem>({
      fields: ["description", "category"], // Fields to index for search
      storeFields: [
        "id",
        "description",
        "category",
        "energy_kcal",
        "protein_g",
        "carbohydrate_g",
        "lipid_g",
        "fiber_g",
        "calcium_mg",
        "iron_mg",
      ], // Fields to return in results
      searchOptions: {
        boost: { description: 2 }, // Prioritize description matches
        fuzzy: 0.2, // Enable fuzzy search for typos
        prefix: true, // Enable prefix search
      },
    });

    // Index all food items
    miniSearch.addAll(tacoData);
  } catch (error) {
    throw error;
  }
}

// Initialize search on startup
initializeSearch();

// Add search tool
server.addTool({
  name: "searchFoods",
  description: "Search for foods in the TACO database by name or category",
  parameters: z.object({
    query: z
      .string()
      .describe("Search terms (e.g., 'arroz integral', 'cereais')"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return"),
  }),
  execute: async ({ query, limit }) => {
    if (!miniSearch) {
      throw new Error("Search index not initialized");
    }

    // Perform search
    const results = miniSearch.search(query);

    // Limit results
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      return "No foods found matching your search terms.";
    }

    // Format results as a readable table
    const formattedResults = limitedResults
      .map((result, index) => {
        const score = result.score.toFixed(2);
        // Helper to format numbers safely
        function safeFixed(val: any) {
          return typeof val === "number" && !isNaN(val) ? val.toFixed(1) : "N/A";
        }
        return `
${index + 1}. ${result.description}
   Category: ${result.category}
   Energy: ${safeFixed(result.energy_kcal)} kcal
   Protein: ${safeFixed(result.protein_g)}g
   Carbs: ${safeFixed(result.carbohydrate_g)}g
   Fat: ${safeFixed(result.lipid_g)}g
   Fiber: ${safeFixed(result.fiber_g)}g
   Match Score: ${score}`;
      })
      .join("\n");

    return `Found ${limitedResults.length} food(s) matching "${query}":\n${formattedResults}`;
  },
});

// Tool: Get food by ID
server.addTool({
  name: "getFoodById",
  description: "Retrieve a food item by its unique ID.",
  parameters: z.object({
    id: z.number().describe("The unique ID of the food item."),
  }),
  execute: async ({ id }) => {
    const tacoData = loadTacoData();
    const food = tacoData.find((item) => item.id === id);
    if (!food) return `No food found with ID ${id}.`;
    return `Food: ${food.description}\nCategory: ${food.category}\nEnergy: ${food.energy_kcal} kcal\nProtein: ${food.protein_g}g\nCarbs: ${food.carbohydrate_g}g\nFat: ${food.lipid_g}g\nFiber: ${food.fiber_g}g`;
  },
});

// Tool: List all categories
server.addTool({
  name: "listCategories",
  description: "List all unique food categories in the TACO database.",
  parameters: z.object({}),
  execute: async () => {
    const tacoData = loadTacoData();
    const categories = Array.from(new Set(tacoData.map((item) => item.category)));
    return `Categories:\n${categories.join("\n")}`;
  },
});

// Tool: Nutrient filter
server.addTool({
  name: "filterByNutrient",
  description:
    "Find foods with a minimum or maximum value for a specific nutrient (e.g., protein, fiber).",
  parameters: z.object({
    nutrient: z.string().describe("Nutrient field name, e.g., 'protein_g', 'fiber_g'."),
    min: z.number().optional().describe("Minimum value for the nutrient."),
    max: z.number().optional().describe("Maximum value for the nutrient."),
    limit: z.number().optional().default(10).describe("Maximum number of results to return."),
  }),
  execute: async ({ nutrient, min, max, limit }) => {
    const tacoData = loadTacoData();
    let filtered = tacoData.filter((item) => {
      const value = item[nutrient];
      if (typeof value !== "number" || isNaN(value)) return false;
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
      return true;
    });
    filtered = filtered.slice(0, limit);
    if (filtered.length === 0) return `No foods found for given nutrient filter.`;
    return `Foods matching filter on '${nutrient}':\n` +
      filtered.map((f, i) => `${i + 1}. ${f.description} (${nutrient}: ${f[nutrient]})`).join("\n");
  },
});

// Tool: Random food
server.addTool({
  name: "randomFood",
  description: "Get a random food item from the TACO database.",
  parameters: z.object({}),
  execute: async () => {
    const tacoData = loadTacoData();
    if (!tacoData.length) return "No foods in the database.";
    const idx = Math.floor(Math.random() * tacoData.length);
    const food = tacoData[idx];
    if (!food) return "No foods in the database.";
    return `Random Food: ${food.description}\nCategory: ${food.category}\nEnergy: ${food.energy_kcal} kcal\nProtein: ${food.protein_g}g\nCarbs: ${food.carbohydrate_g}g\nFat: ${food.lipid_g}g\nFiber: ${food.fiber_g}g`;
  },
});

const type = process.argv[2];
console.log("type", type);
if (!type) {
  server.start({
    transportType: "stdio",
  });
} else {
  server.start({
    transportType: "httpStream",
    httpStream: {
      endpoint: "/mcp",
      port: 3001, // Or your desired port
    },
  });
}
