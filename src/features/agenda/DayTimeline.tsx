import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getAgendaSessionEvents, getAgendaTimelineWindow } from '@/src/core/agendaDay';
import { getTasksForCalendarDay, getTimelinePosition } from '@/src/core/calendar';
import { buildDayPlan } from '@/src/core/dayPlan';
import { atLocalTime, endOfLocalDay, startOfLocalDay, type FocoState, type Task } from '@/src/core/model';
import { FocoPressable } from '@/src/ui/FocoPressable';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { AgendaSessionBlock } from './AgendaSessionBlock';
import { AgendaTaskBlock } from './AgendaTaskBlock';

const MINUTE_HEIGHT = 0.86;
const SESSION_MIN_HEIGHT = 34;

export function DayTimeline({ state, day, onTask, onSlot }: {
  state: FocoState;
  day: number;
  onTask: (task: Task) => void;
  onSlot: (timestamp: number) => void;
}) {
  const theme = useFocoTheme();
  const plan = useMemo(() => buildDayPlan(state, day), [day, state]);
  const tasks = useMemo(() => getTasksForCalendarDay(state, day).filter((task) => !task.completed && task.plannedStartAt !== undefined), [day, state]);
  const projectMap = useMemo(() => new Map(state.projects.map((project) => [project.id, project.name])), [state.projects]);
  const pomodoros = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of state.sessions) if (session.taskId && session.phase === 'focus' && session.mode === 'pomodoro' && session.completed) map.set(session.taskId, (map.get(session.taskId) ?? 0) + 1);
    return map;
  }, [state.sessions]);
  const sessions = useMemo(() => getAgendaSessionEvents(state, day), [day, state]);
  const timelineWindow = useMemo(() => getAgendaTimelineWindow(state, day), [day, state]);
  const startHour = timelineWindow.startHour;
  const endHour = timelineWindow.endHour;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);
  const height = Math.max(60 * MINUTE_HEIGHT, (endHour - startHour) * 60 * MINUTE_HEIGHT);
  const today = startOfLocalDay(Date.now()) === startOfLocalDay(day);
  const nowTop = today ? Math.max(0, (Date.now() - atLocalTime(day, startHour)) / 60_000 * MINUTE_HEIGHT) : -1;
  const dayStart = startOfLocalDay(day);
  const dayEnd = endOfLocalDay(day);
  const planStart = atLocalTime(day, state.planning.workdayStartHour);
  const planEnd = state.planning.workdayEndHour >= 24 ? dayEnd : atLocalTime(day, state.planning.workdayEndHour);
  const hasOutOfHoursReal = sessions.some((session) => {
    const visibleStart = Math.max(dayStart, session.startedAt);
    const visibleEnd = Math.min(dayEnd, session.endedAt);
    return visibleStart < planStart || visibleEnd > planEnd;
  });
  const realMinutes = Math.round(sessions.reduce((total, session) => {
    const visibleStart = Math.max(dayStart, session.startedAt);
    const visibleEnd = Math.min(dayEnd, session.endedAt);
    return total + Math.max(0, visibleEnd - visibleStart) / 60_000;
  }, 0));
  const windowStart = atLocalTime(day, startHour);
  const windowEnd = endHour >= 24 ? dayEnd : atLocalTime(day, endHour);

  return (
    <View>
      <View style={[styles.summaryRow, { borderBottomColor: theme.colors.borderSoft }]}> 
        <Summary label="Fijo" value={`${plan.scheduledMinutes}m`} color={theme.colors.text} />
        <Summary label="Flexible" value={`${plan.flexibleMinutes}m`} color={theme.colors.text} />
        <Summary label="Real" value={`${realMinutes}m`} color={theme.colors.accent} />
        <Summary label={plan.overloadMinutes > 0 ? 'Exceso' : 'Libre'} value={`${plan.overloadMinutes || plan.freeMinutes}m`} color={plan.overloadMinutes > 0 ? theme.colors.danger : theme.colors.success} />
      </View>
      {hasOutOfHoursReal ? (
        <Text style={[styles.outOfHoursNote, { color: theme.colors.muted }]}>Real fuera del horario · también cuenta</Text>
      ) : null}
      <View style={styles.laneHeader}>
        <Text style={[styles.laneLabel, { color: theme.colors.muted }]}>Plan</Text>
        <Text style={[styles.laneLabel, styles.realLaneLabel, { color: theme.colors.muted }]}>Real</Text>
      </View>
      <View style={[styles.timeline, { height, borderColor: theme.colors.borderSoft }]}> 
        {hours.map((hour, index) => {
          const top = index * 60 * MINUTE_HEIGHT;
          const canCreate = hour < endHour && hour < 24;
          return (
            <FocoPressable
              key={hour}
              feedback="quiet"
              accessibilityLabel={canCreate ? `Crear tarea a las ${hour}:00` : `Fin del día a las ${String(hour).padStart(2, '0')}:00`}
              disabled={!canCreate}
              onPress={() => canCreate && onSlot(atLocalTime(day, hour))}
              style={[styles.hourRow, { top, height: canCreate ? 60 * MINUTE_HEIGHT : 1, borderColor: theme.colors.borderSoft }]}
            >
              <Text style={[styles.hourLabel, { color: theme.colors.subtle }]}>{String(hour).padStart(2, '0')}:00</Text>
            </FocoPressable>
          );
        })}
        {tasks.map((task, index) => {
          const position = getTimelinePosition(task, day, startHour, MINUTE_HEIGHT);
          return (
            <AgendaTaskBlock
              key={task.id}
              task={task}
              projectName={projectMap.get(task.projectId) ?? 'Sin proyecto'}
              completedPomodoros={pomodoros.get(task.id) ?? 0}
              onPress={() => onTask(task)}
              style={{ position: 'absolute', top: position.top, minHeight: position.height, left: 54 + (index % 2) * 3, right: '48%', zIndex: 3 + index }}
            />
          );
        })}
        {sessions.map((session, index) => {
          const visibleStart = Math.max(windowStart, session.startedAt);
          const visibleEnd = Math.min(windowEnd, session.endedAt);
          const top = Math.max(0, (visibleStart - windowStart) / 60_000 * MINUTE_HEIGHT);
          const visibleMinutes = Math.max(1, (visibleEnd - visibleStart) / 60_000);
          return (
            <AgendaSessionBlock
              key={session.id}
              event={session}
              style={{ position: 'absolute', top, minHeight: Math.max(SESSION_MIN_HEIGHT, visibleMinutes * MINUTE_HEIGHT), left: '56%', right: 5, zIndex: 8 + index }}
            />
          );
        })}
        {today && nowTop >= 0 && nowTop <= height ? <View style={[styles.nowLine, { top: nowTop, backgroundColor: theme.colors.danger }]}><View style={[styles.nowDot, { backgroundColor: theme.colors.danger }]} /></View> : null}
      </View>
      {plan.flexible.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.flexTitle, { color: theme.colors.text }]}>Sin hora</Text>
          {plan.flexible.map((task) => <AgendaTaskBlock key={task.id} task={task} projectName={projectMap.get(task.projectId) ?? 'Sin proyecto'} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => onTask(task)} style={{ marginTop: 6 }} />)}
        </View>
      ) : null}
    </View>
  );
}

