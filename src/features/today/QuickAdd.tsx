import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii, spacing, typeScale } from '@/src/ui/theme';

type QuickAddProps = {
  onAdd: (title: string) => void;
};

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<TextInput>(null);

  const open = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submit = () => {
    if (!title.trim()) {
      return;
    }

    onAdd(title);
    setTitle('');
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Añadir tarea"
        onPress={open}
        style={({ pressed }) => [
          styles.collapsed,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.plus}>＋</Text>
        <Text style={styles.placeholder}>Añadir tarea</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.expanded}>
      <Text style={styles.plus}>＋</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel="Nombre de la tarea"
        autoCapitalize="sentences"
        blurOnSubmit={false}
        onChangeText={setTitle}
        onSubmitEditing={submit}
        placeholder="¿Qué necesitas hacer?"
        placeholderTextColor={colors.textSubtle}
        returnKeyType="done"
        style={styles.input}
        value={title}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Guardar tarea"
        onPress={submit}
        style={({ pressed }) => [
          styles.save,
          !title.trim() && styles.saveDisabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.saveText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  expanded: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  plus: {
    color: colors.textMuted,
    fontSize: 30,
    lineHeight: 34,
    marginRight: spacing.md,
  },
  placeholder: {
    color: colors.textSubtle,
    fontSize: typeScale.bodyLarge,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: colors.text,
    fontSize: typeScale.bodyLarge,
  },
  save: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
  },
  saveDisabled: {
    opacity: 0.35,
  },
  saveText: {
    color: colors.black,
    fontSize: typeScale.caption,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
});