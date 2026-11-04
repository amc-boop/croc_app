import type { Ingredient } from './types';

export const INGREDIENTS: Ingredient[] = [
  // Légumes & fruits
  { id: 'tomate', name: 'Tomate', emoji: '🍅', unit: 'pc', packSize: 6, basePrice: 2.4, aliases: ['tomates'] },
  { id: 'tomate_cerise', name: 'Tomates cerises', emoji: '🍅', unit: 'g', packSize: 250, basePrice: 2.2 },
  { id: 'oignon', name: 'Oignon', emoji: '🧅', unit: 'pc', packSize: 3, basePrice: 1.2, aliases: ['oignons'] },
  { id: 'ail', name: 'Ail', emoji: '🧄', unit: 'pc', packSize: 10, basePrice: 1.5, aliases: ['gousse', "gousses d'ail"] },
  { id: 'avocat', name: 'Avocat', emoji: '🥑', unit: 'pc', packSize: 2, basePrice: 2.5, aliases: ['avocats'] },
  { id: 'citron', name: 'Citron', emoji: '🍋', unit: 'pc', packSize: 3, basePrice: 1.8, aliases: ['citrons', 'citron vert'] },
  { id: 'courgette', name: 'Courgette', emoji: '🥒', unit: 'pc', packSize: 2, basePrice: 1.9, aliases: ['courgettes'] },
  { id: 'poivron', name: 'Poivron', emoji: '🫑', unit: 'pc', packSize: 3, basePrice: 2.6, aliases: ['poivrons'] },
  { id: 'champignon', name: 'Champignons de Paris', emoji: '🍄', unit: 'g', packSize: 250, basePrice: 1.9, aliases: ['champignons'] },
  { id: 'epinard', name: 'Épinards frais', emoji: '🥬', unit: 'g', packSize: 300, basePrice: 2.3, aliases: ['epinards', 'épinards'] },
  { id: 'carotte', name: 'Carotte', emoji: '🥕', unit: 'pc', packSize: 6, basePrice: 1.4, aliases: ['carottes'] },
  { id: 'pomme_de_terre', name: 'Pomme de terre', emoji: '🥔', unit: 'g', packSize: 1000, basePrice: 1.9, aliases: ['pommes de terre', 'patate'] },
  { id: 'basilic', name: 'Basilic frais', emoji: '🌿', unit: 'g', packSize: 30, basePrice: 1.5, aliases: ['basilic'] },
  { id: 'coriandre', name: 'Coriandre fraîche', emoji: '🌿', unit: 'g', packSize: 30, basePrice: 1.5, aliases: ['coriandre'] },
  { id: 'gingembre', name: 'Gingembre', emoji: '🫚', unit: 'g', packSize: 100, basePrice: 1.3 },
  { id: 'banane', name: 'Banane', emoji: '🍌', unit: 'pc', packSize: 5, basePrice: 1.9, aliases: ['bananes'] },
  { id: 'fruits_rouges', name: 'Fruits rouges', emoji: '🫐', unit: 'g', packSize: 250, basePrice: 3.5, aliases: ['myrtilles', 'framboises'] },
  { id: 'lait_coco', name: 'Lait de coco', emoji: '🥥', unit: 'ml', packSize: 400, basePrice: 1.9 },

  // Féculents & épicerie
  { id: 'pates', name: 'Spaghetti', emoji: '🍝', unit: 'g', packSize: 500, basePrice: 1.3, allergens: ['gluten'], aliases: ['pâtes', 'pates', 'spaghettis'] },
  { id: 'riz', name: 'Riz basmati', emoji: '🍚', unit: 'g', packSize: 1000, basePrice: 2.6, aliases: ['riz'] },
  { id: 'riz_arborio', name: 'Riz arborio', emoji: '🍚', unit: 'g', packSize: 500, basePrice: 2.4, aliases: ['riz risotto'] },
  { id: 'nouilles_riz', name: 'Nouilles de riz', emoji: '🍜', unit: 'g', packSize: 250, basePrice: 2.1 },
  { id: 'pain', name: 'Pain de campagne', emoji: '🍞', unit: 'pc', packSize: 1, basePrice: 2.5, allergens: ['gluten'], aliases: ['pain'] },
  { id: 'farine', name: 'Farine de blé', emoji: '🌾', unit: 'g', packSize: 1000, basePrice: 1.1, allergens: ['gluten'], aliases: ['farine'] },
  { id: 'pois_chiches', name: 'Pois chiches', emoji: '🫘', unit: 'g', packSize: 400, basePrice: 1.2 },
  { id: 'lentilles_corail', name: 'Lentilles corail', emoji: '🫘', unit: 'g', packSize: 500, basePrice: 2.2, aliases: ['lentilles'] },
  { id: 'tomates_concassees', name: 'Tomates concassées', emoji: '🥫', unit: 'g', packSize: 400, basePrice: 1.1 },
  { id: 'cacahuetes', name: 'Cacahuètes', emoji: '🥜', unit: 'g', packSize: 200, basePrice: 1.8, allergens: ['arachide'], aliases: ['arachides'] },
  { id: 'sauce_soja', name: 'Sauce soja', emoji: '🥢', unit: 'ml', packSize: 250, basePrice: 2.3, allergens: ['soja', 'gluten'] },
  { id: 'tahini', name: 'Tahini', emoji: '🥣', unit: 'g', packSize: 250, basePrice: 3.9, allergens: ['sesame'], aliases: ['crème de sésame'] },
  { id: 'chocolat', name: 'Chocolat noir', emoji: '🍫', unit: 'g', packSize: 200, basePrice: 2.4, aliases: ['chocolat'] },
  { id: 'sucre', name: 'Sucre', emoji: '🧂', unit: 'g', packSize: 1000, basePrice: 1.2, staple: true },
  { id: 'curry', name: 'Pâte de curry rouge', emoji: '🌶️', unit: 'g', packSize: 100, basePrice: 2.5, allergens: ['crustaces'] },
  { id: 'cumin', name: 'Cumin', emoji: '🧂', unit: 'g', packSize: 40, basePrice: 1.6, staple: true },
  { id: 'huile_olive', name: "Huile d'olive", emoji: '🫒', unit: 'ml', packSize: 500, basePrice: 5.5, staple: true, aliases: ['huile'] },
  { id: 'sel', name: 'Sel', emoji: '🧂', unit: 'g', packSize: 500, basePrice: 0.6, staple: true },
  { id: 'poivre', name: 'Poivre', emoji: '🧂', unit: 'g', packSize: 50, basePrice: 2.1, staple: true },
  { id: 'bouillon', name: 'Bouillon de légumes', emoji: '🥣', unit: 'ml', packSize: 1000, basePrice: 1.8 },
  { id: 'tofu', name: 'Tofu ferme', emoji: '⬜', unit: 'g', packSize: 400, basePrice: 2.9, allergens: ['soja'] },

  // Produits animaux
  { id: 'oeuf', name: 'Œuf', emoji: '🥚', unit: 'pc', packSize: 6, basePrice: 2.2, animal: 'egg', allergens: ['oeuf'], aliases: ['oeufs', 'œufs'] },
  { id: 'beurre', name: 'Beurre', emoji: '🧈', unit: 'g', packSize: 250, basePrice: 2.6, animal: 'dairy', allergens: ['lactose'] },
  { id: 'creme', name: 'Crème fraîche', emoji: '🥛', unit: 'ml', packSize: 200, basePrice: 1.6, animal: 'dairy', allergens: ['lactose'], aliases: ['crème'] },
  { id: 'lait', name: 'Lait', emoji: '🥛', unit: 'ml', packSize: 1000, basePrice: 1.1, animal: 'dairy', allergens: ['lactose'] },
  { id: 'parmesan', name: 'Parmesan', emoji: '🧀', unit: 'g', packSize: 150, basePrice: 3.9, animal: 'dairy', allergens: ['lactose'], aliases: ['fromage'] },
  { id: 'mozzarella', name: 'Burrata', emoji: '🧀', unit: 'pc', packSize: 1, basePrice: 2.9, animal: 'dairy', allergens: ['lactose'], aliases: ['burrata', 'mozzarella'] },
  { id: 'feta', name: 'Feta', emoji: '🧀', unit: 'g', packSize: 200, basePrice: 2.7, animal: 'dairy', allergens: ['lactose'] },
  { id: 'yaourt_grec', name: 'Yaourt grec', emoji: '🥛', unit: 'g', packSize: 500, basePrice: 2.5, animal: 'dairy', allergens: ['lactose'], aliases: ['yaourt'] },
  { id: 'miel', name: 'Miel', emoji: '🍯', unit: 'g', packSize: 250, basePrice: 4.2, animal: 'honey' },
  { id: 'poulet', name: 'Blanc de poulet', emoji: '🍗', unit: 'g', packSize: 400, basePrice: 5.9, animal: 'meat', aliases: ['poulet'] },
  { id: 'boeuf_hache', name: 'Bœuf haché', emoji: '🥩', unit: 'g', packSize: 350, basePrice: 4.9, animal: 'meat', aliases: ['steak haché', 'boeuf'] },
  { id: 'lardons', name: 'Lardons', emoji: '🥓', unit: 'g', packSize: 200, basePrice: 2.4, animal: 'pork', aliases: ['bacon'] },
  { id: 'guanciale', name: 'Guanciale', emoji: '🥓', unit: 'g', packSize: 150, basePrice: 4.5, animal: 'pork' },
  { id: 'saumon', name: 'Pavé de saumon', emoji: '🐟', unit: 'g', packSize: 250, basePrice: 6.9, animal: 'fish', allergens: ['poisson'], aliases: ['saumon'] },
  { id: 'crevettes', name: 'Crevettes', emoji: '🦐', unit: 'g', packSize: 200, basePrice: 5.4, animal: 'seafood', allergens: ['crustaces'] },

  // Alcool
  { id: 'vin_blanc', name: 'Vin blanc sec', emoji: '🍷', unit: 'ml', packSize: 750, basePrice: 5.5, alcohol: true, aliases: ['vin'] },
  { id: 'rhum', name: 'Rhum ambré', emoji: '🥃', unit: 'ml', packSize: 350, basePrice: 11.9, alcohol: true },
];

export const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

export function getIngredient(id: string): Ingredient {
  const ing = INGREDIENT_BY_ID[id];
  if (!ing) throw new Error(`Ingrédient inconnu : ${id}`);
  return ing;
}
