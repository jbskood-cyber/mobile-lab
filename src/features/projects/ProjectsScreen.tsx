import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getProjectMetrics, type Project, type ProjectIcon } from '@/src/core/model';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

type Filter = 'Todos' | 'Activos' | 'Archivados';
const iconOptions: ProjectIcon[] = ['briefcase', 'book', 'heart', 'grid', 'bulb', 'archive'];

export function ProjectsScreen() {
  const { state, addProject, toggleProjectArchived } = useFocoStore();
  const [filter, setFilter] = useState<Filter>('Todos');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectIcon, setProjectIcon] = useState<ProjectIcon>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const activeCount = state.projects.filter((project) => !project.archived).length;
  const archivedCount = state.projects.length - activeCount;
  const duplicate = state.projects.some((project) => project.name.toLowerCase() === projectName.trim().toLowerCase());
  const visible = useMemo(() => state.projects.filter((project) => {
    const filterMatch = filter === 'Todos' || (filter === 'Activos' ? !project.archived : project.archived);
    return filterMatch && project.name.toLowerCase().includes(query.trim().toLowerCase());
  }), [filter, query, state.projects]);
  const active = visible.filter((project) => !project.archived);
  const archived = visible.filter((project) => project.archived);

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
    toggleProjectArchived(selectedProject.id);
    hapticWarning();
    setSelectedProject(null);
  };

  return (
    <FocoScreen title="Proyectos" rightIcon="plus" onRightPress={() => { setCreateOpen(true); hapticSelection(); }}>
      <Surface style={styles.searchBox}>
        <FocoIcon name="search" size={22} color={foco.colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar proyectos"
          placeholderTextColor={foco.colors.muted}
          style={styles.searchInput}
          accessibilityLabel="Buscar proyectos"
          returnKeyType="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={({ pressed }) => [styles.clearSearch, pressed && pressedStyle]}>
            <FocoIcon name="plus" size={19} color={foco.colors.muted} style={styles.closeIcon} />
          </Pressable>
        ) : null}
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
        {active.map((project) => <ProjectRow key={project.id} project={project} onPress={() => { setSelectedProject(project); hapticSelection(); }} />)}
      </View>

      {archived.length > 0 ? <Text style={[styles.groupLabel, styles.archiveLabel]}>ARCHIVADOS</Text> : null}
      <View style={styles.list}>
        {archived.map((project) => <ProjectRow key={project.id} project={project} onPress={() => { setSelectedProject(project); hapticSelection(); }} />)}
      </View>

      {visible.length === 0 ? (
        <Surface style={styles.emptyState}>
          <FocoIcon name="folder" size={32} color={foco.colors.text} />
          <Text style={styles.emptyTitle}>{query ? 'Sin coincidencias' : 'No hay proyectos aquí'}</Text>
          <Text style={styles.emptyCopy}>{query ? 'Prueba con otro nombre o limpia la búsqueda.' : 'Crea un proyecto para agrupar tareas y sesiones.'}</Text>
          {!query ? <Pressable accessibilityRole="button" onPress={() => setCreateOpen(true)} style={({ pressed }) => [styles.emptyButton, pressed && pressedStyle]}><Text style={styles.emptyButtonText}>Crear proyecto</Text></Pressable> : null}
        </Surface>
      ) : null}

      <FocoSheet
        visible={createOpen}
        title="Nuevo proyecto"
        subtitle="Empieza con un nombre claro. Podrás archivar el proyecto cuando termine."
        onClose={() => setCreateOpen(false)}
        footer={<SheetButton label="Crear proyecto" onPress={saveProject} disabled={!projectName.trim() || duplicate} />}
      >
        <FieldLabel>NOMBRE</FieldLabel>
        <TextInput autoFocus value={projectName} onChangeText={setProjectName} placeholder="Ej. Universidad" placeholderTextColor={foco.colors.subtle} style={styles.sheetInput} accessibilityLabel="Nombre del proyecto" returnKeyType="done" onSubmitEditing={saveProject} />
        {duplicate ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>Ya existe un proyecto con ese nombre.</Text> : null}
        <FieldLabel>ICONO</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconChoices}>
          {iconOptions.map((icon) => (
            <Pressable key={icon} accessibilityRole="radio" accessibilityState={{ checked: projectIcon === icon }} onPress={() => { setProjectIcon(icon); hapticSelection(); }} style={({ pressed }) => [styles.iconChoice, projectIcon === icon && styles.iconChoiceSelected, pressed && pressedStyle]}>
              <FocoIcon name={icon as IconName} size={26} color={projectIcon === icon ? foco.colors.bg : foco.colors.text} />
            </Pressable>
          ))}
        </ScrollView>
      </FocoSheet>

      <ProjectDetailSheet project={selectedProject} state={state} onClose={() => setSelectedProject(null)} onArchive={archiveSelected} />
    </FocoScreen>
  );
}

