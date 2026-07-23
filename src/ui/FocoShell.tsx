import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { foco } from './focoTheme';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightIcon?: IconName;
  onRightPress?: () => void;
  scroll?: boolean;
  contentBottomPadding?: number;
}>;

export function FocoScreen({
  title,
  subtitle,
  rightIcon,
  onRightPress,
  scroll = true,
  contentBottomPadding = 116,
  children,
}: ScreenProps) {
  const content = (
    <View style={[styles.content, { paddingBottom: contentBottomPadding }]}> 
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú" hitSlop={10} style={styles.iconButton}>
          <FocoIcon name="menu" size={27} color={foco.colors.text} />
        </Pressable>
        {rightIcon ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Acción de pantalla" hitSlop={10} style={styles.iconButton} onPress={onRightPress}>
            <FocoIcon name={rightIcon} size={25} color={foco.colors.text} />
          </Pressable>
        ) : <View style={styles.iconButton} />}
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={1.15}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} maxFontSizeMultiplier={1.15}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View pointerEvents="none" style={styles.ambientTop} />
      <View pointerEvents="none" style={styles.ambientBottom} />
      {scroll ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.15}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
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
  content: { paddingHorizontal: 22 },
  ambientTop: { position: 'absolute', top: -120, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.018)' },
  ambientBottom: { position: 'absolute', bottom: 40, left: -120, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(255,255,255,0.012)' },
  toolbar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { color: foco.colors.text, fontSize: 46, lineHeight: 52, fontWeight: '700', letterSpacing: -1.6 },
  subtitle: { color: foco.colors.muted, fontSize: 17, lineHeight: 23, marginTop: 5 },
  surface: { backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.border, borderRadius: foco.radius.md },
  sectionRow: { marginTop: 22, marginBottom: 12, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionTitle: { color: foco.colors.text, fontSize: 19, fontWeight: '600' },
  sectionDetail: { color: foco.colors.muted, fontSize: 15 },
  eyebrow: { color: foco.colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 3.5 },
});
