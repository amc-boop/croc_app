import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { BasketEntry } from '../lib/basket';
import { DEFAULT_PREFERENCES, type Preferences } from '../lib/preferences';
import type { Allergen, Diet } from '../data/types';

interface State {
  hydrated: boolean;
  prefs: Preferences;
  fridge: string[];
  basket: BasketEntry[];
  liked: string[];
  saved: string[];
}

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'toggleDiet'; diet: Diet }
  | { type: 'toggleAllergen'; allergen: Allergen }
  | { type: 'addFridge'; ids: string[] }
  | { type: 'removeFridge'; id: string }
  | { type: 'clearFridge' }
  | { type: 'addToBasket'; recipeId: string; servings: number }
  | { type: 'setServings'; recipeId: string; servings: number }
  | { type: 'removeFromBasket'; recipeId: string }
  | { type: 'clearBasket' }
  | { type: 'toggleLike'; recipeId: string }
  | { type: 'toggleSave'; recipeId: string };

const initial: State = { hydrated: false, prefs: DEFAULT_PREFERENCES, fridge: [], basket: [], liked: [], saved: [] };

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate':
      return { ...s, ...a.state, hydrated: true };
    case 'toggleDiet': {
      let diets = toggle(s.prefs.diets, a.diet);
      // Vegan implique végétarien et sans porc : on évite les doublons visuels.
      if (a.diet === 'vegan' && diets.includes('vegan')) diets = diets.filter((d) => d !== 'vegetarien');
      return { ...s, prefs: { ...s.prefs, diets } };
    }
    case 'toggleAllergen':
      return { ...s, prefs: { ...s.prefs, allergens: toggle(s.prefs.allergens, a.allergen) } };
    case 'addFridge':
      return { ...s, fridge: [...new Set([...s.fridge, ...a.ids])] };
    case 'removeFridge':
      return { ...s, fridge: s.fridge.filter((id) => id !== a.id) };
    case 'clearFridge':
      return { ...s, fridge: [] };
    case 'addToBasket': {
      const exists = s.basket.some((b) => b.recipeId === a.recipeId);
      return {
        ...s,
        basket: exists
          ? s.basket.map((b) => (b.recipeId === a.recipeId ? { ...b, servings: a.servings } : b))
          : [...s.basket, { recipeId: a.recipeId, servings: a.servings }],
      };
    }
    case 'setServings':
      return {
        ...s,
        basket: s.basket.map((b) => (b.recipeId === a.recipeId ? { ...b, servings: Math.max(1, a.servings) } : b)),
      };
    case 'removeFromBasket':
      return { ...s, basket: s.basket.filter((b) => b.recipeId !== a.recipeId) };
    case 'clearBasket':
      return { ...s, basket: [] };
    case 'toggleLike':
      return { ...s, liked: toggle(s.liked, a.recipeId) };
    case 'toggleSave':
      return { ...s, saved: toggle(s.saved, a.recipeId) };
  }
}

const STORAGE_KEY = 'croc:state:v1';

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', state: raw ? JSON.parse(raw) : {} }))
      .catch(() => dispatch({ type: 'hydrate', state: {} }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState doit être utilisé dans <AppStateProvider>');
  return ctx;
}

export function useInBasket(recipeId: string) {
  const { state } = useAppState();
  return state.basket.some((b) => b.recipeId === recipeId);
}

export function useBasketCount() {
  const { state } = useAppState();
  return state.basket.length;
}

export function useDispatch() {
  const { dispatch } = useAppState();
  return useCallback((a: Action) => dispatch(a), [dispatch]);
}
