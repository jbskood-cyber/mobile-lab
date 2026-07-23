import { useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getThemeTokens, type FocoTheme } from './themeTokens';

type Screen = 'today' | 'agenda' | 'projects' | 'focus' | 'stats';

export function FocoSkeleton({ screen = 'today' }: { screen?: Screen }) {
  const theme = getThemeTokens(useColorScheme() === 'light' ? 'light' : 'dark');
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.toolbar}><View style={styles.icon} /><View style={styles.icon} /></View>
        <View style={styles.title} />
        <View style={styles.subtitle} />
        {screen === 'today' ? <TodaySkeleton styles={styles} /> : null}
        {screen === 'agenda' ? <AgendaSkeleton styles={styles} /> : null}
        {screen === 'projects' ? <ProjectsSkeleton styles={styles} /> : null}
        {screen === 'focus' ? <FocusSkeleton styles={styles} /> : null}
        {screen === 'stats' ? <StatsSkeleton styles={styles} /> : null}
      </View>
      <View style={styles.tabBar}>{[0, 1, 2, 3, 4].map((item) => <View key={item} style={styles.tabItem}><View style={styles.tabIcon} /><View style={styles.tabLabel} /></View>)}</View>
    </SafeAreaView>
  );
}

type Styles = ReturnType<typeof makeStyles>;
function TodaySkeleton({ styles }: { styles: Styles }) { return <><View style={[styles.surface, styles.quick]} /><View style={[styles.surface, styles.capacity]} /><View style={styles.sectionLabel} /><View style={[styles.surface, styles.focusCard]} />{[0, 1, 2].map((item) => <View key={item} style={[styles.surface, styles.row]} />)}</>; }
function AgendaSkeleton({ styles }: { styles: Styles }) { return <><View style={[styles.surface, styles.search]} /><View style={[styles.surface, styles.segmented]} /><View style={[styles.surface, styles.calendar]} /><View style={styles.sectionLabel} />{[0, 1, 2].map((item) => <View key={item} style={[styles.surface, styles.row]} />)}</>; }
function ProjectsSkeleton({ styles }: { styles: Styles }) { return <><View style={[styles.surface, styles.search]} /><View style={styles.chips}>{[0, 1].map((item) => <View key={item} style={styles.chip} />)}</View><View style={styles.sectionLabel} />{[0, 1, 2, 3].map((item) => <View key={item} style={[styles.surface, styles.projectRow]} />)}</>; }
function FocusSkeleton({ styles }: { styles: Styles }) { return <><View style={[styles.surface, styles.segmented]} /><View style={[styles.surface, styles.context]} /><View style={styles.timerCircle} /><View style={styles.controls}>{[0, 1, 2].map((item) => <View key={item} style={item === 1 ? styles.primaryControl : styles.secondaryControl} />)}</View></>; }
function StatsSkeleton({ styles }: { styles: Styles }) { return <><View style={[styles.surface, styles.segmented]} /><View style={[styles.surface, styles.metrics]} /><View style={[styles.surface, styles.chart]} /><View style={[styles.surface, styles.heatmap]} /></>; }

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.bg },
    content: { flex: 1, paddingHorizontal: theme.density.pageHorizontal },
    toolbar: { height: theme.density.toolbarHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    icon: { width: 26, height: 26, borderRadius: 9, backgroundColor: theme.colors.panelStrong },
    title: { width: 132, height: 30, borderRadius: 9, backgroundColor: theme.colors.panelStrong },
    subtitle: { width: 144, height: 13, borderRadius: 7, backgroundColor: theme.colors.panel, marginTop: 3 },
    surface: { borderRadius: theme.radius.surface, backgroundColor: theme.colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.borderSoft },
    quick: { height: 48, marginTop: 10 },
    capacity: { height: 62, marginTop: 7 },
    sectionLabel: { width: 106, height: 16, borderRadius: 7, backgroundColor: theme.colors.panelStrong, marginTop: 15, marginBottom: 6 },
    focusCard: { height: 72 },
    row: { height: 58, marginBottom: 2 },
    search: { height: 46, marginTop: 10 },
    segmented: { height: 44, marginTop: 8 },
    calendar: { height: 280, marginTop: 8 },
    chips: { flexDirection: 'row', gap: 6, marginTop: 8 },
    chip: { flex: 1, height: 40, borderRadius: 11, backgroundColor: theme.colors.panelStrong },
    projectRow: { height: 68, marginBottom: 2 },
    context: { height: 58, marginTop: 8 },
    timerCircle: { width: 226, height: 226, borderRadius: 113, borderWidth: 9, borderColor: theme.colors.panelStrong, alignSelf: 'center', marginTop: 18 },
    controls: { flexDirection: 'row', justifyContent: 'center', gap: 18, alignItems: 'center', marginTop: 13 },
    secondaryControl: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.panel },
    primaryControl: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.panelStrong },
    metrics: { height: 66, marginTop: 8 },
    heatmap: { height: 112, marginTop: 10 },
    chart: { height: 120, marginTop: 10 },
    tabBar: { minHeight: 62, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.borderSoft, flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
    tabItem: { flex: 1, alignItems: 'center', gap: 3 },
    tabIcon: { width: 21, height: 21, borderRadius: 7, backgroundColor: theme.colors.panelStrong },
    tabLabel: { width: 38, height: 8, borderRadius: 4, backgroundColor: theme.colors.panel },
  });
}
