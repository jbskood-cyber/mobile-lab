const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (...parts) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8');

function sourceFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(?:ts|tsx|js|jsx)$/.test(entry.name) ? [absolute] : [];
  });
}

test('global FOCO chrome no longer carries the retired orange brand tokens or gradients', () => {
  const theme = read('src', 'ui', 'themeTokens.ts');
  for (const retired of ['#E96712', '#FF8A2A', '#FFF0E5', '#322012']) {
    assert.doesNotMatch(theme, new RegExp(retired, 'i'));
  }
  assert.match(theme, /accent:/);
  assert.match(theme, /accentSoft:/);
  const gradientSources = [...sourceFiles(path.join(process.cwd(), 'app')), ...sourceFiles(path.join(process.cwd(), 'src'))]
    .filter((file) => /LinearGradient|expo-linear-gradient|react-native-linear-gradient/.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(process.cwd(), file));
  assert.deepEqual(gradientSources, [], `Runtime gradient usage remains in: ${gradientSources.join(', ')}`);
});

test('task and agenda identity accept project color without recoloring their whole surface', () => {
  const taskRow = read('src', 'features', 'tasks', 'TaskRow.tsx');
  const taskBlock = read('src', 'features', 'agenda', 'AgendaTaskBlock.tsx');
  const sessionBlock = read('src', 'features', 'agenda', 'AgendaSessionBlock.tsx');
  const timeline = read('src', 'features', 'agenda', 'DayTimeline.tsx');
  assert.match(taskRow, /projectColor/);
  assert.match(taskBlock, /projectColor/);
  assert.match(sessionBlock, /projectColor/);
  assert.match(timeline, /resolveProjectColor/);
  assert.match(timeline, /projectColor=/);
});

test('Progreso resolves project colors for distributions and recent recorded time while aggregate charts stay neutral', () => {
  const stats = read('src', 'features', 'stats', 'StatsScreen.tsx');
  assert.match(stats, /resolveProjectColor/);
  assert.match(stats, /projectColors/);
  assert.match(stats, /color:/);
  assert.match(stats, /sessionMarker|sessionDot/);
  assert.doesNotMatch(stats, /backgroundColor:\s*theme\.colors\.accent\s*\}\]\s*\/?>/);
});

test('Rutinas explains that routines are task templates rather than another task list', () => {
  const routines = read('src', 'features', 'routines', 'RoutinesSheet.tsx');
  assert.match(routines, /Plantillas/i);
  assert.match(routines, /tareas/i);
  assert.match(routines, /Generar|Crear tarea|Crear ahora/i);
});
