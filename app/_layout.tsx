import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { FocoStoreProvider } from '@/src/core/FocoStore';
import { NotificationObserver } from '@/src/platform/NotificationObserver';
import { FocoAppMenu } from '@/src/ui/FocoAppMenu';
import { FocoSkeleton } from '@/src/ui/FocoSkeleton';
import { FocoThemeProvider, useFocoTheme } from '@/src/ui/FocoThemeContext';
import { FocoUIProvider, useFocoUI } from '@/src/ui/FocoUIContext';
import { FocoUndoHost } from '@/src/ui/FocoUndoHost';
import { NativeSystemUI } from '@/src/ui/NativeSystemUI';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  void SplashScreen.hideAsync().catch(() => undefined);
}

function HydrationFallback() {
  const segments = useSegments();
  const destination = segments.at(-1);
  const screen = destination === 'agenda' ? 'agenda' : destination === 'projects' ? 'projects' : destination === 'focus' ? 'focus' : destination === 'stats' ? 'stats' : 'today';
  return <FocoSkeleton screen={screen} />;
}

function FocoSystemChrome() {
  const { focusImmersive } = useFocoUI();
  const theme = useFocoTheme();
  return (
    <>
      <NativeSystemUI />
      <StatusBar hidden={focusImmersive} animated style={theme.mode === 'light' ? 'dark' : 'light'} backgroundColor="transparent" translucent />
    </>
  );
}

function ThemedApplication() {
  const theme = useFocoTheme();
  return (
    <FocoUIProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <FocoSystemChrome />
        <NotificationObserver />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg }, animation: 'fade' }} />
        <FocoAppMenu />
        <FocoUndoHost />
      </View>
    </FocoUIProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold });
  if (!fontsLoaded && !fontError) return <HydrationFallback />;
  return (
    <FocoStoreProvider fallback={<HydrationFallback />} onReady={hideSplash}>
      <FocoThemeProvider>
        <ThemedApplication />
      </FocoThemeProvider>
    </FocoStoreProvider>
  );
}
