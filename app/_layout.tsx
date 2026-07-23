import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { FocoStoreProvider } from '@/src/core/FocoStore';
import { foco } from '@/src/ui/focoTheme';

export default function RootLayout() {
  return (
    <FocoStoreProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: foco.colors.bg },
        }}
      />
      <StatusBar style="light" backgroundColor={foco.colors.bg} translucent={false} />
    </FocoStoreProvider>
  );
}
