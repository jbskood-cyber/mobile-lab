import { type PropsWithChildren, type ReactNode, useEffect, useRef } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { useFocoUI } from './FocoUIContext';
import { foco } from './focoTheme';
import { pressedStyle } from './premium';
import { typeScale } from './typeScale';

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
  contentBottomPadding = 104,
  children,
}: ScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { openAppMenu, registerScrollTarget } = useFocoUI();

  useEffect(() => registerScrollTarget(screenKey, () => {
    Keyboard.dismiss();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }), [registerScrollTarget, screenKey]);

  const content = (
    <View style={[styles.content, { paddingBottom: contentBottomPadding }]}> 
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú de FOCO" hitSlop={8} onPress={openAppMenu} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}>
          <FocoIcon name="menu" size={25} color={foco.colors.text} />
        </Pressable>
        {rightIcon ? (
          <Pressable accessibilityRole="button" accessibilityLabel={rightAccessibilityLabel} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]} onPress={onRightPress}>
            <FocoIcon name={rightIcon} size={24} color={foco.colors.text} />
          </Pressable>
        ) : <View style={styles.iconButton} />}
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={1.18}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} maxFontSizeMultiplier={1.25}>{subtitle}</Text> : null}
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
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
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
  return <Text style={styles.eyebrow}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: foco.colors.bg },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { paddingHorizontal: 16 },
  toolbar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { color: foco.colors.text, ...typeScale.display },
  subtitle: { color: foco.colors.muted, ...typeScale.body, marginTop: 2 },
  surface: { backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.border, borderRadius: foco.radius.surface },
  sectionRow: { marginTop: 18, marginBottom: 7, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleLine: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 8 },
  sectionTitle: { color: foco.colors.text, ...typeScale.section },
  sectionDetail: { flexShrink: 1, color: foco.colors.muted, fontSize: 13, lineHeight: 18 },
  eyebrow: { color: foco.colors.muted, ...typeScale.caption, fontWeight: '700', letterSpacing: 2.6 },
});
