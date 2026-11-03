import { Tabs } from 'expo-router/tabs';
import { Text } from 'react-native';
import { useBasketCount } from '../../state/AppState';
import { colors } from '../../theme';

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
);

export default function TabsLayout() {
  const basketCount = useBasketCount();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed', headerShown: false, tabBarIcon: icon('🎬') }} />
      <Tabs.Screen name="frigo" options={{ title: 'Mon frigo', tabBarIcon: icon('🧊') }} />
      <Tabs.Screen
        name="panier"
        options={{
          title: 'Panier',
          tabBarIcon: icon('🛒'),
          tabBarBadge: basketCount > 0 ? basketCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="profil" options={{ title: 'Mes préférences', tabBarLabel: 'Profil', tabBarIcon: icon('🧑‍🍳') }} />
    </Tabs>
  );
}
