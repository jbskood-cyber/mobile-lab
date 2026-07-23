import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { configureLocalNotifications } from './reminders';

export function NotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    void configureLocalNotifications();
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data.type === 'task' && typeof data.taskId === 'string') {
        router.push({ pathname: '/task/[id]', params: { id: data.taskId } });
      } else if (data.type === 'timer') {
        router.push('/(tabs)/focus');
      }
    });
    return () => subscription.remove();
  }, [router]);

  return null;
}
