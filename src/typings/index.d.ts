export interface Ingredient {
  ingredient: string;
  quantity: string | null;
  unit: string | null;
  minQty: string | null;
  maxQty: string | null;
  extraInfo: string | null;
}
export declare function parse(recipeString: string): Ingredient;
export declare function combine(ingredientArray: Ingredient[]): Ingredient[];
export declare function scale(
  ingredientString: string,
  multiplier: number
): string;
// export declare function prettyPrintingPress(ingredient: Ingredient): string;
