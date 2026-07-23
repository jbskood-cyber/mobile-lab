import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { FocoIcon, type IconName } from './FocoIcon';
import { FocoSheet, SheetButton } from './FocoSheet';
import { useFocoTheme } from './FocoThemeContext';
import { useFocoUI } from './FocoUIContext';
import { hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from './premium';

type DestinationHref = '/(tabs)' | '/(tabs)/agenda' | '/(tabs)/focus' | '/(tabs)/projects' | '/(tabs)/stats' | '/momentum' | '/preferences';
const destinations: Array<{ label: string; detail: string; icon: IconName; href: DestinationHref }> = [
  { label: 'Hoy', detail: 'Plan adaptativo', icon: 'home', href: '/(tabs)' },
  { label: 'Agenda', detail: 'Calendario y línea temporal', icon: 'calendar', href: '/(tabs)/agenda' },
  { label: 'Enfoque', detail: 'Pomodoro y cronómetro', icon: 'circle', href: '/(tabs)/focus' },
  { label: 'Proyectos', detail: 'Áreas y resultados', icon: 'folder', href: '/(tabs)/projects' },
  { label: 'Progreso', detail: 'Tendencias e historial', icon: 'bars', href: '/(tabs)/stats' },
  { label: 'Impulso', detail: 'Empezar con una sola decisión', icon: 'flame', href: '/momentum' },
  { label: 'Preferencias', detail: 'Tema, rutinas, respaldo y diagnóstico', icon: 'sliders', href: '/preferences' },
];

export function FocoAppMenu() {
  const router = useRouter();
  const theme = useFocoTheme();
  const { resetLocalData } = useFocoStore();
  const { appMenuVisible, resetArmed, closeAppMenu, requestReset, cancelReset, completeReset } = useFocoUI();

  const navigate = (href: DestinationHref) => {
    closeAppMenu();
    hapticSelection();
    router.navigate(href);
  };

  const confirmReset = () => {
    resetLocalData();
    completeReset();
    closeAppMenu();
    hapticSuccess();
  };

  return (
    <FocoSheet visible={appMenuVisible} title="FOCO" subtitle="Un día claro, incluso cuando el plan cambia." onClose={closeAppMenu}>
      <Text style={[styles.label, { color: theme.colors.muted }]}>NAVEGACIÓN</Text>
      <View style={[styles.list, { borderTopColor: theme.colors.borderSoft }]}>
        {destinations.map((item) => (
          <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Ir a ${item.label}`} onPress={() => navigate(item.href)} style={({ pressed }) => [styles.destination, { borderBottomColor: theme.colors.borderSoft }, pressed && pressedStyle]}>
            <View style={[styles.destinationIcon, { backgroundColor: theme.colors.panelStrong }]}><FocoIcon name={item.icon} size={19} color={theme.colors.text} /></View>
            <View style={styles.destinationCopy}><Text style={[styles.destinationText, { color: theme.colors.text }]}>{item.label}</Text><Text style={[styles.destinationDetail, { color: theme.colors.muted }]}>{item.detail}</Text></View>
            <FocoIcon name="chevron-right" size={16} color={theme.colors.subtle} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]} />

      {!resetArmed ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Empezar con FOCO vacío" onPress={() => { requestReset(); hapticWarning(); }} style={({ pressed }) => [styles.resetRow, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }, pressed && pressedStyle]}>
          <View style={styles.resetCopy}><Text style={[styles.resetTitle, { color: theme.colors.danger }]}>Empezar vacío</Text><Text style={[styles.resetDescription, { color: theme.colors.muted }]}>Borra datos locales. El respaldo está en Preferencias.</Text></View>
          <FocoIcon name="chevron-right" size={17} color={theme.colors.subtle} />
        </Pressable>
      ) : (
        <View accessibilityLiveRegion="polite" style={[styles.confirmBox, { borderColor: theme.colors.danger, backgroundColor: theme.colors.panel }]}>
          <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>¿Borrar todo en este dispositivo?</Text>
          <Text style={[styles.confirmCopy, { color: theme.colors.muted }]}>Esta acción no se puede deshacer sin una copia.</Text>
          <View style={styles.confirmActions}><SheetButton label="Cancelar" variant="secondary" onPress={cancelReset} /><SheetButton label="Borrar datos" variant="danger" onPress={confirmReset} /></View>
        </View>
      )}

      <Text style={[styles.version, { color: theme.colors.subtle }]}>FOCO {Constants.expoConfig?.version ?? '0.4.0'} · Offline</Text>
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: 'Manrope_700Bold', fontSize: 9.5, lineHeight: 13, letterSpacing: 1.35, marginBottom: 5 },
  list: { borderTopWidth: StyleSheet.hairlineWidth },
  destination: { minHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 9 },
  destinationIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  destinationCopy: { flex: 1, minWidth: 0 },
  destinationText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, lineHeight: 16 },
  destinationDetail: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 13 },
  resetRow: { minHeight: 62, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  resetCopy: { flex: 1, paddingRight: 10 },
  resetTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, lineHeight: 16 },
  resetDescription: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  confirmBox: { borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, padding: 13 },
  confirmTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13.5, lineHeight: 18 },
  confirmCopy: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14, marginTop: 3 },
  confirmActions: { flexDirection: 'row', gap: 8, marginTop: 11 },
  version: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, textAlign: 'center', marginTop: 14, marginBottom: 2 },
});
