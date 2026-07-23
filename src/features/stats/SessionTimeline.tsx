import { StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { foco } from '@/src/ui/focoTheme';

type TimelineItem = {
  id: string;
  endedAt: number;
  durationSec: number;
  mode: 'pomodoro' | 'stopwatch';
  cycleNumber: number;
  projectName: string;
  taskTitle?: string;
  interrupted: boolean;
};

export function SessionTimeline({ sessions }: { sessions: TimelineItem[] }) {
  if (sessions.length === 0) return <Text style={styles.empty}>Completa una sesión para construir tu historial.</Text>;
  return (
    <View style={styles.list}>
      {sessions.map((session) => (
        <View key={session.id} style={styles.row} accessibilityLabel={`${session.taskTitle ?? session.projectName}, ${formatDuration(session.durationSec, true)}`}>
          <View style={styles.icon}><FocoIcon name={session.mode === 'pomodoro' ? 'target' : 'clock'} size={19} color={foco.colors.text} /></View>
          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={1}>{session.taskTitle ?? session.projectName}</Text>
            <Text style={styles.meta}>{session.projectName} · {new Date(session.endedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {session.interrupted ? 'parcial' : session.mode === 'pomodoro' ? `ciclo ${session.cycleNumber}` : 'cronómetro'}</Text>
          </View>
          <Text style={styles.duration}>{formatDuration(session.durationSec, true)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  icon: { width: 36, height: 36, borderRadius: 12, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  title: { color: foco.colors.text, fontSize: 13.5, fontWeight: '600' },
  meta: { color: foco.colors.muted, fontSize: 10.8, marginTop: 4 },
  duration: { color: foco.colors.text, fontSize: 12.5, fontVariant: ['tabular-nums'] },
  empty: { color: foco.colors.muted, fontSize: 12.5, textAlign: 'center', paddingVertical: 24 },
});
