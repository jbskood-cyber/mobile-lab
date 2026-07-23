import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocoIcon } from './FocoIcon';
import { foco } from './focoTheme';
import { pressedStyle, useReducedMotion } from './premium';

type Props = PropsWithChildren<{
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
}>;

export function FocoSheet({ visible, title, subtitle, onClose, footer, children }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title} maxFontSizeMultiplier={1.15}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && pressedStyle]}
            >
              <FocoIcon name="plus" size={23} color={foco.colors.muted} style={styles.closeIcon} />
            </Pressable>
          </View>
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function SheetButton({ label, onPress, variant = 'primary', disabled = false }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && pressedStyle,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'primary' && styles.buttonTextPrimary, variant === 'danger' && styles.buttonTextDanger]}>{label}</Text>
    </Pressable>
  );
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.68)' },
  sheet: {
    backgroundColor: '#101216',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: foco.colors.border,
    paddingHorizontal: 22,
    paddingTop: 10,
    maxHeight: '88%',
  },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#484B52', alignSelf: 'center', marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerCopy: { flex: 1, paddingRight: 12 },
  title: { color: foco.colors.text, fontSize: 24, fontWeight: '650' },
  subtitle: { color: foco.colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: foco.colors.panelStrong },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  body: { paddingTop: 22 },
  footer: { flexDirection: 'row', gap: 10, paddingTop: 22, paddingBottom: 10 },
  button: { minHeight: 52, flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonPrimary: { backgroundColor: foco.colors.text },
  buttonSecondary: { backgroundColor: foco.colors.panelStrong, borderWidth: 1, borderColor: foco.colors.border },
  buttonDanger: { backgroundColor: '#251719', borderWidth: 1, borderColor: '#603038' },
  buttonDisabled: { opacity: 0.42 },
  buttonText: { color: foco.colors.text, fontSize: 15.5, fontWeight: '600' },
  buttonTextPrimary: { color: foco.colors.bg },
  buttonTextDanger: { color: '#F2B9C0' },
  fieldLabel: { color: foco.colors.muted, fontSize: 12.5, fontWeight: '600', letterSpacing: 0.4, marginBottom: 8 },
});
