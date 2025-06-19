import { FastMCP } from "fastmcp";
import { z } from "zod";
import MiniSearch from "minisearch";
import { readFileSync } from "fs";
import { join } from "path";
import { loadTacoData } from "./loadTacoData";
import type { FoodItem } from "./types";
import { formatFoodItem } from "./formatFoodItem";

// Define the food item type

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
  description: "Search for foods in the TACO database by name or category. All food names and categories must be searched in Brazilian Portuguese, as in the original TACO database. Example: 'arroz integral', 'cereais', 'frango grelhado', etc.",
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
   Calcium: ${safeFixed(result.calcium_mg)}mg
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
    return formatFoodItem(food);
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
      filtered.map((f, i) => `${i + 1}.\n${formatFoodItem(f)}`).join("\n\n");
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
    return formatFoodItem(food);
  },
});

// Tool: Advanced search with nutrient ranges and sorting
server.addTool({
  name: "advancedFoodSearch",
  description: "Search foods with optional query, nutrient ranges, and sorting. All food names and categories must be searched in Brazilian Portuguese, as in the original TACO database. Example: 'arroz integral', 'cereais', 'frango grelhado', etc.",
  parameters: z.object({
    query: z.string().optional().describe("Search terms (optional)."),
    min_energy_kcal: z.number().optional().describe("Minimum calories."),
    max_energy_kcal: z.number().optional().describe("Maximum calories."),
    min_protein_g: z.number().optional().describe("Minimum protein."),
    max_protein_g: z.number().optional().describe("Maximum protein."),
    min_carbohydrate_g: z.number().optional().describe("Minimum carbs."),
    max_carbohydrate_g: z.number().optional().describe("Maximum carbs."),
    min_lipid_g: z.number().optional().describe("Minimum fat."),
    max_lipid_g: z.number().optional().describe("Maximum fat."),
    min_fiber_g: z.number().optional().describe("Minimum fiber."),
    max_fiber_g: z.number().optional().describe("Maximum fiber."),
    sort_by: z.enum(["energy_kcal","protein_g","carbohydrate_g","lipid_g","fiber_g"]).optional().describe("Sort by this nutrient."),
    sort_order: z.enum(["asc","desc"]).optional().default("desc").describe("Sort order."),
    limit: z.number().optional().default(10).describe("Maximum number of results to return."),
  }),
  execute: async (params) => {
    const tacoData = loadTacoData();
    let results = tacoData;
    // Filter by query if provided
    if (params.query) {
      results = results.filter(item =>
        item.description.toLowerCase().includes(params.query!.toLowerCase()) ||
        item.category.toLowerCase().includes(params.query!.toLowerCase())
      );
    }
    // Filter by nutrient ranges
    const nutrientFilters = [
      ["energy_kcal", "min_energy_kcal", "max_energy_kcal"],
      ["protein_g", "min_protein_g", "max_protein_g"],
      ["carbohydrate_g", "min_carbohydrate_g", "max_carbohydrate_g"],
      ["lipid_g", "min_lipid_g", "max_lipid_g"],
      ["fiber_g", "min_fiber_g", "max_fiber_g"],
    ];
    for (const [nutrient, minKey, maxKey] of nutrientFilters) {
      const min = params[minKey as keyof typeof params] as number|undefined;
      const max = params[maxKey as keyof typeof params] as number|undefined;
      if (min !== undefined) results = results.filter(item => item[nutrient as string] >= min);
      if (max !== undefined) results = results.filter(item => item[nutrient as string] <= max);
    }
    // Sort if requested
    if (params.sort_by) {
      results = results.sort((a, b) => {
        const valA = a[params.sort_by!];
        const valB = b[params.sort_by!];
        if (params.sort_order === "asc") return valA - valB;
        return valB - valA;
      });
    }
    // Limit
    results = results.slice(0, params.limit ?? 10);
    if (!results.length) return "No foods found for given criteria.";
    return results.map(f => formatFoodItem(f)).join("\n\n");
  },
});

// Tool: Batch search
server.addTool({
  name: "batchFoodSearch",
  description: "Perform multiple food searches in a single call. Each query can be a string or an object with advanced search parameters. All food names and categories must be searched in Brazilian Portuguese, as in the original TACO database. Example: 'arroz integral', 'cereais', 'frango grelhado', etc.",
  parameters: z.object({
    queries: z.array(z.union([
      z.string(),
      z.object({
        query: z.string().optional(),
        min_energy_kcal: z.number().optional(),
        max_energy_kcal: z.number().optional(),
        min_protein_g: z.number().optional(),
        max_protein_g: z.number().optional(),
        min_carbohydrate_g: z.number().optional(),
        max_carbohydrate_g: z.number().optional(),
        min_lipid_g: z.number().optional(),
        max_lipid_g: z.number().optional(),
        min_fiber_g: z.number().optional(),
        max_fiber_g: z.number().optional(),
        sort_by: z.enum(["energy_kcal","protein_g","carbohydrate_g","lipid_g","fiber_g"]).optional(),
        sort_order: z.enum(["asc","desc"]).optional(),
        limit: z.number().optional(),
      })
    ])).describe("Array of queries (string or advanced search object)"),
  }),
  execute: async ({ queries }) => {
    const tacoData = loadTacoData();
    // Helper to run a single search
    const runSearch = (q: any) => {
      if (typeof q === "string") {
        // Simple search by description/category
        const results = tacoData.filter(item =>
          item.description.toLowerCase().includes(q.toLowerCase()) ||
          item.category.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 10);
        if (!results.length) return `No foods found for query: ${q}`;
        return results.map(f => formatFoodItem(f)).join("\n\n");
      } else if (typeof q === "object" && q !== null) {
        // Advanced search (reuse logic from advancedFoodSearch)
        let results = tacoData;
        if (q.query) {
          results = results.filter(item =>
            item.description.toLowerCase().includes(q.query.toLowerCase()) ||
            item.category.toLowerCase().includes(q.query.toLowerCase())
          );
        }
        const nutrientFilters = [
          ["energy_kcal", "min_energy_kcal", "max_energy_kcal"],
          ["protein_g", "min_protein_g", "max_protein_g"],
          ["carbohydrate_g", "min_carbohydrate_g", "max_carbohydrate_g"],
          ["lipid_g", "min_lipid_g", "max_lipid_g"],
          ["fiber_g", "min_fiber_g", "max_fiber_g"],
        ];
        for (const [nutrient, minKey, maxKey] of nutrientFilters) {
          const min = q[minKey as string];
          const max = q[maxKey as string];
          if (min !== undefined) results = results.filter(item => item[nutrient as string] >= min);
          if (max !== undefined) results = results.filter(item => item[nutrient as string] <= max);
        }
        if (q.sort_by) {
          results = results.sort((a, b) => {
            const valA = a[q.sort_by];
            const valB = b[q.sort_by];
            if (q.sort_order === "asc") return valA - valB;
            return valB - valA;
          });
        }
        results = results.slice(0, q.limit ?? 10);
        if (!results.length) return `No foods found for query: ${JSON.stringify(q)}`;
        return results.map(f => formatFoodItem(f)).join("\n\n");
      }
      return "Invalid query format.";
    };
    // Run all queries
    return queries.map((q, i) => `Query ${i + 1}:\n${runSearch(q)}`).join("\n\n");
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
