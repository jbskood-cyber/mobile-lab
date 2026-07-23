import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function NativeSystemUI() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    try {
      NavigationBar.setStyle('dark');
    } catch {
      // System UI styling is enhancement-only and must never block startup.
    }
  }, []);

  return null;
}
