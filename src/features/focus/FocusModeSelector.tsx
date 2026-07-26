import { StyleSheet, Text, View } from 'react-native';

import { FOCO_RUNTIME_FINGERPRINT } from '@/src/core/runtimeFingerprint';
import type { TimerMode } from '@/src/core/focusTimer';
import { FocoPressable } from '@/src/ui/FocoPressable';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';

const modes: Array<{ mode: TimerMode; label: string }> = [
  { mode: 'pomodoro', label: 'Pomodoro' },
  { mode: 'timer', label: 'Temporizador' },
  { mode: 'stopwatch', label: 'Cronómetro' },
];

export function FocusModeSelector({
  mode,
  disabled,
  pomodoroMinutes,
  timerMinutes,
  onMode,
  onConfigurePomodoro,
  onConfigureTimer,
}: {
  mode: TimerMode;
  disabled: boolean;
  pomodoroMinutes: number;
  timerMinutes: number;
  onMode: (mode: TimerMode) => void;
  onConfigurePomodoro: () => void;
  onConfigureTimer: () => void;
}) {
  const theme = useFocoTheme();
  const detail = mode === 'pomodoro'
    ? { label: `Pomodoro · ${pomodoroMinutes} min`, onPress: onConfigurePomodoro }
    : mode === 'timer'
      ? { label: `Temporizador · ${timerMinutes} min`, onPress: onConfigureTimer }
      : undefined;

  return (
    <View style={styles.wrap}>
      <View style={[styles.switch, { backgroundColor: theme.colors.panelSoft, borderColor: theme.colors.borderSoft }]} accessibilityRole="radiogroup">
        {modes.map((item) => {
          const selected = mode === item.mode;
          return (
            <FocoPressable
              key={item.mode}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              accessibilityLabel={item.label}
              disabled={disabled}
              feedback="quiet"
              onPress={() => onMode(item.mode)}
              style={[styles.mode, selected && { backgroundColor: theme.colors.inverse }, disabled && !selected && styles.disabled]}
            >
              <Text style={[styles.modeText, { color: selected ? theme.colors.inverseText : theme.colors.muted, fontFamily: selected ? theme.fonts.semibold : theme.fonts.medium }]} numberOfLines={1}>{item.label}</Text>
            </FocoPressable>
          );
        })}
      </View>
      {__DEV__ ? (
        <Text accessibilityLabel={`Runtime ${FOCO_RUNTIME_FINGERPRINT}`} style={[styles.runtimeFingerprint, { color: theme.colors.inactive, fontFamily: theme.fonts.medium }]}>
          {FOCO_RUNTIME_FINGERPRINT}
        </Text>
      ) : null}
      {detail ? (
        <FocoPressable
          accessibilityRole="button"
          accessibilityLabel={`Configurar ${detail.label}`}
          disabled={disabled}
          feedback="quiet"
          onPress={detail.onPress}
          style={styles.detail}
        >
          <Text style={[styles.detailText, { color: disabled ? theme.colors.inactive : theme.colors.muted, fontFamily: theme.fonts.medium }]}>{detail.label}</Text>
        </FocoPressable>
      ) : (
        <Text style={[styles.detailText, styles.stopwatchDetail, { color: theme.colors.muted, fontFamily: theme.fonts.medium }]}>Cronómetro libre</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  switch: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderRadius: 13, padding: 3 },
  mode: { flex: 1, minHeight: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  modeText: { fontSize: 11, lineHeight: 14 },
  disabled: { opacity: 0.5 },
  runtimeFingerprint: { alignSelf: 'center', fontSize: 8, lineHeight: 10, letterSpacing: 0.2 },
  detail: { minHeight: 30, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  detailText: { fontSize: 11, lineHeight: 14 },
  stopwatchDetail: { minHeight: 30, textAlign: 'center', textAlignVertical: 'center' },
});
