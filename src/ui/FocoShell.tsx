import { type PropsWithChildren, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { useFocoTheme } from './FocoThemeContext';
import { useFocoUI } from './FocoUIContext';
import { pressedStyle } from './premium';
import { typeScale } from './typeScale';
import type { FocoTheme } from './themeTokens';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  screenKey?: string;
  rightIcon?: IconName;
  rightAccessibilityLabel?: string;
  onRightPress?: () => void;
  scroll?: boolean;
  contentBottomPadding?: number;
}>;

export function FocoScreen({
  title,
  subtitle,
  screenKey = title.toLowerCase(),
  rightIcon,
  rightAccessibilityLabel = 'Acción de pantalla',
  onRightPress,
  scroll = true,
  contentBottomPadding = 84,
  children,
}: ScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { openAppMenu, registerScrollTarget } = useFocoUI();
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => registerScrollTarget(screenKey, () => {
    Keyboard.dismiss();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }), [registerScrollTarget, screenKey]);

  const content = (
    <View style={[styles.content, { paddingBottom: contentBottomPadding }]}> 
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú de FOCO" hitSlop={8} onPress={openAppMenu} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}>
          <FocoIcon name="menu" size={22} color={theme.colors.text} />
        </Pressable>
        {rightIcon ? (
          <Pressable accessibilityRole="button" accessibilityLabel={rightAccessibilityLabel} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]} onPress={onRightPress}>
            <FocoIcon name={rightIcon} size={22} color={theme.colors.text} />
          </Pressable>
        ) : <View style={styles.iconButton} />}
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={1.18}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} maxFontSizeMultiplier={1.2}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}

export function Surface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const theme = useFocoTheme();
  return <View style={[{ backgroundColor: theme.colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, borderRadius: theme.radius.surface }, style]}>{children}</View>;
}

export function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionTitleLine}>
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.2}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail} numberOfLines={1}>{detail}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Eyebrow({ children }: PropsWithChildren) {
  const theme = useFocoTheme();
  return <Text style={{ color: theme.colors.muted, ...typeScale.caption, fontWeight: '700', letterSpacing: 2.1 }}>{children}</Text>;
}

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.bg },
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    content: { paddingHorizontal: theme.density.pageHorizontal },
    toolbar: { height: theme.density.toolbarHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { color: theme.colors.text, ...typeScale.display },
    subtitle: { color: theme.colors.muted, ...typeScale.body, marginTop: 0 },
    sectionRow: { marginTop: theme.density.sectionTop, marginBottom: theme.density.sectionBottom, minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitleLine: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8 },
    sectionTitle: { color: theme.colors.text, ...typeScale.section },
    sectionDetail: { flexShrink: 1, color: theme.colors.muted, ...typeScale.metadata },
  });
}
