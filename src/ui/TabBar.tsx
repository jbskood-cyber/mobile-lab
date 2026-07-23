import { StyleSheet, Text, View } from 'react-native';

import { colors } from './theme';

export type TabGlyphName = 'today' | 'projects' | 'focus' | 'stats';

type TabGlyphProps = {
  name: TabGlyphName;
  focused: boolean;
};

const glyphs: Record<TabGlyphName, string> = {
  today: '⌂',
  projects: '□',
  focus: '◉',
  stats: '▥',
};

export function TabGlyph({ name, focused }: TabGlyphProps) {
  return (
    <View style={[styles.wrap, focused && styles.wrapFocused]}>
      <Text style={[styles.glyph, focused && styles.glyphFocused]}>
        {glyphs[name]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapFocused: {
    borderRadius: 15,
    backgroundColor: colors.overlay,
  },
  glyph: {
    color: colors.inactive,
    fontSize: 23,
    lineHeight: 25,
  },
  glyphFocused: {
    color: colors.text,
  },
});