import { type PropsWithChildren, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocoIcon } from './FocoIcon';
import { useFocoTheme } from './FocoThemeContext';
import { useFocoUI } from './FocoUIContext';
import { pressedStyle, useReducedMotion } from './premium';
import { typeScale } from './typeScale';
import type { FocoTheme } from './themeTokens';

type Props = PropsWithChildren<{ visible: boolean; title: string; subtitle?: string; onClose: () => void; footer?: ReactNode }>;

export function FocoSheet({ visible, title, subtitle, onClose, footer, children }: Props) {
  const reducedMotion = useReducedMotion();
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { registerOverlay, unregisterOverlay } = useFocoUI();
  const registered = useRef(false);

  useEffect(() => {
    if (visible && !registered.current) { registered.current = true; registerOverlay(); }
    if (!visible && registered.current) { registered.current = false; unregisterOverlay(); }
    return () => { if (registered.current) { registered.current = false; unregisterOverlay(); } };
  }, [registerOverlay, unregisterOverlay, visible]);

  const close = () => { Keyboard.dismiss(); onClose(); };

  return (
    <Modal visible={visible} transparent statusBarTranslucent navigationBarTranslucent animationType={reducedMotion ? 'none' : 'slide'} onRequestClose={close}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.backdrop} onPress={close} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title} maxFontSizeMultiplier={1.2}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={8} onPress={close} style={({ pressed }) => [styles.close, pressed && pressedStyle]}>
              <FocoIcon name="plus" size={21} color={theme.colors.muted} style={styles.closeIcon} />
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function SheetButton({ label, onPress, variant = 'primary', disabled = false }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'primary' && styles.buttonPrimary, variant === 'secondary' && styles.buttonSecondary, variant === 'danger' && styles.buttonDanger, disabled && styles.buttonDisabled, pressed && !disabled && pressedStyle]}>
      <Text style={[styles.buttonText, variant === 'primary' && styles.buttonTextPrimary, variant === 'danger' && styles.buttonTextDanger]}>{label}</Text>
    </Pressable>
  );
}

export function FieldLabel({ children }: PropsWithChildren) {
  const theme = useFocoTheme();
  return <Text style={{ color: theme.colors.muted, ...typeScale.caption, fontWeight: '700', letterSpacing: 0.65, marginBottom: 6 }}>{children}</Text>;
}

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.overlay },
    sheet: { backgroundColor: theme.colors.bgRaised, borderTopLeftRadius: theme.radius.sheet, borderTopRightRadius: theme.radius.sheet, borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 0, borderColor: theme.colors.border, paddingHorizontal: 16, paddingTop: 7, maxHeight: '92%' },
    handle: { width: 34, height: 4, borderRadius: 2, backgroundColor: theme.colors.subtle, alignSelf: 'center', marginBottom: 9 },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    headerCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
    title: { color: theme.colors.text, ...typeScale.title },
    subtitle: { color: theme.colors.muted, ...typeScale.metadata, marginTop: 2 },
    close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: theme.colors.panelStrong },
    closeIcon: { transform: [{ rotate: '45deg' }] },
    scroll: { flexShrink: 1 },
    body: { paddingTop: 14, paddingBottom: 3 },
    footer: { flexDirection: 'row', gap: 8, paddingTop: 10, paddingBottom: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.borderSoft },
    button: { minHeight: 48, flex: 1, borderRadius: theme.radius.control, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
    buttonPrimary: { backgroundColor: theme.colors.inverse },
    buttonSecondary: { backgroundColor: theme.colors.panelStrong, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border },
    buttonDanger: { backgroundColor: theme.colors.panelStrong, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.danger },
    buttonDisabled: { opacity: 0.42 },
    buttonText: { color: theme.colors.text, fontFamily: theme.fonts.semibold, fontSize: 14, lineHeight: 18 },
    buttonTextPrimary: { color: theme.colors.inverseText },
    buttonTextDanger: { color: theme.colors.danger },
  });
}
