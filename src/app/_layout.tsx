import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '../state/AppState';
import { colors } from '../theme';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, primary: colors.primary, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <ThemeProvider value={theme}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ title: 'Recette', presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
