import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco, shadowGlow } from '@/src/ui/focoTheme';

type Mode = 'Pomodoro' | 'Cronómetro';

export function FocusScreen() {
  const [mode, setMode] = useState<Mode>('Pomodoro');
  const [running, setRunning] = useState(true);

  return (
    <FocoScreen title="Enfoque" rightIcon="sliders">
      <Surface style={styles.segmented}>
        {(['Pomodoro', 'Cronómetro'] as Mode[]).map((item) => {
          const selected = item === mode;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setMode(item)}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{item}</Text>
            </Pressable>
          );
        })}
      </Surface>

      <View style={styles.context}>
        <Text style={styles.blockTitle}>Bloque 2 · Transformación</Text>
        <View style={styles.projectLine}><Text style={styles.project}>Plan maestro</Text><View style={styles.dot} /></View>
      </View>

      <View style={styles.timerWrap}>
        <View style={styles.timerHalo} />
        <ProgressRing size={300} strokeWidth={14} progress={0.77} color={foco.colors.white} trackColor="#2A2D33" glow>
          <View style={styles.timerCopy}>
            <Text style={styles.timerLabel}>{mode === 'Pomodoro' ? 'Enfocado en' : 'Cronómetro'}</Text>
            <Text style={styles.timer}>24:36</Text>
            <Text style={styles.goal}>Objetivo: 3 bloques</Text>
          </View>
        </ProgressRing>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel="Bloque anterior" style={styles.secondaryControl}>
          <FocoIcon name="previous" size={28} color={foco.colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pausar' : 'Continuar'}
          onPress={() => setRunning((value) => !value)}
          style={styles.primaryControl}
        >
          <FocoIcon name={running ? 'pause' : 'play'} size={34} color={foco.colors.white} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Detener" style={styles.secondaryControl}>
          <FocoIcon name="stop" size={27} color={foco.colors.text} />
        </Pressable>
      </View>

      <Surface style={styles.sessionConfig}>
        <SessionMetric value="1 / 3" label="Ciclos" />
        <View style={styles.divider} />
        <SessionMetric value="50:00" label="Sesión" />
        <View style={styles.divider} />
        <SessionMetric value="10:00" label="Descanso" />
      </Surface>

      <Surface style={styles.todayCard}>
        <Text style={styles.todayTitle}>Sesión de hoy</Text>
        <View style={styles.todayRow}>
          <View style={styles.todayMetric}>
            <Text style={styles.todayValue}>2 / 4</Text>
            <Text style={styles.todayLabel}>Ciclos completados</Text>
          </View>
          <View style={styles.todayDivider} />
          <View style={styles.todayMetric}>
            <Text style={styles.todayValue}>1h 40m</Text>
            <Text style={styles.todayLabel}>Tiempo enfocado</Text>
          </View>
          <ProgressRing size={58} strokeWidth={5} progress={0.64} color={foco.colors.text} trackColor="#34373E" />
        </View>
      </Surface>
    </FocoScreen>
  );
}

function SessionMetric({ value, label }: { value: string; label: string }) {
  return <View style={styles.sessionMetric}><Text style={styles.sessionValue}>{value}</Text><Text style={styles.sessionLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  segmented: { marginTop: 24, minHeight: 56, padding: 3, flexDirection: 'row', borderRadius: 18 },
  segment: { flex: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: foco.colors.text },
  segmentText: { color: foco.colors.muted, fontSize: 16 },
  segmentTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  context: { alignItems: 'center', marginTop: 28 },
  blockTitle: { color: foco.colors.text, fontSize: 18, fontWeight: '500' },
  projectLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  project: { color: foco.colors.muted, fontSize: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: foco.colors.text },
  timerWrap: { height: 330, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  timerHalo: { position: 'absolute', width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: '#25282E' },
  timerCopy: { alignItems: 'center' },
  timerLabel: { color: foco.colors.muted, fontSize: 17 },
  timer: { color: foco.colors.text, fontSize: 66, lineHeight: 75, fontWeight: '300', letterSpacing: -2.5, marginTop: 8 },
  goal: { color: foco.colors.muted, fontSize: 16, marginTop: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24, marginTop: -3, marginBottom: 24 },
  secondaryControl: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: foco.colors.panelSoft },
  primaryControl: { width: 86, height: 86, borderRadius: 43, borderWidth: 1, borderColor: foco.colors.text, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center', ...shadowGlow },
  sessionConfig: { minHeight: 94, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  sessionMetric: { flex: 1, alignItems: 'center', gap: 6 },
  sessionValue: { color: foco.colors.text, fontSize: 23, fontWeight: '500' },
  sessionLabel: { color: foco.colors.muted, fontSize: 13 },
  divider: { width: 1, height: 52, backgroundColor: foco.colors.border },
  todayCard: { marginTop: 14, minHeight: 132, padding: 18 },
  todayTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '500' },
  todayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17 },
  todayMetric: { flex: 1 },
  todayValue: { color: foco.colors.text, fontSize: 23, fontWeight: '500' },
  todayLabel: { color: foco.colors.muted, fontSize: 13, marginTop: 6 },
  todayDivider: { width: 1, height: 50, backgroundColor: foco.colors.border, marginHorizontal: 16 },
});
