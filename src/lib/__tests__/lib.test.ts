import { describe, expect, it } from 'vitest';
import { INGREDIENTS } from '../../data/ingredients';
import { RECIPES, RECIPE_BY_ID } from '../../data/recipes';
import { PARTNER_STORES } from '../../data/stores';
import { compareStores, neededIngredients, quoteStore } from '../basket';
import { buildFeed } from '../feed';
import { fridgeMatch, matchIngredientLabel, searchIngredients } from '../fridge';
import { incompatibilities, isCompatible, recipeProfile } from '../preferences';

describe('données de démo', () => {
  it('toutes les recettes référencent des ingrédients connus', () => {
    const ids = new Set(INGREDIENTS.map((i) => i.id));
    for (const r of RECIPES) for (const ri of r.ingredients) expect(ids.has(ri.ingredientId), `${r.id}/${ri.ingredientId}`).toBe(true);
  });
  it('les indisponibilités magasins référencent des ingrédients connus', () => {
    const ids = new Set(INGREDIENTS.map((i) => i.id));
    for (const s of PARTNER_STORES) for (const id of s.unavailable) expect(ids.has(id), `${s.id}/${id}`).toBe(true);
  });
});

describe('préférences', () => {
  it('déduit les régimes des ingrédients', () => {
    expect(recipeProfile(RECIPE_BY_ID.buddha_bowl).vegan).toBe(true);
    expect(recipeProfile(RECIPE_BY_ID.shakshuka).vegan).toBe(false);
    expect(recipeProfile(RECIPE_BY_ID.shakshuka).vegetarien).toBe(true);
    expect(recipeProfile(RECIPE_BY_ID.carbonara).sans_porc).toBe(false);
    expect(recipeProfile(RECIPE_BY_ID.risotto_champignons).sans_alcool).toBe(false);
  });
  it('exclut les allergènes', () => {
    const prefs = { diets: [], allergens: ['arachide' as const] };
    expect(isCompatible(RECIPE_BY_ID.pad_thai, prefs)).toBe(false);
    expect(isCompatible(RECIPE_BY_ID.buddha_bowl, prefs)).toBe(true);
    expect(incompatibilities(RECIPE_BY_ID.pad_thai, prefs)).toEqual(['Contient : arachides']);
  });
  it('vegan + sans gluten ne laisse que des recettes conformes', () => {
    const feed = buildFeed(RECIPES, { prefs: { diets: ['vegan'], allergens: ['gluten'] }, fridge: [], mode: 'pour_toi' });
    expect(feed.map((r) => r.id).sort()).toEqual(['buddha_bowl', 'curry_lentilles']);
  });
});

describe('frigo', () => {
  it('recherche tolérante aux accents et synonymes', () => {
    expect(searchIngredients('oeufs')[0].id).toBe('oeuf');
    expect(searchIngredients('epinards')[0].id).toBe('epinard');
    expect(matchIngredientLabel('Tomates')?.id).toBe('tomate');
  });
  it('ignore les produits de placard dans le calcul', () => {
    const m = fridgeMatch(RECIPE_BY_ID.carbonara, ['pates', 'oeuf']);
    expect(m.have).toEqual(['pates', 'oeuf']);
    expect(m.missing).toEqual(['guanciale', 'parmesan']);
    expect(m.ratio).toBe(0.5);
  });
  it('le mode frigo trie par complétude', () => {
    const feed = buildFeed(RECIPES, {
      prefs: { diets: [], allergens: [] },
      fridge: ['pates', 'oeuf', 'parmesan', 'guanciale'],
      mode: 'frigo',
    });
    expect(feed[0].id).toBe('carbonara');
  });
});

describe('panier', () => {
  it('agrège et met à l’échelle les quantités', () => {
    const needed = neededIngredients(
      [
        { recipeId: 'carbonara', servings: 4 },
        { recipeId: 'shakshuka', servings: 2 },
      ],
      RECIPE_BY_ID,
      [],
    );
    const oeuf = needed.find((n) => n.ingredientId === 'oeuf')!;
    expect(oeuf.qty).toBe(10); // 3×2 + 4
    expect(oeuf.recipeIds).toEqual(['carbonara', 'shakshuka']);
    expect(needed.find((n) => n.ingredientId === 'sel')).toBeUndefined();
  });
  it('retire ce que j’ai déjà au frigo', () => {
    const needed = neededIngredients([{ recipeId: 'carbonara', servings: 2 }], RECIPE_BY_ID, ['oeuf', 'pates']);
    expect(needed.map((n) => n.ingredientId)).toEqual(['guanciale', 'parmesan']);
  });
  it('calcule les conditionnements et la livraison', () => {
    const needed = [{ ingredientId: 'oeuf', qty: 10, recipeIds: [] }];
    const q = quoteStore(PARTNER_STORES[0], needed);
    expect(q.lines[0].packs).toBe(2);
    expect(q.subtotal).toBe(4.4);
    expect(q.delivery).toBe(3.99);
  });
  it('classe en premier les magasins qui ont tout', () => {
    const needed = neededIngredients([{ recipeId: 'carbonara', servings: 2 }], RECIPE_BY_ID, []);
    const quotes = compareStores(PARTNER_STORES, needed);
    expect(quotes[0].unavailable).toEqual([]);
    expect(quotes[0].store.id).toBe('bio_panier');
  });
});
