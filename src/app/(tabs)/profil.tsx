import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../../components/Chip';
import { RECIPES, RECIPE_BY_ID } from '../../data/recipes';
import type { Allergen, Diet } from '../../data/types';
import { ALLERGEN_LABELS, DIET_LABELS, isCompatible } from '../../lib/preferences';
import { useAppState } from '../../state/AppState';
import { colors, radius } from '../../theme';

export default function ProfileScreen() {
  const { state, dispatch } = useAppState();
  const compatibleCount = RECIPES.filter((r) => isCompatible(r, state.prefs)).length;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <Text style={styles.summaryNum}>
          {compatibleCount}/{RECIPES.length}
        </Text>
        <Text style={styles.dim}>recettes correspondent à ton profil. Ton feed s’adapte automatiquement.</Text>
      </View>

      <Text style={styles.h2}>Mon régime</Text>
      <View style={styles.chips}>
        {(Object.keys(DIET_LABELS) as Diet[]).map((d) => (
          <Chip
            key={d}
            emoji={DIET_LABELS[d].emoji}
            label={DIET_LABELS[d].label}
            selected={state.prefs.diets.includes(d)}
            onPress={() => dispatch({ type: 'toggleDiet', diet: d })}
          />
        ))}
      </View>

      <Text style={[styles.h2, { marginTop: 26 }]}>Allergies et intolérances</Text>
      <Text style={[styles.dim, { marginBottom: 10 }]}>Les recettes qui en contiennent sont masquées du feed.</Text>
      <View style={styles.chips}>
        {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
          <Chip
            key={a}
            emoji={ALLERGEN_LABELS[a].emoji}
            label={ALLERGEN_LABELS[a].label}
            selected={state.prefs.allergens.includes(a)}
            onPress={() => dispatch({ type: 'toggleAllergen', allergen: a })}
          />
        ))}
      </View>

      <Text style={[styles.h2, { marginTop: 26 }]}>Recettes enregistrées · {state.saved.length}</Text>
      {state.saved.length === 0 ? (
        <Text style={styles.dim}>Appuie sur 📑 dans le feed pour garder une recette ici.</Text>
      ) : (
        state.saved.map((id) => {
          const r = RECIPE_BY_ID[id];
          if (!r) return null;
          return (
            <Pressable key={id} style={styles.row} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id } })}>
              <Text style={{ fontSize: 26 }}>{r.fallbackEmoji}</Text>
              <Text style={styles.rowTitle}>{r.title}</Text>
              <Text style={styles.dim}>›</Text>
            </Pressable>
          );
        })
      )}

      <Text style={styles.disclaimer}>
        Les informations allergènes sont indicatives. Vérifie toujours les étiquettes des produits.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  summary: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryNum: { color: colors.primary, fontSize: 30, fontWeight: '900' },
  dim: { color: colors.textDim, fontSize: 14, lineHeight: 20, flexShrink: 1 },
  h2: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginBottom: 8 },
  rowTitle: { flex: 1, color: colors.text, fontWeight: '700' },
  disclaimer: { color: colors.textDim, fontSize: 12, marginTop: 32, textAlign: 'center' },
});
