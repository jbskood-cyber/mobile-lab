import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Task } from '@/src/core/model';
import { buildReminderRequest, type ReminderRequest } from './reminderModel';

const TASK_CHANNEL = 'foco-tasks';
const TIMER_CHANNEL = 'foco-timer';

export async function configureLocalNotifications() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    if (Platform.OS === 'android') {
      await Promise.all([
        Notifications.setNotificationChannelAsync(TASK_CHANNEL, { name: 'Recordatorios de tareas', importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 180, 100, 180], lightColor: '#F7F7F8' }),
        Notifications.setNotificationChannelAsync(TIMER_CHANNEL, { name: 'Temporizador de enfoque', importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 100, 250], lightColor: '#F7F7F8' }),
      ]);
    }
  } catch {
    // Notifications enhance FOCO but never block local planning.
  }
}

export async function ensureNotificationPermission() {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function cancelScheduledNotification(identifier?: string) {
  if (!identifier) return;
  try { await Notifications.cancelScheduledNotificationAsync(identifier); } catch { /* expired identifier */ }
}

async function cancelTaskReminders(taskId: string) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matches = scheduled.filter((item) => item.content.data?.type === 'task' && item.content.data?.taskId === taskId);
    await Promise.all(matches.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  } catch {
    // Reconciliation retries on the next mutation.
  }
}

async function scheduleReminderRequest(request: ReminderRequest) {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: request.title, body: request.body, data: { type: 'task', taskId: request.taskId }, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(request.date), channelId: TASK_CHANNEL },
    });
  } catch {
    return undefined;
  }
}

export async function scheduleTaskReminder(task: Task) {
  const request = buildReminderRequest(task);
  if (!request || !(await ensureNotificationPermission())) return undefined;
  return scheduleReminderRequest(request);
}

export async function reconcileAllTaskReminders(tasks: Task[]) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = scheduled.filter((item) => item.content.data?.type === 'task');
    await Promise.all(taskNotifications.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  } catch {
    // Do not schedule duplicates when the existing queue cannot be inspected.
    return [];
  }

  const requests = tasks.map((task) => buildReminderRequest(task)).filter((request): request is ReminderRequest => request !== null);
  if (requests.length === 0 || !(await ensureNotificationPermission())) return [];

  const identifiers = await Promise.all(requests.map(scheduleReminderRequest));
  return identifiers.filter((identifier): identifier is string => typeof identifier === 'string');
}

export async function syncTaskReminder(previous: Task | undefined, next: Task | undefined) {
  const ids = new Set([previous?.id, next?.id].filter((value): value is string => Boolean(value)));
  await Promise.all([...ids].map(cancelTaskReminders));
  if (!next || next.completed || next.reminderAt === undefined) return undefined;
  return scheduleTaskReminder(next);
}

export async function scheduleFocusPhaseNotification(seconds: number, title: string, body: string, data: Record<string, unknown> = {}, sound = true) {
  if (seconds < 1 || !(await ensureNotificationPermission())) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { type: 'timer', ...data }, sound },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(seconds)), channelId: TIMER_CHANNEL },
    });
  } catch {
    return undefined;
  }
}
