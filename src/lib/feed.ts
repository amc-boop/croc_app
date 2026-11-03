import type { Recipe } from '../data/types';
import { fridgeMatch } from './fridge';
import { isCompatible, type Preferences } from './preferences';

export type FeedMode = 'pour_toi' | 'frigo';

export interface FeedOptions {
  prefs: Preferences;
  fridge: string[];
  mode: FeedMode;
  /** En mode frigo : part minimale d'ingrédients possédés pour apparaître. */
  minFridgeRatio?: number;
}

/**
 * Construit le feed : on retire d'abord tout ce qui est incompatible avec les
 * préférences (non négociable), puis on trie. En mode « frigo », on ne garde
 * que les recettes réalisables avec ce qu'on a, les plus complètes d'abord.
 */
export function buildFeed(recipes: Recipe[], opts: FeedOptions): Recipe[] {
  const compatible = recipes.filter((r) => isCompatible(r, opts.prefs));
  if (opts.mode === 'pour_toi') {
    if (opts.fridge.length === 0) return compatible;
    // Léger boost des recettes qui collent au frigo, sans casser la découverte.
    return [...compatible].sort(
      (a, b) =>
        score(b, opts.fridge) - score(a, opts.fridge),
    );
  }
  const min = opts.minFridgeRatio ?? 0.4;
  return compatible
    .map((r) => ({ r, m: fridgeMatch(r, opts.fridge) }))
    .filter(({ m }) => m.ratio >= min)
    .sort((a, b) => b.m.ratio - a.m.ratio || a.m.missing.length - b.m.missing.length)
    .map(({ r }) => r);
}

function score(r: Recipe, fridge: string[]): number {
  return Math.log10(r.likes) + fridgeMatch(r, fridge).ratio * 2;
}
