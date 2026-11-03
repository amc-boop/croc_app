import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../data/types';

/**
 * Média plein écran d'une recette : vidéo si disponible, sinon photo animée
 * (zoom lent) posée sur un dégradé + emoji de secours si l'image ne charge pas.
 */
export function RecipeMedia({ recipe, active }: { recipe: Recipe; active: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={recipe.gradient} style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.emoji}>{recipe.fallbackEmoji}</Text>
      </LinearGradient>
      {recipe.videoUrl ? (
        <ReelVideo uri={recipe.videoUrl} active={active} />
      ) : (
        <KenBurnsImage uri={recipe.imageUrl} active={active} />
      )}
    </View>
  );
}

function ReelVideo({ uri, active }: { uri: string; active: boolean }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });
  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

function KenBurnsImage({ uri, active }: { uri: string; active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!active) {
      scale.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [active, scale]);

  if (failed) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} onError={() => setFailed(true)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 140, opacity: 0.9 },
});
