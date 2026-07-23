import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FocoIcon } from './FocoIcon';
import { foco } from './focoTheme';
import { hapticSelection, pressedStyle } from './premium';

type PickerMode = 'date' | 'time';

type Props = {
  value?: number;
  onChange: (value: number | undefined) => void;
  minimumDate?: number;
  accessibilityLabel?: string;
};

export function NativeDateTimeField({ value, onChange, minimumDate, accessibilityLabel = 'Fecha y hora' }: Props) {
  const [mode, setMode] = useState<PickerMode | null>(null);
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
        <FocoIcon name="calendar" size={19} color={foco.colors.muted} />
        <Text style={styles.value}>{value ? date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha'}</Text>
      </Pressable>
      <Pressable onPress={() => open('time')} style={({ pressed }) => [styles.field, pressed && pressedStyle]}>
        <FocoIcon name="clock" size={19} color={foco.colors.muted} />
        <Text style={styles.value}>{value ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Hora'}</Text>
      </Pressable>
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Quitar fecha y hora" onPress={() => onChange(undefined)} style={({ pressed }) => [styles.clear, pressed && pressedStyle]}>
          <FocoIcon name="plus" size={18} color={foco.colors.muted} style={styles.closeIcon} />
        </Pressable>
      ) : null}
      {mode ? (
        <DateTimePicker
          value={date}
          mode={mode}
          display="default"
          minimumDate={minimumDate ? new Date(minimumDate) : undefined}
          is24Hour
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 18 },
  field: { minHeight: 50, flex: 1, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { color: foco.colors.text, fontSize: 13.5, flexShrink: 1 },
  clear: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border },
  closeIcon: { transform: [{ rotate: '45deg' }] },
});
