import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { AgendaSessionEvent } from '@/src/core/agendaDay';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { fontFamilies, typeScale } from '@/src/ui/themeTokens';

function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function AgendaSessionBlock({ event, projectColor, style }: { event: AgendaSessionEvent; projectColor: string; style?: StyleProp<ViewStyle> }) {
  const theme = useFocoTheme();
  const title = event.taskTitle?.trim() || 'Sesión de enfoque';
  const status = event.interrupted && !event.completed ? 'Parcial' : event.completed ? 'Completada' : 'Registrada';

  return (
    <View
      accessibilityLabel={`${title}, ${formatDuration(event.durationSec)}, ${status}`}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.panelStrong,
          borderColor: theme.colors.border,
          borderLeftColor: projectColor,
        },
        style,
      ]}
    >
      <Text numberOfLines={1} style={[typeScale.metadata, styles.title, { color: theme.colors.text, fontFamily: fontFamilies.semibold }]}>{title}</Text>
      <View style={styles.projectLine}><View style={[styles.projectDot, { backgroundColor: projectColor }]} /><Text numberOfLines={1} style={[typeScale.caption, { color: theme.colors.muted }]}>{event.projectName}</Text></View>
      <View style={styles.metaRow}>
        <Text style={[typeScale.caption, styles.numeric, { color: theme.colors.subtle }]}>{formatClock(event.startedAt)}–{formatClock(event.endedAt)}</Text>
        <Text style={[typeScale.caption, styles.numeric, { color: theme.colors.text, fontFamily: fontFamilies.semibold }]}>{formatDuration(event.durationSec)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  title: { lineHeight: 15 },
  projectLine: { marginTop: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  projectDot: { width: 4, height: 4, borderRadius: 2 },
  metaRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  numeric: { fontVariant: ['tabular-nums'] },
});
