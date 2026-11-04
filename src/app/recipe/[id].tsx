import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { RecipeMedia } from '../../components/RecipeMedia';
import { Stepper } from '../../components/Stepper';
import { getIngredient } from '../../data/ingredients';
import { RECIPE_BY_ID } from '../../data/recipes';
import { formatQty } from '../../lib/basket';
import { incompatibilities } from '../../lib/preferences';
import { useAppState } from '../../state/AppState';
import { colors, radius } from '../../theme';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = RECIPE_BY_ID[id ?? ''];
  const { state, dispatch } = useAppState();
  const insets = useSafeAreaInsets();
  const inBasket = state.basket.find((b) => b.recipeId === recipe?.id);
  const [servings, setServings] = useState(inBasket?.servings ?? recipe?.servings ?? 2);

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.h2}>Recette introuvable</Text>
      </View>
    );
  }

  const factor = servings / recipe.servings;
  const warnings = incompatibilities(recipe, state.prefs);
  const fridge = new Set(state.fridge);
  const missingCount = recipe.ingredients.filter((ri) => !getIngredient(ri.ingredientId).staple && !fridge.has(ri.ingredientId)).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: recipe.title }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={styles.hero}>
          <RecipeMedia recipe={recipe} active={false} />
        </View>
        <View style={styles.body}>
          <Text style={styles.author}>
            {recipe.author.avatar} {recipe.author.name} · {recipe.author.handle}
          </Text>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.desc}>{recipe.description}</Text>
          <View style={styles.meta}>
            <Meta label="Temps" value={`${recipe.durationMin} min`} />
            <Meta label="Niveau" value={recipe.difficulty} />
            <Meta label="À acheter" value={`${missingCount} produit${missingCount > 1 ? 's' : ''}`} />
          </View>

          {warnings.length > 0 && (
            <View style={styles.warning}>
              <Text style={styles.warningTitle}>⚠️ Attention, d’après tes préférences</Text>
              {warnings.map((w) => (
                <Text key={w} style={styles.warningText}>
                  • {w}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.sectionHead}>
            <Text style={styles.h2}>Ingrédients</Text>
            <Stepper value={servings} onChange={setServings} suffix="pers." />
          </View>
          {recipe.ingredients.map((ri) => {
            const ing = getIngredient(ri.ingredientId);
            const have = fridge.has(ing.id);
            return (
              <View key={ri.ingredientId} style={styles.ingRow}>
                <Text style={styles.ingEmoji}>{ing.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ingName}>{ing.name}</Text>
                  {ri.note && <Text style={styles.ingNote}>{ri.note}</Text>}
                </View>
                <Text style={styles.ingQty}>{formatQty(ri.qty * factor, ing.unit)}</Text>
                <Text style={[styles.ingStatus, { color: have ? colors.success : ing.staple ? colors.textDim : colors.warning }]}>
                  {have ? '✓ frigo' : ing.staple ? 'placard' : 'à acheter'}
                </Text>
              </View>
            );
          })}

          <Text style={[styles.h2, { marginTop: 28, marginBottom: 12 }]}>Préparation</Text>
          {recipe.steps.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + 14 }]}>
        <Button
          title={inBasket ? `Mettre à jour le panier (${servings} pers.)` : `🛒 Ajouter au panier (${servings} pers.)`}
          onPress={() => {
            dispatch({ type: 'addToBasket', recipeId: recipe.id, servings });
            router.push('/panier');
          }}
        />
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 280, overflow: 'hidden' },
  body: { padding: 18 },
  author: { color: colors.textDim, fontWeight: '600' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 6 },
  desc: { color: colors.textDim, fontSize: 15, lineHeight: 21, marginTop: 8 },
  meta: { flexDirection: 'row', gap: 10, marginTop: 18 },
  metaItem: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  metaValue: { color: colors.text, fontWeight: '800', fontSize: 15 },
  metaLabel: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  warning: { marginTop: 16, backgroundColor: 'rgba(242,84,91,0.12)', borderColor: colors.danger, borderWidth: 1, borderRadius: radius.md, padding: 12 },
  warningTitle: { color: colors.danger, fontWeight: '800', marginBottom: 4 },
  warningText: { color: colors.text },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 8 },
  h2: { color: colors.text, fontSize: 20, fontWeight: '800' },
  ingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 10 },
  ingEmoji: { fontSize: 22, width: 30, textAlign: 'center' },
  ingName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  ingNote: { color: colors.textDim, fontSize: 12 },
  ingQty: { color: colors.text, fontWeight: '700' },
  ingStatus: { fontSize: 12, fontWeight: '700', width: 64, textAlign: 'right' },
  step: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '800' },
  stepText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
