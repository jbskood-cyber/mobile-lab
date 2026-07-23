import { Tabs } from 'expo-router';

import { FocoTabBar } from '@/src/ui/FocoTabBar';
import { foco } from '@/src/ui/focoTheme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FocoTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: foco.colors.bg },
        tabBarHideOnKeyboard: true,
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="projects" options={{ title: 'Proyectos' }} />
      <Tabs.Screen name="focus" options={{ title: 'Enfoque' }} />
      <Tabs.Screen name="stats" options={{ title: 'Estadísticas' }} />
    </Tabs>
  );
}
