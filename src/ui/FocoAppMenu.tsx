import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { FocoIcon, type IconName } from './FocoIcon';
import { FocoSheet, SheetButton } from './FocoSheet';
import { useFocoUI } from './FocoUIContext';
import { foco } from './focoTheme';
import { hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from './premium';

type DestinationHref = '/(tabs)' | '/(tabs)/agenda' | '/(tabs)/focus' | '/(tabs)/projects' | '/(tabs)/stats';
const destinations: Array<{ label: string; icon: IconName; href: DestinationHref }> = [
  { label: 'Hoy', icon: 'home', href: '/(tabs)' },
  { label: 'Agenda', icon: 'calendar', href: '/(tabs)/agenda' },
  { label: 'Enfoque', icon: 'circle', href: '/(tabs)/focus' },
  { label: 'Proyectos', icon: 'folder', href: '/(tabs)/projects' },
  { label: 'Progreso', icon: 'bars', href: '/(tabs)/stats' },
];

export function FocoAppMenu() {
  const router = useRouter();
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
    <FocoSheet visible={appMenuVisible} title="FOCO" subtitle="Planifica, concentra y revisa tu progreso sin salir del dispositivo." onClose={closeAppMenu}>
      <Text style={styles.label}>NAVEGACIÓN</Text>
      <View style={styles.list}>
        {destinations.map((item) => (
          <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Ir a ${item.label}`} onPress={() => navigate(item.href)} style={({ pressed }) => [styles.destination, pressed && pressedStyle]}>
            <FocoIcon name={item.icon} size={22} color={foco.colors.text} />
            <Text style={styles.destinationText}>{item.label}</Text>
            <FocoIcon name="chevron-right" size={17} color={foco.colors.subtle} />
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      {!resetArmed ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Reiniciar datos locales" onPress={() => { requestReset(); hapticWarning(); }} style={({ pressed }) => [styles.resetRow, pressed && pressedStyle]}>
          <View style={styles.resetCopy}>
            <Text style={styles.resetTitle}>Reiniciar datos locales</Text>
            <Text style={styles.resetDescription}>Borra tareas, proyectos, preferencias y sesiones de este dispositivo.</Text>
          </View>
          <FocoIcon name="chevron-right" size={18} color={foco.colors.subtle} />
        </Pressable>
      ) : (
        <View accessibilityLiveRegion="polite" style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>¿Borrar todo en este dispositivo?</Text>
          <Text style={styles.confirmCopy}>Esta acción no se puede deshacer.</Text>
          <View style={styles.confirmActions}>
            <SheetButton label="Cancelar" variant="secondary" onPress={cancelReset} />
            <SheetButton label="Borrar datos" variant="danger" onPress={confirmReset} />
          </View>
        </View>
      )}

      <Text style={styles.version}>FOCO {Constants.expoConfig?.version ?? '0.3.0'} · Offline</Text>
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  label: { color: foco.colors.muted, fontSize: 11.5, fontWeight: '700', letterSpacing: 1.4, marginBottom: 7 },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft },
  destination: { minHeight: 54, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: 12 },
  destinationText: { flex: 1, color: foco.colors.text, fontSize: 14.5, fontWeight: '600' },
  divider: { height: 1, backgroundColor: foco.colors.borderSoft, marginVertical: 18 },
  resetRow: { minHeight: 72, borderRadius: 15, backgroundColor: foco.colors.panel, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  resetCopy: { flex: 1, paddingRight: 12 },
  resetTitle: { color: '#F0C4C9', fontSize: 14.5, fontWeight: '600' },
  resetDescription: { color: foco.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  confirmBox: { borderRadius: 15, borderWidth: 1, borderColor: '#603038', backgroundColor: '#251719', padding: 15 },
  confirmTitle: { color: '#F4D1D5', fontSize: 15.5, fontWeight: '700' },
  confirmCopy: { color: '#CDA7AC', fontSize: 12.5, marginTop: 4 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  version: { color: foco.colors.subtle, fontSize: 11, textAlign: 'center', marginTop: 18, marginBottom: 3 },
});
