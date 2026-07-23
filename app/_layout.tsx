import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { FocoStoreProvider } from '@/src/core/FocoStore';
import { FocoAppMenu } from '@/src/ui/FocoAppMenu';
import { FocoSkeleton } from '@/src/ui/FocoSkeleton';
import { FocoUIProvider, useFocoUI } from '@/src/ui/FocoUIContext';
import { FocoUndoHost } from '@/src/ui/FocoUndoHost';
import { NativeSystemUI } from '@/src/ui/NativeSystemUI';
import { foco } from '@/src/ui/focoTheme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  void SplashScreen.hideAsync().catch(() => undefined);
}

function HydrationFallback() {
  const segments = useSegments();
  const destination = segments.at(-1);
  const screen = destination === 'projects' ? 'projects' : destination === 'focus' ? 'focus' : destination === 'stats' ? 'stats' : 'today';
  return <FocoSkeleton screen={screen} />;
}

function FocoSystemChrome() {
  const { focusImmersive } = useFocoUI();
  return (
    <>
      <NativeSystemUI />
      <StatusBar hidden={focusImmersive} animated style="light" backgroundColor="transparent" translucent />
    </>
  );
}

export default function RootLayout() {
  return (
    <FocoStoreProvider fallback={<HydrationFallback />} onReady={hideSplash}>
      <FocoUIProvider>
        <View style={styles.root}>
          <FocoSystemChrome />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: foco.colors.bg },
              animation: 'fade',
            }}
          />
          <FocoAppMenu />
          <FocoUndoHost />
        </View>
      </FocoUIProvider>
    </FocoStoreProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: foco.colors.bg },
});
