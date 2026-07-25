import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FocoPressable } from '@/src/ui/FocoPressable';
import { FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { normalizeIntegerDraft, parseOptionalInteger } from '@/src/ui/formModel';

const TIMER_PRESETS = [5, 10, 15, 25, 45, 60] as const;

export function TimerPresetSheet({ visible, minutes, onApply, onClose }: {
  visible: boolean;
  minutes: number;
  onApply: (minutes: number) => void;
  onClose: () => void;
}) {
  const theme = useFocoTheme();
  const [draft, setDraft] = useState(String(minutes));

  useEffect(() => {
    if (visible) setDraft(String(minutes));
  }, [minutes, visible]);

  const parsed = parseOptionalInteger(draft, 1, 180);
  const apply = () => {
    if (parsed === null) return;
    onApply(parsed);
  };

  return (
    <FocoSheet
      visible={visible}
      title="Temporizador"
      subtitle="Elige una duración rápida o escribe una personalizada."
      onClose={onClose}
      footer={<SheetButton label="Aplicar" onPress={apply} disabled={parsed === null} />}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presets}>
        {TIMER_PRESETS.map((value) => {
          const selected = parsed === value;
          return (
            <FocoPressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${value} minutos`}
              feedback="quiet"
              onPress={() => setDraft(String(value))}
              style={[styles.preset, { borderColor: selected ? theme.colors.inverse : theme.colors.border, backgroundColor: selected ? theme.colors.inverse : 'transparent' }]}
            >
              <Text style={[styles.presetText, { color: selected ? theme.colors.inverseText : theme.colors.text, fontFamily: theme.fonts.semibold }]}>{value} min</Text>
            </FocoPressable>
          );
        })}
      </ScrollView>
      <View style={styles.custom}>
        <Text style={[styles.label, { color: theme.colors.muted, fontFamily: theme.fonts.bold }]}>PERSONALIZADO</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={() => setDraft(normalizeIntegerDraft(draft, minutes, 1, 180))}
          keyboardType="number-pad"
          inputMode="numeric"
          selectTextOnFocus
          accessibilityLabel="Duración personalizada en minutos"
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: parsed === null ? theme.colors.danger : theme.colors.border, fontFamily: theme.fonts.semibold }]}
        />
        <Text style={[styles.hint, { color: theme.colors.subtle, fontFamily: theme.fonts.regular }]}>1–180 min</Text>
      </View>
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  presets: { gap: 7, paddingBottom: 18 },
  preset: { minHeight: 40, minWidth: 62, borderWidth: StyleSheet.hairlineWidth, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11 },
  presetText: { fontSize: 11, lineHeight: 14 },
  custom: { gap: 5 },
  label: { fontSize: 8.5, lineHeight: 12, letterSpacing: 0.6 },
  input: { minHeight: 46, borderWidth: StyleSheet.hairlineWidth, borderRadius: 11, paddingHorizontal: 12, fontSize: 15, lineHeight: 19, fontVariant: ['tabular-nums'] },
  hint: { fontSize: 9.5, lineHeight: 13 },
});
