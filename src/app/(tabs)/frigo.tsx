import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { getIngredient } from '../../data/ingredients';
import { RECIPES } from '../../data/recipes';
import { buildFeed } from '../../lib/feed';
import { fridgeMatch, searchIngredients } from '../../lib/fridge';
import { detectFridgeIngredients, type FridgeDetection } from '../../services/fridgeVision';
import { useAppState } from '../../state/AppState';
import { colors, radius } from '../../theme';

const QUICK_ADD = ['oeuf', 'tomate', 'oignon', 'ail', 'pates', 'riz', 'parmesan', 'citron', 'poulet', 'courgette', 'beurre', 'lait'];

export default function FridgeScreen() {
  const { state, dispatch } = useAppState();
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detection, setDetection] = useState<FridgeDetection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => searchIngredients(query).filter((i) => !state.fridge.includes(i.id)), [query, state.fridge]);
  const doable = useMemo(
    () => buildFeed(RECIPES, { prefs: state.prefs, fridge: state.fridge, mode: 'frigo', minFridgeRatio: 0.5 }).slice(0, 4),
    [state.prefs, state.fridge],
  );

  const add = (id: string) => {
    dispatch({ type: 'addFridge', ids: [id] });
    setQuery('');
  };

  const scan = async (source: 'camera' | 'library') => {
    setError(null);
    setDetection(null);
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError("Autorise l'accès à l'appareil photo dans les réglages pour scanner ton frigo.");
          return;
        }
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], base64: true, quality: 0.6 };
      const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets[0]) return;
      setScanning(true);
      const asset = res.assets[0];
      const det = await detectFridgeIngredients({ base64: asset.base64, mimeType: asset.mimeType });
      setDetection(det);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analyse impossible');
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.scanCard}>
        <Text style={styles.scanTitle}>📸 Scanne ton frigo</Text>
        <Text style={styles.dim}>Prends une photo, on détecte les ingrédients et on te propose quoi cuisiner.</Text>
        <View style={styles.row}>
          <Button title="Prendre une photo" onPress={() => scan('camera')} loading={scanning} style={{ flex: 1 }} />
          <Button title="Galerie" variant="secondary" onPress={() => scan('library')} disabled={scanning} style={{ flex: 0.6 }} />
        </View>
        {error && <Text style={{ color: colors.danger, marginTop: 8 }}>{error}</Text>}
        {detection && (
          <View style={styles.detected}>
            <Text style={styles.label}>
              {detection.ingredientIds.length} ingrédient(s) détecté(s){detection.source === 'demo' ? ' · mode démo' : ''}
            </Text>
            <View style={styles.chips}>
              {detection.ingredientIds.map((id) => {
                const ing = getIngredient(id);
                return <Chip key={id} emoji={ing.emoji} label={ing.name} selected={state.fridge.includes(id)} />;
              })}
            </View>
            <Button
              title="Ajouter à mon frigo"
              onPress={() => {
                dispatch({ type: 'addFridge', ids: detection.ingredientIds });
                setDetection(null);
              }}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </View>

      <Text style={styles.h2}>Ou ajoute à la main</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Ex. tomates, œufs, feta…"
        placeholderTextColor={colors.textDim}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={() => suggestions[0] && add(suggestions[0].id)}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((s) => (
            <Pressable key={s.id} onPress={() => add(s.id)} style={styles.suggestion}>
              <Text style={styles.suggestionText}>
                {s.emoji}  {s.name}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: '800' }}>＋</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={[styles.chips, { marginTop: 10 }]}>
        {QUICK_ADD.filter((id) => !state.fridge.includes(id)).map((id) => {
          const ing = getIngredient(id);
          return <Chip key={id} emoji={ing.emoji} label={`+ ${ing.name}`} onPress={() => add(id)} />;
        })}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.h2}>Dans mon frigo · {state.fridge.length}</Text>
        {state.fridge.length > 0 && (
          <Pressable onPress={() => dispatch({ type: 'clearFridge' })}>
            <Text style={{ color: colors.textDim }}>Vider</Text>
          </Pressable>
        )}
      </View>
      {state.fridge.length === 0 ? (
        <Text style={styles.dim}>Ton frigo est vide pour l’instant.</Text>
      ) : (
        <View style={styles.chips}>
          {state.fridge.map((id) => {
            const ing = getIngredient(id);
            return <Chip key={id} emoji={ing.emoji} label={ing.name} selected onRemove={() => dispatch({ type: 'removeFridge', id })} />;
          })}
        </View>
      )}

      {state.fridge.length > 0 && (
        <>
          <Text style={[styles.h2, { marginTop: 26 }]}>Tu peux cuisiner</Text>
          {doable.length === 0 ? (
            <Text style={styles.dim}>Pas encore assez d’ingrédients pour une recette complète. Ajoutes-en quelques-uns !</Text>
          ) : (
            doable.map((r) => {
              const m = fridgeMatch(r, state.fridge);
              return (
                <Pressable key={r.id} style={styles.recipeRow} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}>
                  <Text style={{ fontSize: 30 }}>{r.fallbackEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipeTitle}>{r.title}</Text>
                    <Text style={styles.dim}>
                      {m.missing.length === 0 ? 'Tu as tout ! ✅' : `Il manque : ${m.missing.map((id) => getIngredient(id).name).join(', ')}`}
                    </Text>
                  </View>
                  <Text style={[styles.pct, { color: m.ratio === 1 ? colors.success : colors.warning }]}>{Math.round(m.ratio * 100)} %</Text>
                </Pressable>
              );
            })
          )}
          <Button title="Voir les vidéos avec mon frigo" variant="secondary" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: '/', params: { mode: 'frigo' } })} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  scanCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  scanTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  detected: { marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 14 },
  label: { color: colors.textDim, fontWeight: '700', marginBottom: 8 },
  dim: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  h2: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  suggestions: { backgroundColor: colors.surface, borderRadius: radius.md, marginTop: 6, overflow: 'hidden' },
  suggestion: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  suggestionText: { color: colors.text, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26 },
  recipeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginBottom: 8 },
  recipeTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 2 },
  pct: { fontWeight: '900', fontSize: 16 },
});
