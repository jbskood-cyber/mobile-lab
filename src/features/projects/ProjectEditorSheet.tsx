import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import type { Project, ProjectIcon } from '@/src/core/model';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';

const icons: ProjectIcon[] = ['briefcase', 'book', 'heart', 'grid', 'bulb', 'archive'];

export function ProjectEditorSheet({ visible, project, onClose, onSaved }: { visible: boolean; project?: Project; onClose: () => void; onSaved?: (project: Project) => void }) {
  const { state, addProject, updateProject } = useFocoStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<ProjectIcon>('grid');
  const duplicate = state.projects.some((item) => item.id !== project?.id && item.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'));

  useEffect(() => {
    if (!visible) return;
    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setIcon(project?.icon ?? 'grid');
  }, [project, visible]);

  const save = () => {
    if (!name.trim() || duplicate) return;
    let saved: Project | undefined;
    if (project) {
      updateProject(project.id, { name, description, icon });
      saved = { ...project, name: name.trim(), description: description.trim(), icon, updatedAt: Date.now() };
    } else saved = addProject(name, icon) ?? undefined;
    if (!saved) return;
    if (!project && description.trim()) updateProject(saved.id, { description });
    hapticSuccess();
    onSaved?.({ ...saved, description: description.trim() });
    onClose();
  };

  return (
    <FocoSheet visible={visible} title={project ? 'Editar proyecto' : 'Nuevo proyecto'} subtitle="Agrupa tareas que comparten un mismo resultado." onClose={onClose} footer={<><SheetButton label="Cancelar" variant="secondary" onPress={onClose} /><SheetButton label={project ? 'Guardar' : 'Crear'} onPress={save} disabled={!name.trim() || duplicate} /></>}>
      <FieldLabel>NOMBRE</FieldLabel>
      <TextInput autoFocus={!project} value={name} onChangeText={setName} placeholder="Ej. Universidad" placeholderTextColor={foco.colors.subtle} autoCapitalize="sentences" style={styles.input} />
      {duplicate ? <Text style={styles.error}>Ya existe un proyecto con ese nombre.</Text> : null}
      <FieldLabel>ICONO</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.icons}>
        {icons.map((item) => (
          <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: icon === item }} onPress={() => { setIcon(item); hapticSelection(); }} style={({ pressed }) => [styles.icon, icon === item && styles.iconActive, pressed && pressedStyle]}>
            <FocoIcon name={item as IconName} size={25} color={icon === item ? foco.colors.bg : foco.colors.text} />
          </Pressable>
        ))}
      </ScrollView>
      <FieldLabel>DESCRIPCIÓN</FieldLabel>
      <TextInput value={description} onChangeText={setDescription} placeholder="Qué quieres conseguir con este proyecto" placeholderTextColor={foco.colors.subtle} multiline textAlignVertical="top" style={[styles.input, styles.description]} />
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, color: foco.colors.text, paddingHorizontal: 14, fontSize: 16, marginBottom: 18 },
  description: { minHeight: 105, paddingTop: 13 },
  error: { color: '#DCA8AF', fontSize: 12.5, marginTop: -12, marginBottom: 18 },
  icons: { gap: 9, paddingBottom: 18 },
  icon: { width: 52, height: 52, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
});
