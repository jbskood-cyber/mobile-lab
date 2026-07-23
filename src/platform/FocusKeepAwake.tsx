import { useKeepAwake } from 'expo-keep-awake';

export function FocusKeepAwake({ active }: { active: boolean }) {
  return active ? <ActiveKeepAwake /> : null;
}

function ActiveKeepAwake() {
  useKeepAwake('foco-active-session');
  return null;
}
