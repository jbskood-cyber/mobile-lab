import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useFocoTheme } from './FocoThemeContext';
import { typeScale } from './typeScale';

type EmptyStateKind = 'clear' | 'inbox' | 'search' | 'sessions' | 'complete';

type Props = {
  title: string;
  copy: string;
  compact?: boolean;
  state?: EmptyStateKind;
};

const trajectories: Record<EmptyStateKind, string> = {
  clear: 'M10 29c9-15 20-19 36-14',
  inbox: 'M10 29c10-10 21-13 36-9',
  search: 'M10 29c8-17 23-20 36-8',
  sessions: 'M10 29c12-16 22-16 36-7',
  complete: 'M10 29c10-13 23-18 36-12',
};

export function FocoEmptyState({ title, copy, compact = false, state = 'clear' }: Props) {
  const theme = useFocoTheme();
  const visualSize = compact ? 46 : 58;
  const focusPoint = state === 'complete' ? { x: 37, y: 15 } : state === 'inbox' ? { x: 31, y: 19 } : { x: 34, y: 17 };

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${copy}`}
      style={[styles.root, compact ? styles.compact : styles.regular]}
    >
      <View style={[styles.visual, { width: visualSize, height: visualSize }]} accessibilityElementsHidden>
        <Svg width={visualSize} height={visualSize} viewBox="0 0 56 56">
          {/* FOCO visual language: focus point + orbit/ring + restrained trajectory. */}
          <Circle cx="28" cy="28" r="18" fill="none" stroke={theme.colors.border} strokeWidth="1" />
          <Circle cx="28" cy="28" r="10" fill="none" stroke={theme.colors.borderSoft} strokeWidth="1" strokeDasharray="2 4" />
          <Path d={trajectories[state]} fill="none" stroke={theme.colors.subtle} strokeWidth="1.25" strokeLinecap="round" />
          <Circle cx={focusPoint.x} cy={focusPoint.y} r="3.2" fill={theme.colors.accent} />
          <Circle cx={focusPoint.x} cy={focusPoint.y} r="6.2" fill="none" stroke={theme.colors.accent} strokeOpacity="0.32" strokeWidth="1" />
        </Svg>
      </View>
      <View style={styles.copy}>
        <Text style={[typeScale.metadata, styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[typeScale.caption, styles.body, { color: theme.colors.muted }]}>{copy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  regular: { minHeight: 150, paddingHorizontal: 24, paddingVertical: 18 },
  compact: { minHeight: 94, paddingHorizontal: 18, paddingVertical: 10 },
  visual: { alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  copy: { alignItems: 'center', maxWidth: 280 },
  title: { textAlign: 'center', fontFamily: 'InstrumentSans_600SemiBold' },
  body: { textAlign: 'center', marginTop: 2, lineHeight: 15 },
});
