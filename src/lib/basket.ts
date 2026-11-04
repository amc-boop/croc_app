import { getIngredient } from '../data/ingredients';
import type { PartnerStore, Recipe } from '../data/types';

export interface BasketEntry {
  recipeId: string;
  servings: number;
}

export interface NeededIngredient {
  ingredientId: string;
  qty: number;
  /** Recettes qui utilisent cet ingrédient. */
  recipeIds: string[];
}

export interface StoreLine {
  ingredientId: string;
  packs: number;
  unitPrice: number;
  total: number;
}

export interface StoreQuote {
  store: PartnerStore;
  lines: StoreLine[];
  unavailable: string[];
  subtotal: number;
  delivery: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Agrège les ingrédients de toutes les recettes du panier (quantités mises à
 * l'échelle du nombre de portions), en retirant ce que l'utilisateur a déjà
 * (frigo + produits de placard s'il le souhaite).
 */
export function neededIngredients(
  entries: BasketEntry[],
  recipes: Record<string, Recipe>,
  owned: string[],
  { includeStaples = false }: { includeStaples?: boolean } = {},
): NeededIngredient[] {
  const ownedSet = new Set(owned);
  const map = new Map<string, NeededIngredient>();
  for (const entry of entries) {
    const recipe = recipes[entry.recipeId];
    if (!recipe) continue;
    const factor = entry.servings / recipe.servings;
    for (const ri of recipe.ingredients) {
      const ing = getIngredient(ri.ingredientId);
      if (ownedSet.has(ing.id)) continue;
      if (ing.staple && !includeStaples) continue;
      const cur = map.get(ing.id) ?? { ingredientId: ing.id, qty: 0, recipeIds: [] };
      cur.qty += ri.qty * factor;
      if (!cur.recipeIds.includes(recipe.id)) cur.recipeIds.push(recipe.id);
      map.set(ing.id, cur);
    }
  }
  return [...map.values()].sort((a, b) =>
    getIngredient(a.ingredientId).name.localeCompare(getIngredient(b.ingredientId).name),
  );
}

export function quoteStore(store: PartnerStore, needed: NeededIngredient[]): StoreQuote {
  const lines: StoreLine[] = [];
  const unavailable: string[] = [];
  for (const n of needed) {
    if (store.unavailable.includes(n.ingredientId)) {
      unavailable.push(n.ingredientId);
      continue;
    }
    const ing = getIngredient(n.ingredientId);
    const packs = Math.max(1, Math.ceil(n.qty / ing.packSize - 1e-9));
    const unitPrice = round2(ing.basePrice * store.priceFactor);
    lines.push({ ingredientId: ing.id, packs, unitPrice, total: round2(packs * unitPrice) });
  }
  const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
  const delivery = lines.length === 0 || subtotal >= store.freeDeliveryFrom ? 0 : store.deliveryFee;
  return { store, lines, unavailable, subtotal, delivery, total: round2(subtotal + delivery) };
}

/** Classe les magasins : d'abord ceux qui ont tout, puis par prix total. */
export function compareStores(stores: PartnerStore[], needed: NeededIngredient[]): StoreQuote[] {
  return stores
    .map((s) => quoteStore(s, needed))
    .sort((a, b) => a.unavailable.length - b.unavailable.length || a.total - b.total);
}

export function formatQty(qty: number, unit: 'g' | 'ml' | 'pc'): string {
  const q = Math.round(qty * 10) / 10;
  if (unit === 'pc') return `${q}`;
  if (q >= 1000) return `${Math.round(q / 100) / 10} ${unit === 'g' ? 'kg' : 'L'}`;
  return `${q} ${unit}`;
}

export const formatPrice = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
