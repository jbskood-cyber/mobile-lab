import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco } from '@/src/ui/focoTheme';

type Tab = 'Resumen' | 'Pomodoro' | 'Tareas';

const levels = [
  0,1,1,2,1,0,3, 1,2,2,3,1,1,2, 0,1,3,4,2,1,0, 1,2,4,4,3,2,1,
  0,1,2,3,4,2,1, 1,2,3,4,4,3,2, 0,1,2,3,2,1,0, 1,2,4,4,3,2,1,
  0,1,2,3,4,3,2, 1,2,3,4,3,2,1, 0,1,2,2,1,1,0, 1,1,2,3,2,1,0,
  0,1,2,3,4,2,1, 1,2,3,4,4,3,2, 0,1,2,3,2,1,0, 1,2,3,4,3,2,1,
  0,1,2,3,2,1,0, 1,2,3,4,3,2,1,
];
const bars = [3.8, 5.1, 2.9, 5.8, 4.7, 2.2, 4.1];
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function StatsScreen() {
  const [tab, setTab] = useState<Tab>('Resumen');
  const [weekOffset, setWeekOffset] = useState(0);
  const weekLabel = useMemo(() => weekOffset === 0 ? '7 – 13 jul 2026' : weekOffset < 0 ? '30 jun – 6 jul 2026' : '14 – 20 jul 2026', [weekOffset]);

  return (
    <FocoScreen title="Estadísticas" rightIcon="calendar">
      <View style={styles.tabs}>
        {(['Resumen', 'Pomodoro', 'Tareas'] as Tab[]).map((item) => {
          const selected = item === tab;
          return (
            <Pressable key={item} onPress={() => setTab(item)} style={styles.tab} accessibilityRole="button" accessibilityState={{ selected }}>
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{item}</Text>
              {selected ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Surface style={styles.weekPicker}>
        <Pressable accessibilityRole="button" accessibilityLabel="Semana anterior" onPress={() => setWeekOffset((value) => value - 1)} style={styles.arrowButton}>
          <FocoIcon name="chevron-left" size={20} color={foco.colors.text} />
        </Pressable>
        <Text style={styles.weekText}>{weekLabel}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Semana siguiente" onPress={() => setWeekOffset((value) => value + 1)} style={styles.arrowButton}>
          <FocoIcon name="chevron-right" size={20} color={foco.colors.text} />
        </Pressable>
      </Surface>

      <View style={styles.summaryRow}>
        <Summary icon="clock" value="18h 24m" label="Tiempo total" />
        <Summary icon="target" value="6.2 h/día" label="Promedio" />
        <Summary icon="check" value="92%" label="Objetivo diario" />
      </View>

      <Surface style={styles.heatmapCard}>
        <Text style={styles.cardTitle}>Mapa de actividad</Text>
        <View style={styles.months}><Text style={styles.month}>May</Text><Text style={styles.month}>Jun</Text><Text style={styles.month}>Jul</Text></View>
        <View style={styles.heatmapBody}>
          <View style={styles.dayLetters}>{['L','M','X','J','V','S','D'].map((day) => <Text key={day} style={styles.dayLetter}>{day}</Text>)}</View>
          <View style={styles.grid}>
            {levels.slice(0, 126).map((level, index) => <View key={`${index}-${level}`} style={[styles.cell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />)}
          </View>
        </View>
        <View style={styles.legend}><Text style={styles.legendText}>Menos</Text>{[0,1,2,3,4].map((level) => <View key={level} style={[styles.legendCell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />)}<Text style={styles.legendText}>Más</Text></View>
      </Surface>

      <Surface style={styles.chartCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Tiempo de concentración</Text><Text style={styles.selector}>Diario⌄</Text></View>
        <View style={styles.chartArea}>
          <View style={styles.axisLabels}>{['6h','4h','2h','0h'].map((value) => <Text key={value} style={styles.axisText}>{value}</Text>)}</View>
          <View style={styles.barsArea}>
            {bars.map((value, index) => (
              <View key={days[index]} style={styles.barSlot}>
                <View style={[styles.bar, { height: value * 20 }]} />
                <Text style={styles.dayName}>{days[index]}</Text>
              </View>
            ))}
          </View>
        </View>
      </Surface>

      <Surface style={styles.distributionCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Distribución por enfoque</Text><Text style={styles.selector}>Por tiempo⌄</Text></View>
        <View style={styles.distributionBody}>
          <ProgressRing size={112} strokeWidth={15} progress={0.65} color="#E7E7E8" trackColor="#34373E">
            <View style={styles.donutInner} />
          </ProgressRing>
          <View style={styles.legendList}>
            <LegendRow color="#D8D8DA" label="Profundo" value="65% (11h 50m)" />
            <LegendRow color="#8A8D93" label="Medio" value="25% (4h 35m)" />
            <LegendRow color="#555961" label="Descanso" value="10% (1h 59m)" />
          </View>
        </View>
      </Surface>
    </FocoScreen>
  );
}

function Summary({ icon, value, label }: { icon: 'clock' | 'target' | 'check'; value: string; label: string }) {
  return <Surface style={styles.summaryCard}><FocoIcon name={icon} size={31} color={foco.colors.text} /><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></Surface>;
}
function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.legendRow}><View style={[styles.legendDot,{ backgroundColor: color }]} /><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  tabs: { marginTop: 18, height: 52, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: foco.colors.borderSoft },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: foco.colors.muted, fontSize: 16 },
  tabTextSelected: { color: foco.colors.text, fontWeight: '600' },
  tabUnderline: { position: 'absolute', bottom: -1, width: '85%', height: 2, borderRadius: 2, backgroundColor: foco.colors.text },
  weekPicker: { minHeight: 54, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  arrowButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  weekText: { color: foco.colors.text, fontSize: 17, fontWeight: '500' },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  summaryCard: { flex: 1, minHeight: 132, padding: 15, justifyContent: 'space-between' },
  summaryValue: { color: foco.colors.text, fontSize: 20, fontWeight: '600', marginTop: 12 },
  summaryLabel: { color: foco.colors.muted, fontSize: 12.5, marginTop: 6 },
  heatmapCard: { marginTop: 14, padding: 16 },
  cardTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '600' },
  months: { flexDirection: 'row', justifyContent: 'space-around', paddingLeft: 30, marginTop: 9 },
  month: { color: foco.colors.muted, fontSize: 12.5 },
  heatmapBody: { flexDirection: 'row', marginTop: 7 },
  dayLetters: { width: 24, gap: 5 },
  dayLetter: { height: 13, color: foco.colors.muted, fontSize: 10, lineHeight: 13 },
  grid: { flex: 1, flexDirection: 'column', flexWrap: 'wrap', height: 121, gap: 4, alignContent: 'space-between' },
  cell: { width: 13, height: 13, borderRadius: 3, backgroundColor: '#202329' },
  cell1: { backgroundColor: '#34373D' },
  cell2: { backgroundColor: '#666A71' },
  cell3: { backgroundColor: '#B5B7BB' },
  cell4: { backgroundColor: '#F1F1F2' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  legendText: { color: foco.colors.muted, fontSize: 11 },
  legendCell: { width: 12, height: 12, borderRadius: 3, backgroundColor: '#202329' },
  chartCard: { marginTop: 14, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selector: { color: foco.colors.muted, fontSize: 13.5 },
  chartArea: { height: 184, flexDirection: 'row', marginTop: 12 },
  axisLabels: { width: 28, justifyContent: 'space-between', paddingBottom: 22 },
  axisText: { color: foco.colors.muted, fontSize: 11 },
  barsArea: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: foco.colors.border },
  barSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 24, maxHeight: 122, borderRadius: 3, backgroundColor: '#E7E7E8' },
  dayName: { color: foco.colors.muted, fontSize: 11.5, marginTop: 8, marginBottom: -20 },
  distributionCard: { marginTop: 14, padding: 16 },
  distributionBody: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 16 },
  donutInner: { width: 55, height: 55, borderRadius: 28, backgroundColor: foco.colors.panel },
  legendList: { flex: 1, gap: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { color: foco.colors.muted, fontSize: 13.5, flex: 1 },
  legendValue: { color: foco.colors.text, fontSize: 12.5 },
});
