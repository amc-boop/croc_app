import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../data/types';
import { fridgeMatch } from '../lib/fridge';
import { useAppState } from '../state/AppState';
import { colors, radius } from '../theme';
import { RecipeMedia } from './RecipeMedia';

interface Props {
  recipe: Recipe;
  height: number;
  active: boolean;
  bottomInset: number;
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')} k` : `${n}`);

function ReelItemBase({ recipe, height, active, bottomInset }: Props) {
  const { state, dispatch } = useAppState();
  const liked = state.liked.includes(recipe.id);
  const saved = state.saved.includes(recipe.id);
  const inBasket = state.basket.some((b) => b.recipeId === recipe.id);
  const match = state.fridge.length ? fridgeMatch(recipe, state.fridge) : null;
  const openRecipe = () => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } });

  return (
    <View style={{ height, backgroundColor: colors.media }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={openRecipe} accessibilityLabel={`Voir la recette ${recipe.title}`}>
        <RecipeMedia recipe={recipe} active={active} />
      </Pressable>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.2, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.actions, { bottom: bottomInset + 110 }]}>
        <Action icon={liked ? '❤️' : '🤍'} label={compact(recipe.likes + (liked ? 1 : 0))} onPress={() => dispatch({ type: 'toggleLike', recipeId: recipe.id })} />
        <Action icon="📖" label="Recette" onPress={openRecipe} />
        <Action
          icon={inBasket ? '✅' : '🛒'}
          label={inBasket ? 'Au panier' : 'Panier'}
          onPress={() =>
            inBasket
              ? router.push('/panier')
              : dispatch({ type: 'addToBasket', recipeId: recipe.id, servings: recipe.servings })
          }
        />
        <Action icon={saved ? '🔖' : '📑'} label={saved ? 'Enregistré' : 'Enregistrer'} onPress={() => dispatch({ type: 'toggleSave', recipeId: recipe.id })} />
        <Action icon="↗️" label="Partager" onPress={() => Share.share({ message: `${recipe.title} sur Croc 🐊 croc://recipe/${recipe.id}` }).catch(() => {})} />
      </View>

      <View style={[styles.info, { paddingBottom: bottomInset + 18 }]} pointerEvents="box-none">
        <Text style={styles.author}>
          {recipe.author.avatar} {recipe.author.handle}
        </Text>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.badges}>
          <Badge text={`⏱ ${recipe.durationMin} min`} />
          <Badge text={`👥 ${recipe.servings} pers.`} />
          <Badge text={recipe.difficulty} />
          {match && (
            <Badge
              text={`🧊 ${match.have.length}/${match.have.length + match.missing.length} au frigo`}
              highlight={match.ratio >= 0.6}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { transform: [{ scale: 0.9 }] }]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function Badge({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <View style={[styles.badge, highlight && { backgroundColor: colors.success }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

export const ReelItem = memo(ReelItemBase);

const shadow = { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } };

const styles = StyleSheet.create({
  actions: { position: 'absolute', right: 10, alignItems: 'center', gap: 18 },
  action: { alignItems: 'center', width: 64 },
  actionIcon: { fontSize: 30 },
  actionLabel: { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 3, ...shadow },
  info: { position: 'absolute', left: 16, right: 84, bottom: 0 },
  author: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 6, ...shadow },
  title: { color: '#fff', fontWeight: '800', fontSize: 22, marginBottom: 6, ...shadow },
  desc: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 19, ...shadow },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  badge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
