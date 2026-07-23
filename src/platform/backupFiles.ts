import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareTextFile(filename: string, content: string, mimeType: string) {
  try {
    const file = new File(Paths.cache, filename);
    if (file.exists) file.delete();
    file.create({ intermediates: true, overwrite: true });
    file.write(content);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: `Compartir ${filename}` });
      return { method: 'share' as const, uri: file.uri };
    }
  } catch {
    // Clipboard remains a reliable fallback inside Expo Go.
  }
  await Clipboard.setStringAsync(content);
  return { method: 'clipboard' as const };
}

export async function copyText(content: string) {
  await Clipboard.setStringAsync(content);
}
