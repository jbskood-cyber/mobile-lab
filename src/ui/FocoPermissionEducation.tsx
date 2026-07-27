import { StyleSheet, Text, View } from 'react-native';

import { FocoIcon, type IconName } from './FocoIcon';
import { FocoPressable } from './FocoPressable';
import { useFocoTheme } from './FocoThemeContext';
import { typeScale } from './typeScale';

export function FocoPermissionEducation({
  title,
  benefit,
  privacy,
  actionLabel,
  onContinue,
  icon = 'target',
}: {
  title: string;
  benefit: string;
  privacy: string;
  actionLabel: string;
  onContinue: () => void;
  icon?: IconName;
}) {
  const theme = useFocoTheme();

  return (
    <View style={styles.root} accessibilityLabel={`${title}. ${benefit}. ${privacy}`}>
      <View style={[styles.visual, { backgroundColor: theme.colors.panelSoft, borderColor: theme.colors.borderSoft }]} accessibilityElementsHidden>
        <View style={[styles.orbit, { borderColor: theme.colors.accent }]} />
        <View style={[styles.icon, { backgroundColor: theme.colors.panel }]}> 
          <FocoIcon name={icon} size={22} color={theme.colors.text} strokeWidth={1.6} />
        </View>
      </View>
      <Text style={[typeScale.section, styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[typeScale.body, styles.benefit, { color: theme.colors.text }]}>{benefit}</Text>
      <View style={[styles.privacyRow, { borderColor: theme.colors.borderSoft }]}> 
        <FocoIcon name="check" size={15} color={theme.colors.success} strokeWidth={1.8} />
        <Text style={[typeScale.caption, styles.privacy, { color: theme.colors.muted }]}>{privacy}</Text>
      </View>
      <FocoPressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        feedback="primary"
        onPress={onContinue}
        style={[styles.action, { backgroundColor: theme.colors.inverse }]}
      >
        <Text style={[typeScale.metadata, styles.actionText, { color: theme.colors.inverseText }]}>{actionLabel}</Text>
      </FocoPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingHorizontal: 6, paddingVertical: 8 },
  visual: { width: 72, height: 72, borderRadius: 36, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  orbit: { position: 'absolute', width: 52, height: 30, borderRadius: 26, borderWidth: 1, opacity: 0.34, transform: [{ rotate: '-22deg' }] },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center' },
  benefit: { textAlign: 'center', marginTop: 6, maxWidth: 300 },
  privacyRow: { width: '100%', minHeight: 48, marginTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  privacy: { flex: 1, lineHeight: 15 },
  action: { width: '100%', minHeight: 48, borderRadius: 12, marginTop: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  actionText: { fontFamily: 'InstrumentSans_600SemiBold', fontWeight: '600' },
});
