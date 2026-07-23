import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getProjectMetrics, type Project, type ProjectIcon, type ProjectMetrics } from '@/src/core/model';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

type Filter = 'Todos' | 'Activos' | 'Archivados';
const iconOptions: ProjectIcon[] = ['briefcase', 'book', 'heart', 'grid', 'bulb', 'archive'];
type ProjectRowModel = { project: Project; metrics: ProjectMetrics };

export function ProjectsScreen() {
  const { state, addProject, toggleProjectArchived } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [filter, setFilter] = useState<Filter>('Todos');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectIcon, setProjectIcon] = useState<ProjectIcon>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const activeCount = state.projects.filter((project) => !project.archived).length;
  const archivedCount = state.projects.length - activeCount;
  const duplicate = state.projects.some((project) => project.name.toLowerCase() === projectName.trim().toLowerCase());
  const visible = useMemo<ProjectRowModel[]>(() => state.projects.filter((project) => {
    const filterMatch = filter === 'Todos' || (filter === 'Activos' ? !project.archived : project.archived);
    return filterMatch && project.name.toLowerCase().includes(query.trim().toLowerCase());
  }).map((project) => ({ project, metrics: getProjectMetrics(state, project.id) })), [filter, query, state]);
  const active = visible.filter((row) => !row.project.archived);
  const archived = visible.filter((row) => row.project.archived);

  const openCreate = () => {
    setProjectName('');
    setProjectIcon('grid');
    setCreateOpen(true);
    hapticSelection();
  };

  const saveProject = () => {
    if (!projectName.trim() || duplicate) return;
    addProject(projectName, projectIcon);
    setProjectName('');
    setProjectIcon('grid');
    setCreateOpen(false);
    hapticSuccess();
  };

  const archiveSelected = () => {
    if (!selectedProject) return;
    const project = selectedProject;
    toggleProjectArchived(project.id);
    setSelectedProject(null);
    showUndo(`${project.name} ${project.archived ? 'restaurado' : 'archivado'}`, () => {
      toggleProjectArchived(project.id);
      hapticSelection();
    });
    hapticWarning();
  };

  return (
    <FocoScreen title="Proyectos" screenKey="projects" rightIcon="plus" rightAccessibilityLabel="Crear proyecto" onRightPress={openCreate}>
      <Surface style={styles.searchBox}>
        <FocoIcon name="search" size={21} color={foco.colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Buscar proyectos"
          placeholderTextColor={foco.colors.muted}
          style={styles.searchInput}
          accessibilityLabel="Buscar proyectos"
          returnKeyType="search"
        />
        <View style={styles.clearSlot}>
          {query ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={({ pressed }) => [styles.clearSearch, pressed && pressedStyle]}>
              <FocoIcon name="plus" size={19} color={foco.colors.muted} style={styles.closeIcon} />
            </Pressable>
          ) : null}
        </View>
      </Surface>

      <View style={styles.filters}>
        {(['Todos', 'Activos', 'Archivados'] as Filter[]).map((item) => {
          const selected = filter === item;
          const count = item === 'Todos' ? state.projects.length : item === 'Activos' ? activeCount : archivedCount;
          return (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => { setFilter(item); hapticSelection(); }}
              style={({ pressed }) => [styles.filter, selected && styles.filterSelected, pressed && pressedStyle]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item}  {count}</Text>
            </Pressable>
          );
        })}
      </View>

      {active.length > 0 ? <Text style={styles.groupLabel}>ACTIVOS</Text> : null}
      <View style={styles.list}>
        {active.map((row) => <ProjectRow key={row.project.id} {...row} onPress={() => { setSelectedProject(row.project); hapticSelection(); }} />)}
      </View>

      {archived.length > 0 ? <Text style={[styles.groupLabel, styles.archiveLabel]}>ARCHIVADOS</Text> : null}
      <View style={styles.list}>
        {archived.map((row) => <ProjectRow key={row.project.id} {...row} onPress={() => { setSelectedProject(row.project); hapticSelection(); }} />)}
      </View>

      {visible.length === 0 ? (
        <Surface style={styles.emptyState}>
          <FocoIcon name="folder" size={30} color={foco.colors.text} />
          <Text style={styles.emptyTitle}>{query ? 'Sin coincidencias' : filter === 'Archivados' ? 'Sin proyectos archivados' : 'Crea tu primer proyecto'}</Text>
          <Text style={styles.emptyCopy}>{query ? 'Prueba otro nombre.' : filter === 'Archivados' ? 'Aquí aparecerán al cerrar una etapa.' : 'Agrupa tareas y sesiones en un solo lugar.'}</Text>
          {!query && filter !== 'Archivados' ? <Pressable accessibilityRole="button" accessibilityLabel="Crear proyecto" onPress={openCreate} style={({ pressed }) => [styles.emptyButton, pressed && pressedStyle]}><Text style={styles.emptyButtonText}>Crear proyecto</Text></Pressable> : null}
        </Surface>
      ) : null}

      <FocoSheet
        visible={createOpen}
        title="Nuevo proyecto"
        subtitle="Nombre e icono. Nada más."
        onClose={() => setCreateOpen(false)}
        footer={<SheetButton label="Crear proyecto" onPress={saveProject} disabled={!projectName.trim() || duplicate} />}
      >
        <FieldLabel>NOMBRE</FieldLabel>
        <TextInput autoFocus value={projectName} onChangeText={setProjectName} autoCapitalize="words" returnKeyType="done" placeholder="Ej. Universidad" placeholderTextColor={foco.colors.subtle} style={styles.sheetInput} accessibilityLabel="Nombre del proyecto" onSubmitEditing={saveProject} />
        {duplicate ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>Ese proyecto ya existe.</Text> : null}
        <FieldLabel>ICONO</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.iconChoices}>
          {iconOptions.map((icon) => (
            <Pressable key={icon} accessibilityRole="radio" accessibilityState={{ checked: projectIcon === icon }} accessibilityLabel={`Icono ${icon}`} onPress={() => { setProjectIcon(icon); hapticSelection(); }} style={({ pressed }) => [styles.iconChoice, projectIcon === icon && styles.iconChoiceSelected, pressed && pressedStyle]}>
              <FocoIcon name={icon as IconName} size={25} color={projectIcon === icon ? foco.colors.bg : foco.colors.text} />
            </Pressable>
          ))}
        </ScrollView>
      </FocoSheet>

      <ProjectDetailSheet project={selectedProject} state={state} onClose={() => setSelectedProject(null)} onArchive={archiveSelected} />
    </FocoScreen>
  );
}

