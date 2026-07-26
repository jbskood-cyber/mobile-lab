const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { createInitialState, startOfLocalDay } = require('../.core-test-dist/core/model.js');
const { getAgendaSessionEvents, getAgendaTimelineWindow } = require('../.core-test-dist/core/agendaDay.js');
const { resolveCalendarTap } = require('../.core-test-dist/core/calendarTap.js');

const timelinePath = path.join(process.cwd(), 'src', 'features', 'agenda', 'DayTimeline.tsx');
const monthCalendarPath = path.join(process.cwd(), 'src', 'features', 'agenda', 'MonthCalendar.tsx');
const agendaScreenPath = path.join(process.cwd(), 'src', 'features', 'agenda', 'AgendaScreen.tsx');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function at(day, hour, minute = 0) {
  const value = new Date(day);
  value.setHours(hour, minute, 0, 0);
  return value.getTime();
}

function makeSession(id, projectId, taskId, startedAt, endedAt, overrides = {}) {
  return {
    id,
    projectId,
    taskId,
    mode: 'pomodoro',
    phase: 'focus',
    startedAt,
    endedAt,
    durationSec: Math.max(0, Math.round((endedAt - startedAt) / 1000)),
    plannedSec: 25 * 60,
    completed: true,
    interrupted: false,
    cycleNumber: 1,
    ...overrides,
  };
}

test('Agenda projects short and out-of-hours focus sessions as first-class day history', () => {
  const day = startOfLocalDay(new Date(2026, 6, 25, 12, 0, 0, 0).getTime());
  const state = createInitialState(day);
  state.planning = { ...state.planning, workdayStartHour: 7, workdayEndHour: 22 };
  state.projects = state.projects.map((project) => project.id === 'trabajo' ? { ...project, name: 'Trabajo' } : project);
  state.tasks = [{
    id: 'task-five', title: 'Cinco minutos reales', projectId: 'trabajo', priority: 'Media', completed: false,
    inProgress: false, favorite: false, notes: '', recurrence: { kind: 'none', interval: 1, fromCompletion: false },
    estimatedPomodoros: 1, durationMinutes: 5, captured: false, firstStep: '', subtasks: [], sortOrder: 0,
    createdAt: day, updatedAt: day,
  }];
  state.sessions = [
    makeSession('early', 'trabajo', undefined, at(day, 5, 10), at(day, 5, 20)),
    makeSession('five', 'trabajo', 'task-five', at(day, 10, 0), at(day, 10, 5)),
    makeSession('late', 'trabajo', undefined, at(day, 23, 20), at(day, 23, 30), { mode: 'stopwatch', completed: false, interrupted: true }),
    makeSession('break', 'trabajo', undefined, at(day, 12, 0), at(day, 12, 10), { phase: 'shortBreak' }),
  ];

  const events = getAgendaSessionEvents(state, day);
  assert.equal(events.length, 3);
  const short = events.find((event) => event.sessionId === 'five');
  assert.equal(short.taskTitle, 'Cinco minutos reales');
  assert.equal(short.durationSec, 300);
  assert.equal(short.projectName, 'Trabajo');
  assert.equal(short.startedAt, at(day, 10, 0));
  assert.equal(short.endedAt, at(day, 10, 5));

  assert.deepEqual(getAgendaTimelineWindow(state, day), { startHour: 5, endHour: 24 });
});

test('Agenda includes a focus session when its interval overlaps the selected local day', () => {
  const day = startOfLocalDay(new Date(2026, 6, 25, 12, 0, 0, 0).getTime());
  const state = createInitialState(day);
  const before = day - 2 * 60 * 1000;
  const after = day + 3 * 60 * 1000;
  state.sessions = [makeSession('cross-midnight', 'personal', undefined, before, after, { completed: false, interrupted: true })];

  const events = getAgendaSessionEvents(state, day);
  assert.equal(events.length, 1);
  assert.equal(events[0].sessionId, 'cross-midnight');
  assert.equal(events[0].startedAt, before);
  assert.equal(events[0].endedAt, after);
});

test('Day timeline renders real sessions as readable event blocks instead of 3px markers', () => {
  const source = read(timelinePath);
  assert.match(source, /getAgendaSessionEvents/);
  assert.match(source, /getAgendaTimelineWindow/);
  assert.match(source, /AgendaSessionBlock/);
  assert.doesNotMatch(source, /sessionBar/);
  assert.doesNotMatch(source, /width:\s*3/);
  assert.match(source, /Plan/);
  assert.match(source, /Real/);
});

test('calendar tap contract selects once and opens only same-day second tap inside window', () => {
  const first = resolveCalendarTap(null, 1000, 10_000);
  assert.deepEqual(first, { action: 'select', next: { day: 1000, at: 10_000 } });

  const second = resolveCalendarTap(first.next, 1000, 10_390);
  assert.deepEqual(second, { action: 'open', next: null });

  const late = resolveCalendarTap(first.next, 1000, 10_421);
  assert.equal(late.action, 'select');
  assert.deepEqual(late.next, { day: 1000, at: 10_421 });

  const otherDay = resolveCalendarTap(first.next, 2000, 10_200);
  assert.equal(otherDay.action, 'select');
  assert.deepEqual(otherDay.next, { day: 2000, at: 10_200 });
});

test('Monthly calendar wires the tested tap decision to exact Day mode', () => {
  const month = read(monthCalendarPath);
  const agenda = read(agendaScreenPath);
  assert.match(month, /resolveCalendarTap/);
  assert.match(month, /decision\.action === 'open'/);
  assert.doesNotMatch(month, /DOUBLE_TAP_MS/);
  assert.match(month, /onSelect\(timestamp\)/);
  assert.match(month, /onOpenDay\(timestamp\)/);
  assert.match(agenda, /openCalendarDay/);
  assert.match(agenda, /setSelectedDate\(value\)/);
  assert.match(agenda, /setMode\('Día'\)/);
  assert.match(agenda, /onOpenDay=\{openCalendarDay\}/);
});
