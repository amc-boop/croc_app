export type Unit = 'g' | 'ml' | 'pc';

/** Nature animale d'un ingrédient, utilisée pour déduire les régimes. */
export type AnimalKind = 'meat' | 'pork' | 'fish' | 'seafood' | 'dairy' | 'egg' | 'honey';

export type Allergen =
  | 'gluten'
  | 'lactose'
  | 'oeuf'
  | 'arachide'
  | 'fruits_a_coque'
  | 'poisson'
  | 'crustaces'
  | 'soja'
  | 'sesame';

export type Diet = 'vegan' | 'vegetarien' | 'sans_porc' | 'sans_alcool';

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  unit: Unit;
  /** Taille du conditionnement vendu en magasin, dans `unit`. */
  packSize: number;
  /** Prix de référence d'un conditionnement, en euros. */
  basePrice: number;
  animal?: AnimalKind;
  allergens?: Allergen[];
  alcohol?: boolean;
  /** Ingrédient de placard (sel, poivre, huile…) : supposé déjà présent. */
  staple?: boolean;
  /** Synonymes pour la saisie manuelle et la reconnaissance photo. */
  aliases?: string[];
}

export interface RecipeIngredient {
  ingredientId: string;
  /** Quantité pour `Recipe.servings` personnes, dans l'unité de l'ingrédient. */
  qty: number;
  note?: string;
}

export interface Recipe {
  id: string;
  title: string;
  author: { handle: string; name: string; avatar: string };
  description: string;
  imageUrl: string;
  /** Vidéo courte (format vertical). Optionnelle : à défaut, l'image est animée. */
  videoUrl?: string;
  fallbackEmoji: string;
  gradient: [string, string];
  durationMin: number;
  servings: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  likes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
}

export interface PartnerStore {
  id: string;
  name: string;
  logo: string;
  color: string;
  /** Coefficient appliqué au prix de référence. */
  priceFactor: number;
  deliveryFee: number;
  freeDeliveryFrom: number;
  deliveryEta: string;
  /** Ingrédients non référencés par ce magasin. */
  unavailable: string[];
}
