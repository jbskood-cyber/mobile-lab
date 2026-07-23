import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getProjectMetrics, type Project } from '@/src/core/model';
import { ProjectEditorSheet } from './ProjectEditorSheet';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

type Filter = 'Activos' | 'Archivados';

export function ProjectsScreen() {
  const router = useRouter();
  const theme = useFocoTheme();
  const { state } = useFocoStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Activos');
  const [editorOpen, setEditorOpen] = useState(false);
  const visible = useMemo(() => state.projects.filter((project) => filter === 'Activos' ? !project.archived : project.archived).filter((project) => project.name.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es')), [filter, query, state.projects]);

  return (
    <>
      <FocoScreen title="Proyectos" subtitle="Resultados, tareas y tiempo." screenKey="projects" rightIcon="plus" rightAccessibilityLabel="Crear proyecto" onRightPress={() => setEditorOpen(true)}>
        <View style={[styles.search, { borderColor: theme.colors.border, backgroundColor: theme.colors.panel }]}><FocoIcon name="search" size={18} color={theme.colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar proyectos" placeholderTextColor={theme.colors.subtle} returnKeyType="search" style={[styles.searchInput, { color: theme.colors.text }]} />{query ? <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={({ pressed }) => [styles.clear, pressed && pressedStyle]}><FocoIcon name="plus" size={16} color={theme.colors.muted} style={styles.closeIcon} /></Pressable> : null}</View>
        <View style={styles.filters}>{(['Activos', 'Archivados'] as Filter[]).map((item) => { const active = filter === item; const count = state.projects.filter((project) => item === 'Activos' ? !project.archived : project.archived).length; return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => { setFilter(item); hapticSelection(); }} style={({ pressed }) => [styles.filter, { borderColor: active ? theme.colors.inverse : theme.colors.border, backgroundColor: active ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><Text style={[styles.filterText, { color: active ? theme.colors.inverseText : theme.colors.muted }]}>{item}</Text><Text style={[styles.filterCount, { color: active ? theme.colors.inverseText : theme.colors.subtle }]}>{count}</Text></Pressable>; })}</View>
        <SectionTitle title={filter} detail={`${visible.length} ${visible.length === 1 ? 'proyecto' : 'proyectos'}`} />
        <View style={[styles.list, { borderTopColor: theme.colors.borderSoft }]}>{visible.map((project) => <ProjectRow key={project.id} project={project} onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} />)}{visible.length === 0 ? <View style={styles.empty}><FocoIcon name="folder" size={26} color={theme.colors.text} /><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{query ? 'Sin coincidencias' : `Sin proyectos ${filter.toLocaleLowerCase('es')}`}</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>{query ? 'Prueba con otro nombre.' : 'Usa + para crear uno nuevo.'}</Text></View> : null}</View>
      </FocoScreen>
      <ProjectEditorSheet visible={editorOpen} onClose={() => setEditorOpen(false)} />
    </>
  );
}

function ProjectRow({ project, onPress }: { project: Project; onPress: () => void }) {
  const theme = useFocoTheme();
  const { state } = useFocoStore();
  const metrics = useMemo(() => getProjectMetrics(state, project.id), [project.id, state]);
  const openTasks = metrics.taskCount - metrics.completedCount;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${project.name}`} onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: theme.colors.borderSoft }, pressed && styles.rowPressed]}><View style={[styles.icon, { backgroundColor: theme.colors.panelStrong }]}><FocoIcon name={project.icon as IconName} size={21} color={theme.colors.text} /></View><View style={styles.copy}><View style={styles.titleLine}><Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{project.name}</Text><Text style={[styles.progress, { color: theme.colors.text }]}>{Math.round(metrics.progress * 100)}%</Text></View><Text style={[styles.meta, { color: theme.colors.muted }]}>{openTasks} pendientes · {metrics.completedPomodoros}/{metrics.plannedPomodoros} foco · {formatDuration(metrics.focusSeconds, true)}</Text><View style={[styles.track, { backgroundColor: theme.colors.panelStrong }]}><View style={[styles.fill, { width: `${Math.round(metrics.progress * 100)}%`, backgroundColor: theme.colors.accent }]} /></View></View><FocoIcon name="chevron-right" size={16} color={theme.colors.subtle} /></Pressable>;
}

const styles = StyleSheet.create({
  search: { minHeight: 46, marginTop: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  searchInput: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13.5, lineHeight: 18, paddingHorizontal: 9, paddingVertical: 10 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  filters: { flexDirection: 'row', gap: 6, marginTop: 8 },
  filter: { flex: 1, minHeight: 40, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  filterText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15 },
  filterCount: { fontFamily: 'Manrope_500Medium', fontSize: 10, lineHeight: 13, fontVariant: ['tabular-nums'] },
  list: { borderTopWidth: StyleSheet.hairlineWidth },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: StyleSheet.hairlineWidth, paddingRight: 2 },
  rowPressed: { opacity: 0.68 },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, paddingVertical: 9 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
  progress: { fontFamily: 'Manrope_600SemiBold', fontSize: 10.5, lineHeight: 14, fontVariant: ['tabular-nums'] },
  meta: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 3 },
  track: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },
  empty: { minHeight: 170, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18, marginTop: 9 },
  emptyCopy: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14, marginTop: 3 },
});
