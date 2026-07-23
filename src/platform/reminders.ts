import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Task } from '@/src/core/model';
import { buildReminderRequest } from './reminderModel';

const TASK_CHANNEL = 'foco-tasks';
const TIMER_CHANNEL = 'foco-timer';

export async function configureLocalNotifications() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Promise.all([
        Notifications.setNotificationChannelAsync(TASK_CHANNEL, {
          name: 'Recordatorios de tareas',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 180, 100, 180],
          lightColor: '#F7F7F8',
        }),
        Notifications.setNotificationChannelAsync(TIMER_CHANNEL, {
          name: 'Temporizador de enfoque',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 100, 250],
          lightColor: '#F7F7F8',
        }),
      ]);
    }
  } catch {
    // Notifications are enhancement-only; FOCO remains fully usable offline.
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
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // A missing/expired identifier requires no user-facing failure.
  }
}

async function cancelTaskReminders(taskId: string) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matches = scheduled.filter((item) => item.content.data?.type === 'task' && item.content.data?.taskId === taskId);
    await Promise.all(matches.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  } catch {
    // Reconciliation can safely retry on the next edit.
  }
}

export async function scheduleTaskReminder(task: Task) {
  const request = buildReminderRequest(task);
  if (!request || !(await ensureNotificationPermission())) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: request.title,
        body: request.body,
        data: { type: 'task', taskId: request.taskId },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(request.date), channelId: TASK_CHANNEL },
    });
  } catch {
    return undefined;
  }
}

export async function syncTaskReminder(previous: Task | undefined, next: Task | undefined) {
  const taskId = next?.id ?? previous?.id;
  if (taskId) await cancelTaskReminders(taskId);
  if (!next || next.completed || next.reminderAt === undefined) return undefined;
  return scheduleTaskReminder(next);
}

export async function scheduleFocusPhaseNotification(seconds: number, title: string, body: string, data: Record<string, unknown> = {}) {
  if (seconds < 1 || !(await ensureNotificationPermission())) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { type: 'timer', ...data }, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(seconds)), channelId: TIMER_CHANNEL },
    });
  } catch {
    return undefined;
  }
}