function ProjectRow({ project, onPress }: { project: Project; onPress: () => void }) {
  const { state } = useFocoStore();
  const metrics = getProjectMetrics(state, project.id);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir proyecto ${project.name}`} onPress={onPress} style={({ pressed }) => [styles.row, pressed && pressedStyle]}>
      <View style={styles.iconTile}><FocoIcon name={project.icon as IconName} size={28} color={foco.colors.text} strokeWidth={1.75} /></View>
      <View style={styles.copy}>
        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.meta}>{metrics.taskCount} {metrics.taskCount === 1 ? 'tarea' : 'tareas'}  •  {formatDuration(metrics.focusSeconds, true)}</Text>
      </View>
      {!project.archived ? (
        <ProgressRing size={52} strokeWidth={2.5} progress={metrics.progress} color={foco.colors.text} trackColor="#3A3D44">
          <Text style={styles.progressText}>{Math.round(metrics.progress * 100)}%</Text>
        </ProgressRing>
      ) : <Text style={styles.dash}>–</Text>}
      <FocoIcon name="chevron-right" size={18} color={foco.colors.subtle} />
    </Pressable>
  );
}

function ProjectDetailSheet({ project, state, onClose, onArchive }: { project: Project | null; state: ReturnType<typeof useFocoStore>['state']; onClose: () => void; onArchive: () => void }) {
  const metrics = project ? getProjectMetrics(state, project.id) : null;
  return (
    <FocoSheet
      visible={Boolean(project)}
      title={project?.name ?? 'Proyecto'}
      subtitle={project?.archived ? 'Este proyecto está archivado y permanece disponible en tus estadísticas.' : 'Resumen generado a partir de tus tareas y sesiones locales.'}
      onClose={onClose}
      footer={<SheetButton label={project?.archived ? 'Restaurar proyecto' : 'Archivar proyecto'} variant={project?.archived ? 'primary' : 'danger'} onPress={onArchive} />}
    >
      {metrics ? (
        <View style={styles.detailGrid}>
          <View style={styles.detailMetric}><Text style={styles.detailValue}>{metrics.taskCount}</Text><Text style={styles.detailLabel}>Tareas</Text></View>
          <View style={styles.detailMetric}><Text style={styles.detailValue}>{metrics.completedCount}</Text><Text style={styles.detailLabel}>Completadas</Text></View>
          <View style={styles.detailMetric}><Text style={styles.detailValue}>{formatDuration(metrics.focusSeconds, true)}</Text><Text style={styles.detailLabel}>Enfoque</Text></View>
        </View>
      ) : null}
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  searchBox: { marginTop: 24, minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12 },
  searchInput: { flex: 1, color: foco.colors.text, fontSize: 17, paddingVertical: 13 },
  clearSearch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
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
  emptyState: { marginTop: 26, minHeight: 210, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: foco.colors.text, fontSize: 18, fontWeight: '600', marginTop: 14 },
  emptyCopy: { color: foco.colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  emptyButton: { minHeight: 48, borderRadius: 15, backgroundColor: foco.colors.text, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  emptyButtonText: { color: foco.colors.bg, fontSize: 14.5, fontWeight: '600' },
  sheetInput: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, color: foco.colors.text, paddingHorizontal: 15, fontSize: 16, marginBottom: 8 },
  errorText: { color: '#E6A8B0', fontSize: 12.5, marginBottom: 18 },
  iconChoices: { gap: 10, paddingBottom: 8 },
  iconChoice: { width: 54, height: 54, borderRadius: 17, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center' },
  iconChoiceSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  detailGrid: { flexDirection: 'row', gap: 10, paddingBottom: 8 },
  detailMetric: { flex: 1, minHeight: 102, borderRadius: 17, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, padding: 14, justifyContent: 'space-between' },
  detailValue: { color: foco.colors.text, fontSize: 22, fontWeight: '600' },
  detailLabel: { color: foco.colors.muted, fontSize: 12.5 },
});
