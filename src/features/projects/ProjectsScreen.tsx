import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getProjectMetrics, type Project } from '@/src/core/model';
import { ProjectEditorSheet } from './ProjectEditorSheet';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

type Filter = 'Activos' | 'Archivados';

export function ProjectsScreen() {
  const router = useRouter();
  const { state } = useFocoStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Activos');
  const [editorOpen, setEditorOpen] = useState(false);
  const visible = useMemo(() => state.projects.filter((project) => filter === 'Activos' ? !project.archived : project.archived).filter((project) => project.name.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es')), [filter, query, state.projects]);

  return (
    <>
      <FocoScreen title="Proyectos" subtitle="Resultados, tareas y tiempo en un solo lugar." screenKey="projects" rightIcon="plus" rightAccessibilityLabel="Crear proyecto" onRightPress={() => setEditorOpen(true)}>
        <View style={styles.search}><FocoIcon name="search" size={20} color={foco.colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar proyectos" placeholderTextColor={foco.colors.subtle} returnKeyType="search" style={styles.searchInput} />{query ? <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={({ pressed }) => [styles.clear, pressed && pressedStyle]}><FocoIcon name="plus" size={17} color={foco.colors.muted} style={styles.closeIcon} /></Pressable> : null}</View>
        <View style={styles.filters}>{(['Activos', 'Archivados'] as Filter[]).map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: filter === item }} onPress={() => { setFilter(item); hapticSelection(); }} style={({ pressed }) => [styles.filter, filter === item && styles.filterActive, pressed && pressedStyle]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text><Text style={[styles.filterCount, filter === item && styles.filterTextActive]}>{state.projects.filter((project) => item === 'Activos' ? !project.archived : project.archived).length}</Text></Pressable>)}</View>
        <SectionTitle title={filter} detail={`${visible.length} ${visible.length === 1 ? 'proyecto' : 'proyectos'}`} />
        <View style={styles.list}>{visible.map((project) => <ProjectRow key={project.id} project={project} onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} />)}{visible.length === 0 ? <View style={styles.empty}><FocoIcon name="folder" size={28} color={foco.colors.text} /><Text style={styles.emptyTitle}>{query ? 'Sin coincidencias' : `Sin proyectos ${filter.toLocaleLowerCase('es')}`}</Text><Text style={styles.emptyCopy}>{query ? 'Prueba con otro nombre.' : 'Usa + para crear uno nuevo.'}</Text></View> : null}</View>
      </FocoScreen>
      <ProjectEditorSheet visible={editorOpen} onClose={() => setEditorOpen(false)} />
    </>
  );
}

function ProjectRow({ project, onPress }: { project: Project; onPress: () => void }) {
  const { state } = useFocoStore();
  const metrics = useMemo(() => getProjectMetrics(state, project.id), [project.id, state]);
  const openTasks = metrics.taskCount - metrics.completedCount;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${project.name}`} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}><View style={styles.icon}><FocoIcon name={project.icon as IconName} size={23} color={foco.colors.text} /></View><View style={styles.copy}><View style={styles.titleLine}><Text style={styles.name} numberOfLines={1}>{project.name}</Text><Text style={styles.progress}>{Math.round(metrics.progress * 100)}%</Text></View><Text style={styles.meta}>{openTasks} pendientes · {metrics.completedPomodoros}/{metrics.plannedPomodoros} foco · {formatDuration(metrics.focusSeconds, true)}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.round(metrics.progress * 100)}%` }]} /></View></View><FocoIcon name="chevron-right" size={17} color={foco.colors.subtle} /></Pressable>;
}

const styles = StyleSheet.create({
  search: { minHeight: 54, marginTop: 16, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, flexDirection: 'row', alignItems: 'center', paddingLeft: 14 },
  searchInput: { flex: 1, color: foco.colors.text, fontSize: 14.5, paddingHorizontal: 11, paddingVertical: 13 },
  clear: { width: 46, height: 52, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  filters: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filter: { flex: 1, minHeight: 45, borderRadius: 13, borderWidth: 1, borderColor: foco.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  filterActive: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  filterText: { color: foco.colors.muted, fontSize: 13.5, fontWeight: '600' },
  filterCount: { color: foco.colors.subtle, fontSize: 12, fontVariant: ['tabular-nums'] },
  filterTextActive: { color: foco.colors.bg },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft },
  row: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft, paddingRight: 4 },
  rowPressed: { opacity: 0.7 },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, paddingVertical: 11 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, color: foco.colors.text, fontSize: 16.5, fontWeight: '600' },
  progress: { color: foco.colors.text, fontSize: 12.5, fontVariant: ['tabular-nums'] },
  meta: { color: foco.colors.muted, fontSize: 11.5, marginTop: 5 },
  track: { height: 3, borderRadius: 2, backgroundColor: '#272A30', marginTop: 8, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2, backgroundColor: foco.colors.text },
  empty: { minHeight: 190, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptyCopy: { color: foco.colors.muted, fontSize: 12.5, marginTop: 5 },
});
