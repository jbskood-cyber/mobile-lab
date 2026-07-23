import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { FocoStoreProvider } from '@/src/core/FocoStore';
import { FocoAppMenu } from '@/src/ui/FocoAppMenu';
import { FocoSkeleton } from '@/src/ui/FocoSkeleton';
import { FocoUIProvider } from '@/src/ui/FocoUIContext';
import { NativeSystemUI } from '@/src/ui/NativeSystemUI';
import { foco } from '@/src/ui/focoTheme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  void SplashScreen.hideAsync().catch(() => undefined);
}

export default function RootLayout() {
  return (
    <FocoStoreProvider fallback={<FocoSkeleton screen="today" />} onReady={hideSplash}>
      <FocoUIProvider>
        <NativeSystemUI />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: foco.colors.bg },
            animation: 'fade',
          }}
        />
        <FocoAppMenu />
        <StatusBar style="light" backgroundColor="transparent" translucent />
      </FocoUIProvider>
    </FocoStoreProvider>
  );
}