function Summary({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = useFocoTheme();
  return <View style={styles.summary}><Text style={[styles.summaryValue, { color }]}>{value}</Text><Text style={[styles.summaryLabel, { color: theme.colors.muted }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  summaryRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 2 },
  summary: { flex: 1 },
  summaryValue: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 14, lineHeight: 18, fontVariant: ['tabular-nums'] },
  summaryLabel: { fontFamily: 'InstrumentSans_400Regular', fontSize: 9.5, lineHeight: 12, marginTop: 1 },
  outOfHoursNote: { paddingTop: 5, paddingBottom: 2, fontFamily: 'InstrumentSans_500Medium', fontSize: 9.5, lineHeight: 12 },
  laneHeader: { minHeight: 24, flexDirection: 'row', alignItems: 'center', paddingLeft: 54, paddingRight: 5 },
  laneLabel: { width: '50%', fontFamily: 'InstrumentSans_600SemiBold', fontSize: 9.5, lineHeight: 12, textTransform: 'uppercase', letterSpacing: 0.55 },
  realLaneLabel: { textAlign: 'right' },
  timeline: { position: 'relative', borderBottomWidth: StyleSheet.hairlineWidth },
  hourRow: { position: 'absolute', left: 0, right: 0, borderTopWidth: StyleSheet.hairlineWidth },
  hourLabel: { width: 46, paddingTop: 3, fontFamily: 'InstrumentSans_400Regular', fontSize: 9.5, lineHeight: 12, fontVariant: ['tabular-nums'] },
  nowLine: { position: 'absolute', left: 45, right: 0, height: 1, zIndex: 20 },
  nowDot: { position: 'absolute', left: -3, top: -3, width: 7, height: 7, borderRadius: 4 },
  flexTitle: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 14, lineHeight: 18 },
});
