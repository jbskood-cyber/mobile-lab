import { Tabs } from 'expo-router';

import { FocoTabBar } from '@/src/ui/FocoTabBar';
import { foco } from '@/src/ui/focoTheme';

export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <FocoTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: foco.colors.bg },
        tabBarHideOnKeyboard: true,
        animation: 'none',
        lazy: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarAccessibilityLabel: 'Hoy' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarAccessibilityLabel: 'Agenda' }} />
      <Tabs.Screen name="focus" options={{ title: 'Enfoque', tabBarAccessibilityLabel: 'Enfoque' }} />
      <Tabs.Screen name="projects" options={{ title: 'Proyectos', tabBarAccessibilityLabel: 'Proyectos' }} />
      <Tabs.Screen name="stats" options={{ title: 'Progreso', tabBarAccessibilityLabel: 'Progreso' }} />
    </Tabs>
  );
}
