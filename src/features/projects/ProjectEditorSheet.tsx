import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { PROJECT_COLOR_IDS, PROJECT_ICON_IDS, defaultProjectColor, type Project, type ProjectColor, type ProjectIcon } from '@/src/core/model';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { PROJECT_COLORS, resolveProjectColor } from '@/src/ui/projectColors';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';
import type { FocoTheme } from '@/src/ui/themeTokens';

export function ProjectEditorSheet({ visible, project, onClose, onSaved }: { visible: boolean; project?: Project; onClose: () => void; onSaved?: (project: Project) => void }) {
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { state, addProject, updateProject } = useFocoStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<ProjectIcon>('grid');
  const [color, setColor] = useState<ProjectColor>('emerald');
  const duplicate = state.projects.some((item) => item.id !== project?.id && item.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'));
  const selectedColor = resolveProjectColor(color, theme.mode);

  useEffect(() => {
    if (!visible) return;
    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setIcon(project?.icon ?? 'grid');
    setColor(project?.color ?? defaultProjectColor(project?.sortOrder ?? state.projects.length));
  }, [project, state.projects.length, visible]);

  const save = () => {
    if (!name.trim() || duplicate) return;
    let saved: Project | undefined;
    if (project) {
      updateProject(project.id, { name, description, icon, color });
      saved = { ...project, name: name.trim(), description: description.trim(), icon, color, updatedAt: Date.now() };
    } else saved = addProject(name, icon, color) ?? undefined;
    if (!saved) return;
    if (!project && description.trim()) updateProject(saved.id, { description });
    hapticSuccess();
    onSaved?.({ ...saved, description: description.trim(), icon, color });
    onClose();
  };

  return (
    <FocoSheet visible={visible} title={project ? 'Editar proyecto' : 'Nuevo proyecto'} subtitle="Agrupa tareas que comparten un resultado." onClose={onClose} footer={<><SheetButton label="Cancelar" variant="secondary" onPress={onClose} /><SheetButton label={project ? 'Guardar' : 'Crear'} onPress={save} disabled={!name.trim() || duplicate} /></>}>
      <FieldLabel>NOMBRE</FieldLabel>
      <TextInput autoFocus={!project} value={name} onChangeText={setName} placeholder="Ej. Universidad" placeholderTextColor={theme.colors.subtle} autoCapitalize="sentences" style={styles.input} />
      {duplicate ? <Text style={styles.error}>Ya existe un proyecto con ese nombre.</Text> : null}

      <FieldLabel>COLOR DEL PROYECTO</FieldLabel>
      <View style={styles.swatches}>
        {PROJECT_COLOR_IDS.map((item) => {
          const selected = color === item;
          const value = resolveProjectColor(item, theme.mode);
          return (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityLabel={PROJECT_COLORS[item].label}
              accessibilityState={{ checked: selected }}
              onPress={() => { setColor(item); hapticSelection(); }}
              style={({ pressed }) => [styles.swatchButton, selected && { borderColor: theme.colors.text }, pressed && pressedStyle]}
            >
              <View style={[styles.swatch, { backgroundColor: value }]} />
            </Pressable>
          );
        })}
      </View>

      <FieldLabel>ICONO</FieldLabel>
      <View style={styles.icons}>
        {PROJECT_ICON_IDS.map((item) => {
          const selected = icon === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityLabel={`Icono ${item}`}
              accessibilityState={{ checked: selected }}
              onPress={() => { setIcon(item); hapticSelection(); }}
              style={({ pressed }) => [styles.icon, selected && { borderColor: selectedColor, backgroundColor: theme.colors.panelStrong }, pressed && pressedStyle]}
            >
              <FocoIcon name={item as IconName} size={21} color={selected ? selectedColor : theme.colors.text} />
            </Pressable>
          );
        })}
      </View>

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
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
    swatchButton: { width: 42, height: 42, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
    swatch: { width: 30, height: 30, borderRadius: 9 },
    icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingBottom: 16 },
    icon: { width: 46, height: 46, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  });
}
