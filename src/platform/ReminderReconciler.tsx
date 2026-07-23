import { useEffect, useRef } from 'react';

import { useFocoStore } from '@/src/core/FocoStore';
import { reconcileAllTaskReminders } from './reminders';

export function ReminderReconciler() {
  const { state, resetToken } = useFocoStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      void reconcileAllTaskReminders(state.tasks);
      return;
    }
    if (resetToken > 0) void reconcileAllTaskReminders(state.tasks);
  }, [resetToken, state.tasks]);

  return null;
}
