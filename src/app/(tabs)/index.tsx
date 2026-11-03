import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, type ListViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { ReelItem } from '../../components/ReelItem';
import { RECIPES } from '../../data/recipes';
import type { Recipe } from '../../data/types';
import { buildFeed, type FeedMode } from '../../lib/feed';
import { useAppState } from '../../state/AppState';
import { colors, radius } from '../../theme';

export default function FeedScreen() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<FeedMode>('pour_toi');
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Recipe>>(null);
  const params = useLocalSearchParams<{ mode?: string }>();

  const feed = useMemo(
    () => buildFeed(RECIPES, { prefs: state.prefs, fridge: state.fridge, mode }),
    [state.prefs, state.fridge, mode],
  );
  const activeFilters = state.prefs.diets.length + state.prefs.allergens.length;

  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setActiveIndex(first.index);
  }).current;

  const switchMode = useCallback((m: FeedMode) => {
    setMode(m);
    setActiveIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  useEffect(() => {
    if (params.mode === 'frigo' || params.mode === 'pour_toi') switchMode(params.mode);
  }, [params.mode, switchMode]);

  return (
    <View style={styles.root} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && feed.length > 0 && (
        <FlatList
          ref={listRef}
          data={feed}
          keyExtractor={(r) => r.id}
          renderItem={({ item, index }) => (
            <ReelItem recipe={item} height={height} active={index === activeIndex} bottomInset={0} />
          )}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
        />
      )}

      {feed.length === 0 && height > 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{mode === 'frigo' ? '🧊' : '🥲'}</Text>
          <Text style={styles.emptyTitle}>
            {mode === 'frigo' ? 'Rien à cuisiner avec ton frigo… pour l’instant' : 'Aucune recette ne correspond à tes filtres'}
          </Text>
          <Text style={styles.emptyText}>
            {mode === 'frigo'
              ? 'Ajoute des ingrédients ou prends ton frigo en photo pour trouver des idées.'
              : 'Assouplis un peu tes préférences pour voir plus de recettes.'}
          </Text>
          <Button
            title={mode === 'frigo' ? 'Remplir mon frigo' : 'Modifier mes préférences'}
            onPress={() => router.push(mode === 'frigo' ? '/frigo' : '/profil')}
            style={{ marginTop: 20, alignSelf: 'stretch' }}
          />
        </View>
      )}

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Text style={styles.logo}>croc 🐊</Text>
        <View style={styles.segment}>
          <Segment label="Pour toi" active={mode === 'pour_toi'} onPress={() => switchMode('pour_toi')} />
          <Segment
            label={`Mon frigo${state.fridge.length ? ` · ${state.fridge.length}` : ''}`}
            active={mode === 'frigo'}
            onPress={() => switchMode('frigo')}
          />
        </View>
        <Pressable onPress={() => router.push('/profil')} style={styles.filterBtn} accessibilityLabel="Préférences">
          <Text style={{ fontSize: 18 }}>⚙️</Text>
          {activeFilters > 0 && (
            <View style={styles.filterDot}>
              <Text style={styles.filterDotText}>{activeFilters}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segBtn, active && styles.segBtnActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  logo: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, width: 80 },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: radius.pill, padding: 3 },
  segBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill },
  segBtnActive: { backgroundColor: '#fff' },
  segText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  segTextActive: { color: '#000' },
  filterBtn: { width: 80, alignItems: 'flex-end' },
  filterDot: { position: 'absolute', top: -4, right: -6, backgroundColor: colors.primary, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  filterDotText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: colors.textDim, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
