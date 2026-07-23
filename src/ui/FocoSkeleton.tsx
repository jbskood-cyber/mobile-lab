import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { foco } from './focoTheme';

type Screen = 'today' | 'projects' | 'focus' | 'stats';

export function FocoSkeleton({ screen = 'today' }: { screen?: Screen }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.toolbar}>
          <View style={styles.icon} />
          <View style={styles.icon} />
        </View>
        <View style={styles.title} />
        {screen === 'today' ? <TodaySkeleton /> : null}
        {screen === 'projects' ? <ProjectsSkeleton /> : null}
        {screen === 'focus' ? <FocusSkeleton /> : null}
        {screen === 'stats' ? <StatsSkeleton /> : null}
      </View>
      <View style={styles.tabBar}>
        {[0, 1, 2, 3].map((item) => <View key={item} style={styles.tabItem}><View style={styles.tabIcon} /><View style={styles.tabLabel} /></View>)}
      </View>
    </SafeAreaView>
  );
}

function TodaySkeleton() {
  return (
    <>
      <View style={styles.subtitle} />
      <View style={[styles.surface, styles.metrics]} />
      <View style={[styles.surface, styles.quick]} />
      <View style={styles.sectionLabel} />
      <View style={[styles.surface, styles.focusCard]} />
      <View style={styles.sectionLabel} />
      {[0, 1, 2, 3].map((item) => <View key={item} style={[styles.surface, styles.row]} />)}
    </>
  );
}

function ProjectsSkeleton() {
  return (
    <>
      <View style={[styles.surface, styles.search]} />
      <View style={styles.chips}>{[0, 1, 2].map((item) => <View key={item} style={styles.chip} />)}</View>
      <View style={styles.sectionLabel} />
      {[0, 1, 2, 3, 4].map((item) => <View key={item} style={[styles.surface, styles.projectRow]} />)}
    </>
  );
}

function FocusSkeleton() {
  return (
    <>
      <View style={[styles.surface, styles.segmented]} />
      <View style={styles.centerLabel} />
      <View style={styles.timerCircle} />
      <View style={styles.controls}>{[0, 1, 2].map((item) => <View key={item} style={item === 1 ? styles.primaryControl : styles.secondaryControl} />)}</View>
      <View style={[styles.surface, styles.session]} />
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      <View style={styles.tabs} />
      <View style={[styles.surface, styles.week]} />
      <View style={styles.summary}>{[0, 1, 2].map((item) => <View key={item} style={[styles.surface, styles.summaryCard]} />)}</View>
      <View style={[styles.surface, styles.heatmap]} />
      <View style={[styles.surface, styles.chart]} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: foco.colors.bg },
  content: { flex: 1, paddingHorizontal: 22 },
  toolbar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon: { width: 28, height: 28, borderRadius: 9, backgroundColor: foco.colors.panelStrong },
  title: { width: 184, height: 45, borderRadius: 13, backgroundColor: foco.colors.panelStrong },
  subtitle: { width: 156, height: 17, borderRadius: 8, backgroundColor: foco.colors.panel, marginTop: 9 },
  surface: { borderRadius: foco.radius.md, backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.borderSoft },
  metrics: { height: 118, marginTop: 24 },
  quick: { height: 62, marginTop: 14 },
  sectionLabel: { width: 130, height: 20, borderRadius: 8, backgroundColor: foco.colors.panelStrong, marginTop: 22, marginBottom: 12 },
  focusCard: { height: 168 },
  row: { height: 72, marginBottom: 8 },
  search: { height: 58, marginTop: 24 },
  chips: { flexDirection: 'row', gap: 10, marginTop: 18 },
  chip: { flex: 1, height: 46, borderRadius: 15, backgroundColor: foco.colors.panelStrong },
  projectRow: { height: 82, marginBottom: 8 },
  segmented: { height: 54, marginTop: 24 },
  centerLabel: { width: 190, height: 22, borderRadius: 9, alignSelf: 'center', backgroundColor: foco.colors.panelStrong, marginTop: 28 },
  timerCircle: { width: 280, height: 280, borderRadius: 140, borderWidth: 12, borderColor: foco.colors.panelStrong, alignSelf: 'center', marginTop: 24 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 28, marginTop: 18 },
  secondaryControl: { width: 66, height: 66, borderRadius: 33, backgroundColor: foco.colors.panel },
  primaryControl: { width: 82, height: 82, borderRadius: 41, backgroundColor: foco.colors.panelStrong },
  session: { height: 92, marginTop: 18 },
  tabs: { height: 52, borderBottomWidth: 1, borderBottomColor: foco.colors.borderSoft, marginTop: 10 },
  week: { height: 52, marginTop: 16 },
  summary: { flexDirection: 'row', gap: 10, marginTop: 14 },
  summaryCard: { flex: 1, height: 124 },
  heatmap: { height: 258, marginTop: 14 },
  chart: { height: 220, marginTop: 14 },
  tabBar: { height: 82, borderTopWidth: 1, borderTopColor: foco.colors.borderSoft, flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', gap: 6 },
  tabIcon: { width: 26, height: 26, borderRadius: 9, backgroundColor: foco.colors.panelStrong },
  tabLabel: { width: 48, height: 10, borderRadius: 5, backgroundColor: foco.colors.panel },
});
