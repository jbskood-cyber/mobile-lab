import { type PropsWithChildren, type ReactNode, useEffect, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocoIcon } from './FocoIcon';
import { useFocoUI } from './FocoUIContext';
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
  const { registerOverlay, unregisterOverlay } = useFocoUI();
  const registered = useRef(false);

  useEffect(() => {
    if (visible && !registered.current) {
      registered.current = true;
      registerOverlay();
    }
    if (!visible && registered.current) {
      registered.current = false;
      unregisterOverlay();
    }
    return () => {
      if (registered.current) {
        registered.current = false;
        unregisterOverlay();
      }
    };
  }, [registerOverlay, unregisterOverlay, visible]);

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={close}
    >
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.backdrop} onPress={close} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title} maxFontSizeMultiplier={1.2}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              onPress={close}
              style={({ pressed }) => [styles.close, pressed && pressedStyle]}
            >
              <FocoIcon name="plus" size={23} color={foco.colors.muted} style={styles.closeIcon} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {children}
          </ScrollView>
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
  sheet: {
    backgroundColor: '#101216',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: foco.colors.border,
    paddingHorizontal: 20,
    paddingTop: 9,
    maxHeight: '90%',
  },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#4B4F57', alignSelf: 'center', marginBottom: 13 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
  title: { color: foco.colors.text, fontSize: 23, lineHeight: 28, fontWeight: '600', letterSpacing: -0.4 },
  subtitle: { color: foco.colors.muted, fontSize: 13.5, lineHeight: 19, marginTop: 4 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: foco.colors.panelStrong },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  scroll: { flexShrink: 1 },
  body: { paddingTop: 20, paddingBottom: 4 },
  footer: { flexDirection: 'row', gap: 10, paddingTop: 14, paddingBottom: 8, borderTopWidth: 1, borderTopColor: foco.colors.borderSoft },
  button: { minHeight: 52, flex: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: foco.colors.text },
  buttonSecondary: { backgroundColor: foco.colors.panelStrong, borderWidth: 1, borderColor: foco.colors.border },
  buttonDanger: { backgroundColor: '#251719', borderWidth: 1, borderColor: '#603038' },
  buttonDisabled: { opacity: 0.42 },
  buttonText: { color: foco.colors.text, fontSize: 15, fontWeight: '600' },
  buttonTextPrimary: { color: foco.colors.bg },
  buttonTextDanger: { color: '#F2B9C0' },
  fieldLabel: { color: foco.colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.7, marginBottom: 8 },
});
