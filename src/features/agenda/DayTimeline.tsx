import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTasksForCalendarDay, getTimelinePosition } from '@/src/core/calendar';
import { buildDayPlan } from '@/src/core/dayPlan';
import { atLocalTime, endOfLocalDay, startOfLocalDay, type FocoState, type Task } from '@/src/core/model';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { pressedStyle } from '@/src/ui/premium';
import { AgendaTaskBlock } from './AgendaTaskBlock';

const MINUTE_HEIGHT = 0.86;

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
  const startHour = state.planning.workdayStartHour;
  const endHour = state.planning.workdayEndHour;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);
  const height = (endHour - startHour) * 60 * MINUTE_HEIGHT;
  const today = startOfLocalDay(Date.now()) === startOfLocalDay(day);
  const nowTop = today ? Math.max(0, (Date.now() - atLocalTime(day, startHour)) / 60_000 * MINUTE_HEIGHT) : -1;
  const sessions = state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= startOfLocalDay(day) && session.endedAt < endOfLocalDay(day));

  return (
    <View>
      <View style={[styles.summaryRow, { borderBottomColor: theme.colors.borderSoft }]}>
        <Summary label="Fijo" value={`${plan.scheduledMinutes}m`} color={theme.colors.text} />
        <Summary label="Flexible" value={`${plan.flexibleMinutes}m`} color={theme.colors.text} />
        <Summary label={plan.overloadMinutes > 0 ? 'Exceso' : 'Libre'} value={`${plan.overloadMinutes || plan.freeMinutes}m`} color={plan.overloadMinutes > 0 ? theme.colors.danger : theme.colors.success} />
      </View>
      <View style={[styles.timeline, { height, borderColor: theme.colors.borderSoft }]}>
        {hours.map((hour, index) => {
          const top = index * 60 * MINUTE_HEIGHT;
          return (
            <Pressable key={hour} accessibilityLabel={`Crear tarea a las ${hour}:00`} onPress={() => onSlot(atLocalTime(day, hour))} style={({ pressed }) => [styles.hourRow, { top, borderColor: theme.colors.borderSoft }, pressed && pressedStyle]}>
              <Text style={[styles.hourLabel, { color: theme.colors.subtle }]}>{String(hour).padStart(2, '0')}:00</Text>
            </Pressable>
          );
        })}
        {sessions.map((session, index) => {
          const top = Math.max(0, (session.startedAt - atLocalTime(day, startHour)) / 60_000 * MINUTE_HEIGHT);
          const barHeight = Math.max(3, session.durationSec / 60 * MINUTE_HEIGHT);
          return <View key={session.id} accessibilityLabel={`Sesión de enfoque ${Math.round(session.durationSec / 60)} minutos`} style={[styles.sessionBar, { top, height: barHeight, left: 47 + (index % 3) * 3, backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent }]} />;
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
              style={{ position: 'absolute', top: position.top, minHeight: position.height, left: 54 + (index % 2) * 5, right: index % 2 ? 0 : 5, zIndex: 3 + index }}
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
  summaryRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  summary: { flex: 1 },
  summaryValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18, fontVariant: ['tabular-nums'] },
  summaryLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 12, marginTop: 1 },
  timeline: { position: 'relative', borderBottomWidth: StyleSheet.hairlineWidth },
  hourRow: { position: 'absolute', left: 0, right: 0, height: 60 * MINUTE_HEIGHT, borderTopWidth: StyleSheet.hairlineWidth },
  hourLabel: { width: 46, paddingTop: 3, fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 12, fontVariant: ['tabular-nums'] },
  sessionBar: { position: 'absolute', width: 3, borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, zIndex: 2 },
  nowLine: { position: 'absolute', left: 45, right: 0, height: 1, zIndex: 20 },
  nowDot: { position: 'absolute', left: -3, top: -3, width: 7, height: 7, borderRadius: 4 },
  flexTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
});
