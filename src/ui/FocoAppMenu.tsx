import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { FocoIcon, type IconName } from './FocoIcon';
import { FocoSheet, SheetButton } from './FocoSheet';
import { useFocoUI } from './FocoUIContext';
import { foco } from './focoTheme';
import { hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from './premium';

const destinations: Array<{ label: string; icon: IconName; href: '/(tabs)' | '/(tabs)/projects' | '/(tabs)/focus' | '/(tabs)/stats' }> = [
  { label: 'Hoy', icon: 'home', href: '/(tabs)' },
  { label: 'Proyectos', icon: 'folder', href: '/(tabs)/projects' },
  { label: 'Enfoque', icon: 'circle', href: '/(tabs)/focus' },
  { label: 'Estadísticas', icon: 'bars', href: '/(tabs)/stats' },
];

export function FocoAppMenu() {
  const router = useRouter();
  const { resetLocalData } = useFocoStore();
  const {
    appMenuVisible,
    resetArmed,
    closeAppMenu,
    requestReset,
    cancelReset,
    completeReset,
  } = useFocoUI();

  const navigate = (href: (typeof destinations)[number]['href']) => {
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
    <FocoSheet
      visible={appMenuVisible}
      title="FOCO"
      subtitle="Tu espacio local para organizar, concentrarte y medir progreso."
      onClose={closeAppMenu}
    >
      <Text style={styles.label}>IR A</Text>
      <View style={styles.grid}>
        {destinations.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={`Ir a ${item.label}`}
            onPress={() => navigate(item.href)}
            style={({ pressed }) => [styles.destination, pressed && pressedStyle]}
          >
            <FocoIcon name={item.icon} size={24} color={foco.colors.text} />
            <Text style={styles.destinationText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      {!resetArmed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reiniciar datos locales"
          onPress={() => {
            requestReset();
            hapticWarning();
          }}
          style={({ pressed }) => [styles.resetRow, pressed && pressedStyle]}
        >
          <View style={styles.resetCopy}>
            <Text style={styles.resetTitle}>Reiniciar datos locales</Text>
            <Text style={styles.resetDescription}>Borra tareas, proyectos y sesiones de este dispositivo.</Text>
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

      <Text style={styles.version}>FOCO {Constants.expoConfig?.version ?? '0.2.0'} · Datos locales</Text>
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  label: { color: foco.colors.muted, fontSize: 11.5, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destination: { width: '48%', minHeight: 76, borderRadius: 17, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  destinationText: { color: foco.colors.text, fontSize: 14.5, fontWeight: '600' },
  divider: { height: 1, backgroundColor: foco.colors.borderSoft, marginVertical: 20 },
  resetRow: { minHeight: 76, borderRadius: 17, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  resetCopy: { flex: 1, paddingRight: 12 },
  resetTitle: { color: '#F0C4C9', fontSize: 15, fontWeight: '600' },
  resetDescription: { color: foco.colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  confirmBox: { borderRadius: 17, borderWidth: 1, borderColor: '#603038', backgroundColor: '#251719', padding: 16 },
  confirmTitle: { color: '#F4D1D5', fontSize: 16, fontWeight: '700' },
  confirmCopy: { color: '#CDA7AC', fontSize: 13, marginTop: 5 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  version: { color: foco.colors.subtle, fontSize: 11.5, textAlign: 'center', marginTop: 20, marginBottom: 4 },
});
