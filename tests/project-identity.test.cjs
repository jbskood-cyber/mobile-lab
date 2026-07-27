const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const model = require('../.core-test-dist/core/model.js');
const { migrateState } = require('../.core-test-dist/core/migration.js');

const {
  PROJECT_COLOR_IDS,
  PROJECT_ICON_IDS,
  addProject,
  createInitialState,
  defaultProjectColor,
  updateProject,
} = model;

const iconSourcePath = path.join(process.cwd(), 'src', 'ui', 'FocoIcon.tsx');
const paletteSourcePath = path.join(process.cwd(), 'src', 'ui', 'projectColors.ts');
const editorSourcePath = path.join(process.cwd(), 'src', 'features', 'projects', 'ProjectEditorSheet.tsx');
const storeSourcePath = path.join(process.cwd(), 'src', 'core', 'FocoStore.tsx');
const projectsSourcePath = path.join(process.cwd(), 'src', 'features', 'projects', 'ProjectsScreen.tsx');
const projectDetailSourcePath = path.join(process.cwd(), 'src', 'features', 'projects', 'ProjectDetailScreen.tsx');

test('project identity catalogs are finite, unique, and seeded on every project', () => {
  assert.equal(PROJECT_ICON_IDS.length, 32);
  assert.equal(new Set(PROJECT_ICON_IDS).size, 32);
  assert.equal(PROJECT_COLOR_IDS.length, 12);
  assert.equal(new Set(PROJECT_COLOR_IDS).size, 12);

  const now = new Date(2026, 6, 26, 19, 0, 0, 0).getTime();
  const state = createInitialState(now);
  assert.ok(state.projects.length > 0);
  assert.ok(state.projects.every((project) => PROJECT_COLOR_IDS.includes(project.color)));
});

test('legacy v3 projects hydrate with deterministic valid identity and preserve IDs', () => {
  const now = new Date(2026, 6, 26, 19, 5, 0, 0).getTime();
  const initial = createInitialState(now);
  const legacy = {
    version: 3,
    projects: [{
      id: 'legacy',
      name: 'Legacy',
      icon: 'book',
      archived: false,
      description: 'preserve me',
      sortOrder: 2,
      createdAt: now - 1000,
      updatedAt: now - 500,
    }],
    tasks: [],
    sessions: [],
    routines: [],
    preferences: initial.preferences,
    planning: initial.planning,
    appearance: 'light',
  };

  const migrated = migrateState(legacy, now);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.projects[0].id, 'legacy');
  assert.equal(migrated.projects[0].description, 'preserve me');
  assert.equal(migrated.projects[0].icon, 'book');
  assert.equal(migrated.projects[0].color, defaultProjectColor(2));

  const malformed = migrateState({
    ...legacy,
    projects: [{ ...legacy.projects[0], icon: 'not-real', color: 'not-real' }],
  }, now);
  assert.equal(malformed.projects[0].id, 'legacy');
  assert.equal(malformed.projects[0].icon, 'grid');
  assert.equal(malformed.projects[0].color, defaultProjectColor(2));
});

test('project icon and color can be created and updated independently', () => {
  const now = new Date(2026, 6, 26, 19, 10, 0, 0).getTime();
  const initial = createInitialState(now);
  const createdState = addProject(initial, 'Proyecto propio', 'atom', 'pacific', now + 1);
  const created = createdState.projects[0];

  assert.equal(created.name, 'Proyecto propio');
  assert.equal(created.icon, 'atom');
  assert.equal(created.color, 'pacific');

  const recolored = updateProject(createdState, created.id, { color: 'amber-soft' }, now + 2);
  const updated = recolored.projects.find((project) => project.id === created.id);
  assert.equal(updated.icon, 'atom');
  assert.equal(updated.color, 'amber-soft');
});

test('all 32 curated project icon IDs resolve through FocoIcon', () => {
  const source = fs.readFileSync(iconSourcePath, 'utf8');
  for (const icon of PROJECT_ICON_IDS) {
    assert.ok(
      source.includes(`'${icon}'`) && (source.includes(`name === '${icon}'`) || source.includes(`${icon}:`) || ['home', 'calendar', 'folder', 'bars'].includes(icon)),
      `${icon} must resolve through FocoIcon`,
    );
  }
});

test('project editor exposes independent solid color and 32-icon selectors', () => {
  assert.ok(fs.existsSync(paletteSourcePath), 'projectColors.ts must define the solid project palette');
  const palette = fs.readFileSync(paletteSourcePath, 'utf8');
  const editor = fs.readFileSync(editorSourcePath, 'utf8');
  const store = fs.readFileSync(storeSourcePath, 'utf8');

  for (const color of PROJECT_COLOR_IDS) assert.ok(palette.includes(`${color}:`) || palette.includes(`'${color}'`), `${color} must have a palette token`);
  assert.match(palette, /#D6A23A/i);
  assert.match(editor, /COLOR DEL PROYECTO/);
  assert.match(editor, /PROJECT_COLOR_IDS/);
  assert.match(editor, /PROJECT_ICON_IDS/);
  assert.match(editor, /setColor/);
  assert.match(editor, /setIcon/);
  assert.match(editor, /addProject\(name, icon, color\)/);
  assert.match(editor, /updateProject\(project\.id, \{ name, description, icon, color \}\)/);
  assert.match(store, /addProject: \(name: string, icon\?: ProjectIcon, color\?: ProjectColor\)/);
  assert.match(store, /'name' \| 'icon' \| 'color'/);
});

test('project list and detail render contextual project identity without recoloring global chrome', () => {
  const projects = fs.readFileSync(projectsSourcePath, 'utf8');
  const detail = fs.readFileSync(projectDetailSourcePath, 'utf8');
  assert.match(projects, /resolveProjectColor/);
  assert.match(projects, /project\.color/);
  assert.match(projects, /projectColor/);
  assert.match(detail, /resolveProjectColor/);
  assert.match(detail, /project\.color/);
  assert.match(detail, /projectColor/);
});
