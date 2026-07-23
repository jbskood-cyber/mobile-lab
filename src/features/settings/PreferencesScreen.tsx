import * as Notifications from 'expo-notifications';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseBackup, serializeBackup, sessionsToCsv, summarizeBackup, tasksToCsv } from '@/src/core/backup';
import { useFocoStore } from '@/src/core/FocoStore';
import type { AppearancePreference } from '@/src/core/model';
import { RoutinesSheet } from '@/src/features/routines/RoutinesSheet';
import { shareTextFile } from '@/src/platform/backupFiles';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

const appearances: Array<{ value: AppearancePreference; label: string; detail: string }> = [
  { value: 'system', label: 'Sistema', detail: 'Sigue la apariencia del teléfono' },
  { value: 'light', label: 'Claro', detail: 'Superficies luminosas y contraste suave' },
  { value: 'dark', label: 'Oscuro', detail: 'Graphite para reducir brillo' },
];

export function PreferencesScreen() {
  const router = useRouter();
  const theme = useFocoTheme();
  const { state, updateAppearance, updatePlanning, replaceState, loadDemoData, startEmpty } = useFocoStore();
  const [routinesOpen, setRoutinesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importSource, setImportSource] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number | null>(null);
  const [permission, setPermission] = useState('Sin revisar');
  const bytes = useMemo(() => new TextEncoder().encode(JSON.stringify(state)).length, [state]);

  useEffect(() => {
    let active = true;
    void Promise.all([Notifications.getAllScheduledNotificationsAsync(), Notifications.getPermissionsAsync()]).then(([scheduled, permissions]) => {
      if (!active) return;
      setNotificationCount(scheduled.length);
      setPermission(permissions.granted ? 'Permitidas' : permissions.canAskAgain ? 'Pendientes' : 'Bloqueadas');
    }).catch(() => {
      if (active) { setNotificationCount(null); setPermission('No disponible'); }
    });
    return () => { active = false; };
  }, [state.tasks]);

  const exportBackup = async () => {
    const result = await shareTextFile(`foco-backup-${dateStamp()}.json`, serializeBackup(state), 'application/json');
    Alert.alert('Copia preparada', result.method === 'share' ? 'La copia completa está lista para compartir.' : 'No se pudo abrir el diálogo; la copia quedó en el portapapeles.');
  };
  const exportTasks = async () => {
    const result = await shareTextFile(`foco-tareas-${dateStamp()}.csv`, tasksToCsv(state), 'text/csv');
    Alert.alert('Tareas exportadas', result.method === 'share' ? 'El CSV está listo para compartir.' : 'El CSV quedó en el portapapeles.');
  };
  const exportSessions = async () => {
    const result = await shareTextFile(`foco-sesiones-${dateStamp()}.csv`, sessionsToCsv(state), 'text/csv');
    Alert.alert('Sesiones exportadas', result.method === 'share' ? 'El CSV está listo para compartir.' : 'El CSV quedó en el portapapeles.');
  };

  const previewImport = () => {
    try {
      const backup = parseBackup(importSource);
      const summary = summarizeBackup(backup);
      setImportError(null);
      Alert.alert(
        'Reemplazar datos locales',
        `${summary.projects} proyectos · ${summary.tasks} tareas · ${summary.sessions} sesiones · ${summary.routines} rutinas.\n\nEsta acción reemplazará el estado actual después de validar la copia.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Restaurar', style: 'destructive', onPress: () => { replaceState(backup.state); setImportSource(''); setImportOpen(false); hapticSuccess(); } },
        ],
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'No pudimos leer esta copia.');
      hapticWarning();
    }
  };

  const confirmDemo = () => Alert.alert('Cargar demostración', 'Reemplazará los datos actuales por un espacio completo de ejemplo.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cargar', style: 'destructive', onPress: () => { loadDemoData(); hapticSuccess(); } }]);
  const confirmEmpty = () => Alert.alert('Empezar vacío', 'Eliminará tareas, sesiones y rutinas locales. Exporta una copia antes si deseas conservarlas.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Vaciar', style: 'destructive', onPress: () => { startEmpty(); hapticWarning(); } }]);

  return (
    <>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={22} color={theme.colors.text} /></Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Preferencias</Text>
          <View style={styles.iconButton} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <Text style={[styles.display, { color: theme.colors.text }]}>FOCO a tu manera</Text>
          <Text style={[styles.intro, { color: theme.colors.muted }]}>Apariencia, jornada, rutinas y seguridad de datos en un solo lugar.</Text>

          <Section title="Apariencia">
            <View style={[styles.segmented, { backgroundColor: theme.colors.panelSoft, borderColor: theme.colors.borderSoft }]}>
              {appearances.map((option) => {
                const active = state.appearance === option.value;
                return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => { updateAppearance(option.value); hapticSelection(); }} style={({ pressed }) => [styles.appearance, active && { backgroundColor: theme.colors.inverse }, pressed && pressedStyle]}><Text style={[styles.appearanceLabel, { color: active ? theme.colors.inverseText : theme.colors.text }]}>{option.label}</Text><Text style={[styles.appearanceDetail, { color: active ? theme.colors.inverseText : theme.colors.muted }]} numberOfLines={2}>{option.detail}</Text></Pressable>;
              })}
            </View>
          </Section>

          <Section title="Jornada">
            <View style={[styles.group, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]}>
              <NumberSetting icon="clock" label="Empieza" value={state.planning.workdayStartHour} suffix=":00" min={0} max={22} onChange={(value) => updatePlanning({ workdayStartHour: value })} />
              <NumberSetting icon="clock" label="Termina" value={state.planning.workdayEndHour} suffix=":00" min={state.planning.workdayStartHour + 1} max={24} onChange={(value) => updatePlanning({ workdayEndHour: value })} />
              <NumberSetting icon="previous" label="Margen entre tareas" value={state.planning.bufferMinutes} suffix=" min" min={0} max={120} step={5} onChange={(value) => updatePlanning({ bufferMinutes: value })} />
              <NumberSetting icon="target" label="Duración predeterminada" value={state.planning.defaultTaskDurationMinutes} suffix=" min" min={5} max={480} step={5} onChange={(value) => updatePlanning({ defaultTaskDurationMinutes: value })} last />
            </View>
          </Section>

          <Section title="Flujos reutilizables">
            <ActionRow icon="repeat" title="Rutinas" detail={`${state.routines.length} plantillas`} onPress={() => setRoutinesOpen(true)} />
          </Section>

          <Section title="Tus datos">
            <View style={[styles.group, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]}>
              <ActionRow icon="archive" title="Copia completa" detail="JSON restaurable" onPress={exportBackup} grouped />
              <ActionRow icon="list" title="Exportar tareas" detail="CSV compatible con Excel" onPress={exportTasks} grouped />
              <ActionRow icon="clock" title="Exportar sesiones" detail="Historial de enfoque en CSV" onPress={exportSessions} grouped />
              <ActionRow icon="copy" title="Restaurar copia" detail="Pega un respaldo validado" onPress={() => setImportOpen(true)} grouped last />
            </View>
          </Section>

          <Section title="Diagnóstico">
            <View style={[styles.diagnostics, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]}>
              <Diagnostic label="Estado" value={`v${state.version}`} />
              <Diagnostic label="Datos locales" value={`${formatBytes(bytes)}`} />
              <Diagnostic label="Tareas" value={String(state.tasks.length)} />
              <Diagnostic label="Sesiones" value={String(state.sessions.length)} />
              <Diagnostic label="Recordatorios" value={notificationCount === null ? '—' : String(notificationCount)} />
              <Diagnostic label="Permiso" value={permission} />
            </View>
          </Section>

          <Section title="Demostración y reinicio">
            <ActionRow icon="bulb" title="Cargar espacio de demostración" detail="Ejemplos completos para explorar FOCO" onPress={confirmDemo} />
            <ActionRow icon="trash" title="Empezar con FOCO vacío" detail="Elimina todos los datos locales" onPress={confirmEmpty} danger />
          </Section>
        </ScrollView>
      </SafeAreaView>
      <RoutinesSheet visible={routinesOpen} onClose={() => setRoutinesOpen(false)} />
      <FocoSheet visible={importOpen} title="Restaurar copia" subtitle="Pega el contenido JSON. FOCO validará todo antes de reemplazar datos." onClose={() => { setImportOpen(false); setImportError(null); }} footer={<><SheetButton label="Cancelar" variant="secondary" onPress={() => { setImportOpen(false); setImportError(null); }} /><SheetButton label="Validar" onPress={previewImport} disabled={!importSource.trim()} /></>}>
        <FieldLabel>CONTENIDO DE LA COPIA</FieldLabel>
        <TextInput value={importSource} onChangeText={setImportSource} placeholder={'{\n  "format": "foco-backup", ...\n}'} placeholderTextColor={theme.colors.subtle} multiline textAlignVertical="top" autoCapitalize="none" autoCorrect={false} style={[styles.importInput, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: importError ? theme.colors.danger : theme.colors.border }]} />
        {importError ? <Text style={[styles.importError, { color: theme.colors.danger }]}>{importError}</Text> : null}
      </FocoSheet>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useFocoTheme();
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>{children}</View>;
}

function ActionRow({ icon, title, detail, onPress, grouped = false, last = false, danger = false }: { icon: IconName; title: string; detail: string; onPress: () => void | Promise<void>; grouped?: boolean; last?: boolean; danger?: boolean }) {
  const theme = useFocoTheme();
  return <Pressable accessibilityRole="button" onPress={() => void onPress()} style={({ pressed }) => [styles.actionRow, grouped && { paddingHorizontal: 12 }, grouped && !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderSoft }, !grouped && { backgroundColor: theme.colors.panel, borderColor: theme.colors.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: 13, paddingHorizontal: 12, marginBottom: 6 }, pressed && pressedStyle]}><View style={[styles.actionIcon, { backgroundColor: danger ? theme.colors.accentSoft : theme.colors.panelStrong }]}><FocoIcon name={icon} size={18} color={danger ? theme.colors.danger : theme.colors.text} /></View><View style={styles.actionCopy}><Text style={[styles.actionTitle, { color: danger ? theme.colors.danger : theme.colors.text }]}>{title}</Text><Text style={[styles.actionDetail, { color: theme.colors.muted }]}>{detail}</Text></View><FocoIcon name="chevron-right" size={16} color={theme.colors.subtle} /></Pressable>;
}

function NumberSetting({ icon, label, value, suffix, min, max, step = 1, onChange, last = false }: { icon: IconName; label: string; value: number; suffix: string; min: number; max: number; step?: number; onChange: (value: number) => void; last?: boolean }) {
  const theme = useFocoTheme();
  return <View style={[styles.numberRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderSoft }]}><FocoIcon name={icon} size={18} color={theme.colors.muted} /><Text style={[styles.numberLabel, { color: theme.colors.text }]}>{label}</Text><Pressable accessibilityLabel={`Reducir ${label}`} onPress={() => onChange(Math.max(min, value - step))} style={({ pressed }) => [styles.numberButton, { borderColor: theme.colors.border }, pressed && pressedStyle]}><Text style={[styles.numberSymbol, { color: theme.colors.text }]}>−</Text></Pressable><Text style={[styles.numberValue, { color: theme.colors.text }]}>{value}{suffix}</Text><Pressable accessibilityLabel={`Aumentar ${label}`} onPress={() => onChange(Math.min(max, value + step))} style={({ pressed }) => [styles.numberButton, { borderColor: theme.colors.border }, pressed && pressedStyle]}><Text style={[styles.numberSymbol, { color: theme.colors.text }]}>+</Text></Pressable></View>;
}

function Diagnostic({ label, value }: { label: string; value: string }) {
  const theme = useFocoTheme();
  return <View style={styles.diagnostic}><Text style={[styles.diagnosticValue, { color: theme.colors.text }]}>{value}</Text><Text style={[styles.diagnosticLabel, { color: theme.colors.muted }]}>{label}</Text></View>;
}

function dateStamp() { return new Date().toISOString().slice(0, 10); }
function formatBytes(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
  content: { paddingHorizontal: 14, paddingBottom: 60 },
  display: { fontFamily: 'Manrope_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.65, marginTop: 6 },
  intro: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 17, marginTop: 3 },
  section: { marginTop: 20 },
  sectionTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14.5, lineHeight: 19, marginBottom: 7 },
  segmented: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', padding: 3, gap: 3 },
  appearance: { flex: 1, minHeight: 66, borderRadius: 11, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  appearanceLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15 },
  appearanceDetail: { fontFamily: 'Manrope_400Regular', fontSize: 8.8, lineHeight: 12, textAlign: 'center', marginTop: 2 },
  group: { borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  numberRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  numberLabel: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 12.5, lineHeight: 16 },
  numberButton: { width: 36, height: 36, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  numberSymbol: { fontFamily: 'Manrope_500Medium', fontSize: 18, lineHeight: 21 },
  numberValue: { minWidth: 54, textAlign: 'center', fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15, fontVariant: ['tabular-nums'] },
  actionRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, minWidth: 0, paddingHorizontal: 10 },
  actionTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, lineHeight: 16 },
  actionDetail: { fontFamily: 'Manrope_400Regular', fontSize: 10, lineHeight: 13, marginTop: 2 },
  diagnostics: { borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8 },
  diagnostic: { width: '33.333%', minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  diagnosticValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 17, fontVariant: ['tabular-nums'] },
  diagnosticLabel: { fontFamily: 'Manrope_400Regular', fontSize: 8.8, lineHeight: 12, marginTop: 2 },
  importInput: { minHeight: 230, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  importError: { fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 15, marginTop: 8 },
});
