import { getIngredient } from '../data/ingredients';
import type { Allergen, Diet, Recipe } from '../data/types';

export interface Preferences {
  diets: Diet[];
  allergens: Allergen[];
}

export const DEFAULT_PREFERENCES: Preferences = { diets: [], allergens: [] };

export const DIET_LABELS: Record<Diet, { label: string; emoji: string }> = {
  vegan: { label: 'Vegan', emoji: '🌱' },
  vegetarien: { label: 'Végétarien', emoji: '🥕' },
  sans_porc: { label: 'Sans porc', emoji: '🐖' },
  sans_alcool: { label: 'Sans alcool', emoji: '🚫🍷' },
};

export const ALLERGEN_LABELS: Record<Allergen, { label: string; emoji: string }> = {
  gluten: { label: 'Gluten', emoji: '🌾' },
  lactose: { label: 'Lactose', emoji: '🥛' },
  oeuf: { label: 'Œufs', emoji: '🥚' },
  arachide: { label: 'Arachides', emoji: '🥜' },
  fruits_a_coque: { label: 'Fruits à coque', emoji: '🌰' },
  poisson: { label: 'Poisson', emoji: '🐟' },
  crustaces: { label: 'Crustacés', emoji: '🦐' },
  soja: { label: 'Soja', emoji: '🫘' },
  sesame: { label: 'Sésame', emoji: '⚪' },
};

/** Profil nutritionnel d'une recette, déduit de ses ingrédients (jamais saisi à la main). */
export function recipeProfile(recipe: Recipe) {
  const ings = recipe.ingredients.map((ri) => getIngredient(ri.ingredientId));
  const animals = new Set(ings.map((i) => i.animal).filter(Boolean));
  const allergens = new Set<Allergen>(ings.flatMap((i) => i.allergens ?? []));
  const hasMeatOrFish =
    animals.has('meat') || animals.has('pork') || animals.has('fish') || animals.has('seafood');
  return {
    vegan: animals.size === 0,
    vegetarien: !hasMeatOrFish,
    sans_porc: !animals.has('pork'),
    sans_alcool: !ings.some((i) => i.alcohol),
    allergens,
  };
}

/** Raisons pour lesquelles une recette est exclue par les préférences (vide = compatible). */
export function incompatibilities(recipe: Recipe, prefs: Preferences): string[] {
  const p = recipeProfile(recipe);
  const reasons: string[] = [];
  for (const diet of prefs.diets) {
    if (!p[diet]) reasons.push(`Pas ${DIET_LABELS[diet].label.toLowerCase()}`);
  }
  for (const a of prefs.allergens) {
    if (p.allergens.has(a)) reasons.push(`Contient : ${ALLERGEN_LABELS[a].label.toLowerCase()}`);
  }
  return reasons;
}

export function isCompatible(recipe: Recipe, prefs: Preferences): boolean {
  return incompatibilities(recipe, prefs).length === 0;
}
