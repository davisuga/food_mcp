# TACO MCP

A fast, extensible Model Context Protocol (MCP) server for searching and analyzing foods from the Brazilian TACO food composition database. Built with Bun, FastMCP, and MiniSearch for instant, flexible food queries and nutrient analysis.

## Features

- 🔍 **Full-text food search** by name or category
- 🥗 **Get food by ID** with all nutritional details
- 📋 **List all food categories**
- 🧮 **Filter foods by any nutrient** (e.g., protein, fiber, fat, calories)
- 🎲 **Get a random food**
- 🧑‍🔬 **Advanced search**: filter by nutrient ranges, sort by any nutrient, query optional
- 🧑‍🤝‍🧑 **Batch search**: run multiple queries (simple or advanced) in one call
- 📦 **Consistent, readable output** for all food items (omits nulls)

## Installation

```bash
bun install
```

## Running

```bash
bun run index.ts
```

By default, the server runs in stdio mode. To run as an httpStream/sse server:

```bash
bun run index.ts http
```

## Tools & API

### 1. `searchFoods`
Search foods by name or category.

**Parameters:**
- `query` (string): Search terms (e.g., "arroz integral", "cereais")
- `limit` (number, optional): Max results (default: 10)

### 2. `getFoodById`
Get a food item by its unique ID.

**Parameters:**
- `id` (number): Food ID

### 3. `listCategories`
List all unique food categories in the TACO database.

### 4. `filterByNutrient`
Find foods with a minimum or maximum value for a specific nutrient.

**Parameters:**
- `nutrient` (string): Nutrient field (e.g., `protein_g`, `fiber_g`)
- `min` (number, optional): Minimum value
- `max` (number, optional): Maximum value
- `limit` (number, optional): Max results (default: 10)

### 5. `randomFood`
Get a random food item from the database.

### 6. `advancedFoodSearch`
Search foods with optional query, nutrient ranges, and sorting.

**Parameters:**
- `query` (string, optional): Search terms
- `min_*/max_*` (number, optional): Min/max for any of `energy_kcal`, `protein_g`, `carbohydrate_g`, `lipid_g`, `fiber_g`
- `sort_by` (string, optional): Nutrient to sort by
- `sort_order` (string, optional): `asc` or `desc` (default: `desc`)
- `limit` (number, optional): Max results (default: 10)

### 7. `batchFoodSearch`
Run multiple food searches in a single call. Each query can be a string or an advanced search object.

**Parameters:**
- `queries` (array): Array of queries (string or advanced search object)

## Example Output

```
ID: 1
Description: Arroz, integral, cozido
Category: Cereais e derivados
Energy (kcal): 123.53
Protein (g): 2.59
Carbohydrate (g): 25.81
Fat (g): 1.00
Fiber (g): 2.75
Calcium (mg): 5.20
Iron (mg): 0.26
...etc
```

*Only non-null fields are shown for each food item.*

## Data Source
- [TACO - Tabela Brasileira de Composição de Alimentos](https://www.cfn.org.br/wp-content/uploads/2017/03/taco_4_edicao_ampliada_e_revisada.pdf)

## License
MIT
