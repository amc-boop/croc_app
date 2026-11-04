import { getIngredient, INGREDIENTS } from '../data/ingredients';
import type { Ingredient, Recipe } from '../data/types';

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .trim();
}

/** Recherche d'ingrédients pour la saisie manuelle (nom + synonymes). */
export function searchIngredients(query: string, limit = 8): Ingredient[] {
  const q = normalize(query);
  if (!q) return [];
  const scored = INGREDIENTS.map((ing) => {
    const names = [ing.name, ...(ing.aliases ?? [])].map(normalize);
    const score = names.some((n) => n === q)
      ? 3
      : names.some((n) => n.startsWith(q))
        ? 2
        : names.some((n) => n.includes(q))
          ? 1
          : 0;
    return { ing, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || a.ing.name.localeCompare(b.ing.name));
  return scored.slice(0, limit).map((x) => x.ing);
}

/** Associe un libellé libre (ex. renvoyé par la reconnaissance photo) à un ingrédient du catalogue. */
export function matchIngredientLabel(label: string): Ingredient | undefined {
  return searchIngredients(label, 1)[0];
}

export interface FridgeMatch {
  /** Ingrédients (hors placard) que l'utilisateur possède. */
  have: string[];
  /** Ingrédients (hors placard) à acheter. */
  missing: string[];
  /** Part des ingrédients possédés, de 0 à 1. */
  ratio: number;
}

export function fridgeMatch(recipe: Recipe, fridge: string[]): FridgeMatch {
  const owned = new Set(fridge);
  const relevant = recipe.ingredients
    .map((ri) => ri.ingredientId)
    .filter((id) => !getIngredient(id).staple);
  const have = relevant.filter((id) => owned.has(id));
  const missing = relevant.filter((id) => !owned.has(id));
  return { have, missing, ratio: relevant.length ? have.length / relevant.length : 1 };
}
