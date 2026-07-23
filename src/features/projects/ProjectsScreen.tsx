import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco } from '@/src/ui/focoTheme';

type Filter = 'Todos' | 'Activos' | 'Archivados';
type Project = { name: string; tasks: string; time: string; progress?: number; icon: IconName; archived?: boolean };

const projects: Project[] = [
  { name: 'Plan maestro', tasks: '3 tareas', time: '5h 35min', progress: 0.73, icon: 'briefcase' },
  { name: 'Trabajo', tasks: '5 tareas', time: '6h 20min', progress: 0.42, icon: 'briefcase' },
  { name: 'Estudios', tasks: '4 tareas', time: '6h 10min', progress: 0.60, icon: 'book' },
  { name: 'Salud', tasks: '3 tareas', time: '2h 30min', progress: 0.28, icon: 'heart' },
  { name: 'Personal', tasks: '2 tareas', time: '1h 20min', progress: 0.35, icon: 'grid' },
  { name: 'Ideas', tasks: '1 tarea', time: '0h 30min', progress: 0.10, icon: 'bulb' },
  { name: 'Archivo', tasks: '7 tareas completadas', time: '', icon: 'archive', archived: true },
];

export function ProjectsScreen() {
  const [filter, setFilter] = useState<Filter>('Todos');
  const [query, setQuery] = useState('');
  const visible = useMemo(() => projects.filter((project) => {
    const filterMatch = filter === 'Todos' || (filter === 'Activos' ? !project.archived : project.archived);
    return filterMatch && project.name.toLowerCase().includes(query.trim().toLowerCase());
  }), [filter, query]);
  const active = visible.filter((project) => !project.archived);
  const archived = visible.filter((project) => project.archived);

  return (
    <FocoScreen title="Proyectos" rightIcon="plus">
      <Surface style={styles.searchBox}>
        <FocoIcon name="search" size={22} color={foco.colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar proyectos"
          placeholderTextColor={foco.colors.muted}
          style={styles.searchInput}
          accessibilityLabel="Buscar proyectos"
        />
      </Surface>

      <View style={styles.filters}>
        {(['Todos', 'Activos', 'Archivados'] as Filter[]).map((item) => {
          const selected = filter === item;
          const count = item === 'Todos' ? 8 : item === 'Activos' ? 6 : 2;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item)}
              style={[styles.filter, selected && styles.filterSelected]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item}  {count}</Text>
            </Pressable>
          );
        })}
      </View>

      {active.length > 0 ? <Text style={styles.groupLabel}>ACTIVOS</Text> : null}
      <View style={styles.list}>
        {active.map((project) => <ProjectRow key={project.name} project={project} />)}
      </View>

      {archived.length > 0 ? <Text style={[styles.groupLabel, styles.archiveLabel]}>ARCHIVADOS</Text> : null}
      <View style={styles.list}>
        {archived.map((project) => <ProjectRow key={project.name} project={project} />)}
      </View>
    </FocoScreen>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir proyecto ${project.name}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.iconTile}><FocoIcon name={project.icon} size={28} color={foco.colors.text} strokeWidth={1.75} /></View>
      <View style={styles.copy}>
        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.meta}>{project.tasks}{project.time ? `  •  ${project.time}` : ''}</Text>
      </View>
      {typeof project.progress === 'number' ? (
        <ProgressRing size={52} strokeWidth={2.5} progress={project.progress} color={foco.colors.text} trackColor="#3A3D44">
          <Text style={styles.progressText}>{Math.round(project.progress * 100)}%</Text>
        </ProgressRing>
      ) : <Text style={styles.dash}>–</Text>}
      <FocoIcon name="chevron-right" size={18} color={foco.colors.subtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBox: { marginTop: 24, minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12 },
  searchInput: { flex: 1, color: foco.colors.text, fontSize: 17, paddingVertical: 13 },
  filters: { marginTop: 20, flexDirection: 'row', gap: 10 },
  filter: { flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center' },
  filterSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  filterText: { color: foco.colors.muted, fontSize: 14.5, fontWeight: '500' },
  filterTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  groupLabel: { color: foco.colors.muted, fontSize: 12.5, letterSpacing: 0.6, marginTop: 26, marginBottom: 11 },
  archiveLabel: { marginTop: 28 },
  list: { gap: 8 },
  row: { minHeight: 88, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.borderSoft, backgroundColor: foco.colors.panel, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 13 },
  iconTile: { width: 48, height: 48, borderRadius: 13, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  name: { color: foco.colors.text, fontSize: 17.5, fontWeight: '500' },
  meta: { color: foco.colors.muted, fontSize: 13.5, marginTop: 6 },
  progressText: { color: foco.colors.text, fontSize: 12.5 },
  dash: { color: foco.colors.muted, fontSize: 18, width: 52, textAlign: 'center' },
  pressed: { opacity: 0.72 },
});
