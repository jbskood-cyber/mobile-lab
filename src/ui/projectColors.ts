import type { ProjectColor } from '@/src/core/model';

export type ProjectColorToken = {
  label: string;
  light: string;
  dark: string;
};

export const PROJECT_COLORS: Record<ProjectColor, ProjectColorToken> = {
  emerald: { label: 'Esmeralda', light: '#049E6A', dark: '#049E6A' },
  eucalyptus: { label: 'Eucalipto', light: '#649680', dark: '#649680' },
  lime: { label: 'Lima', light: '#8FC241', dark: '#8FC241' },
  turquoise: { label: 'Turquesa', light: '#3DC4C7', dark: '#3DC4C7' },
  pacific: { label: 'Pacífico', light: '#3177B5', dark: '#3177B5' },
  'electric-blue': { label: 'Azul eléctrico', light: '#2175DF', dark: '#2175DF' },
  indigo: { label: 'Índigo', light: '#433F9E', dark: '#433F9E' },
  crimson: { label: 'Carmesí', light: '#DB3D32', dark: '#DB3D32' },
  coral: { label: 'Coral', light: '#DB604E', dark: '#DB604E' },
  'amber-soft': { label: 'Ámbar suave', light: '#D6A23A', dark: '#B98224' },
  violet: { label: 'Violeta', light: '#793BD7', dark: '#793BD7' },
  plum: { label: 'Ciruela', light: '#913A64', dark: '#913A64' },
};

export function resolveProjectColor(color: ProjectColor, appearance: 'light' | 'dark' = 'light') {
  const token = PROJECT_COLORS[color];
  return appearance === 'dark' ? token.dark : token.light;
}