const ProjectRow = memo(function ProjectRow({ project, metrics, onPress }: ProjectRowModel & { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir proyecto ${project.name}`} onPress={onPress} style={({ pressed }) => [styles.row, pressed && pressedStyle]}>
      <View style={styles.iconTile}><FocoIcon name={project.icon as IconName} size={27} color={foco.colors.text} strokeWidth={1.75} /></View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{metrics.taskCount} {metrics.taskCount === 1 ? 'tarea' : 'tareas'}  •  {formatDuration(metrics.focusSeconds, true)}</Text>
      </View>
      {!project.archived ? (
        <ProgressRing size={50} strokeWidth={2.5} progress={metrics.progress} color={foco.colors.text} trackColor="#3A3D44">
          <Text style={styles.progressText}>{Math.round(metrics.progress * 100)}%</Text>
        </ProgressRing>
      ) : <Text style={styles.dash}>–</Text>}
      <FocoIcon name="chevron-right" size={17} color={foco.colors.subtle} />
    </Pressable>
  );
});

function ProjectDetailSheet({ project, state, onClose, onArchive }: { project: Project | null; state: ReturnType<typeof useFocoStore>['state']; onClose: () => void; onArchive: () => void }) {
  const metrics = project ? getProjectMetrics(state, project.id) : null;
  return (
    <FocoSheet
      visible={Boolean(project)}
      title={project?.name ?? 'Proyecto'}
      subtitle={project?.archived ? 'Archivado · sigue disponible en estadísticas.' : 'Resumen local del proyecto.'}
      onClose={onClose}
      footer={<SheetButton label={project?.archived ? 'Restaurar proyecto' : 'Archivar proyecto'} variant={project?.archived ? 'primary' : 'danger'} onPress={onArchive} />}
    >
      {metrics ? (
        <View style={styles.detailGrid}>
          <View style={styles.detailMetric}><Text style={styles.detailValue}>{metrics.taskCount}</Text><Text style={styles.detailLabel}>Tareas</Text></View>
          <View style={styles.detailMetric}><Text style={styles.detailValue}>{metrics.completedCount}</Text><Text style={styles.detailLabel}>Hechas</Text></View>
          <View style={styles.detailMetric}><Text style={styles.detailValue} adjustsFontSizeToFit numberOfLines={1}>{formatDuration(metrics.focusSeconds, true)}</Text><Text style={styles.detailLabel}>Enfoque</Text></View>
        </View>
      ) : null}
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  searchBox: { marginTop: 22, minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, gap: 10 },
  searchInput: { flex: 1, minWidth: 0, color: foco.colors.text, fontSize: 16.5, paddingVertical: 12 },
  clearSlot: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  clearSearch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  filters: { marginTop: 18, flexDirection: 'row', gap: 8 },
  filter: { flex: 1, minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center' },
  filterSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  filterText: { color: foco.colors.muted, fontSize: 13.8, fontWeight: '500' },
  filterTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  groupLabel: { color: foco.colors.muted, fontSize: 12, letterSpacing: 0.7, marginTop: 23, marginBottom: 9 },
  archiveLabel: { marginTop: 25 },
  list: { gap: 7 },
  row: { minHeight: 82, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.borderSoft, backgroundColor: foco.colors.panel, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 11 },
  iconTile: { width: 46, height: 46, borderRadius: 13, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  name: { color: foco.colors.text, fontSize: 16.5, fontWeight: '500' },
  meta: { color: foco.colors.muted, fontSize: 12.8, marginTop: 5 },
  progressText: { color: foco.colors.text, fontSize: 12, fontVariant: ['tabular-nums'] },
  dash: { color: foco.colors.muted, fontSize: 18, width: 50, textAlign: 'center' },
  emptyState: { marginTop: 24, minHeight: 176, padding: 20, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: foco.colors.text, fontSize: 17, fontWeight: '600', marginTop: 12 },
  emptyCopy: { color: foco.colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 5 },
  emptyButton: { minHeight: 48, borderRadius: 15, backgroundColor: foco.colors.text, paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  emptyButtonText: { color: foco.colors.bg, fontSize: 14, fontWeight: '600' },
  sheetInput: { minHeight: 52, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, color: foco.colors.text, paddingHorizontal: 14, fontSize: 15.5, marginBottom: 7 },
  errorText: { color: '#E6A8B0', fontSize: 12, marginBottom: 16 },
  iconChoices: { gap: 9, paddingBottom: 7 },
  iconChoice: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center' },
  iconChoiceSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  detailGrid: { flexDirection: 'row', gap: 9, paddingBottom: 8 },
  detailMetric: { flex: 1, minWidth: 0, minHeight: 94, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, padding: 13, justifyContent: 'space-between' },
  detailValue: { color: foco.colors.text, fontSize: 20, fontWeight: '600', fontVariant: ['tabular-nums'] },
  detailLabel: { color: foco.colors.muted, fontSize: 12 },
});
