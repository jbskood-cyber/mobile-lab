export function NativeSystemUI() {
  // System-bar appearance is configured through app.json. Avoid imperative
  // navigation-bar calls because Expo Go support differs across Android builds.
  return null;
}
