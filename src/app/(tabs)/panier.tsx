import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Stepper } from '../../components/Stepper';
import { getIngredient } from '../../data/ingredients';
import { RECIPE_BY_ID } from '../../data/recipes';
import { PARTNER_STORES } from '../../data/stores';
import { compareStores, formatPrice, formatQty, neededIngredients } from '../../lib/basket';
import { useAppState } from '../../state/AppState';
import { colors, radius } from '../../theme';

export default function BasketScreen() {
  const { state, dispatch } = useAppState();
  const [useFridge, setUseFridge] = useState(true);
  const [includeStaples, setIncludeStaples] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [ordered, setOrdered] = useState<{ store: string; total: number; eta: string } | null>(null);

  const needed = useMemo(
    () => neededIngredients(state.basket, RECIPE_BY_ID, useFridge ? state.fridge : [], { includeStaples }),
    [state.basket, state.fridge, useFridge, includeStaples],
  );
  const quotes = useMemo(() => compareStores(PARTNER_STORES, needed), [needed]);
  const selected = quotes.find((q) => q.store.id === storeId) ?? quotes[0];

  if (ordered) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={styles.bigTitle}>Commande envoyée !</Text>
        <Text style={styles.dim}>
          {ordered.store} · {formatPrice(ordered.total)} · {ordered.eta}
        </Text>
        <Text style={[styles.dim, { marginTop: 12, textAlign: 'center' }]}>
          (Démo : aucune commande réelle n’a été passée.)
        </Text>
        <Button
          title="Retour au feed"
          style={{ marginTop: 24, alignSelf: 'stretch' }}
          onPress={() => {
            setOrdered(null);
            router.push('/');
          }}
        />
      </View>
    );
  }

  if (state.basket.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={styles.bigTitle}>Ton panier est vide</Text>
        <Text style={[styles.dim, { textAlign: 'center' }]}>
          Ajoute une recette depuis le feed : on calcule les ingrédients et on compare les prix chez nos magasins partenaires.
        </Text>
        <Button title="Découvrir des recettes" style={{ marginTop: 24, alignSelf: 'stretch' }} onPress={() => router.push('/')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h2}>Mes recettes</Text>
        {state.basket.map((b) => {
          const r = RECIPE_BY_ID[b.recipeId];
          if (!r) return null;
          return (
            <View key={b.recipeId} style={styles.card}>
              <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}>
                <Text style={styles.cardTitle}>
                  {r.fallbackEmoji} {r.title}
                </Text>
              </Pressable>
              <View style={styles.cardRow}>
                <Stepper value={b.servings} onChange={(v) => dispatch({ type: 'setServings', recipeId: r.id, servings: v })} suffix="pers." />
                <Pressable onPress={() => dispatch({ type: 'removeFromBasket', recipeId: r.id })} hitSlop={10}>
                  <Text style={{ color: colors.danger, fontWeight: '700' }}>Retirer</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.toggles}>
          <Toggle
            label="Déduire ce que j’ai au frigo"
            hint={state.fridge.length ? `${state.fridge.length} ingrédient(s) enregistrés` : 'Ton frigo est vide'}
            value={useFridge}
            onChange={setUseFridge}
          />
          <Toggle label="Ajouter les produits de placard" hint="Sel, poivre, huile, épices, sucre…" value={includeStaples} onChange={setIncludeStaples} />
        </View>

        <Text style={[styles.h2, { marginTop: 8 }]}>Liste de courses · {needed.length}</Text>
        {needed.length === 0 ? (
          <Text style={styles.dim}>Tu as déjà tout ce qu’il faut. Bon appétit ! 🍽️</Text>
        ) : (
          <View style={styles.listCard}>
            {needed.map((n) => {
              const ing = getIngredient(n.ingredientId);
              const line = selected?.lines.find((l) => l.ingredientId === n.ingredientId);
              const missing = selected?.unavailable.includes(n.ingredientId);
              return (
                <View key={n.ingredientId} style={styles.line}>
                  <Text style={{ fontSize: 20, width: 28 }}>{ing.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineName}>{ing.name}</Text>
                    <Text style={styles.lineSub}>
                      Besoin : {formatQty(n.qty, ing.unit)}
                      {line ? ` · ${line.packs} × ${formatQty(ing.packSize, ing.unit)}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.linePrice, missing && { color: colors.danger }]}>
                    {missing ? 'Indispo.' : line ? formatPrice(line.total) : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {needed.length > 0 && (
          <>
            <Text style={[styles.h2, { marginTop: 24 }]}>Comparer les magasins</Text>
            {quotes.map((q, i) => {
              const isSel = q.store.id === selected?.store.id;
              return (
                <Pressable key={q.store.id} onPress={() => setStoreId(q.store.id)} style={[styles.store, isSel && { borderColor: colors.primary }]}>
                  <Text style={{ fontSize: 26 }}>{q.store.logo}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storeName}>
                      {q.store.name}
                      {i === 0 && q.unavailable.length === 0 ? '  ⭐ Meilleure offre' : ''}
                    </Text>
                    <Text style={styles.lineSub}>
                      {q.store.deliveryEta} · {q.delivery === 0 ? 'livraison offerte' : `livraison ${formatPrice(q.delivery)}`}
                    </Text>
                    {q.unavailable.length > 0 && (
                      <Text style={[styles.lineSub, { color: colors.warning }]}>
                        Manque : {q.unavailable.map((id) => getIngredient(id).name).join(', ')}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.storeTotal}>{formatPrice(q.total)}</Text>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>

      {needed.length > 0 && selected && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.dim}>Sous-total {formatPrice(selected.subtotal)} + livraison {formatPrice(selected.delivery)}</Text>
            <Text style={styles.footerTotal}>{formatPrice(selected.total)}</Text>
          </View>
          <Button
            title={`Commander chez ${selected.store.name}`}
            onPress={() => {
              setOrdered({ store: selected.store.name, total: selected.total, eta: selected.store.deliveryEta });
              dispatch({ type: 'clearBasket' });
            }}
          />
        </View>
      )}
    </View>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <View style={{ flex: 1 }}>
        <Text style={styles.lineName}>{label}</Text>
        <Text style={styles.lineSub}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.surface2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 200 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bigTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  dim: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  h2: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, gap: 10 },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggles: { backgroundColor: colors.surface, borderRadius: radius.md, marginVertical: 14 },
  toggle: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  listCard: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  lineName: { color: colors.text, fontWeight: '600', fontSize: 15 },
  lineSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  linePrice: { color: colors.text, fontWeight: '700' },
  store: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  storeName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  storeTotal: { color: colors.text, fontWeight: '900', fontSize: 17 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, gap: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTotal: { color: colors.text, fontSize: 20, fontWeight: '900' },
});
