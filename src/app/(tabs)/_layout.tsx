import { Image } from 'expo-image';
import { Tabs } from 'expo-router/tabs';
import { useBasketCount } from '../../state/AppState';
import { colors } from '../../theme';

const ICONS = {
  feed: require('../../../assets/tabs/feed.png'),
  frigo: require('../../../assets/tabs/frigo.png'),
  panier: require('../../../assets/tabs/panier.png'),
  profil: require('../../../assets/tabs/profil.png'),
};

const icon =
  (name: keyof typeof ICONS) =>
  ({ focused }: { focused: boolean }) => (
    <Image
      source={ICONS[name]}
      style={{ width: 26, height: 26 }}
      tintColor={focused ? colors.primary : colors.textDim}
      contentFit="contain"
    />
  );

export default function TabsLayout() {
  const basketCount = useBasketCount();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      {/* Le feed affiche son propre titre (logo croc) par-dessus les vidéos. */}
      <Tabs.Screen name="index" options={{ title: 'Feed', headerShown: false, tabBarAccessibilityLabel: 'Feed', tabBarIcon: icon('feed') }} />
      <Tabs.Screen name="frigo" options={{ title: 'Mon frigo', tabBarAccessibilityLabel: 'Mon frigo', tabBarIcon: icon('frigo') }} />
      <Tabs.Screen
        name="panier"
        options={{
          title: 'Mon panier',
          tabBarAccessibilityLabel: 'Panier',
          tabBarIcon: icon('panier'),
          tabBarBadge: basketCount > 0 ? basketCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="profil" options={{ title: 'Mon profil', tabBarAccessibilityLabel: 'Profil', tabBarIcon: icon('profil') }} />
    </Tabs>
  );
}
