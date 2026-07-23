import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import type { Project, ProjectIcon } from '@/src/core/model';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';
import type { FocoTheme } from '@/src/ui/themeTokens';

const icons: ProjectIcon[] = ['briefcase', 'book', 'heart', 'grid', 'bulb', 'archive'];

export function ProjectEditorSheet({ visible, project, onClose, onSaved }: { visible: boolean; project?: Project; onClose: () => void; onSaved?: (project: Project) => void }) {
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
    <FocoSheet visible={visible} title={project ? 'Editar proyecto' : 'Nuevo proyecto'} subtitle="Agrupa tareas que comparten un resultado." onClose={onClose} footer={<><SheetButton label="Cancelar" variant="secondary" onPress={onClose} /><SheetButton label={project ? 'Guardar' : 'Crear'} onPress={save} disabled={!name.trim() || duplicate} /></>}>
      <FieldLabel>NOMBRE</FieldLabel>
      <TextInput autoFocus={!project} value={name} onChangeText={setName} placeholder="Ej. Universidad" placeholderTextColor={theme.colors.subtle} autoCapitalize="sentences" style={styles.input} />
      {duplicate ? <Text style={styles.error}>Ya existe un proyecto con ese nombre.</Text> : null}
      <FieldLabel>ICONO</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.icons}>
        {icons.map((item) => { const selected = icon === item; return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { setIcon(item); hapticSelection(); }} style={({ pressed }) => [styles.icon, selected && styles.iconActive, pressed && pressedStyle]}><FocoIcon name={item as IconName} size={22} color={selected ? theme.colors.inverseText : theme.colors.text} /></Pressable>; })}
      </ScrollView>
      <FieldLabel>DESCRIPCIÓN</FieldLabel>
      <TextInput value={description} onChangeText={setDescription} placeholder="Qué quieres conseguir con este proyecto" placeholderTextColor={theme.colors.subtle} multiline textAlignVertical="top" style={[styles.input, styles.description]} />
    </FocoSheet>
  );
}

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    input: { minHeight: 46, borderRadius: theme.radius.control, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, backgroundColor: theme.colors.panel, color: theme.colors.text, paddingHorizontal: 12, fontFamily: theme.fonts.regular, fontSize: 14, lineHeight: 19, marginBottom: 14 },
    description: { minHeight: 88, paddingTop: 10 },
    error: { color: theme.colors.danger, fontFamily: theme.fonts.medium, fontSize: 10.5, lineHeight: 14, marginTop: -9, marginBottom: 14 },
    icons: { gap: 6, paddingBottom: 14 },
    icon: { width: 46, height: 46, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    iconActive: { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse },
  });
}
