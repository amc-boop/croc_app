import { matchIngredientLabel } from '../lib/fridge';

export interface FridgeDetection {
  ingredientIds: string[];
  /** Libellés reconnus mais absents du catalogue. */
  unknownLabels: string[];
  source: 'api' | 'demo';
}

/**
 * Reconnaissance des ingrédients à partir d'une photo du frigo.
 *
 * - Si `EXPO_PUBLIC_FRIDGE_VISION_URL` est défini, la photo (base64) est envoyée
 *   à ce backend, qui doit répondre `{ "labels": ["tomate", "oeufs", ...] }`.
 *   Ce backend appelle un modèle de vision (ex. Claude) : la clé d'API ne doit
 *   JAMAIS être embarquée dans l'app mobile.
 * - Sinon, mode démo : on renvoie une détection simulée pour tester le parcours.
 */
export async function detectFridgeIngredients(image: { base64?: string | null; mimeType?: string }): Promise<FridgeDetection> {
  const endpoint = process.env.EXPO_PUBLIC_FRIDGE_VISION_URL;
  let labels: string[];
  let source: FridgeDetection['source'];

  if (endpoint && image.base64) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: image.base64, mimeType: image.mimeType ?? 'image/jpeg' }),
    });
    if (!res.ok) throw new Error(`Analyse impossible (${res.status})`);
    const json = (await res.json()) as { labels?: string[] };
    labels = json.labels ?? [];
    source = 'api';
  } else {
    await new Promise((r) => setTimeout(r, 1200));
    labels = demoLabels();
    source = 'demo';
  }

  const ids = new Set<string>();
  const unknownLabels: string[] = [];
  for (const label of labels) {
    const ing = matchIngredientLabel(label);
    if (ing) ids.add(ing.id);
    else unknownLabels.push(label);
  }
  return { ingredientIds: [...ids], unknownLabels, source };
}

const DEMO_POOL = ['oeufs', 'tomates', 'parmesan', 'courgette', 'citron', 'lait', 'beurre', 'épinards', 'poivron', 'yaourt', 'carottes', 'champignons'];

function demoLabels(): string[] {
  const shuffled = [...DEMO_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5 + Math.floor(Math.random() * 3));
}
