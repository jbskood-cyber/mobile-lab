import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FocoIcon } from './FocoIcon';
import { useFocoTheme } from './FocoThemeContext';
import { hapticSelection, pressedStyle } from './premium';
import type { FocoTheme } from './themeTokens';

type PickerMode = 'date' | 'time';

type Props = {
  value?: number;
  onChange: (value: number | undefined) => void;
  minimumDate?: number;
  accessibilityLabel?: string;
};

export function NativeDateTimeField({ value, onChange, minimumDate, accessibilityLabel = 'Fecha y hora' }: Props) {
  const [mode, setMode] = useState<PickerMode | null>(null);
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const date = new Date(value ?? Date.now());

  const open = (nextMode: PickerMode) => {
    setMode(nextMode);
    hapticSelection();
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setMode(null);
    if (event.type === 'dismissed' || !selected) return;
    const next = new Date(value ?? Date.now());
    if (mode === 'date') next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    else next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(next.getTime());
  };

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.row}>
      <Pressable onPress={() => open('date')} style={({ pressed }) => [styles.field, pressed && pressedStyle]}>
        <FocoIcon name="calendar" size={17} color={theme.colors.muted} />
        <Text style={styles.value} numberOfLines={1}>{value ? date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha'}</Text>
      </Pressable>
      <Pressable onPress={() => open('time')} style={({ pressed }) => [styles.field, pressed && pressedStyle]}>
        <FocoIcon name="clock" size={17} color={theme.colors.muted} />
        <Text style={styles.value}>{value ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Hora'}</Text>
      </Pressable>
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Quitar fecha y hora" onPress={() => onChange(undefined)} style={({ pressed }) => [styles.clear, pressed && pressedStyle]}>
          <FocoIcon name="plus" size={17} color={theme.colors.muted} style={styles.closeIcon} />
        </Pressable>
      ) : null}
      {mode ? <DateTimePicker value={date} mode={mode} display="default" minimumDate={minimumDate ? new Date(minimumDate) : undefined} is24Hour onChange={handleChange} /> : null}
    </View>
  );
}

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 14 },
    field: { minHeight: 46, flex: 1, borderRadius: theme.radius.control, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, backgroundColor: theme.colors.panel, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
    value: { color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 11.5, lineHeight: 15, flexShrink: 1 },
    clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.control, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border },
    closeIcon: { transform: [{ rotate: '45deg' }] },
  });
}
